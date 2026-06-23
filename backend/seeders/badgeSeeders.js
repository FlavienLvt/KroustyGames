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
  // --- Frite Fighter ---
  { key: 'score_ff_bronze', name: 'Chasseur de Frites',     description: 'Atteindre 20 points sur Frite Fighter',   icon: '🍟', category: 'game', gameSlug: 'frite-fighter', threshold: 20 },
  { key: 'score_ff_silver', name: 'Maître Friturier',       description: 'Atteindre 45 points sur Frite Fighter',   icon: '🏅', category: 'game', gameSlug: 'frite-fighter', threshold: 45 },
  { key: 'score_ff_gold',   name: 'Légende de la Friteuse', description: 'Atteindre 75 points sur Frite Fighter',   icon: '🥇', category: 'game', gameSlug: 'frite-fighter', threshold: 75 },
  // --- Ketchup Defender ---
  { key: 'score_kd_bronze', name: 'Tireur de Ketchup', description: 'Atteindre 200 pts sur Ketchup Defender',   icon: '🍅', category: 'game', gameSlug: 'ketchup-defender', threshold: 200  },
  { key: 'score_kd_silver', name: 'Défenseur Sauce',   description: 'Atteindre 600 pts sur Ketchup Defender',   icon: '🏅', category: 'game', gameSlug: 'ketchup-defender', threshold: 600  },
  { key: 'score_kd_gold',   name: 'Maître Ketchup',    description: 'Atteindre 1 500 pts sur Ketchup Defender', icon: '🥇', category: 'game', gameSlug: 'ketchup-defender', threshold: 1500 },
  // --- Krousty Crush ---
  { key: 'score_crush_bronze', name: 'Petit Crusher', description: 'Atteindre 500 points sur Krousty Crush',   icon: '🍬', category: 'game', gameSlug: 'krousty-crush', threshold: 500  },
  { key: 'score_crush_silver', name: 'Crusher',       description: 'Atteindre 2 000 points sur Krousty Crush', icon: '🍭', category: 'game', gameSlug: 'krousty-crush', threshold: 2000 },
  { key: 'score_crush_gold',   name: 'Crush Master',  description: 'Atteindre 5 000 points sur Krousty Crush', icon: '💎', category: 'game', gameSlug: 'krousty-crush', threshold: 5000 },
  // --- Krousty Survivors ---
  { key: 'score_survivors_bronze', name: 'Survivant',      description: 'Atteindre 100 points sur Krousty Survivors',   icon: '🛡️', category: 'game', gameSlug: 'krousty-survivors', threshold: 100  },
  { key: 'score_survivors_silver', name: 'Résistant',      description: 'Atteindre 500 points sur Krousty Survivors',   icon: '⚔️', category: 'game', gameSlug: 'krousty-survivors', threshold: 500  },
  { key: 'score_survivors_gold',   name: 'Indestructible', description: 'Atteindre 1 000 points sur Krousty Survivors', icon: '💀', category: 'game', gameSlug: 'krousty-survivors', threshold: 1000 },
  // --- Angry Nuggets ---
  { key: 'score_nuggets_bronze', name: 'Tireur',        description: 'Atteindre 100 points sur Angry Nuggets',   icon: '🐔', category: 'game', gameSlug: 'angry-nuggets', threshold: 100  },
  { key: 'score_nuggets_silver', name: 'Sniper Nugget', description: 'Atteindre 500 points sur Angry Nuggets',   icon: '🎯', category: 'game', gameSlug: 'angry-nuggets', threshold: 500  },
  { key: 'score_nuggets_gold',   name: 'Angry Master',  description: 'Atteindre 1 000 points sur Angry Nuggets', icon: '💥', category: 'game', gameSlug: 'angry-nuggets', threshold: 1000 },
];

async function seedBadges() {
  const existing = await Badge.findAll({ attributes: ['key'] });
  const existingKeys = new Set(existing.map(b => b.key));
  const missing = BADGE_DEFINITIONS.filter(b => !existingKeys.has(b.key));
  if (missing.length > 0) {
    await Badge.bulkCreate(missing);
    console.log(`✅ ${missing.length} badge(s) ajouté(s)`);
  } else {
    console.log('✅ Badges déjà à jour');
  }
}

async function seedUserBadges() {
  const users = await User.findAll();
  for (const user of users) {
    await checkAndAwardBadges(user.id);
  }
  console.log('✅ UserBadges vérifiés et mis à jour pour tous les utilisateurs');
}

module.exports = { seedBadges, seedUserBadges };
