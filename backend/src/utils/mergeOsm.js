// Merge OSM places JSON into the Services table.
// Run via: node src/utils/mergeOsm.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Category, Service } = require('../models');

// Resolve OSM json - either in ../../database or in backend/data
const CANDIDATES = [
  path.join(__dirname, '../../../database/osm_places.json'),
  path.join(__dirname, '../../data/osm_places.json'),
];
const file = CANDIDATES.find((p) => fs.existsSync(p));
if (!file) {
  console.error('osm_places.json not found at any of:', CANDIDATES);
  process.exit(1);
}

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

  // Ensure tourism category exists
  const [tourism] = await Category.findOrCreate({
    where: { slug: 'tourism' },
    defaults: {
      slug: 'tourism',
      name: 'أماكن سياحية',
      icon: 'Landmark',
      color: '#b45309',
      sort_order: 13,
      description: 'المعابد والآثار والمعالم السياحية في محافظة قنا',
    },
  });

  const cats = await Category.findAll();
  const slugToId = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  let added = 0, skipped = 0;

  for (const [slug, items] of Object.entries(raw)) {
    const category_id = slugToId[slug];
    if (!category_id) { console.log(`! no category for ${slug}, skipping`); continue; }

    for (const it of items) {
      if (!it.name || it.name.length < 2) { skipped++; continue; }

      // Dedupe by (category_id, name)
      const exists = await Service.findOne({ where: { category_id, name: it.name } });
      if (exists) {
        // Enrich existing record with missing fields
        const patch = {};
        if (!exists.lat && it.lat) patch.lat = it.lat;
        if (!exists.lng && it.lng) patch.lng = it.lng;
        if (!exists.phone && it.phone) patch.phone = it.phone;
        if (!exists.address && it.address) patch.address = it.address;
        if (!exists.working_hours && it.working_hours) patch.working_hours = it.working_hours;
        if (!exists.website && it.website) patch.website = it.website;
        if (!exists.image_url) patch.image_url = HERO[slug] || null;
        if (Object.keys(patch).length) await exists.update(patch);
        skipped++;
        continue;
      }

      await Service.create({
        category_id,
        name: it.name.slice(0, 160),
        description: (it.description || '').slice(0, 1000) || null,
        city: it.city || 'قنا',
        address: (it.address || '').slice(0, 255) || null,
        lat: it.lat || null,
        lng: it.lng || null,
        phone: (it.phone || '').slice(0, 60) || null,
        website: (it.website || '').slice(0, 255) || null,
        working_hours: (it.working_hours || '').slice(0, 160) || null,
        tags: (it.tags || '').slice(0, 255) || null,
        image_url: HERO[slug] || null,
        status: 'approved',
      });
      added++;
    }
  }

  const total = await Service.count();
  console.log(`✓ Merged OSM: added=${added} skipped=${skipped} total services=${total}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
