const express = require('express');
const upload = require('../config/multer');
const categoryController = require('../controllers/categoryController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// CREATE
router.post(
  '/categories',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  categoryController.createCategory
);
// READ
router.get('/categories', categoryController.getCategories);

router.get('/categories/:id', categoryController.getCategoryById);

// UPDATE
router.put(
  '/categories/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  categoryController.updateCategory
);

//DELETE
router.delete(
  '/categories/:id',
  authMiddleware,
  adminMiddleware,
  categoryController.deleteCategory
);
module.exports = router;
