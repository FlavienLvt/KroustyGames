const { Op } = require('sequelize');
const Game = require('../models/Game');

const gameSeed = [
  {
    title: 'Bloxd.io',
    slug: 'bloxd-io',
    image: 'https://placehold.co/600x400/2a2a35/ffffff?text=Bloxd.io',
    badge: 'Top',
    badgeType: 'yellow',
    description: 'Un jeu multijoueur bac à sable rapide et accessible.',
    sections: ['top-picks'],
    orderIndex: 1
  },
  {
    title: 'Archer',
    slug: 'archer',
    image: 'https://placehold.co/300x200/2a2a35/ffffff?text=Archer',
    description: 'Teste ta précision sur des défis de tir simples et nerveux.',
    sections: ['top-picks'],
    orderIndex: 2
  },
  {
    title: 'Moto X3M',
    slug: 'moto-x3m',
    image: 'https://placehold.co/300x200/2a2a35/ffffff?text=Moto',
    description: 'Course arcade avec des niveaux truffés d’obstacles.',
    sections: ['top-picks'],
    orderIndex: 3
  },
  {
    title: 'Veck.io',
    slug: 'veck-io',
    image: 'https://placehold.co/300x200/2a2a35/ffffff?text=Veck.io',
    description: 'Une arène compétitive pour des parties courtes.',
    sections: ['top-picks'],
    orderIndex: 4
  },
  {
    title: 'Color',
    slug: 'color',
    image: 'https://placehold.co/300x200/2a2a35/ffffff?text=Color',
    description: 'Un mini-jeu rapide basé sur la reconnaissance visuelle.',
    sections: ['top-picks'],
    orderIndex: 5
  },
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
    title: 'Maze',
    slug: 'maze',
    image: 'https://placehold.co/300x200/2b2b36/ffffff?text=Maze',
    description: 'Sors du labyrinthe sans te perdre.',
    sections: ['new'],
    orderIndex: 7
  },
  {
    title: 'Room',
    slug: 'room',
    image: 'https://placehold.co/300x200/2b2b36/ffffff?text=Room',
    description: 'Explore une salle remplie d’indices.',
    sections: ['new'],
    orderIndex: 8
  },
  {
    title: 'Bot',
    slug: 'bot',
    image: 'https://placehold.co/300x200/2b2b36/ffffff?text=Bot',
    description: 'Affronte un petit robot dans une partie express.',
    sections: ['new'],
    orderIndex: 9
  },
  {
    title: 'Racing',
    slug: 'racing',
    image: 'https://placehold.co/300x200/2b2b36/ffffff?text=Racing',
    description: 'Un jeu de course simple pour des sessions courtes.',
    sections: ['new'],
    orderIndex: 10
  },
  {
    title: 'Kebab',
    slug: 'kebab',
    image: 'https://placehold.co/300x200/2b2b36/ffffff?text=Kebab',
    badge: 'Hot',
    badgeType: 'red',
    description: 'Un jeu léger et rapide au ton plus décalé.',
    sections: ['new'],
    orderIndex: 11
  },
  {
    title: 'Hoop',
    slug: 'hoop',
    image: 'https://placehold.co/300x200/2b2b36/ffffff?text=Hoop',
    description: 'Marque des points avec un gameplay très direct.',
    sections: ['new'],
    orderIndex: 12
  }
];

async function listGames(section) {
  const where = section ? { sections: { [Op.contains]: [section] } } : {};

  return Game.findAll({
    where,
    order: [
      ['orderIndex', 'ASC'],
      ['title', 'ASC']
    ]
  });
}

async function getGameBySlug(slug) {
  return Game.findOne({ where: { slug } });
}

async function seedGames() {
  const gamesCount = await Game.count();

  if (gamesCount > 0) {
    return;
  }

  await Game.bulkCreate(gameSeed);
}

module.exports = {
  listGames,
  getGameBySlug,
  seedGames
};