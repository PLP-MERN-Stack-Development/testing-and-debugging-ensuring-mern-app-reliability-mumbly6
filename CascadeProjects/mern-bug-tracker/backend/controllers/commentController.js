const Comment = require('../models/Comment');
const Bug = require('../models/Bug');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('express-async-handler');

// @desc    Get comments for a bug
// @route   GET /api/bugs/:bugId/comments
// @access  Public
const getComments = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find({ bug: req.params.bugId })
    .populate('user', 'name avatar')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: comments.length,
    data: comments
  });
});

// @desc    Get single comment
// @route   GET /api/bugs/:bugId/comments/:commentId
// @access  Public
const getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId)
    .populate('user', 'name avatar');

  if (!comment) {
    return next(new ApiError(`No comment found with id of ${req.params.commentId}`, 404));
  }

  res.status(200).json({
    success: true,
    data: comment
  });
});

// @desc    Add comment to bug
// @route   POST /api/bugs/:bugId/comments
// @access  Private
const addComment = asyncHandler(async (req, res, next) => {
  // Add user and bug to req.body
  req.body.user = req.user.id;
  req.body.bug = req.params.bugId;

  const bug = await Bug.findById(req.params.bugId);

  if (!bug) {
    return next(new ApiError(`No bug with the id of ${req.params.bugId}`, 404));
  }

  const comment = await Comment.create(req.body);

  // Populate user data in the response
  await comment.populate('user', 'name avatar').execPopulate();

  res.status(201).json({
    success: true,
    data: comment
  });
});

// @desc    Update comment
// @route   PUT /api/bugs/:bugId/comments/:commentId
// @access  Private
const updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new ApiError(`No comment with the id of ${req.params.commentId}`, 404));
  }

  // Make sure user is comment owner or admin
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(`User ${req.user.id} is not authorized to update this comment`, 401));
  }

  // Update only the text field
  if (req.body.text) {
    comment.text = req.body.text;
    comment.edited = true;
    comment.editedAt = Date.now();
  }

  await comment.save();

  res.status(200).json({
    success: true,
    data: comment
  });
});

// @desc    Delete comment
// @route   DELETE /api/bugs/:bugId/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new ApiError(`No comment with the id of ${req.params.commentId}`, 404));
  }

  // Make sure user is comment owner or admin
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(`User ${req.user.id} is not authorized to delete this comment`, 401));
  }

  await comment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like a comment
// @route   POST /api/bugs/:bugId/comments/:commentId/like
// @access  Private
const likeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new ApiError(`No comment with the id of ${req.params.commentId}`, 404));
  }

  // Check if the comment has already been liked by this user
  if (comment.likes.some(like => like.user.toString() === req.user.id)) {
    return next(new ApiError('Comment already liked', 400));
  }

  // Add user to likes array
  comment.likes.unshift({ user: req.user.id });

  await comment.save();

  res.status(200).json({
    success: true,
    data: comment.likes
  });
});

// @desc    Unlike a comment
// @route   DELETE /api/bugs/:bugId/comments/:commentId/like
// @access  Private
const unlikeComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new ApiError(`No comment with the id of ${req.params.commentId}`, 404));
  }

  // Check if the comment has been liked by this user
  if (!comment.likes.some(like => like.user.toString() === req.user.id)) {
    return next(new ApiError('Comment has not been liked yet', 400));
  }

  // Remove the like
  comment.likes = comment.likes.filter(
    ({ user }) => user.toString() !== req.user.id
  );

  await comment.save();

  res.status(200).json({
    success: true,
    data: comment.likes
  });
});

// @desc    Flag a comment as inappropriate
// @route   POST /api/bugs/:bugId/comments/:commentId/flag
// @access  Private
const flagComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new ApiError(`No comment with the id of ${req.params.commentId}`, 404));
  }

  // Check if the comment has already been flagged by this user
  if (comment.flags.some(flag => flag.user.toString() === req.user.id)) {
    return next(new ApiError('Comment already flagged by this user', 400));
  }

  // Add user to flags array
  comment.flags.push({
    user: req.user.id,
    reason: req.body.reason || 'Inappropriate content'
  });

  // If number of flags exceeds threshold, hide the comment
  if (comment.flags.length >= 3) {
    comment.hidden = true;
  }

  await comment.save();

  res.status(200).json({
    success: true,
    data: comment.flags
  });
});

module.exports = {
  getComments,
  getComment,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  flagComment
};
