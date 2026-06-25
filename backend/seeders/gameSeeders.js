const Game = require('../models/Game');

const gameSeed = [
  {
    title: '2048',
    slug: '2048',
    image: '/thumbnails/thumbnail-2048.svg',
    badge: 'Updated',
    badgeType: 'blue',
    description: 'Rejoins les nombres jusqu’à atteindre la tuile 2048.',
    sections: ['featured'],
    orderIndex: 6
  },
  {
    title: 'Krousty Run',
    slug: 'krousty-run',
    image: '/thumbnails/thumbnail-krousty-run.svg',
    badge: 'New',
    badgeType: 'red',
    description: 'Un runner infini où il faut esquiver les friteuses et les spatules !',
    sections: ['new'],
    orderIndex: 0
  },
  {
    title: 'Flappy Nugget',
    slug: 'flappy-nugget',
    image: '/thumbnails/thumbnail-flappy-nugget.svg',
    badge: 'New',
    badgeType: 'purple',
    description: 'Volez à travers les jets de sauce !',
    sections: ['new', 'featured'],
    orderIndex: 1
  },
  {
    title: 'Frite Fighter',
    slug: 'frite-fighter',
    image: '/thumbnails/thumbnail-frite-fighter.svg',
    badge: 'New',
    badgeType: 'red',
    description: "Écrase les nuggets avant qu'ils s'échappent de la friteuse !",
    sections: ['top-picks', 'new'],
    orderIndex: 2
  },
  {
    title: 'Ketchup Defender',
    slug: 'ketchup-defender',
    image: '/thumbnails/thumbnail-ketchup-defender.svg',
    badge: 'New',
    badgeType: 'red',
    description: 'Défends la cuisine contre les vagues de nuggets et de frites !',
    sections: ['top-picks', 'new'],
    orderIndex: 3
  },
  {
    title: 'Krousty Crush',
    slug: 'krousty-crush',
    image: '/thumbnails/thumbnail-krousty-crush.svg',
    badge: 'New',
    badgeType: 'purple',
    description: 'Aligne 3 nuggets ou plus pour les faire exploser !',
    sections: ['new', 'featured'],
    orderIndex: 4
  },
  {
    title: 'Krousty Survivors',
    slug: 'krousty-survivors',
    image: '/thumbnails/thumbnail-krousty-survivors.svg',
    badge: 'New',
    badgeType: 'red',
    description: 'Survie des vagues infinies de friteuses ennemies !',
    sections: ['new'],
    orderIndex: 5
  },
  {
    title: 'Angry Nuggets',
    slug: 'angry-nuggets',
    image: '/thumbnails/thumbnail-angry-nuggets.svg',
    badge: 'New',
    badgeType: 'yellow',
    description: 'Lance des nuggets sur les structures ennemies avec ta catapulte !',
    sections: ['new', 'featured'],
    orderIndex: 6
  }
];

async function seedGames() {
  try {
    for (const game of gameSeed) {
      await Game.upsert(game);
    }
    console.log('Jeux initialisés/mis à jour avec succès.');
  } catch (error) {
    console.error('Erreur lors du seeding des jeux:', error);
  }
}

module.exports = {
  seedGames
};