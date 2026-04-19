// Import Qift (قفط) doctors + a few services from Google Maps export.
// Dedupes against existing by normalized name + phone (same logic as importDoctorsBatch.js).
require('dotenv').config();
const { sequelize, Category, Service } = require('../models');

// Medical entries go to clinics category; non-medical go to their respective categories
const medical = [
  { name: 'عيادة د. أبو الحسن الشاذلي', phone: '01030108991', tags: 'طبيب', address: 'الجيش، قفط', city: 'قفط', working_hours: 'يغلق 11م', rating: 5.0, reviews: 3 },
  { name: 'د. محمد ثابت البغدادي', phone: '01119497658', tags: 'علاج بالحركة,علاج طبيعي', address: 'المحطة، قفط', city: 'قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 3 },
  { name: 'عيادة د. محمد دبش لطب الأسنان', phone: '01065767190', tags: 'أسنان', address: 'XRW6+MC6، الجمهورية، قفط', city: 'قفط', working_hours: 'يغلق 10م', rating: 4.8, reviews: 5 },
  { name: 'كيدز كلينك لطب الأطفال وحديثي الولادة - قفط', phone: '01030108991', tags: 'أطفال,حديثي الولادة', address: 'شارع الجيش، أمام كشري الاسكندراني، قفط', city: 'قفط', working_hours: 'يغلق 11م', rating: 4.0, reviews: 1 },
  { name: 'عيادة د. علي محمد الصادق', tags: 'باطنة', address: '2R27+32G، قفط', city: 'قفط', rating: 5.0, reviews: 1 },
  { name: 'عيادة د. شاذلي محمد علي', phone: '01014568158', tags: 'باطنة', address: '2R28+39W، قفط', city: 'قفط', rating: 4.7, reviews: 6 },
  { name: 'مستشفى قفط التخصصي', tags: 'مستشفى,تخصصي', address: 'قفط', city: 'قفط', working_hours: '24 ساعة', rating: 3.8, reviews: 80 },
  { name: 'عيادة د. مصطفى فهمي فؤاد — استشاري الباطنة والسكر والقلب', phone: '01126575726', tags: 'باطنة,سكر,قلب', address: 'قفط', city: 'قفط', working_hours: 'يفتح الاثنين 4م' },
  { name: 'مستشفى الإسراء - قفط', phone: '0962864085', tags: 'مستشفى', address: '2R26+323، الجيش، قفط', city: 'قفط', working_hours: '24 ساعة', rating: 3.8, reviews: 22 },
  { name: 'د. وائل الشاذلي للعيون', phone: '01155352258', tags: 'عيون', address: 'XRX7+C25، درب السبعي، بجوار فرحة للأدوات المنزلية، قفط', city: 'قفط', working_hours: 'يفتح 5م', rating: 5.0, reviews: 1 },
  { name: 'مركز الأماني للعلاج الطبيعي - قفط', phone: '01146342055', tags: 'علاج طبيعي', address: 'XRW6+7X7، الشيخ الأنصاري، قفط', city: 'قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 4 },
  { name: 'د. محمود حسن عبد النور — جلدية', tags: 'جلدية', address: '2R28+39W، قفط', city: 'قفط' },
  { name: 'عيادة د. سعود للقلب - قفط', tags: 'قلب', address: 'XRV2+CM8، قفط', city: 'قفط', rating: 5.0, reviews: 1 },
  { name: 'عيادة د. أيمن حمدان — الخصوبة', tags: 'خصوبة,تخصصي', address: 'XRX6+H2V، Kafteme، قفط', city: 'قفط' },
  { name: 'عيادة د. محمد عبد النعيم — استشاري الجراحة العامة', phone: '01012311450', tags: 'جراحة عامة', address: '2R26+323، مستشفى الإسراء، أمام كوبري الزعير، قفط', city: 'قفط', working_hours: 'يفتح 5م', rating: 5.0, reviews: 1 },
  { name: 'عيادات الجودي التخصصية - قفط', phone: '01012866867', tags: 'عيادة متخصصة', address: 'قفط، بجوار مسجد الصفا والمروة', city: 'قفط', working_hours: 'يفتح 4م' },
  { name: 'عيادة د. محمد حامد أبو شنب', tags: 'باطنة', address: 'XRW5+QXJ، الجيش، قفط', city: 'قفط' },
  { name: 'عيادة د. محمد كمال الشاذلي - قفط', phone: '01090484059', tags: 'قلب', address: 'كوبري المرور، قفط', city: 'قفط', working_hours: 'يفتح 5م' },
  { name: 'عيادة د. سعد أبو السعود عبد الله فضل', phone: '01145862414', tags: 'أطفال', address: 'XRX7+X47، أحمد عرابي، قفط', city: 'قفط', working_hours: 'يفتح 7م', rating: 3.0, reviews: 4 },
  { name: 'مستشفى د. إمبابي - قفط', tags: 'نساء وتوليد,مستشفى', address: 'XRV7+5GJ، قفط', city: 'قفط', rating: 5.0, reviews: 1 },
  { name: 'عياده د. أيمن عدلي', tags: 'نساء وتوليد', address: 'عمارة أحمد بكري، شقة 2، المحطة، قفط', city: 'قفط', rating: 5.0, reviews: 2 },
  { name: 'عيادة د. محمد عبد الرجال — أسنان قفط', tags: 'أسنان', address: 'XRV3+J5M، المحطة، قفط', city: 'قفط' },
  { name: 'عيادة د. حمادة أبو السعود — عيون', phone: '01152642477', tags: 'عيون', address: 'XRW7+46V، الشيخ الأنصاري، قفط', city: 'قفط', working_hours: 'يفتح 5م', rating: 5.0, reviews: 4 },
  { name: 'مركز أجيال لطب الأطفال وحديثي الولادة - قفط', phone: '01002920999', tags: 'أطفال,حديثي الولادة,مستشفى', address: 'الجيش، مدينة قفط، كوبري الزعير، أعلى مستشفى الإسراء', city: 'قفط', working_hours: '24 ساعة' },
  { name: 'عياده د. محمود عويس - قفط', tags: 'عيون', address: '2R28+39W، عمارة الشهر العقاري القديم، قفط', city: 'قفط', working_hours: 'يفتح الاثنين 4م' },
  { name: 'عياده د. محمد حسن مهنا - قفط', tags: 'عيون', address: 'XVW2+W45، قفط', city: 'قفط', rating: 5.0, reviews: 1 },
  { name: 'عياده أسنان د. محمد حسين بالعويضات', tags: 'أسنان', address: 'XRR8+M49، قفط', city: 'قفط', working_hours: 'يفتح الاثنين 12ص', rating: 5.0, reviews: 1 },
  { name: 'عيادة د. شمس الدين عبد الله — أخصائي طب وجراحة الفم والأسنان', phone: '01044656504', tags: 'أسنان,جراحة فم', address: 'نجع الحمرة، بجوار صيدلية د. أحمد سلامة، قفط', city: 'قفط', working_hours: 'يفتح 4م', rating: 5.0, reviews: 1 },
  { name: 'Dr. Mohamed Hussein Dental Clinic', phone: '+96898855924', tags: 'أسنان', address: 'XRR8+98C، قفط', city: 'قفط' },
  { name: 'عمارة العمدة حافظ — عيادات أطفال وخدمات', tags: 'أطفال', address: 'XR9W+5JM، قفط', city: 'قفط' },
  { name: 'عيادة باسم متري — جراحة عظام', tags: 'جراحة عظام', address: 'XRX7+48F، خوفو، قفط', city: 'قفط' },
  { name: 'د. إيناس عبد السمط', tags: 'طبيب', address: 'XRR8+89C، قفط', city: 'قفط', rating: 5.0, reviews: 1 },
];

const pharmacies = [
  { name: 'صيدلية د. سماح أحمد مصري - قفط', phone: '01204002328', tags: 'صيدلية,24 ساعة', address: 'الجمهورية، قفط', city: 'قفط', working_hours: '24 ساعة', rating: 4.3, reviews: 3 },
  { name: 'صيدلية د. ميادة - قفط', tags: 'صيدلية', address: 'XRV2+CM8، قفط', city: 'قفط' },
];

const hotels = [
  { name: 'فندق العويضي - قفط', phone: '01022164099', tags: 'فندق', address: 'XRV6+X6F، الجسر، قفط', city: 'قفط', rating: 3.5, reviews: 46 },
];

const government = [
  { name: 'شركة مصر العليا لتوزيع الكهرباء - قفط', phone: '0966910801', tags: 'كهرباء,مرافق', address: 'قفط', city: 'قفط', working_hours: '24 ساعة', rating: 3.1, reviews: 12 },
  { name: 'المصرية للاتصالات - قفط', phone: '0966917666', tags: 'اتصالات,سنترال', address: 'قفط', city: 'قفط', working_hours: 'يغلق 9م', rating: 3.8, reviews: 135 },
];

const education = [
  { name: 'إدارة قفط التعليمية - الحسابات', phone: '0966910302', tags: 'مؤسسة تعليمية,حكومي', address: '2R26+C7Q، شارع مجلس المدينة، قفط', city: 'قفط', working_hours: 'يغلق 9م', rating: 2.9, reviews: 31 },
];

const schools = [
  { name: 'أكاديمية الإسراء - قفط', tags: 'مركز تعليمي', address: 'المحطة، قفط', city: 'قفط', working_hours: 'يغلق 9م', rating: 5.0, reviews: 1 },
];

function normalize(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652ـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/^د\s*[\.\/]\s*/, '').replace(/^الدكتور\s*/, '').replace(/^الأستاذ\s*/, '')
    .replace(/^عيادة\s*/, '').replace(/^مركز\s*/, '').replace(/^مستشفى\s*/, '')
    .replace(/[^\w\u0600-\u06FF]+/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}
function normPhone(p) {
  if (!p) return null;
  return p.toString().replace(/[^0-9]/g, '').replace(/^20/, '0');
}

async function importBatch(categorySlug, items) {
  const cat = await Category.findOne({ where: { slug: categorySlug } });
  if (!cat) { console.log(`! missing category: ${categorySlug}`); return { inserted: 0, enriched: 0, skipped: 0 }; }

  // Build existing lookup within this category
  const existing = await Service.findAll({
    where: { category_id: cat.id },
    attributes: ['id', 'name', 'phone', 'address', 'tags'],
  });
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
  return { inserted, enriched, skipped };
}

async function main() {
  await sequelize.authenticate();
  let grand = { inserted: 0, enriched: 0, skipped: 0 };
  const batches = [
    ['clinics', medical], ['pharmacies', pharmacies], ['hotels', hotels],
    ['government', government], ['education', education], ['schools', schools],
  ];
  for (const [slug, items] of batches) {
    const r = await importBatch(slug, items);
    console.log(`  ${slug.padEnd(16)}  inserted=${r.inserted}  enriched=${r.enriched}  skipped=${r.skipped}`);
    grand.inserted += r.inserted; grand.enriched += r.enriched; grand.skipped += r.skipped;
  }
  console.log(`\n✓ TOTAL inserted=${grand.inserted}  enriched=${grand.enriched}  skipped=${grand.skipped}`);
  console.log(`  total services now: ${await Service.count()}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
