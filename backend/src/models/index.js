const sequelize = require('../config/db');
const Category = require('./Category');
const Service = require('./Service');
const PublicNumber = require('./PublicNumber');
const Suggestion = require('./Suggestion');
const Admin = require('./Admin');

Category.hasMany(Service, { foreignKey: 'category_id', as: 'services' });
Service.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = {
  sequelize,
  Category,
  Service,
  PublicNumber,
  Suggestion,
  Admin,
};
