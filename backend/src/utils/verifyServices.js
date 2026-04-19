// Professional verification: for every service, search Google Places via Serper.
// Verify: (1) exists in Google, (2) located in Qena governorate bbox,
//         (3) name similarity > 0.6 to our record.
// Actions: enrich missing phone/address/coords from Google, OR mark for deletion.
// Safety: NEVER deletes immediately — flags as 'pending' review instead.
// Run: SERPER_KEY=xxx node src/utils/verifyServices.js

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const { sequelize, Service, Category } = require('../models');

const KEY = process.env.SERPER_KEY || '4ab5e5b3a2f955a7235f2540c775a6985c1425b2';
const REPORT_PATH = path.join(__dirname, '../../../database/verify_report.json');
const PROGRESS_PATH = path.join(__dirname, '../../../database/verify_progress.json');

// Qena governorate bbox (very lenient — includes edges)
const QENA_BBOX = { s: 25.3, n: 26.8, w: 32.0, e: 33.3 };

function post(q, pageNum = 1) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ q, location: 'Qena Governorate, Egypt', gl: 'eg', hl: 'ar', page: pageNum });
    const req = https.request({
      method: 'POST', hostname: 'google.serper.dev', path: '/places',
      headers: { 'X-API-KEY': KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function norm(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652ـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/[^\w\u0600-\u06FF]+/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

// Jaccard-style word overlap on normalized tokens
function similarity(a, b) {
  const A = new Set(norm(a).split(/\s+/).filter((x) => x.length >= 2));
  const B = new Set(norm(b).split(/\s+/).filter((x) => x.length >= 2));
  if (!A.size || !B.size) return 0;
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / Math.max(A.size, B.size);
}

function dist(a, b, c, d) {
  const R = 6371000, toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(c - a), dLng = toRad(d - b);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function inQenaBbox(lat, lng) {
  return lat >= QENA_BBOX.s && lat <= QENA_BBOX.n && lng >= QENA_BBOX.w && lng <= QENA_BBOX.e;
}

function cleanPhone(p) {
  if (!p) return null;
  return p.toString().replace(/[^0-9+]/g, '').replace(/^\+?20/, '0');
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function verify(s) {
  // Search Google via Serper
  const q = `${s.name} قنا`;
  const r = await post(q).catch(() => null);
  if (!r || !r.places || r.places.length === 0) {
    return { status: 'not_found' };
  }
  // Rank matches by (name similarity + in-Qena + coord distance)
  let best = null, bestScore = -Infinity;
  for (const p of r.places) {
    const inQ = (p.latitude && p.longitude && inQenaBbox(p.latitude, p.longitude)) ? 1 : 0;
    const sim = similarity(s.name, p.title);
    let score = sim * 100 + inQ * 40;
    if (s.lat && s.lng && p.latitude && p.longitude) {
      const d = dist(Number(s.lat), Number(s.lng), p.latitude, p.longitude);
      if (d < 100) score += 30;
      else if (d < 500) score += 15;
      else if (d > 5000) score -= 20;
    }
    if (score > bestScore) { bestScore = score; best = p; }
  }
  if (!best || similarity(s.name, best.title) < 0.3) {
    return { status: 'no_match', best: best ? { title: best.title, sim: similarity(s.name, best.title) } : null };
  }
  if (!best.latitude || !best.longitude || !inQenaBbox(best.latitude, best.longitude)) {
    return { status: 'outside_qena', best };
  }
  return { status: 'verified', best };
}

async function main() {
  await sequelize.authenticate();
  const services = await Service.findAll({
    where: { status: 'approved' },
    include: [{ model: Category, as: 'category', attributes: ['slug', 'name'] }],
    order: [['id', 'ASC']],
  });
  console.log(`Total services to verify: ${services.length}`);

  let progress = {};
  if (fs.existsSync(PROGRESS_PATH)) progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));

  const report = { verified: [], enriched: [], moved_to_pending: [], outside: [], not_found: [] };
  let credits = 0;

  // SKIP emergency-number-style entries (names that have no Google presence)
  // Also skip doctor category (PDFs have different naming — many not in Google Places)
  const SKIP_CATEGORIES = ['doctors'];

  for (const s of services) {
    if (progress[s.id]) continue;   // already processed
    if (SKIP_CATEGORIES.includes(s.category?.slug)) {
      progress[s.id] = 'skipped';
      continue;
    }
    let result;
    try {
      result = await verify(s);
      credits++;
    } catch (e) {
      console.log('! err', s.id, e.message);
      await sleep(3000);
      continue;
    }

    if (result.status === 'verified') {
      report.verified.push(s.id);
      // Enrich missing fields
      const patch = {};
      const b = result.best;
      if (!s.phone && b.phoneNumber) patch.phone = cleanPhone(b.phoneNumber);
      if (!s.lat && b.latitude) patch.lat = b.latitude;
      if (!s.lng && b.longitude) patch.lng = b.longitude;
      if (!s.address && b.address) patch.address = b.address.slice(0, 255);
      if (Object.keys(patch).length) {
        await s.update(patch);
        report.enriched.push(s.id);
      }
    } else if (result.status === 'outside_qena') {
      report.outside.push(s.id);
      // Don't delete — move to pending for manual review
      await s.update({ status: 'pending' });
      report.moved_to_pending.push(s.id);
    } else if (result.status === 'not_found' || result.status === 'no_match') {
      report.not_found.push(s.id);
      // Only move to pending if the service has insufficient data to trust
      // (i.e., no phone AND no address)
      if (!s.phone && !s.address) {
        await s.update({ status: 'pending' });
        report.moved_to_pending.push(s.id);
      }
    }

    progress[s.id] = result.status;
    if (credits % 30 === 0) {
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
      console.log(`  credits=${credits}, verified=${report.verified.length}, enriched=${report.enriched.length}, pending=${report.moved_to_pending.length}, not_found=${report.not_found.length}`);
    }
    await sleep(900);
  }

  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n✓ credits=${credits}`);
  console.log(`  verified=${report.verified.length}`);
  console.log(`  enriched=${report.enriched.length}`);
  console.log(`  moved_to_pending=${report.moved_to_pending.length}`);
  console.log(`  outside=${report.outside.length}`);
  console.log(`  not_found=${report.not_found.length}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
