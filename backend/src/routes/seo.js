// SEO helpers: dynamic sitemap.xml + robots.txt + per-route HTML render.
// Mounted at /api/* and / (see backend/src/index.js).
//
// /render returns the static index.html with <title>, <meta description>,
// canonical, OG/Twitter tags, AND per-route body content (h1 + service info
// + LocalBusiness/BreadcrumbList/ItemList JSON-LD) injected so Googlebot
// sees unique HTML for every /service/:id and /category/:slug — otherwise
// the empty SPA shell makes every URL look like a near-duplicate of the
// home page and Google clusters them under one canonical.
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
  { loc: '/contact', priority: '0.5', changefreq: 'yearly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
  { loc: '/guides', priority: '0.9', changefreq: 'weekly' },
  { loc: '/guides/hospitals-qena', priority: '0.8', changefreq: 'monthly' },
  { loc: '/guides/pharmacies-24h-qena', priority: '0.8', changefreq: 'monthly' },
  { loc: '/guides/dendera-temple-guide', priority: '0.85', changefreq: 'monthly' },
  { loc: '/guides/qena-to-cairo-transport', priority: '0.8', changefreq: 'monthly' },
  { loc: '/guides/restaurants-qena', priority: '0.75', changefreq: 'monthly' },
  { loc: '/guides/hotels-qena', priority: '0.75', changefreq: 'monthly' },
  { loc: '/guides/banks-atm-qena', priority: '0.75', changefreq: 'monthly' },
  { loc: '/guides/qena-landmarks', priority: '0.8', changefreq: 'monthly' },
  { loc: '/guides/qena-emergency-numbers', priority: '0.85', changefreq: 'monthly' },
];

function escAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

router.get('/sitemap.xml', async (_req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const urls = [];
  for (const p of STATIC_PAGES) {
    urls.push(`<url><loc>${BASE}${p.loc}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`);
  }

  // Add DB-backed entries best-effort — fall back to the 8 static pages if
  // the DB is unreachable so Google Search Console stops getting 503s.
  try {
    const cats = await Category.findAll({ where: { is_active: true }, attributes: ['slug', 'updatedAt'] });
    for (const c of cats) {
      const lm = (c.updatedAt || new Date()).toISOString().split('T')[0];
      urls.push(`<url><loc>${BASE}/category/${escAttr(c.slug)}</loc><lastmod>${lm}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    }
    const services = await Service.findAll({
      where: { status: 'approved' },
      attributes: ['id', 'updatedAt'],
      order: [['id', 'ASC']],
    });
    for (const s of services) {
      const lm = (s.updatedAt || new Date()).toISOString().split('T')[0];
      urls.push(`<url><loc>${BASE}/service/${s.id}</loc><lastmod>${lm}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
    }
  } catch (e) {
    console.error('[sitemap] db error, returning static pages only:', e && e.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(xml);
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
  '/nearby': {
    title: 'قريب مني | خدمات بالقرب منك في قنا — قناوي',
    description: 'اعرف أقرب مستشفى، صيدلية، عيادة، أو محطة وقود لموقعك الحالي في محافظة قنا. خدمة مجانية من قناوي.',
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
  '/privacy': {
    title: 'سياسة الخصوصية | قناوي - دليل قنا',
    description: 'سياسة الخصوصية لموقع قناوي (qinawy.com). البيانات التي نجمعها، الكوكيز، إعلانات Google AdSense، وحقوقك كمستخدم.',
  },
  '/terms': {
    title: 'شروط الاستخدام | قناوي - دليل قنا',
    description: 'شروط استخدام موقع قناوي. قواعد إضافة الخدمات، حقوق المستخدم، الإعلانات، وإخلاء المسؤولية عن دقة البيانات.',
  },
  '/contact': {
    title: 'تواصل معنا | قناوي - دليل قنا',
    description: 'تواصل مع فريق قناوي - دليل محافظة قنا. أرقام تليفون، بريد إلكتروني، ونموذج رسالة للاقتراحات والشراكات.',
  },
  '/guides': {
    title: 'الأدلة والمقالات | قناوي - دليل قنا الشامل',
    description: 'مقالات وأدلة عن محافظة قنا: مستشفيات، صيدليات، فنادق، مطاعم، معبد دندرة، الانتقال للقاهرة، البنوك، والمعالم السياحية.',
  },
  '/guides/hospitals-qena': {
    title: 'دليل أفضل مستشفيات قنا 2026 — حكومية وخاصة | قناوي',
    description: 'دليل مفصّل لكل مستشفيات محافظة قنا: الجامعي، العام، الجديدة، التأمين الصحي، ومستشفيات النواحي. تخصصات، أرقام، عيادات خارجية، طوارئ.',
  },
  '/guides/pharmacies-24h-qena': {
    title: 'صيدليات قنا 24 ساعة — أرقام، توصيل، وأقرب فرع | قناوي',
    description: 'دليل صيدليات قنا التي تعمل ٢٤ ساعة، أرقام التوصيل المنزلي، وأكبر سلاسل الصيدليات في كل مراكز محافظة قنا.',
  },
  '/guides/dendera-temple-guide': {
    title: 'معبد دندرة الكامل — التاريخ، المواعيد، وكيف تصل | قناوي',
    description: 'دليل سياحي شامل عن معبد دندرة (معبد حتحور) في قنا. تاريخه، مواعيد الزيارة، تذاكر 2026، وكيف تصل من قنا أو القاهرة.',
  },
  '/guides/qena-to-cairo-transport': {
    title: 'الانتقال من قنا للقاهرة — قطار، أتوبيس، سيارة | قناوي',
    description: 'مقارنة بين السفر من قنا للقاهرة بالقطار، بأتوبيسات Super Jet وGoBus، أو بالسيارة الخاصة. أسعار ومواعيد ومدة 2026.',
  },
  '/guides/restaurants-qena': {
    title: 'أفضل مطاعم قنا — مشويات، أسماك، شرقي وغربي | قناوي',
    description: 'دليل المطاعم في محافظة قنا. أشهر مطاعم المشويات، أسماك النيل، كشري، حمام محشي، ومطاعم البيتزا والفاست فود.',
  },
  '/guides/hotels-qena': {
    title: 'فنادق قنا — حجز، أسعار، والأقرب لمعابد دندرة | قناوي',
    description: 'دليل فنادق محافظة قنا في 2026. من فنادق وسط المدينة، إلى منتجعات على النيل، والأقرب لمعبد دندرة.',
  },
  '/guides/banks-atm-qena': {
    title: 'بنوك وصرافات قنا — الأهلي، مصر، CIB، QNB | قناوي',
    description: 'دليل بنوك محافظة قنا 2026: فروع الأهلي، مصر، QNB، CIB، وأماكن الصرافات الآلية ٢٤ ساعة في كل المراكز.',
  },
  '/guides/qena-landmarks': {
    title: 'معالم قنا السياحية — معابد، أديرة، ومواقع أثرية | قناوي',
    description: 'جولة كاملة في معالم محافظة قنا: معبد دندرة، معبد قفط، نقادة الأثرية، دير الصليب، قلعة الشيخ همام.',
  },
  '/guides/qena-emergency-numbers': {
    title: 'أرقام الطوارئ والخدمات الحكومية في قنا — احفظها الآن | قناوي',
    description: 'دليل شامل لأرقام الطوارئ في محافظة قنا: نجدة، إسعاف، مطافئ، شكاوى كهرباء ومياه وغاز، إنقاذ الطرق، وأرقام المحافظة.',
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

const LB_TYPE_BY_SLUG = {
  hospitals: 'Hospital', clinics: 'MedicalClinic', pharmacies: 'Pharmacy',
  hotels: 'Hotel', restaurants: 'Restaurant', cafes: 'CafeOrCoffeeShop',
  banks: 'BankOrCreditUnion', 'gas-stations': 'GasStation',
  shops: 'Store', transport: 'LocalBusiness',
  government: 'GovernmentOffice', education: 'EducationalOrganization',
  tourism: 'TouristAttraction',
};

function absImage(url) {
  if (!url) return null;
  if (String(url).toLowerCase().includes('unsplash.com')) return null;
  return url.startsWith('http') ? url : BASE + url;
}

function serviceBodySsr(svc) {
  const cat = svc.category || {};
  const lbType = LB_TYPE_BY_SLUG[cat.slug] || 'LocalBusiness';
  const img = absImage(svc.image_url);

  const lbLd = {
    '@context': 'https://schema.org',
    '@type': lbType,
    '@id': `${BASE}/service/${svc.id}#business`,
    name: svc.name,
    url: `${BASE}/service/${svc.id}`,
    ...(svc.phone && { telephone: svc.phone }),
    ...(img && { image: img }),
    ...(svc.description && { description: String(svc.description).slice(0, 500) }),
    ...((svc.address || svc.city) && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: svc.address || '',
        addressLocality: svc.city || 'قنا',
        addressRegion: 'محافظة قنا',
        addressCountry: 'EG',
      },
    }),
    ...(svc.lat && svc.lng && {
      geo: { '@type': 'GeoCoordinates', latitude: Number(svc.lat), longitude: Number(svc.lng) },
    }),
    ...(svc.working_hours && { openingHours: svc.working_hours }),
    ...(svc.website && { sameAs: [svc.website] }),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${BASE}/` },
      cat.slug && { '@type': 'ListItem', position: 2, name: cat.name, item: `${BASE}/category/${cat.slug}` },
      { '@type': 'ListItem', position: cat.slug ? 3 : 2, name: svc.name, item: `${BASE}/service/${svc.id}` },
    ].filter(Boolean),
  };

  // Rendered INSIDE <div id="root">. React's createRoot().render() wipes this
  // on mount (no hydration) so users only see it for a few hundred ms; crawlers
  // and no-JS users see the full content. Includes a breadcrumb, H1, key
  // contact fields, and the description.
  const rows = [];
  if (svc.address) rows.push(['العنوان', escHtml(svc.address)]);
  if (svc.phone) rows.push(['هاتف', `<a href="tel:${escAttr(svc.phone)}">${escHtml(svc.phone)}</a>`]);
  if (svc.alt_phone) rows.push(['هاتف آخر', `<a href="tel:${escAttr(svc.alt_phone)}">${escHtml(svc.alt_phone)}</a>`]);
  if (svc.whatsapp) rows.push(['واتساب', escHtml(svc.whatsapp)]);
  if (svc.working_hours) rows.push(['مواعيد العمل', escHtml(svc.working_hours)]);
  if (svc.price_range) rows.push(['الأسعار', escHtml(svc.price_range)]);
  if (svc.website) rows.push(['الموقع', `<a href="${escAttr(svc.website)}" rel="noopener">${escHtml(svc.website)}</a>`]);

  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1rem;max-width:1100px;margin:0 auto">
  <nav aria-label="breadcrumb" style="font-size:0.85rem;color:#64748b;margin-bottom:0.75rem">
    <a href="/" style="color:#0c4a6e">الرئيسية</a>
    ${cat.slug ? ` › <a href="/category/${escAttr(cat.slug)}" style="color:#0c4a6e">${escHtml(cat.name)}</a>` : ''}
    › <span>${escHtml(svc.name)}</span>
  </nav>
  <h1 style="font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 0.5rem">${escHtml(svc.name)}</h1>
  ${cat.name ? `<p style="color:#475569;margin:0 0 1rem"><strong>${escHtml(cat.name)}</strong>${svc.city ? ' · ' + escHtml(svc.city) + '، محافظة قنا' : '، محافظة قنا'}</p>` : ''}
  ${svc.description ? `<p style="line-height:1.8;color:#334155;margin:0 0 1rem">${escHtml(svc.description)}</p>` : ''}
  ${rows.length ? `<dl style="display:grid;grid-template-columns:auto 1fr;gap:0.5rem 1rem;margin:0">${
    rows.map(([k, v]) => `<dt style="color:#64748b;font-size:0.9rem">${k}</dt><dd style="margin:0;color:#0f172a">${v}</dd>`).join('')
  }</dl>` : ''}
  ${img ? `<img src="${escAttr(img)}" alt="${escAttr(svc.name)}" style="max-width:100%;height:auto;margin-top:1rem;border-radius:0.75rem" loading="lazy">` : ''}
</div>`;

  const ldHtml = `<script type="application/ld+json">${JSON.stringify(lbLd)}</script>\n<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>`;
  return { bodyHtml, ldHtml, img };
}

function categoryBodySsr(cat, services) {
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cat.name} في محافظة قنا`,
    numberOfItems: services.length,
    itemListElement: services.slice(0, 50).map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE}/service/${s.id}`,
      name: s.name,
    })),
  };

  const items = services.slice(0, 100).map((s) => {
    const parts = [];
    if (s.city) parts.push(escHtml(s.city));
    if (s.address) parts.push(escHtml(s.address));
    if (s.phone) parts.push(`<a href="tel:${escAttr(s.phone)}">${escHtml(s.phone)}</a>`);
    return `<li style="padding:0.5rem 0;border-bottom:1px solid #f1f5f9"><a href="/service/${s.id}" style="color:#0c4a6e;font-weight:600">${escHtml(s.name)}</a>${parts.length ? ` <span style="color:#64748b;font-size:0.85rem"> · ${parts.join(' · ')}</span>` : ''}</li>`;
  }).join('');

  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1rem;max-width:1100px;margin:0 auto">
  <nav aria-label="breadcrumb" style="font-size:0.85rem;color:#64748b;margin-bottom:0.75rem">
    <a href="/" style="color:#0c4a6e">الرئيسية</a> › <span>${escHtml(cat.name)}</span>
  </nav>
  <h1 style="font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 0.5rem">${escHtml(cat.name)} في محافظة قنا</h1>
  ${cat.description ? `<p style="line-height:1.8;color:#334155;margin:0 0 1rem">${escHtml(cat.description)}</p>` : ''}
  <p style="color:#64748b;margin:0 0 1rem">${services.length.toLocaleString('ar-EG')} نتيجة في قنا، قفط، قوص، نجع حمادي، دشنا، فرشوط، أبو تشت، نقادة، الوقف.</p>
  ${items ? `<ul style="list-style:none;padding:0;margin:0">${items}</ul>` : ''}
</div>`;

  const ldHtml = `<script type="application/ld+json">${JSON.stringify(itemListLd)}</script>`;
  return { bodyHtml, ldHtml };
}

// Resolve route metadata and (optionally) per-route body content. Returns
// { meta, found, body, ld, ogImage }. `found: false` means the URL doesn't
// match any known SPA route (or the DB row was missing) and the caller
// should respond 404 + noindex.
async function metaFor(reqPath) {
  let p = (reqPath || '/').split('?')[0];
  if (p.length > 1) p = p.replace(/\/+$/, '');
  if (!p) p = '/';

  if (STATIC_META[p]) return { meta: STATIC_META[p], found: true };

  // /admin and subpaths — known SPA routes, but excluded from indexing.
  if (p === '/admin' || p.startsWith('/admin/')) {
    return { meta: STATIC_META['/'], found: true, noindex: true };
  }

  let m = p.match(/^\/category\/([a-z0-9-]+)$/i);
  if (m) {
    try {
      const cat = await Category.findOne({ where: { slug: m[1], is_active: true } });
      if (!cat) return { meta: STATIC_META['/'], found: false };

      // Best-effort: load top services for the body. If it fails, we still
      // serve the page with just the H1 + category description.
      let services = [];
      try {
        services = await Service.findAll({
          where: { status: 'approved', category_id: cat.id },
          attributes: ['id', 'name', 'city', 'address', 'phone'],
          order: [['is_featured', 'DESC'], ['id', 'DESC']],
          limit: 100,
        });
      } catch (_) { /* keep empty list */ }

      const { bodyHtml, ldHtml } = categoryBodySsr(cat, services);
      return { meta: metaForCategory(cat), found: true, body: bodyHtml, ld: ldHtml };
    } catch (_) {
      // DB unreachable — keep page indexable with generic meta + no body.
      return { meta: STATIC_META['/category/all'], found: true };
    }
  }

  m = p.match(/^\/service\/(\d+)$/);
  if (m) {
    try {
      const svc = await Service.findOne({
        where: { id: m[1], status: 'approved' },
        include: [{ model: Category, as: 'category', attributes: ['name', 'slug'] }],
      });
      if (!svc) return { meta: STATIC_META['/'], found: false };

      const { bodyHtml, ldHtml, img } = serviceBodySsr(svc);
      return { meta: metaForService(svc), found: true, body: bodyHtml, ld: ldHtml, ogImage: img };
    } catch (_) {
      // DB unreachable — degrade but stay indexable rather than 404'ing.
      return { meta: STATIC_META['/'], found: true };
    }
  }

  return { meta: STATIC_META['/'], found: false };
}

async function renderForPath(reqPath, res) {
  try {
    const ctx = await metaFor(reqPath);
    const { meta, found, noindex, body, ld, ogImage } = ctx;
    const canonical = found
      ? BASE + (reqPath === '/' ? '/' : reqPath.replace(/\/+$/, ''))
      : BASE + '/';

    const titleEsc = escAttr(meta.title);
    const descEsc = escAttr(meta.description);
    const canonEsc = escAttr(canonical);
    const ogImg = ogImage ? escAttr(ogImage) : null;

    let html = getIndexHtml()
      .replace(/<title>[^<]*<\/title>/, `<title>${titleEsc}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${descEsc}$2`)
      .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${canonEsc}$2`)
      .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${titleEsc}$2`)
      .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${descEsc}$2`)
      .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${canonEsc}$2`)
      .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${titleEsc}$2`)
      .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${descEsc}$2`);

    if (ogImg) {
      html = html
        .replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/, `$1${ogImg}$2`)
        .replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/, `$1${ogImg}$2`);
    }

    // Per-route body content. Injected inside <div id="root"> so React's
    // createRoot().render() wipes it on mount (no hydration mismatch).
    // Until React runs, Googlebot / no-JS users see a fully unique body —
    // this is what fixes the "Alternate page with proper canonical tag" and
    // "Duplicate, Google chose different canonical" issues.
    if (body) {
      html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    }

    // Per-route structured data: LocalBusiness + BreadcrumbList (services)
    // or ItemList (categories). Inserted just before </body> so the static
    // Organization/WebSite blocks in <head> remain untouched.
    if (ld) {
      html = html.replace('</body>', `${ld}\n</body>`);
    }

    // For unknown URLs and admin routes: add noindex so Google drops them
    // instead of indexing the SPA shell as a phantom canonical.
    if (!found || noindex) {
      html = html.replace(
        /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/,
        '<meta name="robots" content="noindex,nofollow" />'
      );
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=300');
    res.status(found ? 200 : 404).send(html);
  } catch (e) {
    console.error('[render] error for', reqPath, ':', e && e.message);
    try {
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(getIndexHtml());
    } catch (_) {
      res.status(500).send('Render error');
    }
  }
}

// /render endpoint (used when called explicitly, e.g. via Apache rewrite)
router.get('/render', async (req, res) => {
  const reqPath = typeof req.query.path === 'string' && req.query.path.startsWith('/')
    ? req.query.path : '/';
  return renderForPath(reqPath, res);
});

// SPA catch-all middleware: render the SPA HTML for any GET that no other
// route matched. Mount via app.use(spaCatchAll) AFTER all API routes.
async function spaCatchAll(req, res, next) {
  if (req.method !== 'GET') return next();
  // Skip API and admin paths (admin is a SPA route but blocked from indexing,
  // so we still serve it the homepage HTML — same as before).
  if (req.path.startsWith('/api/')) return next();
  return renderForPath(req.path, res);
}

module.exports = router;
module.exports.spaCatchAll = spaCatchAll;
