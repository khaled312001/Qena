const express = require('express');
const { Suggestion, Service } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Parse a correction message (produced by CorrectionModal) into a concrete
// patch that can be applied to a Service row. Example message:
//   الخدمة: مستشفى قنا الجامعي (#475)
//   الحقل: رقم الهاتف
//   القيمة الحالية: ...
//   القيمة المقترحة: 01012345678
//   📎 صورة مرفقة: /api/uploads/xxx.jpg
function parseCorrection(message) {
  const txt = String(message || '');
  const field = (txt.match(/الحقل:\s*([^\n]+)/) || [])[1]?.trim() || '';
  const proposed = (txt.match(/القيمة المقترحة:\s*([^\n]+)/) || [])[1]?.trim() || '';
  const imageUrl = (txt.match(/📎\s*صورة مرفقة:\s*([^\n]+)/) || [])[1]?.trim() || '';
  const patch = {};
  const meta = { field, proposed, imageUrl, applied: [] };

  // Map the Arabic label to a DB column. Location becomes lat/lng.
  const MAP = {
    'اسم المكان': 'name',
    'رقم الهاتف': 'phone',
    'العنوان': 'address',
    'مواعيد العمل': 'working_hours',
    'الموقع الإلكتروني': 'website',
  };
  if (field && MAP[field] && proposed) {
    patch[MAP[field]] = proposed;
    meta.applied.push(MAP[field]);
  }
  if (field === 'الموقع على الخريطة' && proposed) {
    const m = proposed.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (m) { patch.lat = Number(m[1]); patch.lng = Number(m[2]); meta.applied.push('lat', 'lng'); }
  }
  if (field === 'المكان مغلق نهائياً') {
    patch.status = 'rejected';
    meta.applied.push('status=rejected');
  }
  if (imageUrl) {
    patch.image_url = imageUrl;
    meta.applied.push('image_url');
  }
  return { patch, meta };
}

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

// Apply a correction suggestion to its target service: parses the structured
// message, updates the service fields (name/phone/address/working_hours/
// website/lat/lng/image_url) and marks the suggestion as reviewed.
//
// This is the button the admin clicks to actually *apply* a user correction
// — previously "approve" only flipped the suggestion's own status.
router.post('/:id/apply', requireAuth, async (req, res) => {
  const row = await Suggestion.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'غير موجود' });
  if (!row.service_id) {
    return res.status(400).json({ error: 'الاقتراح غير مرتبط بخدمة — تعذّر التطبيق' });
  }
  const svc = await Service.findByPk(row.service_id);
  if (!svc) return res.status(404).json({ error: 'الخدمة المرتبطة محذوفة' });

  const { patch, meta } = parseCorrection(row.message);
  if (Object.keys(patch).length === 0) {
    return res.status(400).json({
      error: 'لا يوجد تعديل قابل للتطبيق — عدّل الخدمة يدوياً',
      meta,
    });
  }
  await svc.update(patch);
  await row.update({
    status: 'reviewed',
    admin_note: `تم التطبيق: ${meta.applied.join('، ')}`,
  });
  res.json({ ok: true, applied: meta.applied, service: svc });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const row = await Suggestion.findByPk(req.params.id);
  if (!row) return res.status(404).json({ error: 'غير موجود' });
  await row.destroy();
  res.json({ ok: true });
});

module.exports = router;
