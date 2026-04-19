// Import cosmetics & perfumes stores (مستحضرات تجميل وعطور) from user-provided list
// Source: Google Maps export supplied by the project owner
require('dotenv').config();
const { sequelize, Category, Service } = require('../models');

const data = [
  // Cosmetics
  { name: 'سنتر بيسو لمستحضرات التجميل', phone: '01005570968', address: 'قنا', working_hours: '24 ساعة', tags: 'مستحضرات تجميل,توصيل' },
  { name: 'حور لمستحضرات التجميل والمكياج', phone: '01003360525', address: 'شارع الجمهورية', working_hours: 'يغلق 11م', tags: 'مستحضرات تجميل,مكياج' },
  { name: 'مستحضرات تجميل أولاد المصري', phone: '01096640044', address: 'المنطقة التعليمية', working_hours: 'يغلق 1ص', tags: 'مستحضرات تجميل', description: 'متجر مستحضرات تجميل متنوع.' },
  { name: 'شركة الروضة لمستحضرات التجميل', phone: '01118893696', address: 'قنا', working_hours: 'يغلق 5م', tags: 'مستحضرات تجميل,صحة', description: 'مركز بيع منتجات تجميل.' },
  { name: 'باندا ستور قنا', phone: '01030396635', address: 'قنا', working_hours: '24 ساعة', tags: 'مستحضرات تجميل,توصيل,سيارة,داخل المتجر' },
  { name: 'سمارة لمستحضرات التجميل', phone: '01005570968', address: 'كافتيريا دردشة، آخر شارع، طريق مساكن عثمان', working_hours: '24 ساعة', tags: 'مستحضرات تجميل,توصيل,استلام' },
  { name: 'بوتيك GOGO لمستحضرات التجميل', phone: '01271091708', address: '5P7C+34X, Bahari El-Balad', working_hours: '24 ساعة', tags: 'مستحضرات تجميل,بوتيك' },
  { name: 'مكتب خليج ستور', phone: '01151195508', address: '5P58+C6X، 23 يوليو', working_hours: 'يغلق 11م', tags: 'مستحضرات تجميل' },
  { name: 'محل سمارة فرع 2 لمستحضرات التجميل والميكاب والهدايا', phone: '01005570968', address: 'قنا، قسم قنا', working_hours: '24 ساعة', tags: 'مستحضرات تجميل,مكياج,هدايا,توصيل' },
  { name: 'أورتال لتجارة وتصنيع مستحضرات التجميل', phone: '01016937008', address: 'الشؤون', working_hours: 'يغلق 5م', tags: 'مستحضرات تجميل,تصنيع,توصيل' },
  { name: 'Makeup House', phone: '01020610343', address: '5P5C+MR4، الجمهورية', working_hours: 'يغلق 11م', tags: 'مستحضرات تجميل,مكياج' },
  { name: 'دار الطب للمستلزمات الطبية ومستحضرات التجميل', phone: '01062784222', address: 'صلاح سالم', working_hours: 'يغلق 10م', tags: 'مستلزمات طبية,مستحضرات تجميل', description: 'من أفضل المحلات التجارية لبيع الأجهزة الطبية في محافظة قنا.' },
  { name: 'بيوتي سنتر موضة', phone: '01005722065', address: '5P38+WXM أمام قاعة ريفان، قنا', working_hours: '24 ساعة', tags: 'صالون تجميل,موضة' },
  { name: 'سنتر سوق قنا', phone: '01023867315', address: '5P49+PHR', working_hours: 'مفتوح', tags: 'سلع منزلية,متجر', description: 'ممتاز وأسعاره لا تقارن.' },
  { name: 'بنزايون - قنا', phone: '0963320283', address: '5P5C+FVF، بورسعيد', working_hours: 'يغلق 11م', tags: 'متجر شامل,مجمع تجاري' },
  { name: 'محلات معتز نور - برفانات ومكياج', phone: '01006108160', address: '7HX4+447، القنصل', working_hours: '24 ساعة', tags: 'عطور,مكياج' },

  // Perfumes
  { name: 'مزايا للعطور', phone: '01207459726', address: 'XRX5+9WM، الجيش', working_hours: 'يغلق 11:30م', tags: 'عطور,توصيل' },
  { name: 'عطور الندى', phone: '01098733217', address: '2QC7+2W9، المحروسة، شارع الكنيسة القديمة', working_hours: '24 ساعة', tags: 'عطور' },
  { name: 'الروديسي للعطور (Rodaisi Perfumes)', phone: '01010260447', address: 'شارع مصطفى كامل', working_hours: 'يغلق 10م', tags: 'عطور,توصيل,داخل المتجر' },
  { name: 'فرع ماء الذهب للعطور', phone: '01020616820', address: 'بجوار بيلا مود، مصطفى كامل', working_hours: 'يغلق 11:30م', tags: 'عطور' },
  { name: 'لاروزا للعطور قنا', address: '5P6F+5P3، الجمهورية', tags: 'عطور,مركز تسوق' },
  { name: 'عود الذهب للعطور', phone: '01093355266', address: '5P7G+CQQ، طريق القاهرة - أسوان الصحراوي الشرقي', working_hours: '24 ساعة', tags: 'عطور' },
  { name: 'عطور عود الذهب', phone: '01099191445', address: '5PGM+5CQ، خلف التجنيد', working_hours: '24 ساعة', tags: 'عطور' },
  { name: 'Maa Althahab', phone: '01009544432', address: '23 يوليو، قسم قنا', tags: 'عطور,توصيل' },
  { name: 'عطور الياسمين', phone: '01062220492', address: 'شارع الجمهورية', working_hours: 'يغلق 10م', tags: 'عطور,داخل المتجر,استلام,توصيل' },
  { name: 'كنزو للعطور', phone: '01003579711', address: 'مدينة قوص', city: 'قوص', working_hours: 'يغلق 11:30م', tags: 'عطور' },
  { name: 'رويال جولد للعطور', phone: '01069940189', address: '5P48+2CC', working_hours: 'يغلق 11م', tags: 'عطور' },
  { name: 'عطور البدري', phone: '01004165412', address: 'كافتريا أبناء النوبة، قنا - الشؤون', tags: 'عطور' },
  { name: 'عمر هوجو', phone: '01204693256', address: '5P59+9G7', working_hours: 'يغلق 10م', tags: 'ملابس' },
  { name: 'الجودي للعطور', address: 'XRCX+V24', tags: 'عطور,مركز تسوق' },
  { name: 'شركة روزيرا للعطور', address: '5P7H+WQ2', tags: 'عطور' },
  { name: 'مملكة العطور', address: '4PQ4+FHV', tags: 'عطور,مركز تسوق', description: 'تجربتي كويسة جداً.' },
  { name: 'Bebo Perfume & Makeup', phone: '01156912881', address: 'أمام كشري اسكندراني', working_hours: 'يغلق 11:30م', tags: 'عطور,مكياج' },
  { name: 'محل عطور المصطفى', address: 'WP4F+H27', tags: 'عطور' },
  { name: 'بوتيك رشا', address: '5PGM+968، مصنع الغزل، إلى عزبة البوصة', working_hours: 'يفتح 6م', tags: 'عطور,بوتيك' },
  { name: 'بيت العطور العالمية', phone: '01111779453', address: 'قنا', working_hours: 'يغلق 11:30م', tags: 'عطور' },
  { name: 'النحاس ستورز', phone: '01126620083', address: 'أمام عيادة د.محمد، شارع صيدلية الرحمة، هاشم الدقيني', tags: 'عطور' },
  { name: 'الخيمة العطرية - عزبة البوصة', phone: '01026080131', address: '33H4+9Q4', working_hours: '24 ساعة', tags: 'عطور' },
  { name: 'الخيمة العطرية - أبو طشت 1', phone: '01026080131', address: '33J4+223، أبو طشت', city: 'أبو تشت', working_hours: '24 ساعة', tags: 'عطور' },
  { name: 'الخيمة العطرية - أبو طشت 2', phone: '01026080131', address: '33J3+2X5، أبو طشت', city: 'أبو تشت', working_hours: '24 ساعة', tags: 'عطور' },
  { name: 'الخيمة العطرية - أبو طشت 3', address: '33J4+226، أبو طشت', city: 'أبو تشت', tags: 'عطور' },
  { name: 'عطر الملوك', phone: '01064071802', address: 'خلف السنترال', working_hours: 'يغلق 10م', tags: 'عطور,توصيل' },
  { name: 'الجوكر النوبي - مكتبة وعطور وهدايا وألعاب أطفال', phone: '01100595879', address: 'مصنع الغزل - إلى عزبة البوصة', working_hours: 'يغلق 12ص', tags: 'عطور,هدايا,مكتبة' },
  { name: 'بحر العطور 2', address: '3FWC+66P', tags: 'عطور,مستحضرات تجميل' },
  { name: 'ملك العطور', phone: '01001384431', address: '3CMC+PQ9', working_hours: 'يفتح 4م', tags: 'عطور' },
  { name: 'جنة العطور للعود والبخور', phone: '01017659469', address: 'الصينية - أمام التأمينات الاجتماعية، الإمام', working_hours: 'يغلق 10م', tags: 'عطور,عود,بخور' },
  { name: 'ريحانة الجنة للعطور', phone: '01154722265', address: 'الحلة، إسنا - إدفو', working_hours: 'يغلق 11م', tags: 'عطور' },
  { name: 'سندريلا للعطور', address: '3CPF+MP3', tags: 'عطور,مستحضرات تجميل' },
  { name: 'حامل المسك', phone: '01070054192', address: '5C3F+JCR', tags: 'عطور' },
  { name: 'وصال الذهب للعطور', address: '5PGJ+8X5 بجوار مخبز علي مبارك بالشؤون، خلف التجنيد', working_hours: 'يغلق 10م', tags: 'عطور', description: 'وصال الذهب للعطور قنا.' },
  { name: 'عطور زمان', address: 'JG44+HJ7', tags: 'عطور' },
  { name: 'كنزي للعطور (إدارة محمود حمام)', address: 'العصارة، قرية الجمالية', tags: 'عطور' },
  { name: 'سلطان العطور', phone: '01145323680', address: '4366+PCJ شارع سمر سبورت أمام فرع اتصالات', working_hours: '24 ساعة', tags: 'عطور,مستحضرات تجميل' },
  { name: 'سهري للعطور ومستحضرات التجميل', address: 'VP7F+P8H', tags: 'عطور,هدايا' },
  { name: 'كاريزما للعطور', address: '9 شارع عبد المنعم رياض', working_hours: '24 ساعة', tags: 'عطور' },
  { name: 'عطور حامل المسك - نقادة', phone: '01001724881', address: 'دراو، الأوسط قمولا، نقادة', city: 'نقادة', working_hours: 'يفتح السبت 9ص', tags: 'عطور,هدايا,توصيل,داخل المتجر,استلام' },
  { name: 'شيخ العرب للعطارة والغلال', phone: '01013042427', address: 'نجع حمادي - دشنا، الغربي بالسلامية، بجوار النفق', city: 'نجع حمادي', working_hours: '24 ساعة', tags: 'عطارة,عطور,غلال,توصيل' },
  { name: 'الكهف للعطور والاكسسوار', phone: '01127041239', address: '30 مارس - الشارع اللي قدام كتاكيت', tags: 'عطور,اكسسوار' },
  { name: 'محل الندى سر العطور', phone: '01155539986', address: '7HVM+R86', working_hours: '24 ساعة', tags: 'عطور,مركز تسوق' },
  { name: 'Al Kamal Mall - مول الكمال', phone: '01012500400', address: '5P6G+C8J، الجمهورية', working_hours: 'يغلق 11م', tags: 'مول,تسوق,عطور', description: 'مكان متميز به الكثير من المحلات المتنوعة.' },
  { name: 'تيتان للعطور ومستحضرات التجميل', phone: '01015958729', address: 'قنا', working_hours: '24 ساعة', tags: 'عطور,مستحضرات تجميل' },
  { name: 'العود الملكي للعطور والبخور', phone: '01009776345', address: 'شارع القضاة', working_hours: 'يغلق 12ص', tags: 'عطور,عود,بخور,داخل المتجر,استلام' },
  { name: 'Oriflame Qena - مركز خدمة أوريفليم قنا', phone: '01002670023', address: '5P38+VMJ', working_hours: 'يغلق 10م', tags: 'أوريفليم,مكياج,مستحضرات تجميل' },
];

async function main() {
  await sequelize.authenticate();

  // Create/upsert category
  const [cat] = await Category.findOrCreate({
    where: { slug: 'cosmetics-perfumes' },
    defaults: {
      slug: 'cosmetics-perfumes',
      name: 'مستحضرات تجميل وعطور',
      icon: 'Sparkles',
      color: '#ec4899',
      sort_order: 14,
      description: 'محلات مستحضرات التجميل، المكياج، العطور والعود في قنا',
    },
  });
  await cat.update({
    name: 'مستحضرات تجميل وعطور',
    icon: 'Sparkles', color: '#ec4899', sort_order: 14,
    description: 'محلات مستحضرات التجميل، المكياج، العطور والعود في قنا',
  });

  let inserted = 0, skipped = 0;
  for (const it of data) {
    const exists = await Service.findOne({ where: { category_id: cat.id, name: it.name } });
    if (exists) { skipped++; continue; }
    await Service.create({
      category_id: cat.id,
      name: it.name,
      description: it.description || null,
      city: it.city || 'قنا',
      address: it.address || null,
      phone: it.phone || null,
      working_hours: it.working_hours || null,
      tags: it.tags || null,
      status: 'approved',
    });
    inserted++;
  }
  console.log(`✓ inserted=${inserted}, skipped=${skipped}, category services=${await Service.count({ where: { category_id: cat.id } })}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
