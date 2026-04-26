// SEO helpers: dynamic sitemap.xml + robots.txt + per-route HTML render.
// Mounted at /api/* and / (see backend/src/index.js).
//
// /render returns the static index.html with <title>, <meta description>,
// canonical, and OG/Twitter tags rewritten per-route. Apache routes every
// SPA path through here so each URL has unique metadata in the initial HTML
// (for crawlers + correct browser tab title on first paint).
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Service, Category } = require('../models');

const router = express.Router();

const BASE = 'https://qinawy.com';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/category/all', priority: '0.9', changefreq: 'daily' },
  { loc: '/numbers', priority: '0.9', changefreq: 'weekly' },
  { loc: '/qena', priority: '0.9', changefreq: 'monthly' },
  { loc: '/submit', priority: '0.5', changefreq: 'monthly' },
  { loc: '/submit/rental', priority: '0.6', changefreq: 'weekly' },
  { loc: '/submit/driver', priority: '0.6', changefreq: 'weekly' },
  { loc: '/about', priority: '0.4', changefreq: 'yearly' },
];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

router.get('/sitemap.xml', async (_req, res) => {
  try {
    const cats = await Category.findAll({ where: { is_active: true }, attributes: ['slug', 'updatedAt'] });
    const services = await Service.findAll({
      where: { status: 'approved' },
      attributes: ['id', 'updatedAt'],
      order: [['id', 'ASC']],
    });

    const today = new Date().toISOString().split('T')[0];
    const urls = [];
    for (const p of STATIC_PAGES) {
      urls.push(`<url><loc>${BASE}${p.loc}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`);
    }
    for (const c of cats) {
      const lm = (c.updatedAt || new Date()).toISOString().split('T')[0];
      urls.push(`<url><loc>${BASE}/category/${esc(c.slug)}</loc><lastmod>${lm}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    }
    for (const s of services) {
      const lm = (s.updatedAt || new Date()).toISOString().split('T')[0];
      urls.push(`<url><loc>${BASE}/service/${s.id}</loc><lastmod>${lm}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (e) {
    res.status(500).send(`<!-- sitemap error: ${e.message} -->`);
  }
});

router.get('/robots.txt', (_req, res) => {
  const txt = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${BASE}/sitemap.xml`,
  ].join('\n');
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(txt);
});

// ---------- Per-route HTML rendering ----------

const STATIC_HTML_CANDIDATES = [
  process.env.STATIC_HTML_PATH,
  '/home/u492425110/domains/qinawy.com/public_html/index.html',
  path.join(__dirname, '../../../frontend/dist/index.html'),
].filter(Boolean);

let cachedHtml = null;
let cachedHtmlAt = 0;
const HTML_CACHE_MS = 60_000;

function readIndexHtml() {
  for (const p of STATIC_HTML_CANDIDATES) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
    } catch (_) { /* try next */ }
  }
  throw new Error('index.html not found in any candidate path');
}

function getIndexHtml() {
  const now = Date.now();
  if (cachedHtml && (now - cachedHtmlAt) < HTML_CACHE_MS) return cachedHtml;
  cachedHtml = readIndexHtml();
  cachedHtmlAt = now;
  return cachedHtml;
}

const HOMEPAGE_TITLE = 'قناوي | دليل قنا الشامل — مستشفيات، أطباء، صيدليات، فنادق، مطاعم، خدمات محافظة قنا';
const HOMEPAGE_DESC = 'قناوي — دليل قنا الشامل المجاني. أرقام مستشفيات قنا، أطباء قنا بكل التخصصات، صيدليات 24 ساعة، فنادق قنا، مطاعم، كافيهات، بنوك، مصالح حكومية، محطات وقود، معابد دندرة. خدمة مجانية من شركة برمجلي.';

const STATIC_META = {
  '/': { title: HOMEPAGE_TITLE, description: HOMEPAGE_DESC },
  '/about': {
    title: 'عن قناوي | دليل قنا الشامل من شركة برمجلي',
    description: 'قصة موقع قناوي — مبادرة خيرية من شركة برمجلي لخدمة سكان قنا. تعرف على فريق العمل والرؤية والرسالة.',
  },
  '/qena': {
    title: 'محافظة قنا | عروس الصعيد، تاريخها، مراكزها، ومعالمها — قناوي',
    description: 'محافظة قنا (عروس الصعيد) — معلومات عن مراكز قنا، معبد دندرة، جامعة جنوب الوادي، السكان، التاريخ، والاقتصاد.',
  },
  '/numbers': {
    title: 'أرقام قنا المهمة | طوارئ، نجدة، إسعاف، مطافئ، شكاوى — قناوي',
    description: 'أرقام الطوارئ والخدمات في محافظة قنا: النجدة 122، الإسعاف 123، المطافئ 180، الكهرباء، الغاز، المياه، شكاوى الحكومة.',
  },
  '/submit': {
    title: 'أضف خدمتك إلى دليل قنا — قناوي',
    description: 'سجل مستشفى، صيدلية، عيادة، فندق، مطعم، أو أي خدمة في محافظة قنا مجاناً ضمن دليل قناوي. مراجعة قبل النشر.',
  },
  '/submit/rental': {
    title: 'أضف عقارًا للإيجار في قنا — قناوي',
    description: 'سجل شقة، غرفة، أو سكن طلاب للإيجار في محافظة قنا مجاناً على قناوي.',
  },
  '/submit/driver': {
    title: 'سجل كسائق نقل خاص في قنا — قناوي',
    description: 'سجل بياناتك كسائق نقل خاص في محافظة قنا مجاناً على قناوي وتصل لعملاء يبحثون عن مواصلات.',
  },
  '/category/all': {
    title: 'كل الخدمات في قنا | قناوي - دليل قنا الشامل',
    description: 'تصفح كل الخدمات في محافظة قنا — مستشفيات، صيدليات، عيادات، فنادق، مطاعم، بنوك، مدارس، وأكثر.',
  },
};

function metaForCategory(cat) {
  const desc = (cat.description && cat.description.trim()) ||
    `دليل ${cat.name} في محافظة قنا — أرقام، عناوين، مواعيد عمل، وتقييمات. خدمة مجانية من قناوي.`;
  return {
    title: `${cat.name} في قنا | قناوي - دليل ${cat.name} في محافظة قنا`,
    description: desc.slice(0, 300),
  };
}

function metaForService(svc) {
  const catName = (svc.category && svc.category.name) || 'خدمة';
  const cityPart = svc.city && svc.city !== 'قنا' ? ` - ${svc.city}` : ' - قنا';
  const desc = (svc.description && svc.description.trim()) ||
    `${svc.name} - ${catName} في ${svc.city || 'قنا'}${svc.address ? '، ' + svc.address : ''}. عنوان، رقم تواصل، ومواعيد العمل على قناوي.`;
  return {
    title: `${svc.name}${cityPart} | ${catName} - قناوي`,
    description: desc.slice(0, 300),
  };
}

async function metaFor(reqPath) {
  let p = (reqPath || '/').split('?')[0];
  if (p.length > 1) p = p.replace(/\/+$/, '');
  if (!p) p = '/';

  if (STATIC_META[p]) return STATIC_META[p];

  let m = p.match(/^\/category\/([a-z0-9-]+)$/i);
  if (m) {
    try {
      const cat = await Category.findOne({ where: { slug: m[1], is_active: true } });
      if (cat) return metaForCategory(cat);
    } catch (_) { /* fall through */ }
  }

  m = p.match(/^\/service\/(\d+)$/);
  if (m) {
    try {
      const svc = await Service.findOne({
        where: { id: m[1], status: 'approved' },
        include: [{ model: Category, as: 'category', attributes: ['name', 'slug'] }],
      });
      if (svc) return metaForService(svc);
    } catch (_) { /* fall through */ }
  }

  return { title: HOMEPAGE_TITLE, description: HOMEPAGE_DESC };
}

router.get('/render', async (req, res) => {
  const reqPath = typeof req.query.path === 'string' && req.query.path.startsWith('/')
    ? req.query.path : '/';
  try {
    const meta = await metaFor(reqPath);
    const canonical = BASE + (reqPath === '/' ? '/' : reqPath.replace(/\/+$/, ''));

    const titleEsc = esc(meta.title);
    const descEsc = esc(meta.description);
    const canonEsc = esc(canonical);

    let html = getIndexHtml()
      .replace(/<title>[^<]*<\/title>/, `<title>${titleEsc}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${descEsc}$2`)
      .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${canonEsc}$2`)
      .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${titleEsc}$2`)
      .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${descEsc}$2`)
      .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${canonEsc}$2`)
      .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${titleEsc}$2`)
      .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${descEsc}$2`);

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300');
    res.send(html);
  } catch (e) {
    console.error('[render] error for', reqPath, ':', e && e.message);
    try {
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(getIndexHtml());
    } catch (_) {
      res.status(500).send('Render error');
    }
  }
});

module.exports = router;
