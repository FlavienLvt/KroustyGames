const Score = require('../models/Score');
const User = require('../models/User');

const SCORE_SEEDS = [
  // --- 2048 ---
  { score: 32500, gameSlug: '2048',              username: 'KroustyAdmin' },
  { score: 15420, gameSlug: '2048',              username: 'PlayerOne'    },
  { score:  8900, gameSlug: '2048',              username: 'NuggetMaster' },
  // --- Krousty Run ---
  { score:  1250, gameSlug: 'krousty-run',       username: 'NuggetMaster' },
  { score:   850, gameSlug: 'krousty-run',       username: 'PlayerOne'    },
  { score:   420, gameSlug: 'krousty-run',       username: 'KroustyAdmin' },
  // --- Flappy Nugget ---
  { score:    45, gameSlug: 'flappy-nugget',     username: 'PlayerOne'    },
  { score:    32, gameSlug: 'flappy-nugget',     username: 'NuggetMaster' },
  { score:    12, gameSlug: 'flappy-nugget',     username: 'KroustyAdmin' },
  // --- Krousty Crush ---
  { score:  5800, gameSlug: 'krousty-crush',     username: 'NuggetMaster' },
  { score:  2400, gameSlug: 'krousty-crush',     username: 'PlayerOne'    },
  { score:   650, gameSlug: 'krousty-crush',     username: 'KroustyAdmin' },
  // --- Krousty Survivors ---
  { score:  1200, gameSlug: 'krousty-survivors', username: 'KroustyAdmin' },
  { score:   580, gameSlug: 'krousty-survivors', username: 'NuggetMaster' },
  { score:   120, gameSlug: 'krousty-survivors', username: 'PlayerOne'    },
  // --- Angry Nuggets ---
  { score:  1450, gameSlug: 'angry-nuggets',     username: 'PlayerOne'    },
  { score:   720, gameSlug: 'angry-nuggets',     username: 'KroustyAdmin' },
  { score:   210, gameSlug: 'angry-nuggets',     username: 'NuggetMaster' },
  // --- Frite Fighter ---
  { score:    78, gameSlug: 'frite-fighter',     username: 'NuggetMaster' },
  { score:    52, gameSlug: 'frite-fighter',     username: 'KroustyAdmin' },
  { score:    24, gameSlug: 'frite-fighter',     username: 'PlayerOne'    },
  // --- Ketchup Defender ---
  { score:  1620, gameSlug: 'ketchup-defender',  username: 'KroustyAdmin' },
  { score:   680, gameSlug: 'ketchup-defender',  username: 'NuggetMaster' },
  { score:   230, gameSlug: 'ketchup-defender',  username: 'PlayerOne'    },
];

async function seedScores() {
  try {
    const users = await User.findAll({ where: { username: ['KroustyAdmin', 'PlayerOne', 'NuggetMaster'] } });
    if (users.length === 0) {
      console.log("⚠️ Utilisateurs par défaut introuvables. Lancez seedUsers d'abord.");
      return;
    }
    const userMap = Object.fromEntries(users.map(u => [u.username, u.id]));

    // Récupère les slugs déjà présents en base
    const existingRows = await Score.findAll({
      where: { userId: users.map(u => u.id) },
      attributes: ['gameSlug', 'userId']
    });
    const existingSet = new Set(existingRows.map(r => `${r.gameSlug}:${r.userId}`));

    const toInsert = SCORE_SEEDS
      .filter(s => userMap[s.username])
      .filter(s => !existingSet.has(`${s.gameSlug}:${userMap[s.username]}`))
      .map(s => ({ score: s.score, gameSlug: s.gameSlug, userId: userMap[s.username] }));

    if (toInsert.length > 0) {
      await Score.bulkCreate(toInsert);
      console.log(`✅ ${toInsert.length} score(s) seedé(s)`);
    } else {
      console.log('✅ Scores déjà à jour');
    }
  } catch (error) {
    console.error('❌ Erreur lors du seed des scores:', error);
  }
}

module.exports = { seedScores };
