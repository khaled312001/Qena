const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Suggestion = sequelize.define('Suggestion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  kind: {
    type: DataTypes.ENUM('new_service', 'correction', 'complaint', 'other'),
    defaultValue: 'other',
  },
  subject: { type: DataTypes.STRING(200) },
  message: { type: DataTypes.TEXT, allowNull: false },
  name: { type: DataTypes.STRING(120) },
  contact: { type: DataTypes.STRING(120) },
  service_id: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'rejected'),
    defaultValue: 'pending',
  },
  admin_note: { type: DataTypes.TEXT },
}, {
  tableName: 'suggestions',
  indexes: [{ fields: ['status'] }],
});

module.exports = Suggestion;
