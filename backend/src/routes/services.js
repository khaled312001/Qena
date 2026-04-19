const express = require('express');
const { Op } = require('sequelize');
const { Service, Category } = require('../models');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public aggregate counts + facets — used by the category / search page to show
// real totals and real tag/city counts independent of list pagination.
router.get('/aggregate', async (req, res) => {
  const { category, q, city, facets } = req.query;
  const where = { status: 'approved' };

  if (q) {
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
      { address: { [Op.like]: `%${q}%` } },
      { tags: { [Op.like]: `%${q}%` } },
    ];
  }
  if (city) where.city = city;
  if (category && category !== 'all') {
    const cat = await Category.findOne({ where: { slug: category } });
    if (cat) where.category_id = cat.id;
    else return res.json({ total: 0, withPhone: 0, withMap: 0, withImage: 0, tags: [], cities: [], categories: [] });
  }

  const [total, withPhone, withMap, withImage] = await Promise.all([
    Service.count({ where }),
    Service.count({ where: { ...where, phone: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] } } }),
    Service.count({ where: { ...where, lat: { [Op.ne]: null }, lng: { [Op.ne]: null } } }),
    Service.count({ where: { ...where, image_url: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }] } } }),
  ]);

  const result = { total, withPhone, withMap, withImage };

  // Facets: real per-tag / per-city / per-category counts from the DB,
  // NOT from the paginated list. Cheap — we only fetch three small columns.
  if (facets === '1') {
    const rows = await Service.findAll({
      where,
      attributes: ['tags', 'city', 'category_id'],
      include: [{ model: Category, as: 'category', attributes: ['slug', 'name', 'icon', 'color'] }],
      raw: false,
    });

    const tagMap = new Map(), cityMap = new Map(), catMap = new Map();
    for (const r of rows) {
      if (r.tags) {
        for (const t of String(r.tags).split(/[,،]+/).map((x) => x.trim()).filter((x) => x && x.length > 1 && x.length < 40)) {
          tagMap.set(t, (tagMap.get(t) || 0) + 1);
        }
      }
      if (r.city) cityMap.set(r.city, (cityMap.get(r.city) || 0) + 1);
      const c = r.category;
      if (c && c.slug) {
        if (!catMap.has(c.slug)) catMap.set(c.slug, { slug: c.slug, name: c.name, icon: c.icon, color: c.color, count: 0 });
        catMap.get(c.slug).count += 1;
      }
    }
    result.tags = [...tagMap.entries()].sort((a, b) => b[1] - a[1]);
    result.cities = [...cityMap.entries()].sort((a, b) => b[1] - a[1]);
    result.categories = [...catMap.values()].sort((a, b) => b.count - a.count);
  }

  res.json(result);
});

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
    limit: Math.min(Number(limit) || 60, 1000),
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
