const express = require('express');
const upload = require('../config/multer');
const singerController = require('../controllers/singerController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// CREATE
router.post(
  '/singers',
  authMiddleware,
  adminMiddleware,
  upload.single('avatar'),
  singerController.createSinger
);
// READ
router.get('/singers', singerController.getSingers);
router.get('/singers/:slug', singerController.getSingerBySlug);
// router.get('/singers/:id', singerController.getSingerById);

// UPDATE
router.put(
  '/singers/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('avatar'),
  singerController.updateSinger
);

//DELETE
router.delete('/singers/:id', authMiddleware, adminMiddleware, singerController.deleteSinger);
module.exports = router;
