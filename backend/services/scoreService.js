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

async function getScoreStats() {
  const { fn, col } = require('sequelize');
  const rows = await Score.findAll({
    attributes: [
      'gameSlug',
      [fn('COUNT', col('id')), 'count'],
      [fn('MAX', col('score')), 'maxScore']
    ],
    group: ['gameSlug'],
    order: [[fn('COUNT', col('id')), 'DESC']]
  });
  return rows.map(r => ({
    gameSlug: r.gameSlug,
    count:    parseInt(r.dataValues.count, 10)    || 0,
    maxScore: parseInt(r.dataValues.maxScore, 10) || 0,
  }));
}

module.exports = { saveScore, getLeaderboard, getScoreStats };
