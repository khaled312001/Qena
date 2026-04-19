// Merge 'doctors' category into 'clinics' (renamed to 'أطباء ومراكز طبية')
// Steps:
// 1. Rename clinics category
// 2. Move all doctor services to clinics
// 3. Delete doctors category
require('dotenv').config();
const { sequelize, Category, Service } = require('../models');

async function main() {
  await sequelize.authenticate();

  const clinics = await Category.findOne({ where: { slug: 'clinics' } });
  const doctors = await Category.findOne({ where: { slug: 'doctors' } });

  if (!clinics) { console.error('clinics category not found'); process.exit(1); }
  if (!doctors) {
    console.log('doctors category already absent — nothing to merge');
    process.exit(0);
  }

  const clinicsCount = await Service.count({ where: { category_id: clinics.id } });
  const doctorsCount = await Service.count({ where: { category_id: doctors.id } });
  console.log(`before: clinics=${clinicsCount}, doctors=${doctorsCount}`);

  // Rename clinics category to reflect merged content
  await clinics.update({
    name: 'أطباء ومراكز طبية',
    icon: 'Stethoscope',
    color: '#dc2626',
    sort_order: 2,
    description: 'أطباء قنا بجميع التخصصات + العيادات والمراكز الطبية والمعامل',
  });
  console.log('✓ renamed clinics -> أطباء ومراكز طبية');

  // Move doctor services to clinics
  const [moved] = await Service.update(
    { category_id: clinics.id },
    { where: { category_id: doctors.id } }
  );
  console.log(`✓ moved ${moved} services from doctors -> clinics`);

  // Delete doctors category
  await doctors.destroy();
  console.log('✓ deleted doctors category');

  const finalCount = await Service.count({ where: { category_id: clinics.id } });
  console.log(`after: أطباء ومراكز طبية = ${finalCount}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
