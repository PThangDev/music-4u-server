const express = require('express');
const upload = require('../config/multer');
const songController = require('../controllers/songController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// CREATE
router.post(
  '/songs',
  authMiddleware,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio' }]),
  songController.createSong
);
// READ
router.get('/songs', songController.getSongs);
router.get('/songs/:id', songController.getSongById);
router.get('/songs/category/:slug', songController.getSongOfCategory);
router.get('/songs/album/:slug', songController.getSongOfAlbum);
router.get('/songs/favorites/refresh', songController.getSongOfFavorites);

// UPDATE
router.put(
  '/songs/:id',
  authMiddleware,
  adminMiddleware,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio' }]),
  songController.updateSong
);
router.put('/songs/:id/views/update', songController.updateViewsOfSong);
// router.put(
//   '/songs/:id',
//   authMiddleware,
//   adminMiddleware,
//   upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio' }]),
//   // upload.single('image'),
//   songController.updateSongImage
// );

//DELETE
router.delete('/songs/:id', authMiddleware, adminMiddleware, songController.deleteSong);
module.exports = router;
