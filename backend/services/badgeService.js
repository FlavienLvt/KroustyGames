const { Op } = require('sequelize');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');
const Score = require('../models/Score');

const BADGE_DEFINITIONS = [
  // --- Compte ---
  { key: 'account_created', name: 'Bienvenue !', description: 'Créer un compte KroustyGames', icon: '🎮', category: 'account', gameSlug: null, threshold: null },
  { key: 'veteran_5d',      name: 'Vétéran',     description: 'Avoir un compte depuis 5 jours',  icon: '⏳', category: 'account', gameSlug: null, threshold: null },
  { key: 'veteran_10d',     name: 'Ancien',      description: 'Avoir un compte depuis 10 jours', icon: '🕰️', category: 'account', gameSlug: null, threshold: null },
  { key: 'veteran_30d',     name: 'Légende',     description: 'Avoir un compte depuis 30 jours', icon: '👑', category: 'account', gameSlug: null, threshold: null },
  // --- 2048 ---
  { key: 'score_2048_bronze', name: 'Joueur 2048', description: 'Atteindre 5 000 points sur 2048',  icon: '🥉', category: 'game', gameSlug: '2048', threshold: 5000 },
  { key: 'score_2048_silver', name: 'Expert 2048', description: 'Atteindre 15 000 points sur 2048', icon: '🥈', category: 'game', gameSlug: '2048', threshold: 15000 },
  { key: 'score_2048_gold',   name: 'Maître 2048', description: 'Atteindre 30 000 points sur 2048', icon: '🥇', category: 'game', gameSlug: '2048', threshold: 30000 },
  // --- Krousty Run ---
  { key: 'score_krousty_bronze', name: 'Coureur',  description: 'Atteindre 300 points sur Krousty Run',   icon: '🥉', category: 'game', gameSlug: 'krousty-run', threshold: 300 },
  { key: 'score_krousty_silver', name: 'Sprinter', description: 'Atteindre 700 points sur Krousty Run',   icon: '🥈', category: 'game', gameSlug: 'krousty-run', threshold: 700 },
  { key: 'score_krousty_gold',   name: 'Champion', description: 'Atteindre 1 000 points sur Krousty Run', icon: '🥇', category: 'game', gameSlug: 'krousty-run', threshold: 1000 },
  // --- Flappy Nugget ---
  { key: 'score_flappy_bronze', name: 'Poulet',      description: 'Atteindre 10 points sur Flappy Nugget', icon: '🥉', category: 'game', gameSlug: 'flappy-nugget', threshold: 10 },
  { key: 'score_flappy_silver', name: 'Nugget',      description: 'Atteindre 25 points sur Flappy Nugget', icon: '🥈', category: 'game', gameSlug: 'flappy-nugget', threshold: 25 },
  { key: 'score_flappy_gold',   name: 'KroustyBird', description: 'Atteindre 40 points sur Flappy Nugget', icon: '🥇', category: 'game', gameSlug: 'flappy-nugget', threshold: 40 },
];

async function seedBadges() {
  const count = await Badge.count();
  if (count > 0) return;

  await Badge.bulkCreate(BADGE_DEFINITIONS);
  console.log('✅ Badges seedés (13 badges)');
}

async function checkAndAwardBadges(userId) {
  const user = await User.findByPk(userId);
  if (!user) return;

  const now = Date.now();
  const accountAgeDays = (now - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);

  // Scores max par jeu pour cet utilisateur
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
      const best = maxScoreBySlug[badge.gameSlug] || 0;
      qualifies = best >= badge.threshold;
    }

    if (qualifies) {
      toAward.push({ userId, badgeKey: badge.key, earnedAt: new Date() });
    }
  }

  if (toAward.length > 0) {
    await UserBadge.bulkCreate(toAward, { ignoreDuplicates: true });
  }
}

async function seedUserBadges() {
  const count = await UserBadge.count();
  if (count > 0) return;

  const users = await User.findAll();
  for (const user of users) {
    await checkAndAwardBadges(user.id);
  }
  console.log('✅ UserBadges seedés pour les utilisateurs existants');
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
  const { sequelize } = require('../database');
  const { QueryTypes } = require('sequelize');

  const rows = await sequelize.query(
    `SELECT u.id, u.username, COUNT(ub."badgeKey") as "badgeCount"
     FROM "Users" u
     LEFT JOIN "UserBadges" ub ON ub."userId" = u.id
     GROUP BY u.id, u.username
     ORDER BY "badgeCount" DESC, u.username ASC
     LIMIT 20`,
    { type: QueryTypes.SELECT }
  );

  return rows.map((r, i) => ({ rank: i + 1, username: r.username, badgeCount: parseInt(r.badgeCount, 10) }));
}

module.exports = { seedBadges, seedUserBadges, checkAndAwardBadges, getBadgesForUser, getBadgeLeaderboard };
