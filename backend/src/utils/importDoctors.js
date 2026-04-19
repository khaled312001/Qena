// Import doctors from PDF + Vezeeta into services table under 'doctors' category
// Tags field holds the specialty (used for filter UI)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize, Category, Service } = require('../models');

const PDF_PATH = path.join(__dirname, '../../../database/pdf_doctors.json');
const VEZ_PATH = path.join(__dirname, '../../../database/vezeeta_doctors.json');

function norm(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652ـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/^د\s*[\.\/]\s*/, '')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  // Ensure doctors category exists
  const [doctors] = await Category.findOrCreate({
    where: { slug: 'doctors' },
    defaults: {
      slug: 'doctors',
      name: 'أطباء',
      icon: 'Stethoscope',
      color: '#dc2626',
      sort_order: 2,  // right after hospitals
      description: 'دليل أطباء قنا بالتخصصات',
    },
  });
  // Force update in case it already existed with old data
  await doctors.update({
    name: 'أطباء', icon: 'Stethoscope', color: '#dc2626', sort_order: 2,
    description: 'دليل أطباء قنا بالتخصصات',
  });

  const pdfDocs = fs.existsSync(PDF_PATH) ? JSON.parse(fs.readFileSync(PDF_PATH, 'utf8')) : [];
  const vezDocs = fs.existsSync(VEZ_PATH) ? JSON.parse(fs.readFileSync(VEZ_PATH, 'utf8')) : [];

  // Build a lookup by normalized name for vezeeta (has specialty)
  const vezByName = new Map();
  for (const v of vezDocs) vezByName.set(norm(v.name), v);

  const merged = new Map();   // normName -> record
  for (const p of pdfDocs) {
    const n = norm(p.name);
    if (!n) continue;
    const rec = {
      name: p.name,
      address: p.address,
      city: p.city || 'قنا',
      phone: p.phone,
      alt_phone: p.alt_phone,
      specialty: null,
      price: null,
    };
    // Look up in Vezeeta for specialty
    const v = vezByName.get(n);
    if (v) {
      rec.specialty = v.specialty;
      rec.price = v.price;
      if (!rec.address && v.address) rec.address = v.address;
    }
    merged.set(n, rec);
  }
  // Add Vezeeta-only doctors (not in PDF)
  for (const v of vezDocs) {
    const n = norm(v.name);
    if (merged.has(n)) continue;
    merged.set(n, {
      name: v.name,
      address: v.address,
      city: v.city || 'قنا',
      phone: null, alt_phone: null,
      specialty: v.specialty,
      price: v.price || null,
    });
  }

  console.log(`Total unique doctors: ${merged.size}`);
  const withSpecialty = [...merged.values()].filter((r) => r.specialty).length;
  console.log(`With specialty: ${withSpecialty}`);

  let inserted = 0, skipped = 0;
  for (const rec of merged.values()) {
    // dedupe against existing
    const exists = await Service.findOne({ where: { category_id: doctors.id, name: rec.name } });
    if (exists) { skipped++; continue; }
    const description = rec.specialty
      ? `${rec.specialty}${rec.price ? ` · سعر الكشف ${rec.price} جنيه` : ''}`
      : null;
    await Service.create({
      category_id: doctors.id,
      name: rec.name.slice(0, 160),
      description,
      city: rec.city,
      address: rec.address ? rec.address.slice(0, 255) : null,
      phone: rec.phone || null,
      alt_phone: rec.alt_phone || null,
      tags: rec.specialty || null,
      status: 'approved',
    });
    inserted++;
  }

  console.log(`✓ inserted=${inserted}, skipped=${skipped}, total doctors now=${await Service.count({ where: { category_id: doctors.id } })}`);
  console.log(`Total services: ${await Service.count()}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
