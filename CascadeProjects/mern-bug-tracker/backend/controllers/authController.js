const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Create token
    const token = user.getSignedJwtToken();

    // Create httpOnly cookie
    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    // Generate email confirm token
    const confirmToken = user.generateEmailConfirmToken();
    
    // Save the user with the new confirm token
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const confirmUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/confirmemail?token=${confirmToken}`;

    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email confirmation token',
        message
      });

      res.status(200).json({
        success: true,
        token,
        data: 'Email sent successfully'
      });
    } catch (err) {
      console.log(err);
      user.confirmEmailToken = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ApiError('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ApiError('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ApiError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }

    // Check if email is confirmed
    if (!user.isEmailConfirmed) {
      return next(new ApiError('Please confirm your email to login', 401));
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnable) {
      // Generate 2FA code
      const code = user.generateTwoFactorCode();
      await user.save({ validateBeforeSave: false });

      // Send 2FA code to user's email
      const message = `Your 2FA code is: ${code}`;
      
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your 2FA Code',
          message
        });

        return res.status(200).json({
          success: true,
          twoFactorRequired: true,
          message: '2FA code sent to email'
        });
      } catch (err) {
        console.log(err);
        user.twoFactorCode = undefined;
        user.twoFactorCodeExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ApiError('2FA code could not be sent', 500));
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Verify 2FA code
// @route   POST /api/v1/auth/verify-2fa
// @access  Public
exports.verify2FA = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return next(new ApiError('Please provide email and 2FA code', 400));
    }

    // Get user by email
    const user = await User.findOne({
      email,
      twoFactorCodeExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ApiError('Invalid or expired 2FA code', 400));
    }

    // Hash the provided code and compare with stored hash
    const hashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    if (hashedCode !== user.twoFactorCode) {
      return next(new ApiError('Invalid 2FA code', 400));
    }

    // Clear 2FA code
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm Email
// @route   GET /api/v1/auth/confirmemail
// @access  Public
exports.confirmEmail = async (req, res, next) => {
  try {
    // Get token from query
    const { token } = req.query;

    if (!token) {
      return next(new ApiError('Invalid token', 400));
    }

    // Get hashed token
    const confirmEmailToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Get user by token
    const user = await User.findOne({
      confirmEmailToken,
      isEmailConfirmed: false
    });

    if (!user) {
      return next(new ApiError('Invalid token or email already confirmed', 400));
    }

    // Update confirmed to true
    user.confirmEmailToken = undefined;
    user.isEmailConfirmed = true;
    await user.save({ validateBeforeSave: false });

    // Return token
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ApiError('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ApiError('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ApiError('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ApiError('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Enable/Disable 2FA
// @route   PUT /api/v1/auth/toggle-2fa
// @access  Private
exports.toggle2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Toggle 2FA status
    user.twoFactorEnable = !user.twoFactorEnable;
    
    await user.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      data: { twoFactorEnable: user.twoFactorEnable }
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: user
    });
};
