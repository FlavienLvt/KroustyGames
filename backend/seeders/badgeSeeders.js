const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');
const { checkAndAwardBadges } = require('../services/badgeService');

const BADGE_DEFINITIONS = [
  // --- Compte ---
  { key: 'account_created', name: 'Bienvenue !', description: 'Créer un compte KroustyGames',   icon: '🎮', category: 'account', gameSlug: null, threshold: null },
  { key: 'veteran_5d',      name: 'Vétéran',     description: 'Avoir un compte depuis 5 jours',  icon: '⏳', category: 'account', gameSlug: null, threshold: null },
  { key: 'veteran_10d',     name: 'Ancien',      description: 'Avoir un compte depuis 10 jours', icon: '🕰️', category: 'account', gameSlug: null, threshold: null },
  { key: 'veteran_30d',     name: 'Légende',     description: 'Avoir un compte depuis 30 jours', icon: '👑', category: 'account', gameSlug: null, threshold: null },
  // --- 2048 ---
  { key: 'score_2048_bronze', name: 'Joueur 2048', description: 'Atteindre 5 000 points sur 2048',  icon: '🥉', category: 'game', gameSlug: '2048', threshold: 5000  },
  { key: 'score_2048_silver', name: 'Expert 2048', description: 'Atteindre 15 000 points sur 2048', icon: '🥈', category: 'game', gameSlug: '2048', threshold: 15000 },
  { key: 'score_2048_gold',   name: 'Maître 2048', description: 'Atteindre 30 000 points sur 2048', icon: '🥇', category: 'game', gameSlug: '2048', threshold: 30000 },
  // --- Krousty Run ---
  { key: 'score_krousty_bronze', name: 'Coureur',  description: 'Atteindre 300 points sur Krousty Run',    icon: '🥉', category: 'game', gameSlug: 'krousty-run', threshold: 300  },
  { key: 'score_krousty_silver', name: 'Sprinter', description: 'Atteindre 700 points sur Krousty Run',    icon: '🥈', category: 'game', gameSlug: 'krousty-run', threshold: 700  },
  { key: 'score_krousty_gold',   name: 'Champion', description: 'Atteindre 1 000 points sur Krousty Run',  icon: '🥇', category: 'game', gameSlug: 'krousty-run', threshold: 1000 },
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

async function seedUserBadges() {
  const count = await UserBadge.count();
  if (count > 0) return;

  const users = await User.findAll();
  for (const user of users) {
    await checkAndAwardBadges(user.id);
  }
  console.log('✅ UserBadges seedés pour les utilisateurs existants');
}

module.exports = { seedBadges, seedUserBadges };
