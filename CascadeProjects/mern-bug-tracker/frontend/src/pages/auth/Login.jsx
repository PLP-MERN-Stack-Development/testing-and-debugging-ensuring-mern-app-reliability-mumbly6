import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [emailFor2FA, setEmailFor2FA] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  // Handle regular login
  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);
    
    try {
      const result = await login(values.email, values.password);
      
      if (result.twoFactorRequired) {
        setShow2FA(true);
        setEmailFor2FA(values.email);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification
  const handle2FASubmit = async (values) => {
    setError('');
    setLoading(true);
    
    try {
      const result = await verify2FA(emailFor2FA, values.code);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Formik configuration for login form
  const loginFormik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: handleSubmit,
  });

  // Formik configuration for 2FA form
  const twoFAFormik = useFormik({
    initialValues: {
      code: '',
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .required('Verification code is required')
        .matches(/^\d{6}$/, 'Code must be 6 digits'),
    }),
    onSubmit: handle2FASubmit,
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (show2FA) {
    return (
      <Box component="form" onSubmit={twoFAFormik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Two-Factor Authentication
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          We've sent a verification code to your email. Please enter it below.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="code"
          label="Verification Code"
          name="code"
          autoComplete="one-time-code"
          autoFocus
          value={twoFAFormik.values.code}
          onChange={twoFAFormik.handleChange}
          onBlur={twoFAFormik.handleBlur}
          error={twoFAFormik.touched.code && Boolean(twoFAFormik.errors.code)}
          helperText={twoFAFormik.touched.code && twoFAFormik.errors.code}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 6,
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Verify'}
        </Button>
        
        <Box textAlign="center" mt={2}>
          <Link
            component={RouterLink}
            to="/login"
            variant="body2"
            onClick={() => setShow2FA(false)}
          >
            Back to login
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={loginFormik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Sign in
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={loginFormik.values.email}
        onChange={loginFormik.handleChange}
        onBlur={loginFormik.handleBlur}
        error={loginFormik.touched.email && Boolean(loginFormik.errors.email)}
        helperText={loginFormik.touched.email && loginFormik.errors.email}
      />
      
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        value={loginFormik.values.password}
        onChange={loginFormik.handleChange}
        onBlur={loginFormik.handleBlur}
        error={loginFormik.touched.password && Boolean(loginFormik.errors.password)}
        helperText={loginFormik.touched.password && loginFormik.errors.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={togglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link component={RouterLink} to="/forgot-password" variant="body2">
          Forgot password?
        </Link>
      </Box>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
      
      <Box textAlign="center" mt={2}>
        <Link component={RouterLink} to="/register" variant="body2">
          {"Don't have an account? Sign Up"}
        </Link>
      </Box>
    </Box>
  );
};

export default Login;
