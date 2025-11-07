const Bug = require('../models/Bug');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');

// @desc    Get all bugs
// @route   GET /api/bugs
// @access  Private
const getBugs = asyncHandler(async (req, res) => {
  const { status, priority, project, search } = req.query;
  
  // Build query
  const query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  if (project) {
    query.project = project;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  // Execute query
  const bugs = await Bug.find(query)
    .sort({ createdAt: -1 })
    .populate('project', 'name');
    
  res.status(200).json({
    success: true,
    count: bugs.length,
    data: bugs
  });
});

// @desc    Get single bug
// @route   GET /api/bugs/:id
// @access  Private
const getBug = asyncHandler(async (req, res, next) => {
  const bug = await Bug.findById(req.params.id)
    .populate('project', 'name description')
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');
    
  if (!bug) {
    return next(new ApiError(`Bug not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user has access to this bug
  if (bug.createdBy._id.toString() !== req.user.id && !req.user.role.includes('admin')) {
    return next(new ApiError(`Not authorized to access this bug`, 401));
  }
  
  res.status(200).json({
    success: true,
    data: bug
  });
});

// @desc    Create new bug
// @route   POST /api/bugs
// @access  Private
const createBug = asyncHandler(async (req, res) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  const bug = await Bug.create(req.body);
  
  res.status(201).json({
    success: true,
    data: bug
  });
});

// @desc    Update bug
// @route   PUT /api/bugs/:id
// @access  Private
const updateBug = asyncHandler(async (req, res, next) => {
  let bug = await Bug.findById(req.params.id);
  
  if (!bug) {
    return next(new ApiError(`Bug not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is bug owner or admin
  if (bug.createdBy.toString() !== req.user.id && !req.user.role.includes('admin')) {
    return next(new ApiError(`User ${req.user.id} is not authorized to update this bug`, 401));
  }
  
  // Handle status changes
  if (req.body.status && req.body.status !== bug.status) {
    bug = await bug.updateStatus(req.body.status);
    delete req.body.status; // Remove status from req.body to prevent overwrite
  }
  
  bug = await Bug.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: bug
  });
});

// @desc    Delete bug
// @route   DELETE /api/bugs/:id
// @access  Private
const deleteBug = asyncHandler(async (req, res, next) => {
  const bug = await Bug.findById(req.params.id);
  
  if (!bug) {
    return next(new ApiError(`Bug not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is bug owner or admin
  if (bug.createdBy.toString() !== req.user.id && !req.user.role.includes('admin')) {
    return next(new ApiError(`User ${req.user.id} is not authorized to delete this bug`, 401));
  }
  
  await bug.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get bugs by status
// @route   GET /api/bugs/stats/status
// @access  Private
const getBugStats = asyncHandler(async (req, res) => {
  const stats = await Bug.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Upload attachment for bug
// @route   PUT /api/bugs/:id/attachment
// @access  Private
const uploadAttachment = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ApiError('Please upload a file', 400));
  }
  
  const file = req.files.file;
  
  // Check file type
  if (!file.mimetype.startsWith('image') && !file.mimetype.startsWith('application')) {
    return next(new ApiError('Please upload an image or document', 400));
  }
  
  // Check file size
  const maxSize = process.env.MAX_FILE_UPLOAD || 1000000;
  if (file.size > maxSize) {
    return next(new ApiError(`Please upload an image less than ${maxSize/1000000}MB`, 400));
  }
  
  // Create custom filename
  file.name = `attachment_${Date.now()}${path.parse(file.name).ext}`;
  
  // Move file to uploads folder
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ApiError('Problem with file upload', 500));
    }
    
    await Bug.findByIdAndUpdate(req.params.id, {
      $push: { 
        attachments: {
          url: file.name,
          name: file.name,
          type: file.mimetype
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

module.exports = {
  getBugs,
  getBug,
  createBug,
  updateBug,
  deleteBug,
  getBugStats,
  uploadAttachment
};
