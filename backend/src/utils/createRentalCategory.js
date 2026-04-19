// Ensure 'student-housing' category exists (سكن طلابي / شقق مفروشة)
require('dotenv').config();
const { sequelize, Category } = require('../models');

async function main() {
  await sequelize.authenticate();
  const [cat, created] = await Category.findOrCreate({
    where: { slug: 'student-housing' },
    defaults: {
      slug: 'student-housing',
      name: 'سكن طلابي / شقق مفروشة',
      icon: 'Home',
      color: '#0ea5e9',
      sort_order: 9,
      description: 'شقق وغرف مفروشة للإيجار في قنا لطلاب جامعة قنا والموظفين — بأسعار مختلفة ومواصفات متنوعة.',
    },
  });
  if (!created) {
    await cat.update({
      name: 'سكن طلابي / شقق مفروشة',
      icon: 'Home',
      color: '#0ea5e9',
      sort_order: 9,
      description: 'شقق وغرف مفروشة للإيجار في قنا لطلاب جامعة قنا والموظفين — بأسعار مختلفة ومواصفات متنوعة.',
    });
  }
  console.log(`✓ category ${created ? 'created' : 'updated'}: ${cat.name} (#${cat.id})`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
