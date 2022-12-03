const express = require('express');
const upload = require('../config/multer');
const authorController = require('../controllers/authorController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// CREATE
router.post(
  '/authors',
  authMiddleware,
  adminMiddleware,
  upload.single('avatar'),
  authorController.createAuthor
);
// READ
router.get('/authors', authorController.getAuthors);

// UPDATE
router.put(
  '/authors/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('avatar'),
  authorController.updateAuthor
);

//DELETE
router.delete('/authors/:id', authMiddleware, adminMiddleware, authorController.deleteAuthor);
module.exports = router;
