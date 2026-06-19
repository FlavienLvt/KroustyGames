// backend/models/Score.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const User = require('./User');
const Score = sequelize.define('Score', {
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gameSlug: {
    type: DataTypes.STRING,
    allowNull: false
    // Ça stockera par exemple '2048', 'krousty-run', etc.
  }
}, {
  tableName: 'scores',
  timestamps: true // Pratique pour savoir QUAND le score a été fait
});

// Création de la relation : Un User a plusieurs Scores, et un Score appartient à un User
User.hasMany(Score, { foreignKey: 'userId', onDelete: 'CASCADE' });
Score.belongsTo(User, { foreignKey: 'userId' });

module.exports = Score;