const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PublicNumber = sequelize.define('PublicNumber', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  group_name: { type: DataTypes.STRING(80), allowNull: false },
  name: { type: DataTypes.STRING(160), allowNull: false },
  phone: { type: DataTypes.STRING(60), allowNull: false },
  description: { type: DataTypes.STRING(255) },
  is_emergency: { type: DataTypes.BOOLEAN, defaultValue: false },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'public_numbers',
  indexes: [{ fields: ['group_name'] }, { fields: ['is_emergency'] }],
});

module.exports = PublicNumber;
