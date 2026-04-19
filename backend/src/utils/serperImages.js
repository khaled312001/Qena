// Fetch images for every service via Serper /images (Google Images API wrapper)
// STRICT filtering: only accepts images from domains that allow hot-linking
// Usage: SERPER_KEY=xxx node src/utils/serperImages.js [--refresh]

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const { sequelize, Service } = require('../models');

const KEY = process.env.SERPER_KEY || '4ab5e5b3a2f955a7235f2540c775a6985c1425b2';
const REFRESH = process.argv.includes('--refresh');
const CACHE_PATH = path.join(__dirname, '../../../database/image_cache.json');

// DOMAINS that reliably allow hot-linking (tested)
const ALLOW = [
  'googleusercontent.com',     // Google-hosted photos (from Maps)
  'ggpht.com',
  'wikimedia.org',
  'wikipedia.org',
  'tacdn.com',                 // TripAdvisor CDN
  'tripadvisor.com',
  'agoda.net',
  'bstatic.com',               // Booking.com CDN
  'cf.bstatic.com',
  'cloudinary.com',
  'unsplash.com',              // fallback (stock)
  'pexels.com',
  'imgur.com',
  'wixstatic.com',
  'squarespace-cdn.com',
  'shopify.com',
  'gstatic.com',
  'amazonaws.com',             // many news/blog CDNs
];

// DOMAINS to BLOCK (known hot-link-blocked or irrelevant)
const BLOCK = [
  'lookaside.fbsbx.com',       // Facebook crawler — blocks hot-linking
  'facebook.com',
  'fbcdn.net',
  'scontent',                  // fb CDN
  'cdninstagram.com',
  'instagram.com',
  'pinterest',
  'twimg.com',                 // Twitter
  'aliexpress',
  'amazon.com/images',
  'ebay',
  'youtube.com',
  'ytimg.com',
  'tiktok',
];

function post(q) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ q, gl: 'eg', hl: 'ar', location: 'Qena, Egypt' });
    const req = https.request({
      method: 'POST', hostname: 'google.serper.dev', path: '/images',
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

function isBlocked(url) {
  const u = (url || '').toLowerCase();
  return BLOCK.some((d) => u.includes(d));
}
function isAllowed(url) {
  const u = (url || '').toLowerCase();
  return ALLOW.some((d) => u.includes(d));
}

function score(img) {
  let s = 0;
  const url = (img.imageUrl || '').toLowerCase();
  if (isBlocked(url)) return -1000;
  if (isAllowed(url)) s += 20;
  const w = img.imageWidth || 0, h = img.imageHeight || 0;
  if (w >= 600 && h >= 400) s += 8;
  else if (w >= 400 && h >= 300) s += 4;
  else if (w < 250 || h < 180) s -= 10;
  if (w > h) s += 3;       // prefer landscape
  if (url.endsWith('.svg') || url.includes('icon') || url.includes('logo')) s -= 5;
  if (/\.(jpg|jpeg|webp|png)(\?|$)/.test(url)) s += 3;  // direct image file
  return s;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  await sequelize.authenticate();

  let cache = {};
  if (!REFRESH && fs.existsSync(CACHE_PATH)) cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));

  const services = await Service.findAll({
    where: { status: 'approved' },
    attributes: ['id', 'name', 'city', 'address', 'image_url'],
    order: [['is_featured', 'DESC'], ['id', 'ASC']],
  });
  console.log(`services=${services.length}, cached=${Object.keys(cache).length}, refresh=${REFRESH}`);

  let fetched = 0, skipped = 0, updated = 0, credits = 0, rejected = 0;
  for (const s of services) {
    const key = s.name.trim();
    let best;
    if (!REFRESH && cache[key] !== undefined) {
      best = cache[key];
      skipped++;
    } else {
      const q = `${s.name} قنا`;
      try {
        const r = await post(q);
        credits++;
        const imgs = (r.images || []).filter((i) => i.imageUrl && !isBlocked(i.imageUrl));
        if (imgs.length === 0) { cache[key] = null; rejected++; }
        else {
          imgs.sort((a, b) => score(b) - score(a));
          // Only accept if top image scored positively
          const topScore = score(imgs[0]);
          if (topScore > 0) {
            best = imgs[0].imageUrl;
            cache[key] = best;
            fetched++;
          } else {
            cache[key] = null; rejected++;
          }
        }
      } catch (e) {
        console.log('! err', s.name, e.message);
        await sleep(3000);
        continue;
      }
      await sleep(900);
      if (credits % 25 === 0) {
        fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
        console.log(`  progress: credits=${credits}, fetched=${fetched}, rejected=${rejected}`);
      }
    }

    if (best && best !== s.image_url) {
      await s.update({ image_url: best });
      updated++;
    }
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`\n✓ credits=${credits}, fetched=${fetched}, rejected=${rejected}, skipped(cached)=${skipped}, updated=${updated}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
