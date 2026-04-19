// Dedupe services by: (normalized name + category) OR (phone match) OR (coords within 40m)
// Keeps the richer record (more fields filled) and deletes the duplicate.
require('dotenv').config();
const { sequelize, Service } = require('../models');

function norm(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652]/g, '')    // Arabic diacritics
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[^\w\u0600-\u06FF]+/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

function dist(a, b, c, d) {
  const R = 6371000, toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(c - a), dLng = toRad(d - b);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function richness(s) {
  let r = 0;
  if (s.phone) r += 3;
  if (s.address) r += 2;
  if (s.lat && s.lng) r += 2;
  if (s.website) r += 1;
  if (s.image_url && !s.image_url.includes('unsplash')) r += 3;
  if (s.description) r += 1;
  if (s.is_featured) r += 5;
  return r;
}

function normPhone(p) {
  if (!p) return null;
  return p.toString().replace(/[^0-9]/g, '').replace(/^20/, '0').replace(/^0+/, '0');
}

async function main() {
  await sequelize.authenticate();
  const all = await Service.findAll({ order: [['id', 'ASC']] });
  console.log(`Total services: ${all.length}`);

  const toDelete = new Set();

  // 1) Exact name-match within same category
  const nameKey = (s) => `${s.category_id}::${norm(s.name)}`;
  const byName = new Map();
  for (const s of all) {
    if (toDelete.has(s.id)) continue;
    const k = nameKey(s);
    if (byName.has(k)) {
      const other = byName.get(k);
      const loser = richness(s) >= richness(other) ? other : s;
      const keeper = loser === s ? other : s;
      toDelete.add(loser.id);
      byName.set(k, keeper);
    } else {
      byName.set(k, s);
    }
  }

  // 2) Same phone (across categories — cleanup same business listed twice)
  const byPhone = new Map();
  for (const s of all) {
    if (toDelete.has(s.id)) continue;
    const p = normPhone(s.phone);
    if (!p || p.length < 7) continue;
    if (byPhone.has(p)) {
      const other = byPhone.get(p);
      // only merge if same category OR similar name
      if (other.category_id === s.category_id || norm(other.name).slice(0, 6) === norm(s.name).slice(0, 6)) {
        const loser = richness(s) >= richness(other) ? other : s;
        const keeper = loser === s ? other : s;
        toDelete.add(loser.id);
        byPhone.set(p, keeper);
        continue;
      }
    }
    byPhone.set(p, s);
  }

  // 3) Coords within 40m AND similar name within same category
  const withCoords = all.filter((s) => !toDelete.has(s.id) && s.lat && s.lng);
  for (let i = 0; i < withCoords.length; i++) {
    if (toDelete.has(withCoords[i].id)) continue;
    for (let j = i + 1; j < withCoords.length; j++) {
      if (toDelete.has(withCoords[j].id)) continue;
      const a = withCoords[i], b = withCoords[j];
      if (a.category_id !== b.category_id) continue;
      const d = dist(Number(a.lat), Number(a.lng), Number(b.lat), Number(b.lng));
      if (d > 40) continue;
      const na = norm(a.name), nb = norm(b.name);
      if (na === nb || na.includes(nb) || nb.includes(na)) {
        const loser = richness(a) >= richness(b) ? b : a;
        toDelete.add(loser.id);
      }
    }
  }

  console.log(`Will delete ${toDelete.size} duplicates`);
  if (toDelete.size > 0) {
    await Service.destroy({ where: { id: [...toDelete] } });
  }
  console.log(`Remaining: ${await Service.count()}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
