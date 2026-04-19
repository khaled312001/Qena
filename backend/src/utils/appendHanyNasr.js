// Append verified hany-nasr.com listings to services table (deduped by name)
require('dotenv').config();
const { sequelize, Category, Service } = require('../models');
const listings = require('./hanyNasrData');

const HERO = {
  restaurants: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=75',
  cafes: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=75',
  shops: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=75',
};

async function main() {
  await sequelize.authenticate();
  const cats = await Category.findAll();
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  let added = 0, skipped = 0;
  for (const it of listings) {
    const category_id = catMap[it.cat];
    if (!category_id) { console.log('! no cat', it.cat); continue; }
    const exists = await Service.findOne({ where: { category_id, name: it.name } });
    if (exists) { skipped++; continue; }
    const { cat, ...rest } = it;
    await Service.create({
      ...rest,
      category_id,
      status: 'approved',
      image_url: HERO[cat] || null,
    });
    added++;
  }
  console.log(`✓ appended=${added}, skipped=${skipped}, total services=${await Service.count()}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
