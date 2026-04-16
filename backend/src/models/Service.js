const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(160), allowNull: false },
  description: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING(80), defaultValue: 'قنا' },
  address: { type: DataTypes.STRING(255) },
  lat: { type: DataTypes.DECIMAL(10, 7) },
  lng: { type: DataTypes.DECIMAL(10, 7) },
  phone: { type: DataTypes.STRING(60) },
  alt_phone: { type: DataTypes.STRING(60) },
  whatsapp: { type: DataTypes.STRING(60) },
  website: { type: DataTypes.STRING(255) },
  working_hours: { type: DataTypes.STRING(160) },
  price_range: { type: DataTypes.STRING(60) },
  image_url: { type: DataTypes.STRING(500) },
  tags: { type: DataTypes.STRING(255) },
  status: {
    type: DataTypes.ENUM('approved', 'pending', 'rejected'),
    defaultValue: 'approved',
  },
  submitted_by_name: { type: DataTypes.STRING(120) },
  submitted_by_contact: { type: DataTypes.STRING(120) },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'services',
  indexes: [
    { fields: ['category_id'] },
    { fields: ['status'] },
    { fields: ['is_featured'] },
  ],
});

module.exports = Service;
