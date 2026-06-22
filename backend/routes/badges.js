const express = require('express');
const jwt = require('jsonwebtoken');
const { getBadgesForUser, getBadgeLeaderboard, checkAndAwardBadges } = require('../services/badgeService');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'kroustygames_secret_key_temp';

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();
  const token = authHeader.split(' ')[1];
  if (!token) return next();
  try {
    req.user = jwt.verify(token, SECRET_KEY);
  } catch (_) {
    // token invalide — on continue sans user
  }
  next();
}

// GET /api/badges — tous les badges, avec statut earned si connecté
router.get('/badges', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    if (userId) await checkAndAwardBadges(userId);
    const badges = await getBadgesForUser(userId);
    res.json(badges);
  } catch (error) {
    console.error('Erreur fetch badges:', error);
    res.status(500).json({ message: 'Impossible de charger les badges.' });
  }
});

// GET /api/badges/leaderboard — classement par nombre de badges
router.get('/badges/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getBadgeLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Erreur badge leaderboard:', error);
    res.status(500).json({ message: 'Impossible de charger le classement des badges.' });
  }
});

module.exports = router;
