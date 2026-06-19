// backend/services/scoreService.js
const Score = require('../models/Score');
const User = require('../models/User');

async function seedScores() {
  try {
    const count = await Score.count();

    // S'il n'y a pas encore de scores, on en crée de faux
    if (count === 0) {
      console.log('⏳ Création des scores par défaut...');

      // 1. On récupère les utilisateurs créés par le userService
      const admin = await User.findOne({ where: { username: 'KroustyAdmin' } });
      const player1 = await User.findOne({ where: { username: 'PlayerOne' } });
      const nugget = await User.findOne({ where: { username: 'NuggetMaster' } });

      // Sécurité : si les utilisateurs n'existent pas encore, on annule
      if (!admin || !player1 || !nugget) {
        console.log('⚠️ Utilisateurs par défaut introuvables. Lancez seedUsers d\'abord.');
        return;
      }

      // 2. On insère de faux scores pour nos 3 jeux
      await Score.bulkCreate([
        // --- Scores pour 2048 ---
        { score: 32500, gameSlug: '2048', userId: admin.id },
        { score: 15420, gameSlug: '2048', userId: player1.id },
        { score: 8900, gameSlug: '2048', userId: nugget.id },

        // --- Scores pour Krousty Run ---
        { score: 1250, gameSlug: 'krousty-run', userId: nugget.id },
        { score: 850, gameSlug: 'krousty-run', userId: player1.id },
        { score: 420, gameSlug: 'krousty-run', userId: admin.id },

        // --- Scores pour Flappy Nugget ---
        { score: 45, gameSlug: 'flappy-nugget', userId: player1.id },
        { score: 32, gameSlug: 'flappy-nugget', userId: nugget.id },
        { score: 12, gameSlug: 'flappy-nugget', userId: admin.id }
      ]);

      console.log('✅ Scores par défaut créés avec succès !');
    } else {
      console.log('ℹ️ Les scores existent déjà, création ignorée.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création des scores par défaut:', error);
  }
}

module.exports = { seedScores };