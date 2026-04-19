// Import Google Maps ATMs into the 'banks' category — with proper city assignment
// (قنا / قفط / نقادة / قوص / فرشوط / نجع حمادي / دشنا / الوقف). Dedup by exact name,
// OR by coordinates within 25m.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Category, Service } = require('../models');

const FILE = path.join(__dirname, '../../../database/atms_google.json');

function dist(a, b, c, d) {
  if (!a || !b || !c || !d) return Infinity;
  const R = 6371000, toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(c - a), dLng = toRad(d - b);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function norm(s) {
  return (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

async function main() {
  await sequelize.authenticate();
  const banks = await Category.findOne({ where: { slug: 'banks' } });
  if (!banks) { console.error('banks category not found'); process.exit(1); }

  const atms = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  console.log(`to import: ${atms.length}`);

  const existing = await Service.findAll({
    where: { category_id: banks.id },
    attributes: ['id', 'name', 'lat', 'lng'],
  });

  let added = 0, skipped = 0;
  for (const a of atms) {
    // dedup: same normalized name OR within 25m of an existing coord
    const nn = norm(a.name);
    let dup = existing.find((e) => norm(e.name) === nn);
    if (!dup && a.lat && a.lng) {
      dup = existing.find((e) => e.lat && e.lng && dist(Number(e.lat), Number(e.lng), a.lat, a.lng) < 25);
    }
    if (dup) { skipped++; continue; }

    const tags = ['ATM', 'صراف آلي'];
    // detect bank tag
    const n = a.name.toLowerCase();
    if (n.includes('nbe') || a.name.includes('الأهلي')) tags.push('البنك الأهلي المصري');
    if (n.includes('qnb') || a.name.includes('QNB')) tags.push('QNB');
    if (n.includes('cib')) tags.push('CIB');
    if (a.name.includes('بنك مصر')) tags.push('بنك مصر');
    if (n.includes('baraka') || a.name.includes('البركة')) tags.push('بنك البركة');
    if (n.includes('emirates') || a.name.includes('الإمارات')) tags.push('بنك الإمارات');
    if (n.includes('adcb')) tags.push('ADCB');
    if (a.name.includes('القاهرة')) tags.push('بنك القاهرة');
    if (a.name.includes('الإسكندرية') || a.name.includes('الاسكندرية')) tags.push('بنك الإسكندرية');
    if (a.name.includes('كريدي أجريكول') || a.name.includes('كريدي اجريكول')) tags.push('كريدي أجريكول');
    if (a.name.includes('فيصل')) tags.push('مصرف فيصل الإسلامي');
    if (a.name.includes('الإسكان') || a.name.includes('التعمير')) tags.push('بنك الإسكان والتعمير');

    const row = {
      category_id: banks.id,
      name: a.name.slice(0, 160),
      description: a.rating ? `صراف آلي · تقييم ${a.rating}${a.reviews ? ` (${a.reviews} مراجعة)` : ''}` : 'صراف آلي — مفتوح على مدار الساعة',
      city: a.city || 'قنا',
      address: (a.address || '').slice(0, 255) || null,
      lat: a.lat || null,
      lng: a.lng || null,
      phone: a.phone || null,
      working_hours: a.working_hours || '24 ساعة',
      tags: tags.join(',').slice(0, 255),
      status: 'approved',
    };
    await Service.create(row);
    existing.push({ id: 0, name: a.name, lat: a.lat, lng: a.lng });
    added++;
  }

  // Summary by city
  const byCity = {};
  for (const a of atms) byCity[a.city] = (byCity[a.city] || 0) + 1;

  console.log(`\n✓ added=${added}, skipped(dup)=${skipped}`);
  console.log('by city:', byCity);
  const totalBanks = await Service.count({ where: { category_id: banks.id } });
  console.log(`total banks now: ${totalBanks}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
