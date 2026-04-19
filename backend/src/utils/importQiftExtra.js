// Extra Qift medical entries (hospitals + medical centers) — smart dedup.
require('dotenv').config();
const { sequelize, Category, Service } = require('../models');

const items = [
  { name: 'مستشفى قفط التخصصي', tags: 'مستشفى,تخصصي', address: 'قفط', city: 'قفط', working_hours: '24 ساعة', rating: 3.8, reviews: 80 },
  { name: 'مستشفى الإسراء - قفط', phone: '0962864085', tags: 'مستشفى', address: '2R26+323، الجيش، قفط', city: 'قفط', working_hours: '24 ساعة', rating: 3.8, reviews: 22 },
  { name: 'مستشفى أجيال التخصصي - قفط', tags: 'مستشفى,تخصصي', address: 'قفط، كوبري المرور، المحطة', city: 'قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 2, description: 'أحسن مستشفى متكاملة في قنا حقيقي.' },
  { name: 'عيادات نبض الحياة - قفط', phone: '01098614229', tags: 'مركز طبي', address: 'XRV4+MHC، قفط', city: 'قفط', rating: 5.0, reviews: 2 },
  { name: 'مركز دار الصفوة التخصصي - قفط', phone: '01093660042', tags: 'مركز طبي,تخصصي', address: 'XRV4+MRQ، قفط', city: 'قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 3 },
  { name: 'مركز حضانات السلام - قفط', tags: 'مركز طبي,حضانات أطفال', address: 'XRV4+MRP، قفط', city: 'قفط', working_hours: '24 ساعة', rating: 2.5, reviews: 2 },
  { name: 'مركز أجيال لطب الأطفال وحديثي الولادة - قفط', phone: '01002920999', tags: 'أطفال,حديثي الولادة,مستشفى', address: 'الجيش، مدينة قفط، كوبري الزعير، أعلى مستشفى الإسراء', city: 'قفط', working_hours: '24 ساعة' },
  { name: 'إدارة قفط الصحية - الوقائي', tags: 'مركز طبي,وقائي,حكومي', address: '2R28+39W، قفط', city: 'قفط', rating: 3.0, reviews: 2 },
];

function normalize(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652ـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/^د\s*[\.\/]\s*/, '').replace(/^الدكتور\s*/, '').replace(/^عيادة\s*/, '')
    .replace(/^مركز\s*/, '').replace(/^مستشفى\s*/, '').replace(/^محل\s*/, '')
    .replace(/[^\w\u0600-\u06FF]+/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}
function normPhone(p) { return p ? p.toString().replace(/[^0-9]/g, '').replace(/^20/, '0') : null; }

async function main() {
  await sequelize.authenticate();
  const cat = await Category.findOne({ where: { slug: 'clinics' } });
  if (!cat) { console.error('clinics not found'); process.exit(1); }

  const existing = await Service.findAll({ attributes: ['id', 'name', 'phone', 'address', 'tags', 'category_id'] });
  const byName = new Map(), byPhone = new Map();
  for (const e of existing) {
    byName.set(normalize(e.name), e);
    const p = normPhone(e.phone);
    if (p && p.length >= 10) byPhone.set(p, e);
  }

  let inserted = 0, enriched = 0, skipped = 0;
  for (const d of items) {
    const nn = normalize(d.name);
    const np = normPhone(d.phone);
    let match = np ? byPhone.get(np) : null;
    if (!match) {
      match = byName.get(nn);
      if (!match) {
        for (const [k, v] of byName) {
          if (nn.length < 6 || k.length < 6) continue;
          if (k.includes(nn) || nn.includes(k)) { match = v; break; }
        }
      }
    }
    if (match) {
      const patch = {};
      if (!match.phone && d.phone) patch.phone = d.phone;
      if (!match.address && d.address) patch.address = d.address;
      if (!match.tags && d.tags) patch.tags = d.tags;
      if (Object.keys(patch).length) { await Service.update(patch, { where: { id: match.id } }); enriched++; }
      else skipped++;
      continue;
    }
    const desc = d.description || (d.rating ? `${(d.tags || '').split(',')[0]} · تقييم ${d.rating} (${d.reviews || 0})` : (d.tags || '').split(',')[0] || null);
    await Service.create({
      category_id: cat.id,
      name: d.name.slice(0, 160),
      description: desc,
      city: d.city || 'قفط',
      address: d.address || null,
      phone: d.phone || null,
      working_hours: d.working_hours || null,
      tags: d.tags || null,
      status: 'approved',
    });
    inserted++;
  }
  console.log(`✓ inserted=${inserted} enriched=${enriched} skipped=${skipped}`);
  console.log(`total services: ${await Service.count()}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
