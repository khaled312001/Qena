// Import restaurants extracted from Google Maps search for Qena.
// Dedupes by normalized name within restaurants category.
// Enriches existing entries (rating, reviews, price, hours, tags).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Category, Service } = require('../models');

const DATA_PATH = path.join(__dirname, '../../../database/google_maps_restaurants.json');

function norm(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652ـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[^\w\u0600-\u06FF]+/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

async function main() {
  await sequelize.authenticate();
  const cat = await Category.findOne({ where: { slug: 'restaurants' } });
  if (!cat) { console.error('restaurants category not found'); process.exit(1); }

  const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const existing = await Service.findAll({ where: { category_id: cat.id } });
  const byName = new Map(existing.map((s) => [norm(s.name), s]));
  console.log(`existing restaurants: ${existing.length}, new entries: ${raw.length}`);

  let inserted = 0, enriched = 0, skipped = 0;
  for (const r of raw) {
    if (!r.name) continue;
    const key = norm(r.name);
    const existingMatch = byName.get(key);
    const descParts = [];
    if (r.tags) descParts.push(r.tags.split(/[,،]/)[0].trim());
    if (r.rating) descParts.push(`تقييم ${r.rating} (${r.reviews || 0} مراجعة)`);
    const description = descParts.join(' · ') || null;

    if (existingMatch) {
      const patch = {};
      if (!existingMatch.description && description) patch.description = description;
      if (!existingMatch.address && r.address) patch.address = r.address.slice(0, 255);
      if (!existingMatch.tags && r.tags) patch.tags = r.tags.slice(0, 255);
      if (!existingMatch.price_range && r.price_range) patch.price_range = r.price_range.slice(0, 60);
      if (!existingMatch.working_hours && r.working_hours) patch.working_hours = r.working_hours.slice(0, 160);
      if (r.is_featured && !existingMatch.is_featured) patch.is_featured = true;
      if (Object.keys(patch).length) {
        await existingMatch.update(patch);
        enriched++;
      } else { skipped++; }
      continue;
    }
    await Service.create({
      category_id: cat.id,
      name: r.name.slice(0, 160),
      description,
      city: r.city || 'قنا',
      address: r.address ? r.address.slice(0, 255) : null,
      tags: r.tags ? r.tags.slice(0, 255) : null,
      price_range: r.price_range ? r.price_range.slice(0, 60) : null,
      working_hours: r.working_hours ? r.working_hours.slice(0, 160) : null,
      is_featured: !!r.is_featured,
      status: 'approved',
    });
    inserted++;
    byName.set(key, { id: -1 });
  }
  const total = await Service.count({ where: { category_id: cat.id } });
  console.log(`✓ inserted=${inserted}, enriched=${enriched}, skipped=${skipped}, total restaurants=${total}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
