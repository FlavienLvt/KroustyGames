const Score = require('../models/Score');
const User = require('../models/User');

async function saveScore(userId, gameSlug, score) {
  return Score.create({ score, gameSlug, userId });
}

async function getLeaderboard(gameSlug) {
  return Score.findAll({
    where: { gameSlug },
    order: [['score', 'DESC']],
    limit: 10,
    include: [{ model: User, attributes: ['username'] }]
  });
}

module.exports = { saveScore, getLeaderboard };
