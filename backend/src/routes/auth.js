const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'اسم المستخدم وكلمة السر مطلوبان' });
  }
  const admin = await Admin.findOne({ where: { username } });
  if (!admin) return res.status(401).json({ error: 'بيانات غير صحيحة' });
  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return res.status(401).json({ error: 'بيانات غير صحيحة' });
  admin.last_login_at = new Date();
  await admin.save();
  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  res.json({
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      display_name: admin.display_name,
      role: admin.role,
    },
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const admin = await Admin.findByPk(req.admin.id);
  if (!admin) return res.status(404).json({ error: 'غير موجود' });
  res.json({
    id: admin.id,
    username: admin.username,
    display_name: admin.display_name,
    role: admin.role,
  });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { current, next } = req.body || {};
  const admin = await Admin.findByPk(req.admin.id);
  if (!admin) return res.status(404).json({ error: 'غير موجود' });
  const ok = await bcrypt.compare(current || '', admin.password_hash);
  if (!ok) return res.status(401).json({ error: 'كلمة السر الحالية غير صحيحة' });
  if (!next || next.length < 8) return res.status(400).json({ error: 'كلمة السر الجديدة قصيرة' });
  admin.password_hash = await bcrypt.hash(next, 10);
  await admin.save();
  res.json({ ok: true });
});

module.exports = router;
