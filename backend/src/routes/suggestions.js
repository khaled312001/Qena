const express = require('express');
const { Suggestion } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const body = { ...req.body, status: 'pending' };
    const row = await Suggestion.create(body);
    res.status(201).json({ ok: true, id: row.id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const rows = await Suggestion.findAll({ where, order: [['created_at', 'DESC']] });
  res.json(rows);
});

router.put('/:id', requireAuth, async (req, res) => {
  const row = await Suggestion.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'غير موجود' });
  await row.update(req.body);
  res.json(row);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const row = await Suggestion.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'غير موجود' });
  await row.destroy();
  res.json({ ok: true });
});

module.exports = router;
