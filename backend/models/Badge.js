const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Badge = sequelize.define('Badge', {
  key: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('account', 'game'),
    allowNull: false
  },
  gameSlug: {
    type: DataTypes.STRING,
    allowNull: true
  },
  threshold: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'badges'
});

module.exports = Badge;
