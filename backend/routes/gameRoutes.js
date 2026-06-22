const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/games', gameController.getGames);
router.get('/games/section/:section', gameController.getGamesBySection);
router.get('/games/:slug', gameController.getGameBySlug);

module.exports = router;