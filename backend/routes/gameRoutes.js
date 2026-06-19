const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Route pour lister les jeux (accepte potentiellement ?section=...)
router.get('/games', gameController.getGames);

// Route pour récupérer un jeu spécifique par son slug
router.get('/games/:slug', gameController.getGameBySlug);

router.get('/games/section/:section', gameController.getGamesBySection);

module.exports = router;