// Rename all occurrences of "جامعة جنوب الوادي" / "جنوب الوادي" to "جامعة قنا" / "قنا"
// in services (name, description, address, tags).
require('dotenv').config();
const { sequelize, Service, Category } = require('../models');
const { Op } = require('sequelize');

async function main() {
  await sequelize.authenticate();

  // Find all services that mention جنوب الوادي anywhere
  const rows = await Service.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: '%جنوب الوادي%' } },
        { name: { [Op.like]: '%جنوب الوادى%' } },
        { description: { [Op.like]: '%جنوب الوادي%' } },
        { description: { [Op.like]: '%جنوب الوادى%' } },
        { address: { [Op.like]: '%جنوب الوادي%' } },
        { address: { [Op.like]: '%جنوب الوادى%' } },
        { tags: { [Op.like]: '%جنوب الوادي%' } },
      ],
    },
  });
  console.log(`found ${rows.length} services mentioning "جنوب الوادي"`);

  function rn(s) {
    if (!s) return s;
    return s
      .replace(/جامعة\s*جنوب\s*الواد[يى]/g, 'جامعة قنا')
      .replace(/جنوب\s*الواد[يى]/g, 'قنا');
  }

  let updated = 0;
  for (const r of rows) {
    await r.update({
      name: rn(r.name),
      description: rn(r.description),
      address: rn(r.address),
      tags: rn(r.tags),
    });
    updated++;
  }
  console.log(`✓ updated ${updated} services`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
