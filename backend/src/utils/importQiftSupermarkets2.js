// Second batch of Qift supermarkets — adds the ones missed by importQiftAll.js.
// Dedup is handled inside: matches existing rows by normalized name + phone.
require('dotenv').config();
const { sequelize, Service, Category } = require('../models');

const items = [
  { name: 'سوبر ماركت نور 2 - قفط', tags: 'سوبرماركت', address: 'XRV8+546، قفط' },
  { name: 'سوبر ماركت الأصلي - قفط', tags: 'متجر', address: 'قفط', rating: 5.0 },
  { name: 'عطارة الإخلاص - قفط', tags: 'عطارة,سوبرماركت', address: '2R28+39W، قفط' },
  { name: 'مخزن محمد محمود العبد - فيزا فاملي', phone: '01201235034', tags: 'سوبرماركت,فيزا', address: 'القلعة، شارع نجع أبو عمر، خلف مدرسة الشهيد فايز، قفط', working_hours: '24 ساعة', rating: 4.0 },
  { name: 'سوبر ماركت الرحمة - قفط', tags: 'سوق', address: 'XR8Q+6X2، قفط', rating: 5.0 },
  { name: 'لكلحين - قفط', tags: 'سوبرماركت', address: 'XRCX+V2C، قفط', rating: 5.0 },
  { name: 'دكان مختار - البراهمة', tags: 'سوبرماركت', address: '2Q7X+FCG، البراهمة، قفط', working_hours: 'يفتح الجمعة 6:30ص', rating: 3.5, reviews: 2 },
  { name: 'سيتي فودز قنا', phone: '01116664476', tags: 'بقالة,توصيل', address: 'XQVW+9VC، قنا', working_hours: 'يفتح 4م', rating: 4.1, reviews: 22 },
  { name: 'ماركت الرحمن - أولاد الحاج خديوي', tags: 'سوق منتجات غذائية', address: '2R3C+R95، شارع مدرسة الشهيد عبدالحليم دنقل الإعدادية، قفط', rating: 5.0 },
  { name: 'شركة الملح - قفط', tags: 'بقالة', address: '2R45+X9F، كوبري مسجد ابن الصايغ، قفط' },
  { name: 'محمد أحمد هلال لصرف الدقيق', tags: 'بقالة,دقيق', address: '2R2C+95، قفط' },
  { name: 'أحمد نصار - قفط', tags: 'سوبرماركت', address: 'XRJX+JHC، قفط' },
  { name: 'سوبر ماركت آل البيت - صلاح درويش', phone: '01003060493', tags: 'سوبرماركت', address: '2QJR+48Q، الجزيرة، البراهمة، قفط', working_hours: '24 ساعة', rating: 5.0 },
  { name: 'سوبر ماركت القدس - قفط', tags: 'سوبرماركت', address: '2RJW+J2C، قفط', working_hours: 'يفتح الاثنين 6ص', rating: 3.6, reviews: 26 },
  { name: 'محل سمير جعفر - قفط', tags: 'سوبرماركت', address: '2Q8X+4P3، قفط' },
  { name: 'الدندراوي - قفط', phone: '01067303136', tags: 'سوبرماركت', address: 'قفط', working_hours: 'يغلق 5م', rating: 4.1, reviews: 23 },
  { name: 'سوبر ماركت خضري فراج', tags: 'بقالة', address: '2R7V+5WF، قفط' },
  { name: 'سوبر ماركت الناظر أحمد حفني', tags: 'بقالة', address: '2QMR+VX5، قفط', rating: 5.0, reviews: 4 },
  { name: 'سوبرماركت أولاد خليفة - قفط', tags: 'سوبر ماركت,عروض خصم', address: '2QMR+QR5، قفط', working_hours: 'يفتح الاثنين 8ص', rating: 4.1, reviews: 20 },
  { name: 'الفكاهني - قفط', tags: 'بقالة', address: '2R7W+9M5، قفط', rating: 3.0 },
  { name: 'سوبر ماركت الكراتية - قوص', phone: '01128040756', tags: 'بقالة', address: 'XQ9R+M5W، الكراتية، قوص', working_hours: 'يغلق 11م', rating: 3.0 },
  { name: 'أحمد عبده - قفط', tags: 'سوبرماركت', address: '2VG6+HP8، قفط', rating: 3.0 },
  { name: 'سوبر ماركت أبو فارس - قفط', tags: 'سوبرماركت', address: 'XR9W+8PC، قفط' },
  { name: 'ماركت الرضواني - قفط', tags: 'سوبرماركت', address: 'XQ9R+GMG، قفط' },
  { name: 'محلات أولاد الشيخ الطقري', tags: 'سوبرماركت,تزيين سيارات', address: 'ورشة الطقري، كلاحين الحاجر، قفط', working_hours: 'يغلق 8م', rating: 3.8, reviews: 4 },
  { name: 'أبو الفضل العكرمي - بقالة تموينية', tags: 'بقالة', address: '2R72+VFC، قفط' },
  { name: 'يوسف رفاعي - قفط', tags: 'بقالة', address: 'نجع أبو غابة، قفط', working_hours: 'يغلق 9م', rating: 5.0, reviews: 2 },
  { name: 'محلات عكرش الجزار', phone: '01015330350', tags: 'سوبرماركت', address: 'XRCW+7RM، قفط', working_hours: '24 ساعة' },
  { name: 'نجع داوود - قفط', phone: '01019316962', tags: 'بقالة', address: '2Q8Q+P88، قفط', rating: 4.0, reviews: 24 },
  { name: 'شارع آل مرزوق - قفط', tags: 'سوبرماركت', address: '2QFQ+VC، قفط' },
  { name: 'أبو خليل لتجارة الحبوب والأعلاف', tags: 'بقالة,حبوب,أعلاف', address: '2R72+VFC، قفط' },
  { name: 'تاجر جملة - قفط', tags: 'بقالة,جملة', address: '2QFV+XHG، قفط', rating: 5.0 },
  { name: 'سوبر ماركت آل توفيق', tags: 'سوبرماركت', address: 'XR5W+94، قفط' },
  { name: 'الملك فهد - قفط', phone: '01143374864', tags: 'بقالة', address: 'XRC7+4JW، قفط', working_hours: '24 ساعة' },
  { name: 'بقالة أبو آدم - الشيخية', tags: 'سوبرماركت', address: 'XQ9V+J53، الشيخية، الكراتية، قوص', rating: 3.8, reviews: 6 },
  { name: 'مكة للتجارة', phone: '01156784100', tags: 'بقالة', address: 'XVJ2+WXH' },
  { name: 'سوبر ماركت أبو عبد الله - قفط', tags: 'سوبرماركت', address: 'XR3X+78G، قفط' },
  { name: 'ماركت الشيخ عبدالعاطي - الأشراف', phone: '01221287934', tags: 'بقالة', address: '3RH5+97X، الأشراف، قفط', rating: 5.0 },
  { name: 'عبد كمال - قفط', tags: 'بقالة', address: '2RJV+GVX، قفط' },
  { name: 'سوبر ماركت المصطفى', phone: '01126596571', tags: 'سوبرماركت', address: 'XQ37+8P2', working_hours: '24 ساعة', rating: 4.6, reviews: 9 },
  { name: 'بقالة الناظر - قفط', tags: 'بقالة', address: '2QCQ+MGC، قفط' },
  { name: 'سوبر ماركت أولاد الحاج خضري', tags: 'سوبرماركت', address: 'XQ9R+VQF، الشيخية، شارع الجسر، أمام مبنى شبكة المياه، قوص' },
  { name: 'سوبر ماركت الرحمة - الأشراف', tags: 'سوبرماركت', address: '3RJ5+J9P، الأشراف، قفط' },
  { name: 'أحمد رمضان - الأشراف', tags: 'سوبرماركت', address: '3RH4+RFH، الأشراف، قفط', rating: 5.0 },
  { name: 'سوبر ماركت الرحمة - الأشراف 2', tags: 'سوبر ماركت', address: '3RG7+86V، الأشراف، قفط' },
  { name: 'بقالة تموينية فكيهة عبدالجليل', tags: 'بقالة', address: 'XQ9Q+6FJ، الشيخية، قفط، قوص' },
  { name: 'تجارة الجزيرية - أولاد إبراهيم عبدالقوي أبو عميرة', tags: 'بقالة', address: '2QJQ+4JW، الجزيرة، البراهمة، قفط', rating: 5.0, reviews: 2 },
  { name: 'ماركت الحسن والحسين - الأشراف', phone: '01000511877', tags: 'بقالة', address: 'الأشراف، قفط', rating: 3.3, reviews: 4 },
  { name: 'فودافون كاش أبو عدنان', phone: '01147711075', tags: 'بقالة,فودافون كاش', address: 'شارع الجامع، قفط', rating: 4.7, reviews: 3 },
  { name: 'سوبر ماركت الأصدقاء - الكلاحين', phone: '01018520094', tags: 'سوبرماركت', address: 'الكلاحين، قفط' },
  { name: 'الناظر ماركت - قفط', phone: '01000844874', tags: 'سوبرماركت', address: 'قفط', working_hours: 'يغلق 1ص' },
  { name: 'سوبر ماركت النني', tags: 'سوبرماركت', address: 'WVX2+87R' },
  { name: 'سليم ماركت - الحراجية قوص', phone: '01009674625', tags: 'بقالة', address: 'الطريق الزراعي السريع، الحراجية، قوص', working_hours: '24 ساعة', rating: 4.2, reviews: 111, city: 'قوص' },
  { name: 'ماركت أبو مودة', phone: '01065726376', tags: 'سوبرماركت', address: 'قفط', working_hours: '24 ساعة' },
];

function normalize(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652ـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/^محل\s*/, '').replace(/^سوبر\s*ماركت\s*/, '').replace(/^ماركت\s*/, '').replace(/^بقالة\s*/, '')
    .replace(/[^\w\u0600-\u06FF]+/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}
function normPhone(p) {
  if (!p) return null;
  return p.toString().replace(/[^0-9]/g, '').replace(/^20/, '0');
}

async function main() {
  await sequelize.authenticate();
  const cat = await Category.findOne({ where: { slug: 'shops' } });
  if (!cat) { console.log('! no shops category'); process.exit(1); }

  const existing = await Service.findAll({ attributes: ['id', 'name', 'phone', 'address', 'tags'] });
  const byName = new Map();
  const byPhone = new Map();
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
    const desc = d.rating
      ? `${(d.tags || '').split(',')[0]} · تقييم ${d.rating} (${d.reviews || 0} مراجعة)`.trim()
      : ((d.tags || '').split(',')[0] || null);
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
    byName.set(nn, { id: null, name: d.name });
    if (np) byPhone.set(np, { id: null });
  }
  console.log(`\nsupermarkets batch 2 → inserted ${inserted} · enriched ${enriched} · skipped ${skipped}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
