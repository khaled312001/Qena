const express = require('express');
const { Service, Category, Suggestion, PublicNumber } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (_req, res) => {
  const [services, approved, pending, categories, numbers, suggestions, suggPending] = await Promise.all([
    Service.count(),
    Service.count({ where: { status: 'approved' } }),
    Service.count({ where: { status: 'pending' } }),
    Category.count(),
    PublicNumber.count(),
    Suggestion.count(),
    Suggestion.count({ where: { status: 'pending' } }),
  ]);
  res.json({
    services, approved, pending, categories, numbers, suggestions, suggPending,
  });
});

module.exports = router;
