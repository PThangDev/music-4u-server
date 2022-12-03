const express = require('express');
const searchController = require('../controllers/searchController');
const router = express.Router();

router.get('/search', searchController.search);
// router.get('/search', searchController.searching);

module.exports = router;
