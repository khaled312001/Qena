const express = require('express');
const { PublicNumber } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const where = { is_active: true };
  if (req.query.emergency === '1') where.is_emergency = true;
  if (req.query.group) where.group_name = req.query.group;
  const rows = await PublicNumber.findAll({
    where,
    order: [['is_emergency', 'DESC'], ['sort_order', 'ASC'], ['id', 'ASC']],
  });
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const row = await PublicNumber.create(req.body);
    res.status(201).json(row);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const row = await PublicNumber.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'غير موجود' });
  await row.update(req.body);
  res.json(row);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const row = await PublicNumber.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'غير موجود' });
  await row.destroy();
  res.json({ ok: true });
});

module.exports = router;
