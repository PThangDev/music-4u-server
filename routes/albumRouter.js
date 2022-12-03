const express = require('express');
const upload = require('../config/multer');
const albumController = require('../controllers/albumController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// CREATE
router.post(
  '/albums',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  albumController.createAlbum
);
// READ
router.get('/albums', albumController.getAlbums);
router.get('/albums/:id', albumController.getAlbumById);
router.get('/albums/category/:slug', albumController.getAlbumsOfCategory);
router.get('/albums/album_groups/:slug', albumController.getAlbumsOfAlbumGroup);
router.post('/albums/album_groups', albumController.getAlbumsByAlbumGroupSlug);

// UPDATE
router.put(
  '/albums/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  albumController.updateAlbum
);

//DELETE
router.delete('/albums/:id', authMiddleware, adminMiddleware, albumController.deleteAlbum);
module.exports = router;
