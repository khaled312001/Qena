const express = require('express');
const slugify = require('slugify');
const { Category, Service } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  const rows = await Category.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC'], ['id', 'ASC']],
  });
  res.json(rows);
});

router.get('/with-counts', async (_req, res) => {
  const rows = await Category.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC']],
    include: [{
      model: Service,
      as: 'services',
      attributes: ['id'],
      where: { status: 'approved' },
      required: false,
    }],
  });
  const out = rows.map((c) => {
    const j = c.toJSON();
    j.services_count = (j.services || []).length;
    delete j.services;
    return j;
  });
  res.json(out);
});

router.get('/:slug', async (req, res) => {
  const cat = await Category.findOne({ where: { slug: req.params.slug } });
  if (!cat) return res.status(404).json({ error: 'القسم غير موجود' });
  res.json(cat);
});

router.post('/', requireAuth, async (req, res) => {
  const body = { ...req.body };
  if (!body.slug && body.name) {
    body.slug = slugify(body.name, { lower: true, strict: true });
  }
  try {
    const cat = await Category.create(body);
    res.status(201).json(cat);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return res.status(404).json({ error: 'غير موجود' });
  await cat.update(req.body);
  res.json(cat);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return res.status(404).json({ error: 'غير موجود' });
  await cat.destroy();
  res.json({ ok: true });
});

module.exports = router;
