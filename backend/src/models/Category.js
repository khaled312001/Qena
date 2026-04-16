const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  description: { type: DataTypes.TEXT },
  icon: { type: DataTypes.STRING(80), defaultValue: 'MapPin' },
  color: { type: DataTypes.STRING(20), defaultValue: '#0ea5e9' },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'categories' });

module.exports = Category;
