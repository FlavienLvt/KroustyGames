const { Op } = require('sequelize');
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