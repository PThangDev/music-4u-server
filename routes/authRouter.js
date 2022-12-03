const express = require('express');
const upload = require('../config/multer');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Login router
router.post('/auths/login', authController.login);

//Register router
router.post('/auths/register', upload.single('avatar'), authController.register);

//Update user router
router.put('/auths/update', authMiddleware, upload.single('avatar'), authController.updateUser);

module.exports = router;
