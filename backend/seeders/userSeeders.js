const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedUsers() {
  try {
    const defaultPassword = await bcrypt.hash('password123', 10);

    // Toujours s'assurer que KroustyAdmin est admin (gère les BDs existantes)
    const [admin, adminCreated] = await User.findOrCreate({
      where: { username: 'KroustyAdmin' },
      defaults: { email: 'admin@kroustygames.com', password: defaultPassword, role: 'admin' }
    });
    if (!adminCreated && admin.role !== 'admin') {
      await admin.update({ role: 'admin' });
      console.log('✅ KroustyAdmin promu administrateur.');
    }

    await User.findOrCreate({
      where: { username: 'PlayerOne' },
      defaults: { email: 'player1@test.com', password: defaultPassword, role: 'user' }
    });

    await User.findOrCreate({
      where: { username: 'NuggetMaster' },
      defaults: { email: 'nugget@test.com', password: defaultPassword, role: 'user' }
    });

    console.log('✅ Comptes par défaut vérifiés/créés !');
  } catch (error) {
    console.error('❌ Erreur lors de la création des comptes par défaut:', error);
  }
}

module.exports = { seedUsers };
