require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');

const app = express();
const BASE = process.env.API_BASE_PATH || '/api';

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

const writeLimiter = rateLimit({ windowMs: 60 * 1000, max: 40 });
const submitLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 10 });

const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '../uploads');
app.use(`${BASE}/uploads`, express.static(uploadsDir, { maxAge: '30d' }));

app.get(`${BASE}/health`, (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use(`${BASE}/auth`, require('./routes/auth'));
app.use(`${BASE}/categories`, require('./routes/categories'));

const servicesRouter = require('./routes/services');
app.use(`${BASE}/services/submit`, submitLimiter);
app.use(`${BASE}/services`, servicesRouter);

app.use(`${BASE}/public-numbers`, require('./routes/publicNumbers'));

const suggestionsRouter = require('./routes/suggestions');
app.post(`${BASE}/suggestions`, submitLimiter);
app.use(`${BASE}/suggestions`, suggestionsRouter);

app.use(`${BASE}/stats`, require('./routes/stats'));

// SEO endpoints — mount at BOTH /api/* and /* because Passenger's
// `PassengerBaseURI /api` strips the prefix before handing off to Express,
// so root-URL rewrites arrive here without the /api part.
const seoRouter = require('./routes/seo');
app.use(`${BASE}`, seoRouter);
app.use('/', seoRouter);

app.use(`${BASE}`, writeLimiter);

app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(err.status || 500).json({ error: err.message || 'خطأ في الخادم' });
});

const PORT = Number(process.env.PORT || 5010);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('[db] connected');
    await sequelize.sync();
    console.log('[db] synced');
    app.listen(PORT, () => console.log(`[api] listening on :${PORT}${BASE}`));
  } catch (e) {
    console.error('[startup] failed:', e);
    process.exit(1);
  }
}

start();

module.exports = app;
