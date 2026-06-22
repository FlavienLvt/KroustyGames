const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const User = require('./User');
const Badge = require('./Badge');

const UserBadge = sequelize.define('UserBadge', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE'
  },
  badgeKey: {
    type: DataTypes.STRING,
    allowNull: false,
    references: { model: Badge, key: 'key' }
  },
  earnedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_badges',
  indexes: [
    { unique: true, fields: ['userId', 'badgeKey'] }
  ]
});

User.hasMany(UserBadge, { foreignKey: 'userId' });
UserBadge.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserBadge;
