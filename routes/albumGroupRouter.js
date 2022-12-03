const express = require('express');
const upload = require('../config/multer');
const albumGroupController = require('../controllers/albumGroupController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// CREATE
router.post(
  '/album_groups',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  albumGroupController.createAlbumGroup
);
// READ
router.get('/album_groups', albumGroupController.getAlbumGroups);
router.get('/album_groups/:id', albumGroupController.getAlbumGroupById);

// UPDATE
router.put(
  '/album_groups/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  albumGroupController.updateAlbumGroup
);

//DELETE
router.delete(
  '/album_groups/:id',
  authMiddleware,
  adminMiddleware,
  albumGroupController.deleteAlbumGroup
);
module.exports = router;
