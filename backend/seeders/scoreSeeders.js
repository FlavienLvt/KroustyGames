const Score = require('../models/Score');
const User = require('../models/User');

async function seedScores() {
  try {
    const count = await Score.count();
    if (count > 0) {
      console.log('ℹ️ Les scores existent déjà, création ignorée.');
      return;
    }

    console.log('⏳ Création des scores par défaut...');

    const admin  = await User.findOne({ where: { username: 'KroustyAdmin' } });
    const player = await User.findOne({ where: { username: 'PlayerOne' } });
    const nugget = await User.findOne({ where: { username: 'NuggetMaster' } });

    if (!admin || !player || !nugget) {
      console.log("⚠️ Utilisateurs par défaut introuvables. Lancez seedUsers d'abord.");
      return;
    }

    await Score.bulkCreate([
      { score: 32500, gameSlug: '2048',          userId: admin.id  },
      { score: 15420, gameSlug: '2048',          userId: player.id },
      { score:  8900, gameSlug: '2048',          userId: nugget.id },
      { score:  1250, gameSlug: 'krousty-run',   userId: nugget.id },
      { score:   850, gameSlug: 'krousty-run',   userId: player.id },
      { score:   420, gameSlug: 'krousty-run',   userId: admin.id  },
      { score:    45, gameSlug: 'flappy-nugget', userId: player.id },
      { score:    32, gameSlug: 'flappy-nugget', userId: nugget.id },
      { score:    12, gameSlug: 'flappy-nugget', userId: admin.id  }
    ]);

    console.log('✅ Scores par défaut créés avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la création des scores par défaut:', error);
  }
}

module.exports = { seedScores };
