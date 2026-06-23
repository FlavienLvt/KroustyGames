const Game = require('../models/Game');

const gameSeed = [
  {
    title: '2048',
    slug: '2048',
    image: 'https://placehold.co/300x200/1e1e24/ffffff?text=2048',
    badge: 'Updated',
    badgeType: 'blue',
    description: 'Rejoins les nombres jusqu’à atteindre la tuile 2048.',
    sections: ['featured'],
    orderIndex: 6
  },
  {
    title: 'Krousty Run',
    slug: 'krousty-run',
    image: 'https://placehold.co/300x200/1e1e24/ffffff?text=Krousty+Run',
    badge: 'New',
    badgeType: 'red',
    description: 'Un runner infini où il faut esquiver les friteuses et les spatules !',
    sections: ['new'],
    orderIndex: 0
  },
  {
    title: 'Flappy Nugget',
    slug: 'flappy-nugget',
    image: 'https://placehold.co/300x200/1e1e24/ffffff?text=Flappy+Nugget',
    badge: 'New',
    badgeType: 'purple',
    description: 'Volez à travers les jets de sauce !',
    sections: ['new', 'featured'],
    orderIndex: 1
  },
  {
    title: 'Frite Fighter',
    slug: 'frite-fighter',
    image: 'https://placehold.co/300x200/1e1e24/ffffff?text=Frite+Fighter',
    badge: 'New',
    badgeType: 'red',
    description: 'Écrase les nuggets avant qu\'ils s\'échappent de la friteuse !',
    sections: ['top-picks', 'new'],
    orderIndex: 2
  }
];

async function seedGames() {
  try {
    for (const game of gameSeed) {
      await Game.findOrCreate({ where: { slug: game.slug }, defaults: game });
    }
    console.log('Jeux initialisés avec succès.');
  } catch (error) {
    console.error('Erreur lors du seeding des jeux:', error);
  }
}

module.exports = {
  seedGames
};