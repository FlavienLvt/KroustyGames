// backend/services/userService.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seedUsers() {
  try {
    const count = await User.count();

    if (count === 0) {
      console.log('⏳ Création des comptes par défaut...');
      
      // On hache le mot de passe commun "password123" pour les tests
      const defaultPassword = await bcrypt.hash('password123', 10);

      await User.bulkCreate([
        { 
          username: 'KroustyAdmin', 
          email: 'admin@kroustygames.com', 
          password: defaultPassword 
        },
        { 
          username: 'PlayerOne', 
          email: 'player1@test.com', 
          password: defaultPassword 
        },
        { 
          username: 'NuggetMaster', 
          email: 'nugget@test.com', 
          password: defaultPassword 
        }
      ]);

      console.log('✅ Comptes par défaut créés avec succès !');
    } else {
      console.log('ℹ️ Les utilisateurs existent déjà, création ignorée.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création des comptes par défaut:', error);
  }
}

module.exports = { seedUsers };