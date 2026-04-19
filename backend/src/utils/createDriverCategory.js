// Ensure 'private-transport' category exists
require('dotenv').config();
const { sequelize, Category } = require('../models');

async function main() {
  await sequelize.authenticate();
  const [cat, created] = await Category.findOrCreate({
    where: { slug: 'private-transport' },
    defaults: {
      slug: 'private-transport',
      name: 'مواصلات خاصة',
      icon: 'Car',
      color: '#16a34a',
      sort_order: 8,
      description: 'سائقون مرخصون في محافظة قنا — ميكروباص، ملاكي، 7 راكب، نقل — لرحلات داخل قنا أو بين المحافظات.',
    },
  });
  if (!created) {
    await cat.update({
      name: 'مواصلات خاصة',
      icon: 'Car',
      color: '#16a34a',
      sort_order: 8,
      description: 'سائقون مرخصون في محافظة قنا — ميكروباص، ملاكي، 7 راكب، نقل — لرحلات داخل قنا أو بين المحافظات.',
    });
  }
  console.log(`✓ category ${created ? 'created' : 'updated'}: ${cat.name} (#${cat.id})`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
