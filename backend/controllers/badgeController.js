const { checkAndAwardBadges, getBadgesForUser, getBadgeLeaderboard } = require('../services/badgeService');

async function getBadges(req, res) {
  try {
    const userId = req.user?.userId || null;
    if (userId) await checkAndAwardBadges(userId);
    const badges = await getBadgesForUser(userId);
    res.json(badges);
  } catch (error) {
    console.error('Erreur fetch badges:', error);
    res.status(500).json({ message: 'Impossible de charger les badges.' });
  }
}

async function getLeaderboard(req, res) {
  try {
    const leaderboard = await getBadgeLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Erreur badge leaderboard:', error);
    res.status(500).json({ message: 'Impossible de charger le classement des badges.' });
  }
}

module.exports = { getBadges, getLeaderboard };
