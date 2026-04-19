// Import Serper.dev Qena data into services table
// Dedupes against existing by (name+phone) or (lat/lng within 30m) then inserts new ones
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Category, Service } = require('../models');

const RAW_PATH = path.join(__dirname, '../../../database/serper_raw.json');

// Qena city (مركز قنا) tight bbox
const QENA_CITY_BBOX = { s: 26.05, n: 26.30, w: 32.65, e: 32.82 };
// Other centers to EXCLUDE from Qena-city filter
const OTHER_CENTERS = ['نجع حمادي', 'نجع حمادى', 'قوص', 'دشنا', 'فرشوط', 'أبو تشت', 'ابو تشت', 'نقادة', 'قفط', 'الوقف'];

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

// Haversine distance in meters
function dist(a, b, c, d) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(c - a), dLng = toRad(d - b);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function normalize(s) { return (s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }

function inQenaCity(p) {
  // Must be in tight bbox of Qena city
  if (!(p.lat >= QENA_CITY_BBOX.s && p.lat <= QENA_CITY_BBOX.n && p.lng >= QENA_CITY_BBOX.w && p.lng <= QENA_CITY_BBOX.e)) return false;
  // Must not mention another center in address
  const addr = p.address || '';
  for (const c of OTHER_CENTERS) if (addr.includes(c)) return false;
  return true;
}

function cleanPhone(phone) {
  if (!phone) return null;
  return phone.toString().replace(/[^0-9+]/g, '').replace(/^\+?20/, '0');
}

async function main() {
  await sequelize.authenticate();
  const raw = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));

  // ONLY مركز قنا (as user requested)
  const places = raw.filter(inQenaCity);
  console.log(`raw=${raw.length}, مركز قنا=${places.length}`);

  const cats = await Category.findAll();
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  // Existing services (to dedupe against)
  const existing = await Service.findAll({ attributes: ['id', 'category_id', 'name', 'phone', 'lat', 'lng'] });
  console.log(`existing=${existing.length}`);

  function findDup(p, category_id) {
    const n = normalize(p.name);
    for (const e of existing) {
      if (e.category_id !== category_id) continue;
      if (normalize(e.name) === n) return e;
      if (e.lat && e.lng && p.lat && p.lng) {
        const d = dist(Number(e.lat), Number(e.lng), p.lat, p.lng);
        if (d < 30 && (normalize(e.name).includes(n) || n.includes(normalize(e.name)))) return e;
      }
    }
    return null;
  }

  let inserted = 0, enriched = 0, skipped = 0;
  for (const p of places) {
    const category_id = catMap[p.cat];
    if (!category_id) { skipped++; continue; }
    const dup = findDup(p, category_id);
    if (dup) {
      // enrich missing fields
      const patch = {};
      if (!dup.phone && p.phone) patch.phone = cleanPhone(p.phone);
      if (!dup.lat && p.lat) patch.lat = p.lat;
      if (!dup.lng && p.lng) patch.lng = p.lng;
      if (Object.keys(patch).length) {
        await Service.update(patch, { where: { id: dup.id } });
        enriched++;
      } else {
        skipped++;
      }
      continue;
    }
    await Service.create({
      category_id,
      name: p.name.slice(0, 160),
      description: p.category ? `${p.category}${p.rating ? ` · تقييم ${p.rating} (${p.reviews || 0} مراجعة)` : ''}` : null,
      city: 'قنا',
      address: (p.address || '').slice(0, 255) || null,
      lat: p.lat || null,
      lng: p.lng || null,
      phone: cleanPhone(p.phone),
      website: (p.website || '').slice(0, 255) || null,
      image_url: HERO[p.cat] || null,
      tags: (p.category || '') + (p.types ? ',' + p.types.slice(0, 3).join(',') : ''),
      status: 'approved',
    });
    inserted++;
    existing.push({ id: Date.now(), category_id, name: p.name, phone: p.phone, lat: p.lat, lng: p.lng });
  }

  const total = await Service.count();
  console.log(`\n✓ inserted=${inserted}, enriched=${enriched}, skipped=${skipped}`);
  console.log(`  total services now: ${total}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
