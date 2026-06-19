// backend/routes/scores.js
const express = require('express');
const Score = require('../models/Score');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// 1. SAUVEGARDER UN SCORE (Sécurisé par authMiddleware)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { score, gameSlug } = req.body;
    const userId = req.user.userId; // Récupéré grâce au middleware

    const newScore = await Score.create({ score, gameSlug, userId });
    res.status(201).json(newScore);
  } catch (error) {
    console.error('Erreur save score:', error);
    res.status(500).json({ message: 'Erreur lors de la sauvegarde.' });
  }
});

// 2. RÉCUPÉRER LE CLASSEMENT D'UN JEU (Public)
router.get('/:gameSlug', async (req, res) => {
  try {
    const { gameSlug } = req.params;
    
    // On cherche les 10 meilleurs scores pour ce jeu
    const leaderboard = await Score.findAll({
      where: { gameSlug },
      order: [['score', 'DESC']], // Du plus grand au plus petit
      limit: 10,
      include: [{ model: User, attributes: ['username'] }] // On inclut le pseudo du joueur !
    });

    res.json(leaderboard);
  } catch (error) {
    console.error('Erreur fetch scores:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du classement.' });
  }
});

module.exports = router;