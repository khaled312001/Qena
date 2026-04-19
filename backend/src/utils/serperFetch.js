// Fetch real Qena places via Serper.dev (legitimate Google Places API wrapper)
// Usage: SERPER_KEY=xxx node src/utils/serperFetch.js
// Saves results to JSON file (then run importSerper.js to load to DB)

const fs = require('fs');
const path = require('path');
const https = require('https');

const KEY = process.env.SERPER_KEY;
if (!KEY) { console.error('SERPER_KEY env var required'); process.exit(1); }

// All Arabic queries to cover every service type. Each query → up to 10 places per page.
// We paginate up to 3 pages when results are full.
const QUERIES = [
  // Health
  { q: 'مستشفى', cat: 'hospitals' },
  { q: 'مستشفى خاص', cat: 'hospitals' },
  { q: 'صيدلية', cat: 'pharmacies' },
  { q: 'صيدلية 24 ساعة', cat: 'pharmacies' },
  { q: 'مركز طبي', cat: 'clinics' },
  { q: 'عيادة طبيب', cat: 'clinics' },
  { q: 'معمل تحاليل', cat: 'clinics' },
  { q: 'مركز أشعة', cat: 'clinics' },
  // Food
  { q: 'مطعم', cat: 'restaurants' },
  { q: 'مطعم مشويات', cat: 'restaurants' },
  { q: 'مطعم كشري', cat: 'restaurants' },
  { q: 'مطعم وجبات سريعة', cat: 'restaurants' },
  { q: 'بيتزا', cat: 'restaurants' },
  { q: 'كافيه', cat: 'cafes' },
  { q: 'قهوة', cat: 'cafes' },
  { q: 'حلواني', cat: 'cafes' },
  // Lodging
  { q: 'فندق', cat: 'hotels' },
  // Retail
  { q: 'سوبر ماركت', cat: 'shops' },
  { q: 'محل ملابس', cat: 'shops' },
  { q: 'محل موبايلات', cat: 'shops' },
  { q: 'محل أثاث', cat: 'shops' },
  { q: 'مول', cat: 'shops' },
  // Transport
  { q: 'محطة قطار', cat: 'transport' },
  { q: 'موقف أتوبيس', cat: 'transport' },
  // Government
  { q: 'مديرية حكومية', cat: 'government' },
  { q: 'قسم شرطة', cat: 'government' },
  { q: 'مكتب بريد', cat: 'government' },
  { q: 'محكمة', cat: 'government' },
  // Education
  { q: 'كلية', cat: 'education' },
  { q: 'مدرسة', cat: 'education' },
  { q: 'معهد', cat: 'education' },
  // Banking
  { q: 'بنك', cat: 'banks' },
  { q: 'ماكينة صراف آلي', cat: 'banks' },
  // Gas
  { q: 'محطة بنزين', cat: 'gas-stations' },
  { q: 'محطة وقود', cat: 'gas-stations' },
  // Tourism
  { q: 'معبد', cat: 'tourism' },
  { q: 'مسجد أثري', cat: 'tourism' },
  { q: 'موقع أثري', cat: 'tourism' },
];

// Qena governorate bbox roughly — we'll filter by lat/lng
// But the location param to Serper constrains the search. We use "Qena, Egypt" and "Qena Governorate, Egypt"
const LOCATIONS = [
  'Qena, Egypt',
  'Qena Governorate, Egypt',
];

function post(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      method: 'POST',
      hostname: 'google.serper.dev',
      path: '/places',
      headers: {
        'X-API-KEY': KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => { chunks += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  const all = new Map();       // dedupe key → place
  let creditsUsed = 0;

  const outPath = path.join(__dirname, '../../../database/serper_raw.json');
  const progressPath = path.join(__dirname, '../../../database/serper_progress.json');

  // resume from progress if exists
  if (fs.existsSync(progressPath)) {
    const prev = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
    for (const [k, v] of Object.entries(prev)) all.set(k, v);
    console.log(`resumed with ${all.size} places from previous run`);
  }

  for (const { q, cat } of QUERIES) {
    for (const location of LOCATIONS) {
      for (let page = 1; page <= 3; page++) {
        const body = { q, location, gl: 'eg', hl: 'ar', page };
        let res;
        try { res = await post(body); } catch (e) { console.error(`! ${q} p${page}:`, e.message); await sleep(2000); continue; }
        creditsUsed++;
        const places = res.places || [];
        console.log(`${q} @ ${location} p${page} -> ${places.length}`);
        if (places.length === 0) break;

        for (const p of places) {
          if (!p.title) continue;
          // Dedupe key: prefer placeId / cid, fallback to title + lat/lng
          const key = p.placeId || p.cid || `${p.title}|${p.latitude || ''}|${p.longitude || ''}`;
          if (all.has(key)) continue;
          all.set(key, {
            cat,
            query: q,
            name: p.title,
            rating: p.rating || null,
            reviews: p.ratingCount || null,
            phone: p.phoneNumber || null,
            address: p.address || null,
            lat: p.latitude || null,
            lng: p.longitude || null,
            website: p.website || null,
            category: p.category || null,
            types: p.types || null,
          });
        }

        // Save progress after each page
        const obj = Object.fromEntries(all);
        fs.writeFileSync(progressPath, JSON.stringify(obj, null, 2));

        if (places.length < 10) break;   // last page
        await sleep(1200);               // polite rate limit
      }
    }
  }

  // Filter to Qena governorate area by lat/lng
  // Qena bbox: lat 25.5..26.6, lng 32.1..33.2
  const filtered = [...all.values()].filter((p) => {
    if (p.lat == null || p.lng == null) return false;
    return p.lat >= 25.4 && p.lat <= 26.7 && p.lng >= 32.0 && p.lng <= 33.3;
  });

  console.log(`\n=== DONE ===`);
  console.log(`credits used: ${creditsUsed}`);
  console.log(`total unique: ${all.size}`);
  console.log(`after bbox filter: ${filtered.length}`);

  fs.writeFileSync(outPath, JSON.stringify(filtered, null, 2));
  console.log(`saved -> ${outPath}`);

  // summary per category
  const byCat = {};
  for (const p of filtered) byCat[p.cat] = (byCat[p.cat] || 0) + 1;
  console.log('by category:', byCat);

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
