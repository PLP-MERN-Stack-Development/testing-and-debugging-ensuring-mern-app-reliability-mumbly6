const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getComments,
  getComment,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  flagComment
} = require('../controllers/commentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (if any)
router.route('/')
  .get(getComments)
  .post(protect, authorize('user', 'admin'), addComment);

router.route('/:commentId')
  .get(getComment)
  .put(protect, authorize('user', 'admin'), updateComment)
  .delete(protect, authorize('user', 'admin'), deleteComment);

// Like/Unlike comment
router.route('/:commentId/like')
  .post(protect, likeComment)
  .delete(protect, unlikeComment);

// Flag comment as inappropriate
router.post('/:commentId/flag', protect, flagComment);

module.exports = router;
