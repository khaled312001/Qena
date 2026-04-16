const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Admin = sequelize.define('Admin', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  display_name: { type: DataTypes.STRING(120) },
  role: { type: DataTypes.ENUM('admin', 'editor'), defaultValue: 'admin' },
  last_login_at: { type: DataTypes.DATE },
}, { tableName: 'admins' });

module.exports = Admin;
