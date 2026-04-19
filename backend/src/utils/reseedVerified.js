// Wipe services + public_numbers + re-seed with ONLY verified real data
// Run: npm run reseedVerified
require('dotenv').config();
const { sequelize, Category, Service, PublicNumber } = require('../models');
const { categories, services, publicNumbers } = require('./verifiedData');

const HERO = {
  hospitals: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=75',
  pharmacies: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=75',
  clinics: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=75',
  hotels: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=75',
  restaurants: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=75',
  cafes: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=75',
  shops: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=75',
  transport: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=75',
  government: 'https://images.unsplash.com/photo-1585468274952-66591eb14165?w=800&q=75',
  education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=75',
  banks: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=75',
  'gas-stations': 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&q=75',
  tourism: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Dendera_7_977.PNG/800px-Dendera_7_977.PNG',
};

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  console.log('› wiping services + public_numbers...');
  await Service.destroy({ where: {}, truncate: false });
  await PublicNumber.destroy({ where: {}, truncate: false });

  console.log('› upserting categories...');
  const catMap = {};
  for (const c of categories) {
    const [row] = await Category.findOrCreate({ where: { slug: c.slug }, defaults: c });
    await row.update({ name: c.name, icon: c.icon, color: c.color, sort_order: c.sort_order, description: c.description });
    catMap[c.slug] = row.id;
  }

  console.log('› seeding verified services...');
  let added = 0;
  for (const s of services) {
    const category_id = catMap[s.cat];
    if (!category_id) { console.log('! no cat for', s.cat); continue; }
    if (!s.name) continue;
    const { cat, ...rest } = s;
    await Service.create({
      ...rest,
      category_id,
      status: 'approved',
      image_url: s.image_url || HERO[cat] || null,
    });
    added++;
  }

  console.log('› seeding verified public numbers...');
  let numAdded = 0;
  for (const p of publicNumbers) {
    await PublicNumber.create({ ...p, is_active: true });
    numAdded++;
  }

  const counts = {
    categories: await Category.count(),
    services: await Service.count(),
    numbers: await PublicNumber.count(),
  };
  console.log(`✓ Reseed complete: ${added} services, ${numAdded} public numbers, ${counts.categories} categories`);
  console.log('  breakdown:', counts);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
