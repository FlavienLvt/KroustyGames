const scoreService = require('../services/scoreService');
const { checkAndAwardBadges } = require('../services/badgeService');

async function saveScore(req, res) {
  try {
    const { score, gameSlug } = req.body;
    const userId = req.user.userId;
    const newScore = await scoreService.saveScore(userId, gameSlug, score);
    await checkAndAwardBadges(userId);
    res.status(201).json(newScore);
  } catch (error) {
    console.error('Erreur save score:', error);
    res.status(500).json({ message: 'Erreur lors de la sauvegarde.' });
  }
}

async function getLeaderboard(req, res) {
  try {
    const { gameSlug } = req.params;
    const leaderboard = await scoreService.getLeaderboard(gameSlug);
    res.json(leaderboard);
  } catch (error) {
    console.error('Erreur fetch scores:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du classement.' });
  }
}

async function getStats(req, res) {
  try {
    const stats = await scoreService.getScoreStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur fetch score stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des stats.' });
  }
}

module.exports = { saveScore, getLeaderboard, getStats };
