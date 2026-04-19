// Reset image_url for services that have known-broken URLs (lookaside.fbsbx.com etc)
// Sets them back to NULL so the category hero fallback kicks in, or a re-fetch can pick up.
require('dotenv').config();
const { sequelize, Service, Category } = require('../models');

const BAD_PATTERNS = [
  '%lookaside.fbsbx%',
  '%fbcdn.net%',
  '%scontent%',
  '%cdninstagram%',
];

async function main() {
  await sequelize.authenticate();
  const { Op } = require('sequelize');

  let count = 0;
  for (const pat of BAD_PATTERNS) {
    const [updated] = await Service.update(
      { image_url: null },
      { where: { image_url: { [Op.like]: pat } } }
    );
    count += updated;
  }
  console.log(`✓ cleared ${count} bad image URLs`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
