const express = require('express');
const { Op } = require('sequelize');
const { Service, Category } = require('../models');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res) => {
  const {
    category,
    q,
    featured,
    status = 'approved',
    limit = 60,
    offset = 0,
    includeCategory,
  } = req.query;

  const where = {};
  if (status) where.status = status;
  if (featured === '1') where.is_featured = true;
  if (q) {
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
      { address: { [Op.like]: `%${q}%` } },
      { tags: { [Op.like]: `%${q}%` } },
    ];
  }
  const include = [];
  if (category) {
    const cat = await Category.findOne({ where: { slug: category } });
    if (cat) where.category_id = cat.id;
    else return res.json({ rows: [], total: 0 });
  }
  if (includeCategory === '1') {
    include.push({ model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon', 'color'] });
  }

  const { rows, count } = await Service.findAndCountAll({
    where,
    include,
    limit: Math.min(Number(limit), 200),
    offset: Number(offset),
    order: [['is_featured', 'DESC'], ['created_at', 'DESC']],
  });
  res.json({ rows, total: count });
});

router.get('/:id', async (req, res) => {
  const svc = await Service.findByPk(req.params.id, {
    include: [{ model: Category, as: 'category' }],
  });
  if (!svc) return res.status(404).json({ error: 'غير موجود' });
  if (svc.status === 'approved') {
    svc.views = (svc.views || 0) + 1;
    await svc.save();
  }
  res.json(svc);
});

router.post('/submit', async (req, res) => {
  try {
    const body = { ...req.body, status: 'pending', is_featured: false };
    delete body.id;
    delete body.views;
    const svc = await Service.create(body);
    res.status(201).json({ ok: true, id: svc.id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const svc = await Service.create(req.body);
    res.status(201).json(svc);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const svc = await Service.findByPk(req.params.id);
  if (!svc) return res.status(404).json({ error: 'غير موجود' });
  await svc.update(req.body);
  res.json(svc);
});

router.post('/:id/approve', requireAuth, async (req, res) => {
  const svc = await Service.findByPk(req.params.id);
  if (!svc) return res.status(404).json({ error: 'غير موجود' });
  await svc.update({ status: 'approved' });
  res.json(svc);
});

router.post('/:id/reject', requireAuth, async (req, res) => {
  const svc = await Service.findByPk(req.params.id);
  if (!svc) return res.status(404).json({ error: 'غير موجود' });
  await svc.update({ status: 'rejected' });
  res.json(svc);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const svc = await Service.findByPk(req.params.id);
  if (!svc) return res.status(404).json({ error: 'غير موجود' });
  await svc.destroy();
  res.json({ ok: true });
});

router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'لا يوجد ملف' });
  const url = `/api/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
