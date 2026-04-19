// Audit + auto-fix miscategorized services.
// Detects mismatches by scanning name / tags / description keywords,
// then moves rows to the correct category. Conservative — only moves when
// the signal is very strong (high-confidence keywords in the NAME).
require('dotenv').config();
const { sequelize, Service, Category } = require('../models');

// Keywords → target category slug. The name must contain one of the keywords.
// Ordered by specificity — first match wins.
const RULES = [
  // Hotels — only explicit keywords (removed "نزل " which matches "منزل")
  { target: 'hotels', keywords: ['فندق ', 'Hotel', 'منتجع '] },
  // Pharmacies
  { target: 'pharmacies', keywords: ['صيدلية', 'صيدليه', 'Pharmacy'] },
  // Hospitals — skip if NAME also starts with صالون / مركز تجميل etc.
  { target: 'hospitals', keywords: ['مستشفى ', 'مستشفي '] },
  // Restaurants FIRST (so "Restaurant & Café" stays in restaurants)
  { target: 'restaurants', keywords: [
    'مطعم ', 'مطاعم ', 'Restaurant', 'كشري ', 'بيتزا ', 'Pizza',
    'مشويات', 'كبابجي', 'كبابجى', 'فطير', 'سندوتشات',
    'حواوشي', 'حواوشى', 'كشرى', 'لحمة ', 'فلافل ',
  ] },
  // Cafes (after restaurants)
  { target: 'cafes', keywords: ['كافيه ', 'كافية ', 'كافيتريا', 'مقهى ', 'مقاهي ', 'Café', 'Cafe', 'قهوة ', 'حلواني '] },
  // Medical: labs, diagnostics etc.
  { target: 'clinics', keywords: [
    'معمل ', 'معامل ', 'مختبر', 'عيادة ', 'عياده ', 'د. ', 'دكتور ',
    'مركز طبي', 'مركز الأشعة', 'مركز الاشعة', 'مركز أشعة', 'مركز اشعة',
    'تحاليل ', 'علاج طبيعي',
  ] },
  // Gas stations
  { target: 'gas-stations', keywords: ['محطة وقود', 'محطة بنزين', 'وقود الفلاح', 'مصر للبترول', 'توتال', 'موبيل', 'شل', 'بترول مصر'] },
  // Banks
  { target: 'banks', keywords: ['بنك ', 'Bank', 'ماكينة صراف', 'ATM', 'CIB', 'QNB', 'NBE', 'البنك الأهلي'] },
  // Schools (primary/prep/secondary only)
  { target: 'schools', keywords: ['مدرسة ', 'مدرسه ', 'حضانة ', 'حضانه ', 'روضة ', 'روضه '] },
  // Higher education ONLY — معهد lives here to avoid schools↔education ping-pong
  { target: 'education', keywords: ['جامعة ', 'جامعه ', 'كلية ', 'كليه ', 'معهد ', 'أكاديمية ', 'اكاديمية ', 'University', 'College'] },
  // Cosmetics / perfumes
  { target: 'cosmetics-perfumes', keywords: ['عطور', 'عطر ', 'مستحضرات تجميل', 'مكياج', 'بيوتي', 'Makeup', 'العزبى', 'Oriflame'] },
  // Beauty salons (hair / nails) — removed "سبا" (matches "سبايسي")
  { target: 'beauty', keywords: ['كوافير', 'صالون تجميل', 'صالون حلاقة', 'صالون نسائي', 'حلاق ', 'Barber Shop', 'بيوتي سنتر', 'مركز تجميل'] },
  // Transport (buses, trains, stations, taxi offices)
  { target: 'transport', keywords: [
    'محطة قطار', 'محطة قطارات', 'محطة أتوبيس', 'محطة اتوبيس', 'موقف ',
    'سوبر جت', 'جو باص', 'الصعيد للنقل', 'مستر باص', 'Super Jet',
    'شركة النقل', 'للنقل البري', 'للنقل البرى',
  ] },
  // Tourism
  { target: 'tourism', keywords: ['معبد ', 'دير ', 'قلعة ', 'متحف', 'هرم ', 'مقام ', 'مسجد أثري'] },
];

function matchTarget(text) {
  const t = text || '';
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (t.includes(kw)) return rule.target;
    }
  }
  return null;
}

async function main() {
  const dry = process.argv.includes('--dry');
  await sequelize.authenticate();

  const cats = await Category.findAll();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  const services = await Service.findAll({
    attributes: ['id', 'name', 'tags', 'category_id'],
    include: [{ model: Category, as: 'category', attributes: ['slug'] }],
    order: [['id', 'ASC']],
  });
  console.log(`scanning ${services.length} services${dry ? ' (dry-run)' : ''}...`);

  const moves = { };   // "from → to" -> count
  let actions = 0;
  const examples = [];

  for (const s of services) {
    const currentSlug = s.category?.slug;
    if (!currentSlug) continue;

    const target = matchTarget(s.name);
    if (!target) continue;
    if (target === currentSlug) continue;

    // Skip moves where current is a more-specific medical subtype
    // (e.g., if it's already in hospitals and matches مستشفى, leave it)
    if (target === 'clinics' && ['hospitals', 'pharmacies'].includes(currentSlug)) continue;

    const key = `${currentSlug} → ${target}`;
    moves[key] = (moves[key] || 0) + 1;
    if (examples.length < 40) examples.push(`  #${s.id}  ${s.name.slice(0, 50).padEnd(50)}  ${currentSlug} → ${target}`);

    if (!dry) {
      const newCat = catBySlug[target];
      if (newCat) {
        await Service.update({ category_id: newCat.id }, { where: { id: s.id } });
        actions++;
      }
    } else {
      actions++;
    }
  }

  console.log(`\n${dry ? 'WOULD MOVE' : 'MOVED'} ${actions} services`);
  console.log('breakdown:');
  for (const [k, v] of Object.entries(moves).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(50)}  ${v}`);
  }
  console.log('\nSample moves:');
  examples.forEach((e) => console.log(e));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
