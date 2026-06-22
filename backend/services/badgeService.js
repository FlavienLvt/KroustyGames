const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');
const Score = require('../models/Score');

async function checkAndAwardBadges(userId) {
  const user = await User.findByPk(userId);
  if (!user) return;

  const accountAgeDays = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);

  const scores = await Score.findAll({ where: { userId } });
  const maxScoreBySlug = {};
  for (const s of scores) {
    if (!maxScoreBySlug[s.gameSlug] || s.score > maxScoreBySlug[s.gameSlug]) {
      maxScoreBySlug[s.gameSlug] = s.score;
    }
  }

  const allBadges = await Badge.findAll();
  const earned = await UserBadge.findAll({ where: { userId }, attributes: ['badgeKey'] });
  const earnedKeys = new Set(earned.map(ub => ub.badgeKey));

  const toAward = [];

  for (const badge of allBadges) {
    if (earnedKeys.has(badge.key)) continue;

    let qualifies = false;

    if (badge.key === 'account_created') {
      qualifies = true;
    } else if (badge.key === 'veteran_5d') {
      qualifies = accountAgeDays >= 5;
    } else if (badge.key === 'veteran_10d') {
      qualifies = accountAgeDays >= 10;
    } else if (badge.key === 'veteran_30d') {
      qualifies = accountAgeDays >= 30;
    } else if (badge.category === 'game' && badge.gameSlug && badge.threshold !== null) {
      qualifies = (maxScoreBySlug[badge.gameSlug] || 0) >= badge.threshold;
    }

    if (qualifies) {
      toAward.push({ userId, badgeKey: badge.key, earnedAt: new Date() });
    }
  }

  if (toAward.length > 0) {
    await UserBadge.bulkCreate(toAward, { ignoreDuplicates: true });
  }
}

async function getBadgesForUser(userId) {
  const allBadges = await Badge.findAll({ order: [['category', 'ASC'], ['key', 'ASC']] });

  if (!userId) {
    return allBadges.map(b => ({ ...b.toJSON(), earned: false, earnedAt: null }));
  }

  const earned = await UserBadge.findAll({ where: { userId } });
  const earnedMap = {};
  for (const ub of earned) {
    earnedMap[ub.badgeKey] = ub.earnedAt;
  }

  return allBadges.map(b => ({
    ...b.toJSON(),
    earned: !!earnedMap[b.key],
    earnedAt: earnedMap[b.key] || null
  }));
}

async function getBadgeLeaderboard() {
  const { fn, col } = require('sequelize');

  const counts = await UserBadge.findAll({
    attributes: [
      'userId',
      [fn('COUNT', col('UserBadge.badgeKey')), 'badgeCount']
    ],
    include: [{ model: User, attributes: ['username'] }],
    group: ['UserBadge.userId', 'User.id', 'User.username'],
    order: [[fn('COUNT', col('UserBadge.badgeKey')), 'DESC'], [User, 'username', 'ASC']],
    limit: 20
  });

  return counts.map((r, i) => ({
    rank: i + 1,
    username: r.User.username,
    badgeCount: parseInt(r.dataValues.badgeCount, 10) || 0
  }));
}

module.exports = { checkAndAwardBadges, getBadgesForUser, getBadgeLeaderboard };
