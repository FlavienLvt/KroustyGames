const { Op } = require('sequelize');
const Game = require('../models/Game');

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

async function getGameBySection(section) {
  return Game.findAll({
    where: {
      sections: {
        [Op.contains]: [section]
      }
    },
    order: [
      ['orderIndex', 'ASC'],
      ['title', 'ASC']
    ]
  });
}

module.exports = {
  listGames,
  getGameBySlug,
  getGameBySection
};