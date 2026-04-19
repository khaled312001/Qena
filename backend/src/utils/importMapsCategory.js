// Generic importer: loads a JSON file of places into a specific category.
// Usage: node src/utils/importMapsCategory.js <category-slug> <json-file>
// Example: node src/utils/importMapsCategory.js hotels database/google_maps_hotels.json
// Dedupes by normalized name within the category, enriches existing entries.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Category, Service } = require('../models');

function norm(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652ـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[^\w\u0600-\u06FF]+/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

async function main() {
  const slug = process.argv[2];
  let filePath = process.argv[3];
  if (!slug || !filePath) {
    console.error('Usage: node importMapsCategory.js <category-slug> <json-file>');
    process.exit(1);
  }
  if (!path.isAbsolute(filePath)) {
    filePath = path.join(__dirname, '../../../', filePath);
  }
  if (!fs.existsSync(filePath)) { console.error('file not found:', filePath); process.exit(1); }

  await sequelize.authenticate();
  const cat = await Category.findOne({ where: { slug } });
  if (!cat) { console.error('category not found:', slug); process.exit(1); }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const existing = await Service.findAll({ where: { category_id: cat.id } });
  const byName = new Map(existing.map((s) => [norm(s.name), s]));
  console.log(`category=${slug}, existing=${existing.length}, incoming=${raw.length}`);

  let inserted = 0, enriched = 0, skipped = 0;
  for (const r of raw) {
    if (!r.name) continue;
    const key = norm(r.name);
    const match = byName.get(key);

    // Also try to match shorter English or Arabic portion
    let realMatch = match;
    if (!realMatch) {
      for (const [k, v] of byName.entries()) {
        if (k.length < 4) continue;
        if (key.includes(k) || k.includes(key)) { realMatch = v; break; }
      }
    }

    const desc = r.description || (r.rating ? `تقييم ${r.rating}${r.reviews ? ` (${r.reviews} مراجعة)` : ''}` : null);

    if (realMatch) {
      const patch = {};
      if (!realMatch.description && desc) patch.description = desc;
      if (!realMatch.address && r.address) patch.address = r.address.slice(0, 255);
      if (!realMatch.phone && r.phone) patch.phone = r.phone.slice(0, 60);
      if (!realMatch.alt_phone && r.alt_phone) patch.alt_phone = r.alt_phone.slice(0, 60);
      if (!realMatch.tags && r.tags) patch.tags = r.tags.slice(0, 255);
      if (!realMatch.price_range && r.price_range) patch.price_range = r.price_range.slice(0, 60);
      if (!realMatch.working_hours && r.working_hours) patch.working_hours = r.working_hours.slice(0, 160);
      if (!realMatch.lat && r.lat) patch.lat = r.lat;
      if (!realMatch.lng && r.lng) patch.lng = r.lng;
      if (r.is_featured && !realMatch.is_featured) patch.is_featured = true;
      if (Object.keys(patch).length) {
        await realMatch.update(patch);
        enriched++;
      } else { skipped++; }
      continue;
    }
    await Service.create({
      category_id: cat.id,
      name: r.name.slice(0, 160),
      description: desc,
      city: r.city || 'قنا',
      address: r.address ? r.address.slice(0, 255) : null,
      phone: r.phone ? r.phone.slice(0, 60) : null,
      alt_phone: r.alt_phone ? r.alt_phone.slice(0, 60) : null,
      tags: r.tags ? r.tags.slice(0, 255) : null,
      price_range: r.price_range ? r.price_range.slice(0, 60) : null,
      working_hours: r.working_hours ? r.working_hours.slice(0, 160) : null,
      lat: r.lat || null,
      lng: r.lng || null,
      is_featured: !!r.is_featured,
      status: 'approved',
    });
    inserted++;
    byName.set(key, { id: -1 });
  }
  const total = await Service.count({ where: { category_id: cat.id } });
  console.log(`✓ [${slug}] inserted=${inserted}, enriched=${enriched}, skipped=${skipped}, total=${total}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
