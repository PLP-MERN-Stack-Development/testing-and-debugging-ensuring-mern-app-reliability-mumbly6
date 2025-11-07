const express = require('express');
const router = express.Router();
const {
  getBugs,
  getBug,
  createBug,
  updateBug,
  deleteBug,
  getBugStats,
  uploadAttachment
} = require('../controllers/bugController');
const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const commentRouter = require('./commentRoutes');

// Re-route into other resource routers
router.use('/:bugId/comments', commentRouter);

// Public routes (if any)
// router.get('/', getBugs);
// router.get('/:id', getBug);

// Protected routes (require authentication)
router.use(protect);

// File upload
const multer = require('multer');
const path = require('path');
const { fileFilter, fileStorage } = require('../middleware/fileUpload');

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB max file size
});

// File upload route
router.put('/:id/attachment', upload.single('file'), uploadAttachment);

// Routes for bugs
router
  .route('/')
  .get(getBugs)
  .post(createBug);

router
  .route('/:id')
  .get(getBug)
  .put(updateBug)
  .delete(deleteBug);

// Stats route
router.get('/stats/status', getBugStats);

// Admin protected routes
router.use(authorize('admin'));

// Add any admin-only routes here

module.exports = router;
