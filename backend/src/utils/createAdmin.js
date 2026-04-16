require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Admin } = require('../models');

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error('ADMIN_PASSWORD غير محدد في .env');

  await sequelize.authenticate();
  await sequelize.sync();

  const hash = await bcrypt.hash(password, 10);
  const [admin, created] = await Admin.findOrCreate({
    where: { username },
    defaults: { password_hash: hash, display_name: 'مدير النظام', role: 'admin' },
  });
  if (!created) {
    admin.password_hash = hash;
    await admin.save();
    console.log('✓ تم تحديث كلمة سر الأدمن:', username);
  } else {
    console.log('✓ تم إنشاء الأدمن:', username);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
