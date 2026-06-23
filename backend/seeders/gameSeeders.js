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
    title: 'Krousty Crush',
    slug: 'krousty-crush',
    image: 'https://placehold.co/300x200/1e1e24/8c52ff?text=Krousty+Crush',
    badge: 'New',
    badgeType: 'purple',
    description: 'Aligne 3 nuggets ou plus pour les faire exploser !',
    sections: ['new', 'featured'],
    orderIndex: 2
  },
  {
    title: 'Krousty Survivors',
    slug: 'krousty-survivors',
    image: 'https://placehold.co/300x200/1e1e24/e63946?text=Krousty+Survivors',
    badge: 'New',
    badgeType: 'red',
    description: 'Survie des vagues infinies de friteuses ennemies !',
    sections: ['new'],
    orderIndex: 3
  },
  {
    title: 'Angry Nuggets',
    slug: 'angry-nuggets',
    image: 'https://placehold.co/300x200/1e1e24/f4a261?text=Angry+Nuggets',
    badge: 'New',
    badgeType: 'yellow',
    description: 'Lance des nuggets sur les structures ennemies avec ta catapulte !',
    sections: ['new', 'featured'],
    orderIndex: 4
  }
];

async function seedGames() {
  try {
    const gamesCount = await Game.count();

    if (gamesCount === 0) {
      await Game.bulkCreate(gameSeed);
      console.log('Jeux initialisés avec succès.');
    } else {
      console.log('Les jeux existent déjà, seeding ignoré.');
    }
  } catch (error) {
    console.error('Erreur lors du seeding des jeux:', error);
  }
}

module.exports = {
  seedGames
};