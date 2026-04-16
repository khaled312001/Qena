require('dotenv').config();
const { sequelize, Category, Service, PublicNumber } = require('../models');
const { categories, services, publicNumbers } = require('./seedData');

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  console.log('› seeding categories...');
  const catMap = {};
  for (const c of categories) {
    const [row] = await Category.findOrCreate({ where: { slug: c.slug }, defaults: c });
    catMap[c.slug] = row.id;
  }

  console.log('› seeding services...');
  for (const s of services) {
    const category_id = catMap[s.cat];
    if (!category_id) continue;
    const exists = await Service.findOne({ where: { name: s.name, category_id } });
    if (exists) continue;
    const { cat, ...rest } = s;
    await Service.create({ ...rest, category_id, status: 'approved' });
  }

  console.log('› seeding public numbers...');
  for (const p of publicNumbers) {
    const exists = await PublicNumber.findOne({ where: { name: p.name, phone: p.phone } });
    if (!exists) await PublicNumber.create(p);
  }

  const counts = {
    categories: await Category.count(),
    services: await Service.count(),
    numbers: await PublicNumber.count(),
  };
  console.log('✓ Done:', counts);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
