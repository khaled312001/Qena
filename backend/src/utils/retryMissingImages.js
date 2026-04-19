// For services that still have NULL image_url (or unsplash), retry Serper with alternate queries
// Tries: 1) name alone, 2) name + category, 3) name + "Qena Egypt"
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const { sequelize, Service, Category } = require('../models');

const KEY = process.env.SERPER_KEY || '4ab5e5b3a2f955a7235f2540c775a6985c1425b2';
const CACHE_PATH = path.join(__dirname, '../../../database/image_cache_retry.json');

const ALLOW = [
  'googleusercontent.com', 'ggpht.com', 'wikimedia.org', 'wikipedia.org',
  'tacdn.com', 'tripadvisor.com', 'agoda.net', 'bstatic.com',
  'gstatic.com', 'cloudinary.com', 'wixstatic.com',
  'youm7.com', 'elwatannews.com', 'elbalad.news', 'shorouknews.com',
  'akhbarelyom.com', 'ahram.org.eg', 'almasryalyoum.com', 'elfagr.org',
  'menuegypt.com', 'healtheg.com', 'welp-prod.s3.amazonaws.com',
  'restaurantguru.com', 'svu.edu.eg', 'qena.gov.eg', 'egypt.travel',
  'blogger.googleusercontent',
];
const BLOCK = [
  'lookaside.fbsbx.com', 'facebook.com', 'fbcdn.net', 'scontent',
  'cdninstagram', 'instagram.com', 'pinterest', 'twimg.com',
  'aliexpress', 'ebay', 'youtube.com', 'ytimg.com', 'tiktok',
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
function blocked(u) { const x = (u || '').toLowerCase(); return BLOCK.some((d) => x.includes(d)); }
function allowed(u) { const x = (u || '').toLowerCase(); return ALLOW.some((d) => x.includes(d)); }
function score(img) {
  const url = (img.imageUrl || '').toLowerCase();
  if (blocked(url)) return -1000;
  let s = 0;
  if (allowed(url)) s += 20;
  const w = img.imageWidth || 0, h = img.imageHeight || 0;
  if (w >= 600 && h >= 400) s += 8;
  else if (w >= 400 && h >= 300) s += 4;
  if (w > h) s += 3;
  if (/\.(jpg|jpeg|webp|png)(\?|$)/.test(url)) s += 3;
  if (url.endsWith('.svg') || url.includes('icon') || url.includes('logo')) s -= 5;
  return s;
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function tryQuery(q) {
  try {
    const r = await post(q);
    const imgs = (r.images || []).filter((i) => i.imageUrl && !blocked(i.imageUrl));
    if (!imgs.length) return null;
    imgs.sort((a, b) => score(b) - score(a));
    if (score(imgs[0]) <= 0) return null;
    return imgs[0].imageUrl;
  } catch (_) { return null; }
}

async function main() {
  await sequelize.authenticate();
  let cache = {};
  if (fs.existsSync(CACHE_PATH)) cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));

  const { Op } = require('sequelize');
  const services = await Service.findAll({
    where: { status: 'approved', [Op.or]: [{ image_url: null }, { image_url: { [Op.like]: '%unsplash%' } }] },
    include: [{ model: Category, as: 'category', attributes: ['name'] }],
    order: [['is_featured', 'DESC'], ['id', 'ASC']],
  });
  console.log(`services needing image: ${services.length}`);

  let found = 0, stillNone = 0, credits = 0;
  for (const s of services) {
    const key = s.name.trim();
    if (cache[key]) { await s.update({ image_url: cache[key] }); found++; continue; }
    const cat = s.category?.name || '';
    const attempts = [`${s.name} قنا`, `${s.name} ${cat} قنا`, `${s.name}`, `${s.name} Qena Egypt`];
    let best = null;
    for (const q of attempts) {
      best = await tryQuery(q);
      credits++;
      await sleep(900);
      if (best) break;
    }
    if (best) {
      cache[key] = best;
      await s.update({ image_url: best });
      found++;
    } else {
      cache[key] = null;
      await s.update({ image_url: null });
      stillNone++;
    }
    if (credits % 20 === 0) {
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
      console.log(`  credits=${credits}, found=${found}, none=${stillNone}`);
    }
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`\n✓ credits=${credits}, found=${found}, stillNone=${stillNone}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
