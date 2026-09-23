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
const NEW_ARTICLES = require('../data/articles');
const AUTHORS = require('../data/authors');
const TEAM = require('../data/team');
const EDITORIAL_POLICY = require('../data/editorial-policy');
const STATIC_PAGES_CONTENT = require('../data/staticPages');
// sae:image-health — what the last sweep learned about each hotlinked image.
const imageHealth = require('../utils/imageHealth');

const router = express.Router();

const BASE = 'https://qinawy.com';

// Outline-only data for the 12 pre-existing guide articles. Their full prose
// lives in frontend/src/pages/guides/*Guide.jsx and renders client-side via
// React. The outlines below let the backend SSR a substantial summary so
// crawlers (especially AdsBot-Google) see real content before JS executes.
const EXISTING_GUIDE_OUTLINES = {
  'hospitals-qena': {
    title: 'دليل أفضل مستشفيات قنا 2026 — حكومية وخاصة',
    description: 'دليل مفصّل لكل مستشفيات محافظة قنا: الجامعي، العام، الجديدة، التأمين الصحي، ومستشفيات النواحي. تخصصات، أرقام، عيادات خارجية، طوارئ.',
    icon: '🏥', read_mins: 8, author: 'khaled-ahmed', reviewed_by: 'qena-correspondent',
    sections: [
      'مستشفى قنا الجامعي — المرجع الإقليمي',
      'مستشفى قنا العام التابع لوزارة الصحة',
      'مستشفى قنا الجديدة',
      'مستشفيات النواحي والمراكز',
      'المستشفيات الخاصة في قنا',
      'أرقام الطوارئ المهمة في قنا',
      'نصائح عملية قبل الذهاب لأي مستشفى',
    ],
  },
  'pharmacies-24h-qena': {
    title: 'صيدليات قنا 24 ساعة — أرقام، توصيل، وأقرب فرع',
    description: 'دليل صيدليات قنا التي تعمل ٢٤ ساعة، أرقام التوصيل المنزلي، وأكبر سلاسل الصيدليات في كل مراكز محافظة قنا.',
    icon: '💊', read_mins: 6, author: 'khaled-ahmed', reviewed_by: 'qena-correspondent',
    sections: [
      'أكبر سلاسل الصيدليات في قنا',
      'الصيدليات المحلية في كل مركز',
      'كيف تجد صيدلية مفتوحة الآن',
      'توصيل الأدوية في قنا',
      'متى تحتاج روشتة طبيب',
      'الصيدليات في الأعياد والإجازات',
    ],
  },
  'dendera-temple-guide': {
    title: 'معبد دندرة الكامل — التاريخ، المواعيد، وكيف تصل',
    description: 'دليل سياحي شامل عن معبد دندرة (معبد حتحور) في قنا. تاريخه، مواعيد الزيارة، تذاكر 2026، وكيف تصل من قنا أو القاهرة.',
    icon: '🏛️', read_mins: 10, author: 'qena-historian', reviewed_by: 'khaled-ahmed',
    sections: [
      'لماذا دندرة مهم؟',
      'تاريخ المعبد باختصار',
      'أبرز ما تشاهده داخل المعبد',
      'زودياك دندرة (السقف الفلكي)',
      'كيف تصل لمعبد دندرة',
      'المواعيد وأسعار التذاكر (2026)',
      'نصائح قبل الزيارة',
    ],
  },
  'qena-to-cairo-transport': {
    title: 'الانتقال من قنا للقاهرة — قطار، أتوبيس، أو سيارة',
    description: 'مقارنة بين السفر من قنا للقاهرة بالقطار، بأتوبيسات Super Jet وGoBus، أو بالسيارة الخاصة. أسعار ومواعيد ومدة 2026.',
    icon: '🚆', read_mins: 7, author: 'khaled-ahmed', reviewed_by: 'qena-correspondent',
    sections: [
      'المسافة والوقت — نظرة سريعة',
      'القطار — الأكثر شعبية',
      'الأتوبيسات — Super Jet وGoBus',
      'السيارة الخاصة',
      'الطيران',
      'أيهما أفضل لرحلتي؟',
      'عند الوصول للقاهرة',
    ],
  },
  'restaurants-qena': {
    title: 'أفضل مطاعم قنا — مشويات، أسماك، شرقي وغربي',
    description: 'دليل المطاعم في محافظة قنا. أشهر مطاعم المشويات، أسماك النيل، كشري، حمام محشي، ومطاعم البيتزا والفاست فود.',
    icon: '🍽️', read_mins: 6, author: 'qena-correspondent', reviewed_by: 'khaled-ahmed',
    sections: [
      'المطبخ القناوي — ما يميّزه',
      'أشهر مطاعم وسط مدينة قنا',
      'مطاعم الأسماك على النيل',
      'مطاعم البيتزا والفاست فود',
      'مطاعم نجع حمادي',
      'الكافيهات في قنا',
      'توصيل الطعام',
    ],
  },
  'hotels-qena': {
    title: 'فنادق قنا — حجز، أسعار، والأقرب لمعابد دندرة',
    description: 'دليل فنادق محافظة قنا في 2026. من فنادق وسط المدينة، إلى منتجعات على النيل، والأقرب لمعبد دندرة.',
    icon: '🏨', read_mins: 5, author: 'ahmed-kamal', reviewed_by: 'qena-correspondent',
    sections: [
      'أنواع الإقامة المتاحة في قنا',
      'متوسط أسعار الفنادق (2026)',
      'الفندق المناسب لكل غرض',
      'كيف تحجز فندق في قنا',
      'ما يجب أن تسأل عنه قبل الحجز',
      'نصائح إقامة عملية',
    ],
  },
  'banks-atm-qena': {
    title: 'بنوك وصرافات قنا — الأهلي، مصر، CIB، QNB وأكثر',
    description: 'دليل بنوك محافظة قنا 2026: فروع الأهلي، مصر، QNB، CIB، وأماكن الصرافات الآلية ٢٤ ساعة في كل المراكز.',
    icon: '🏦', read_mins: 6, author: 'khaled-ahmed', reviewed_by: 'ahmed-kamal',
    sections: [
      'البنوك الحكومية الكبرى في قنا',
      'البنوك الخاصة والاستثمارية',
      'مواعيد عمل البنوك',
      'الصرّافات الآلية في قنا',
      'كيف تفتح حساباً بنكياً',
      'الشهادات وحسابات الادخار',
      'أرقام الطوارئ المصرفية',
    ],
  },
  'qena-landmarks': {
    title: 'معالم قنا السياحية — معابد، أديرة، ومواقع أثرية',
    description: 'جولة كاملة في معالم محافظة قنا: معبد دندرة، معبد قفط، نقادة الأثرية، دير الصليب، قلعة الشيخ همام.',
    icon: '🗺️', read_mins: 9, author: 'qena-historian', reviewed_by: 'qena-correspondent',
    sections: [
      'معبد دندرة (معبد حتحور)',
      'معبد قفط (Coptos)',
      'نقادة الأثرية',
      'دير الصليب في نقادة',
      'معبد شنهور',
      'مسجد عبد الرحيم القناوي',
      'قلعة الشيخ همام في فرشوط',
      'كورنيش النيل في قنا',
      'متحف قنا',
    ],
  },
  'qena-emergency-numbers': {
    title: 'أرقام الطوارئ والخدمات الحكومية في قنا — احفظها الآن',
    description: 'دليل شامل لأرقام الطوارئ في محافظة قنا: نجدة، إسعاف، مطافئ، شكاوى كهرباء ومياه وغاز، إنقاذ الطرق.',
    icon: '🚨', read_mins: 5, author: 'khaled-ahmed', reviewed_by: 'qena-historian',
    sections: [
      'أرقام الطوارئ الأساسية (موحدة لكل مصر)',
      'متى تتصل بالإسعاف؟',
      'أرقام الشكاوى الحكومية',
      'أرقام محافظة قنا',
      'كيف تستخدم هذه الأرقام بفعالية',
      'إذا لم يستجب أحد',
      'نصائح أمان عامة',
    ],
  },
  'qena-history': {
    title: 'تاريخ محافظة قنا — من حضارة نقادة إلى اليوم',
    description: 'رحلة شاملة في تاريخ محافظة قنا: حضارة نقادة قبل الأسرات، العصر الفرعوني، البطلمي، الروماني، القبطي، الإسلامي، حتى مصر الحديثة.',
    icon: '📜', read_mins: 12, author: 'qena-historian', reviewed_by: 'khaled-ahmed',
    sections: [
      'ما قبل الأسرات — حضارة نقادة (4400-3100 ق.م)',
      'العصر الفرعوني — قفط وقنا في الأسرات',
      'العصر البطلمي والروماني (332 ق.م - 395 م)',
      'العصر القبطي والمسيحي (4-7 م)',
      'العصر الإسلامي المبكر (640-1250 م)',
      'العصر المملوكي والعثماني (1250-1800 م)',
      'عصر محمد علي والاحتلال البريطاني',
      'مصر الحديثة (1952 - اليوم)',
    ],
  },
  'qena-education': {
    title: 'التعليم في قنا — جامعات، مدارس، معاهد، ومراكز تدريب',
    description: 'دليل التعليم الكامل في محافظة قنا. جامعة جنوب الوادي، كلياتها، المدارس الحكومية والخاصة، المعاهد، وسكن الطلاب.',
    icon: '🎓', read_mins: 8, author: 'khaled-ahmed', reviewed_by: 'ahmed-kamal',
    sections: [
      'جامعة جنوب الوادي — قلب التعليم العالي',
      'الأزهر الشريف في قنا',
      'التعليم قبل الجامعي',
      'المعاهد الفنية والمهنية',
      'مراكز الدروس والكورسات',
      'التعليم الإلكتروني والمنح',
      'مكتبات قنا',
    ],
  },
  'qena-economy': {
    title: 'اقتصاد قنا — الزراعة، الصناعة، السياحة، والتجارة',
    description: 'دليل اقتصاد قنا 2026. القطاعات: قصب السكر، الصناعة (الألومنيوم، السكر)، السياحة، التجارة، وفرص الاستثمار.',
    icon: '💼', read_mins: 9, author: 'ahmed-kamal', reviewed_by: 'qena-historian',
    sections: [
      'القطاع الزراعي — العمود الفقري',
      'القطاع الصناعي — التصنيع الثقيل',
      'السياحة — قطاع نمو',
      'التجارة المحلية',
      'القطاع المصرفي والمالي',
      'النقل والمواصلات',
      'الخدمات الصحية والتعليمية',
      'فرص العمل والاستثمار',
    ],
  },
};

const ALL_GUIDE_SLUGS = [
  ...Object.keys(EXISTING_GUIDE_OUTLINES),
  ...Object.keys(NEW_ARTICLES),
];

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/category/all', priority: '0.9', changefreq: 'daily' },
  { loc: '/numbers', priority: '0.9', changefreq: 'weekly' },
  // sae:sitemap-fix — linked from the footer and indexable, but never listed.
  { loc: '/nearby', priority: '0.7', changefreq: 'weekly' },
  { loc: '/qena', priority: '0.9', changefreq: 'monthly' },
  { loc: '/submit', priority: '0.5', changefreq: 'monthly' },
  { loc: '/submit/rental', priority: '0.6', changefreq: 'weekly' },
  { loc: '/submit/driver', priority: '0.6', changefreq: 'weekly' },
  { loc: '/about', priority: '0.6', changefreq: 'monthly' },
  { loc: '/team', priority: '0.6', changefreq: 'monthly' },
  { loc: '/editorial-policy', priority: '0.5', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.5', changefreq: 'yearly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
  { loc: '/guides', priority: '0.95', changefreq: 'weekly' },
  // 12 existing guides
  ...Object.keys(EXISTING_GUIDE_OUTLINES).map((slug) => ({
    loc: `/guides/${slug}`, priority: '0.85', changefreq: 'monthly',
  })),
  // 7 new long-form articles
  ...Object.keys(NEW_ARTICLES).map((slug) => ({
    loc: `/guides/${slug}`, priority: '0.9', changefreq: 'monthly',
  })),
  // 4 author pages
  ...Object.keys(AUTHORS).map((slug) => ({
    loc: `/author/${slug}`, priority: '0.5', changefreq: 'monthly',
  })),
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
    // sae:rest-fix — every active category is listed. The five-category
    // filter here was the sitemap half of a noindex strategy that no longer
    // exists; leaving it in place asked Google to ignore eleven pages that
    // the same response declares indexable and links from the homepage.
    const cats = await Category.findAll({ where: { is_active: true }, attributes: ['id', 'slug', 'updatedAt'] });
    // sae:empty-cats — a sitemap entry asks Google to rank the URL. Two
    // categories hold no approved listing, so the page is a heading over an
    // empty list; promoting it is asking to be judged on a thin page.
    const populated = new Set();
    for (const c of cats) {
      const n = await Service.count({
        where: { status: 'approved', category_id: c.id },
      });
      if (n > 0) populated.add(c.slug);
    }
    for (const c of cats) {
      if (!populated.has(c.slug)) continue;
      const lm = (c.updatedAt || new Date()).toISOString().split('T')[0];
      urls.push(`<url><loc>${BASE}/category/${escAttr(c.slug)}</loc><lastmod>${lm}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    }
    // Only include "rich" services in the sitemap — see isThinService() for
    // the exact rule. Thin services stay reachable via /category/* listings
    // but aren't promoted to Google as primary content. Keeps AdSense from
    // seeing thousands of templated near-duplicate pages.
    const services = await Service.findAll({
      where: { status: 'approved' },
      attributes: ['id', 'updatedAt', 'description', 'working_hours', 'website', 'image_url', 'address', 'tags', 'phone'],
      order: [['id', 'ASC']],
    });
    // sae:sitemap-fix — a listing that canonicalises to another must not also
    // be submitted for indexing; the two signals contradict each other.
    const dupes = await saeDupeTargets();
    for (const s of services) {
      if (dupes.has(String(s.id))) continue;
      // sae:index-all — every approved service is listed now.
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
  // Block AdSense quality crawlers (Mediapartners-Google, AdsBot-Google)
  // from /service/:id — they evaluate content quality for ad-eligibility,
  // and our editorial pages should be what they score, not the thin
  // listing pages. See audit notes in commit history.
  const txt = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    'User-agent: Mediapartners-Google',
    'Disallow: /service/',
    '',
    'User-agent: AdsBot-Google',
    'Disallow: /service/',
    '',
    'User-agent: AdsBot-Google-Mobile',
    'Disallow: /service/',
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

// sae:meta-fix — was 82 chars; Google truncates near 60 and the platform
// flags anything past 70.
const HOMEPAGE_TITLE = 'قناوي | دليل قنا الشامل — مستشفيات، صيدليات، فنادق ومطاعم';
// Meta description: kept <=160 chars (Google's SERP truncation point).
// Focus on the strongest keywords + value proposition.
const HOMEPAGE_DESC = 'قناوي — دليل قنا الشامل المجاني. مستشفيات، صيدليات 24 ساعة، فنادق، مطاعم، بنوك، معابد دندرة، وأرقام طوارئ. مقدم من شركة برمجلي.';

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
  '/guides/qena-history': {
    title: 'تاريخ محافظة قنا — من حضارة نقادة إلى اليوم | قناوي',
    description: 'رحلة شاملة في تاريخ محافظة قنا: حضارة نقادة قبل الأسرات، العصر الفرعوني، البطلمي، الروماني، القبطي، الإسلامي، حتى مصر الحديثة.',
  },
  '/guides/qena-education': {
    title: 'التعليم في قنا — جامعات، مدارس، معاهد، ومراكز تدريب | قناوي',
    description: 'دليل التعليم الكامل في محافظة قنا. جامعة جنوب الوادي، كلياتها، المدارس الحكومية والخاصة، المعاهد، وسكن الطلاب.',
  },
  '/guides/qena-economy': {
    title: 'اقتصاد قنا — الزراعة، الصناعة، السياحة، والتجارة | قناوي',
    description: 'دليل اقتصاد قنا 2026. القطاعات: قصب السكر، الصناعة (الألومنيوم، السكر)، السياحة، التجارة، وفرص الاستثمار.',
  },
  // 7 new long-form articles (titles + descriptions sourced from data/articles.js)
  ...Object.fromEntries(Object.entries(NEW_ARTICLES).map(([slug, art]) => [
    `/guides/${slug}`, { title: `${art.title} | قناوي`, description: art.description }
  ])),
  // Editorial trust pages
  '/team': {
    title: 'فريق قناوي — مؤسسون ومحررون ومراجعون',
    description: 'تعرّف على فريق قناوي: المؤسسون من شركة برمجلي، باحث التاريخ، المراسلة الميدانية، المراجع الطبي، والمحررة اللغوية.',
  },
  '/editorial-policy': {
    title: 'السياسة التحريرية | قناوي - دليل قنا',
    description: 'سياسة قناوي التحريرية: كيف نختار المحتوى، كيف نتحقق من المعلومات، التصحيحات، شفافية الإعلانات، وعلاقتنا مع المعلنين.',
  },
  // Author pages (built dynamically from data/authors.js)
  ...Object.fromEntries(Object.entries(AUTHORS).map(([slug, a]) => [
    `/author/${slug}`, {
      title: `${a.name} — ${a.role} | كتّاب قناوي`,
      description: `${a.name}، ${a.role}. ${a.bio.slice(0, 180)}`,
    }
  ])),
};

// sae:meta-fix — shared metadata builders.
//
// Google truncates titles near 60 characters and descriptions near 160. The
// previous code capped descriptions at 300 and never capped titles at all,
// so the fix is not "shorten" but "compose to fit": build the fullest form
// first and fall back through progressively shorter ones, rather than
// cutting a finished string mid-word.
const SAE_TITLE_MAX = 60;
const SAE_DESC_MAX = 160;
const SAE_DESC_MIN = 70;

/** Trims to a limit on a word boundary; never leaves a dangling separator. */
function saeTrim(s, limit) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit - 1);
  const at = cut.lastIndexOf(' ');
  return (at > limit * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,،.\-|]+$/, '') + '…';
}

/** First candidate that fits, else the shortest one trimmed. */
function saeFit(candidates, limit) {
  for (const c of candidates) {
    const t = String(c || '').replace(/\s+/g, ' ').trim();
    if (t && t.length <= limit) return t;
  }
  return saeTrim(candidates[candidates.length - 1], limit);
}

/**
 * A stored description is only worth using when it actually describes the
 * place. Rows holding a rating stub, a bare phone number or a handful of
 * characters are worse than the generated sentence, and they repeat verbatim
 * across listings — which is what made them duplicates as well as thin.
 */
function saeUsableDescription(raw) {
  const t = String(raw || '').replace(/\s+/g, ' ').trim();
  if (t.length < 40) return '';
  if (/^تقييم\s|^\d[\d\s()،.-]*$/.test(t)) return '';
  return t;
}

function metaForCategory(cat) {
  // The old title said the category name twice — "X في قنا | قناوي - دليل X
  // في محافظة قنا" — which spent the whole budget on repetition.
  const title = saeFit([
    `دليل ${cat.name} في محافظة قنا | قناوي`,
    `${cat.name} في قنا | قناوي`,
    `${cat.name} | قناوي`,
  ], SAE_TITLE_MAX);

  const stored = saeUsableDescription(cat.description);
  const generated =
    `دليل ${cat.name} في محافظة قنا: العناوين، أرقام التواصل، ومواعيد العمل ` +
    `لكل المراكز. محدَّث باستمرار ومجاني على قناوي.`;
  const description = saeTrim(
    stored.length >= SAE_DESC_MIN ? stored : generated,
    SAE_DESC_MAX,
  );

  return { title, description };
}

function metaForService(svc) {
  const catName = (svc.category && svc.category.name) || 'خدمة';
  const name = String(svc.name || '').replace(/\s+/g, ' ').trim();
  const city = String(svc.city || 'قنا').trim();

  // " - قنا" was appended unconditionally, so a listing already carrying the
  // city in its name rendered "… جامعة قنا - قنا | …".
  const cityPart = city && !name.includes(city) ? ` - ${city}` : '';

  const title = saeFit([
    `${name}${cityPart} | ${catName} - قناوي`,
    `${name}${cityPart} | قناوي`,
    `${name} | قناوي`,
    name,
  ], SAE_TITLE_MAX);

  // Built from the fields that differ between listings, so two entries in
  // the same category do not end up with the same sentence.
  const where = svc.address ? `${city}، ${String(svc.address).trim()}` : city;
  const generated =
    `${name} — ${catName} في ${where}. رقم التواصل، العنوان، ` +
    `ومواعيد العمل، وأقرب الخدمات المشابهة على دليل قناوي.`;

  const stored = saeUsableDescription(svc.description);
  const description = saeTrim(
    stored.length >= SAE_DESC_MIN ? stored : generated,
    SAE_DESC_MAX,
  );

  return { title, description };
}

const LB_TYPE_BY_SLUG = {
  hospitals: 'Hospital', clinics: 'MedicalClinic', pharmacies: 'Pharmacy',
  hotels: 'Hotel', restaurants: 'Restaurant', cafes: 'CafeOrCoffeeShop',
  banks: 'BankOrCreditUnion', 'gas-stations': 'GasStation',
  shops: 'Store', transport: 'LocalBusiness',
  government: 'GovernmentOffice', education: 'EducationalOrganization',
  tourism: 'TouristAttraction',
};

// Category slug → guide article slug. Used to cross-link service+category
// pages to long-form editorial content (helps AdSense content quality
// signals and Google's internal-linking model).
const GUIDE_BY_CATEGORY = {
  hospitals: 'hospitals-qena',
  clinics: 'hospitals-qena',
  pharmacies: 'pharmacies-24h-qena',
  hotels: 'hotels-qena',
  restaurants: 'restaurants-qena',
  cafes: 'restaurants-qena',
  banks: 'banks-atm-qena',
  tourism: 'qena-landmarks',
  transport: 'qena-to-cairo-transport',
  'private-transport': 'qena-to-cairo-transport',
  'student-housing': 'hotels-qena',
};
const GUIDE_TITLE_BY_CATEGORY = {
  hospitals: 'دليل أفضل مستشفيات قنا',
  clinics: 'دليل المستشفيات والعيادات في قنا',
  pharmacies: 'صيدليات قنا 24 ساعة',
  hotels: 'دليل فنادق قنا',
  restaurants: 'أفضل مطاعم قنا',
  cafes: 'أفضل مطاعم وكافيهات قنا',
  banks: 'بنوك وصرافات قنا',
  tourism: 'معالم قنا السياحية',
  transport: 'الانتقال من قنا للقاهرة',
  'private-transport': 'الانتقال من قنا للقاهرة',
  'student-housing': 'دليل فنادق وسكن قنا',
};

// Auto-generate a unique "about this place" paragraph from the service's
// own fields. Each service gets prose Google can index — not just a
// contact-info card. Mirrors buildAboutText() in ServiceDetail.jsx.
function buildServiceAboutText(s, catName) {
  const parts = [];
  const city = s.city || 'قنا';
  parts.push(`${s.name} هي إحدى ${catName || 'الخدمات'} الموجودة في ${city}، محافظة قنا، صعيد مصر.`);
  if (s.address) parts.push(`المكان يقع في: ${s.address}.`);
  if (s.working_hours) parts.push(`مواعيد العمل: ${s.working_hours}.`);
  if (s.phone) parts.push(`يمكنك التواصل المباشر مع ${s.name} عبر الرقم ${s.phone} للاستفسار عن أي تفاصيل قبل الزيارة.`);
  if (s.price_range) parts.push(`نطاق الأسعار: ${s.price_range}.`);
  if (s.website) parts.push(`الموقع الإلكتروني الرسمي: ${s.website}.`);
  if (s.whatsapp) parts.push(`متاح أيضاً التواصل عبر واتساب: ${s.whatsapp}.`);
  if (s.lat && s.lng) parts.push(`الموقع الجغرافي محدد بدقة على خريطة قناوي، ويمكنك فتحه مباشرة في خرائط جوجل للحصول على اتجاهات القيادة من موقعك الحالي.`);
  parts.push(`جميع البيانات في صفحة ${s.name} تم تجميعها وتحديثها من خلال فريق قناوي ومساهمات المستخدمين، وإذا لاحظت أي معلومة تحتاج تصحيحاً، يمكنك استخدام زر "إرسال تصحيح" داخل الصفحة.`);
  return parts.join(' ');
}

// Category-specific tips. Mirrors tipsByCategory() in ServiceDetail.jsx —
// the duplication is intentional so SSR doesn't depend on bundling the JSX
// helpers. Both must be kept in sync if you change them.
const TIPS_BY_CATEGORY = {
  hospitals: [
    'إذا كانت الحالة طارئة، توجّه فوراً لقسم الطوارئ بدون انتظار حجز.',
    'لو كنت من خارج المدينة، احرص على معرفة موقف السيارات قبل الذهاب.',
    'احمل بطاقتك الشخصية وأي تقارير طبية سابقة معك.',
    'اتصل قبل الذهاب للتأكد من توفر الطبيب أو التخصص المطلوب.',
  ],
  clinics: [
    'اتصل لحجز موعد كشف قبل الذهاب لتجنّب الانتظار.',
    'اسأل عن سعر الكشف وسعر الفحوصات المطلوبة.',
    'احمل أي تقارير أو أشعة سابقة معك.',
    'بعض العيادات تخصم رسوم الإعادة خلال 15 يوم.',
  ],
  pharmacies: [
    'لو تحتاج روشتة، احمل صورة منها على تليفونك.',
    'اسأل عن البديل الجنريك الأرخص لو الدواء غالي.',
    'افحص تاريخ صلاحية الدواء قبل ترك الصيدلية.',
    'كثير من صيدليات قنا تقدّم خدمة توصيل بدون رسوم للطلبات الكبيرة.',
  ],
  hotels: [
    'اسأل عن السعر شاملاً الإفطار والضرائب.',
    'تأكد من توفر مكيف لو الزيارة في الصيف.',
    'الحجز قبل أسبوع من زيارة معبد دندرة موصى به.',
    'الحجز عبر منصات الإنترنت قد يكون أرخص من الحجز المباشر.',
  ],
  restaurants: [
    'اسأل عن السعر قبل الطلب — كثير من المطاعم لا تعرض قائمة أسعار.',
    'الإكرامية 5-10٪ من الفاتورة معتاد.',
    'للحجز في المناسبات، اتصل قبل يوم على الأقل.',
    'اطلب مياه معدنية مغلقة إذا كنت من خارج قنا.',
  ],
  cafes: [
    'الكافيهات تكون أكثر هدوءاً صباحاً وأكثر ازدحاماً مساءً.',
    'الحد الأدنى للطلب موجود في بعض الكافيهات — اسأل قبل الجلوس.',
    'كثير من الكافيهات لديها واي فاي مجاني للزبائن.',
  ],
  banks: [
    'مواعيد العمل الرسمية: الأحد-الخميس 8:30 صباحاً - 3 ظهراً.',
    'في رمضان: من 9 صباحاً حتى 1 ظهراً عادة.',
    'احرص على معرفة الأوراق المطلوبة قبل الذهاب لتجنّب الاستياء.',
    'لاستفسار سريع، اتصل بخط البنك الساخن قبل الذهاب.',
  ],
  'gas-stations': [
    'كثير من محطات الوقود تعمل ٢٤ ساعة.',
    'احمل نقوداً سائلة — ليس كل المحطات تقبل بطاقات الائتمان.',
    'بعض المحطات تقدّم خدمات تغيير زيت، غسيل، وتبديل إطارات.',
  ],
  schools: [
    'مواعيد التسجيل تختلف حسب نوع المدرسة (حكومية/خاصة).',
    'احرص على معرفة الكتب المطلوبة والزي الموحد قبل بداية العام.',
    'اسأل عن خدمات الباص ومواعيد الإنصراف.',
  ],
  tourism: [
    'الموسم الأفضل للزيارة: أكتوبر-أبريل (الجو معتدل).',
    'احمل ماء وقبعة، خاصة للمعابد المكشوفة.',
    'استئجار مرشد محلي يكشف تفاصيل لن تجدها في الكتيبات.',
    'بعض المواقع تتطلب تذكرة منفصلة للتصوير.',
  ],
  government: [
    'مواعيد العمل: الأحد-الخميس 9 صباحاً - 2 ظهراً عادة.',
    'احمل أصل بطاقتك وصور كافية.',
    'اسأل قبل الذهاب عن الأوراق المطلوبة للخدمة.',
    'بعض الخدمات الآن متاحة إلكترونياً عبر بوابة الحكومة المصرية.',
  ],
};
function tipsByCategory(slug) {
  return TIPS_BY_CATEGORY[slug] || [
    'تواصل مع الخدمة قبل الذهاب للتأكد من ساعات العمل.',
    'احفظ رقم المكان في تليفونك للوصول السريع.',
    'لو وجدت معلومة غير دقيقة، أرسل لنا تصحيحاً ليستفيد الجميع.',
  ];
}

// Common FAQ per category — gives every category page 5+ Q&A pairs of
// unique editorial content, plus FAQPage JSON-LD for Google rich results.
const FAQ_BY_CATEGORY = {
  hospitals: [
    ['كم مستشفى يوجد في محافظة قنا؟', 'تحوي محافظة قنا عشرات المستشفيات بين حكومية وخاصة وجامعية. أبرزها مستشفى قنا الجامعي التابع لجامعة جنوب الوادي، مستشفى قنا العام التابع لوزارة الصحة، ومستشفى قنا الجديدة، بالإضافة لمستشفيات مركزية في نجع حمادي، قوص، دشنا، فرشوط، ونقادة.'],
    ['ما أقرب مستشفى طوارئ في قنا؟', 'مستشفى قنا الجامعي هو المرجع الأول للطوارئ في المحافظة لأنه يحوي تخصصات كاملة وعناية مركزة. للحالات البسيطة يكفي المستشفى العام أو المستشفى المركزي بالمركز التابع له.'],
    ['هل يوجد تأمين صحي يغطّي مستشفيات قنا؟', 'نعم، التأمين الصحي الحكومي يغطّي المستشفيات الحكومية والمراكز التابعة لوزارة الصحة. التأمين الصحي الخاص (Misr Health, Bupa Egypt) يقبله بعض المستشفيات والمراكز الخاصة فقط.'],
    ['ما رقم الإسعاف في قنا؟', 'رقم الإسعاف الموحد في كل مصر هو 123. يعمل ٢٤ ساعة ومجاني من أي تليفون.'],
    ['كيف أحصل على موعد عيادة خارجية؟', 'العيادات الخارجية في المستشفيات الحكومية لا تحتاج حجزاً مسبقاً — اذهب صباحاً مبكراً. في المستشفيات الخاصة، اتصل بالرقم الموجود في صفحة المستشفى لحجز موعد.'],
  ],
  pharmacies: [
    ['هل توجد صيدليات تعمل 24 ساعة في قنا؟', 'نعم، عدة فروع لصيدليات العزبي وسيف ومجموعة من الصيدليات المحلية في وسط مدينة قنا ونجع حمادي تعمل ٢٤ ساعة طوال أيام الأسبوع.'],
    ['هل يمكن توصيل الأدوية للمنزل في قنا؟', 'نعم، أغلب الصيدليات الكبرى تقدّم توصيلاً مجانياً للطلبات فوق 50 جنيه داخل وسط المدينة. اتصل بالرقم لتأكيد التوصيل لمنطقتك.'],
    ['كيف أعرف الصيدلية المناوبة في قنا أيام الأعياد؟', 'وزارة الصحة تحدد قائمة صيدليات مناوبة في الأعياد الرسمية. القائمة تُنشر على لافتات الصيدليات وعلى صفحة المحافظة الرسمية.'],
    ['هل أحتاج روشتة طبيب لكل الأدوية؟', 'الأدوية المضادة الحيوية والنفسية والمخدّرة تتطلب روشتة قانونياً. الأدوية الأخرى (مسكنات، فيتامينات، علاجات بسيطة) متاحة بدون روشتة.'],
    ['ما رقم خدمة توصيل صيدليات العزبي؟', 'الرقم المركزي لصيدليات العزبي هو 19011 ويعمل في كل المحافظات بما فيها قنا.'],
  ],
  hotels: [
    ['ما متوسط سعر فندق ٣ نجوم في قنا؟', 'فنادق ٣ نجوم في وسط مدينة قنا تبدأ من 500 جنيه لليلة في 2026، وقد تصل لـ1000 جنيه حسب الموسم والإطلالة.'],
    ['ما أقرب فندق لمعبد دندرة؟', 'فنادق وسط مدينة قنا هي الأقرب لمعبد دندرة (5 كم فقط). كثير من السياح يقيمون في الأقصر ويزورون دندرة في رحلة يومية.'],
    ['هل يوجد فنادق على نهر النيل في قنا؟', 'نعم، يوجد عدة فنادق ومنتجعات تطلّ على نهر النيل في قنا ونجع حمادي. الأسعار أعلى قليلاً من فنادق وسط المدينة.'],
    ['هل أحتاج حجزاً مسبقاً؟', 'في مواسم السياحة (أكتوبر-فبراير) والأعياد يُفضّل الحجز قبل أسبوع. في باقي الأوقات يمكن الحجز في نفس اليوم.'],
    ['ما الموسم الأنسب للإقامة في قنا؟', 'من أكتوبر إلى أبريل. الجو معتدل ومناسب للسياحة. تجنّب يونيو-سبتمبر حيث الحرارة قد تصل لـ٤٥ مئوية.'],
  ],
  restaurants: [
    ['ما أشهر الأكلات القناوية؟', 'الفطير المشلتت، المشويات (كباب وكفتة على الفحم)، أسماك النيل (بلطي وقرموط)، الحمام المحشي، البليلة، والعصيدة الصعيدية.'],
    ['هل توجد خدمة توصيل طعام في قنا؟', 'نعم، تطبيقات طلبات وElmenus تعمل في قنا. كذلك أغلب المطاعم في وسط المدينة لديها توصيل مباشر بنفس اليوم.'],
    ['هل توجد مطاعم سمك طازج؟', 'نعم، عدة مطاعم متخصصة قرب كورنيش النيل في قنا تقدّم سمك نيلي طازج (بلطي وقرموط) بأسعار أقل من القاهرة بـ30-50٪.'],
    ['ما متوسط سعر وجبة مشويات للشخص؟', 'وجبة مشويات كاملة (كباب أو كفتة + أرز + سلطات) تتراوح من 150 إلى 300 جنيه للشخص في مطاعم 2026.'],
    ['هل توجد فروع لMcDonald\'s أو KFC في قنا؟', 'لا، حالياً لا يوجد فروع لهذه السلاسل في قنا. أقرب فروع لها في الأقصر.'],
  ],
  banks: [
    ['ما مواعيد عمل البنوك في قنا؟', 'البنوك تفتح من الأحد إلى الخميس، 8:30 صباحاً حتى 3 ظهراً. الجمعة والسبت إجازة رسمية. في رمضان: 9 صباحاً حتى 1 ظهراً.'],
    ['ما البنوك الموجودة في قنا؟', 'الأهلي المصري، بنك مصر، بنك الإسكندرية، QNB، CIB، البنك العقاري المصري العربي، بنك التنمية الزراعي، وبنك ناصر الاجتماعي.'],
    ['أين أجد صراف آلي ATM في قنا؟', 'تنتشر الصرّافات الآلية أمام فروع البنوك، في محطات الوقود الكبرى، وفي المولات والمراكز التجارية. كل صرّاف يقبل بطاقات من أي بنك (شبكة 123).'],
    ['كيف أفتح حساباً بنكياً في قنا؟', 'تحتاج: بطاقة رقم قومي سارية، إثبات دخل، إثبات عنوان (فاتورة كهرباء)، وإيداع مبدئي (يبدأ من 100 جنيه).'],
    ['ما أرخص طريقة لتحويل الأموال داخل مصر؟', 'InstaPay من أي بنك لأي بنك مصري — تحويل فوري ومجاني تقريباً. بديل: محافظ المحمول (Vodafone Cash, Etisalat Cash).'],
  ],
  tourism: [
    ['ما أشهر معالم محافظة قنا؟', 'معبد دندرة (معبد حتحور)، معبد قفط، نقادة الأثرية، دير الصليب في نقادة، قلعة الشيخ همام في فرشوط، ومسجد عبد الرحيم القناوي.'],
    ['كيف أصل لمعبد دندرة؟', 'المعبد يبعد 5 كم شمال مدينة قنا. يمكن الوصول بتاكسي (50-100 جنيه ذهاب) أو سيارة خاصة (10 دقائق). من الأقصر: 60 كم بالسيارة أو القطار.'],
    ['ما سعر تذكرة معبد دندرة 2026؟', 'للمصري البالغ: 40 جنيه، للمصري الطالب: 10 جنيه، للأجنبي البالغ: 250 جنيه. الأسعار قابلة للتغيير.'],
    ['ما مواعيد فتح المعابد في قنا؟', 'مواعيد العمل الرسمية: من 8 صباحاً حتى 5 مساءً صيفاً، وحتى 4 مساءً شتاءً.'],
    ['هل يوجد متحف في قنا؟', 'نعم، افتُتح متحف قنا الحضاري عام 2022 ويعرض قطعاً أثرية محلية من معبد دندرة ومقابر نقادة ومعبد قفط.'],
  ],
};

// sae:rest-fix — an http:// image on an https:// page is blocked by the
// browser and downgrades the page's security state. Upgrading at render time
// leaves the stored row untouched; the data is the customer's, the protocol
// is ours to get right.
function saeHttps(url) {
  if (typeof url !== 'string') return url;
  return url.replace(/^http:\/\//i, 'https://');
}

function absImage(url) {
  if (!url) return null;
  if (String(url).toLowerCase().includes('unsplash.com')) return null;
  return url.startsWith('http') ? url : BASE + url;
}

// Detect Google Plus Codes used as fake addresses (e.g. "2Q79+8H4", "5VC9+M2 Qena").
// These offer no human-readable content value and shouldn't count as a
// "rich signal" for indexing decisions.
const PLUS_CODE_RE = /^\s*[23456789CFGHJMPQRVWX]{2,4}[23456789CFGHJMPQRVWX]?\+[23456789CFGHJMPQRVWX]{2,3}(\s|$)/i;

// Templated/auto-generated descriptions (review counters, "5.0 (N reviews)", etc).
// These give no actual content even though the field is non-empty.
const TEMPLATED_DESC_RES = [
  /^\s*تقييم\s*\d+(\.\d+)?\s*\(\s*\d+\s*مراجعة\s*\)\s*$/,
  /^\s*\d+(\.\d+)?\s*\(\s*\d+\s*reviews?\s*\)\s*$/i,
  /^\s*rating:?\s*\d/i,
];

// Reject text that has Unicode replacement chars (U+FFFD) — sign of a broken
// import (PDF scrape, mojibake re-decode). Such text adds no signal.
function isCorrupted(s) {
  if (!s) return false;
  return /[�]/.test(String(s));
}

function hasRealDescription(desc) {
  if (!desc) return false;
  const t = String(desc).trim();
  if (t.length < 40) return false;
  if (isCorrupted(t)) return false;
  return !TEMPLATED_DESC_RES.some((re) => re.test(t));
}

function hasRealAddress(addr) {
  if (!addr) return false;
  const t = String(addr).trim();
  if (t.length < 5) return false;
  if (isCorrupted(t)) return false;
  return !PLUS_CODE_RE.test(t);
}

function hasRealImage(url) {
  if (!url) return false;
  const lower = String(url).toLowerCase().trim();
  if (lower.length === 0) return false;
  if (lower.includes('unsplash.com')) return false;
  // Relative URL (served from our backend uploads endpoint) — always real.
  if (lower.startsWith('/')) return true;
  // Absolute URL: only count it as "real" if hosted on qinawy.com. Random
  // third-party hotlinks (e.g. https://dezone.net/wp-content/uploads/...,
  // https://clinido.com/storage/...) are NOT a quality signal — they often
  // 404 over time, and Google's classifier doesn't credit them.
  try {
    const parsed = new URL(lower);
    const h = parsed.hostname;
    return h === 'qinawy.com' || h.endsWith('.qinawy.com');
  } catch (_) {
    return false; // not a valid URL
  }
}

// Tags count as a signal only if they exist AND aren't just the same string
// as the description (templated dup like desc="صيدلية" + tags="صيدلية" → not
// a real signal) AND aren't corrupted.
function hasRealTags(tags, desc) {
  if (!tags) return false;
  const t = String(tags).trim();
  if (t.length === 0) return false;
  if (isCorrupted(t)) return false;
  if (desc && t === String(desc).trim()) return false;
  return true;
}

// Returns true if the service has so little distinguishing content that it
// should be marked noindex + excluded from sitemap. Matches Google's actual
// indexing behavior more closely: pages without ANY "quality" signal
// (description / image / website) are not indexed by Google even when they
// have phone + address — because those are basic contact-card facts every
// pharmacy/hospital/restaurant has, not editorial differentiation.
function isThinService(svc) {
  // Quality signals — editorial / differentiating content that says
  // something about THIS specific place beyond "it exists".
  const quality = [
    hasRealDescription(svc.description),
    hasRealImage(svc.image_url),
    !!svc.website,
  ].filter(Boolean).length;

  // Basic contact-info signals — present on every entry, but together
  // they confirm the page is at least a complete contact card.
  const basics = [
    !!svc.working_hours,
    hasRealAddress(svc.address),
    hasRealTags(svc.tags, svc.description),
    !!svc.phone,
  ].filter(Boolean).length;

  // Thin if: no quality signal at all, OR fewer than 2 basic signals.
  // Matches GSC's actual "Crawled - currently not indexed" decisions on
  // pages like /service/657 (no real desc, hotlinked image, no website).
  return quality === 0 || basics < 2;
}

// sae:image-health — the listing image, as far as it can be trusted.
//
// Returns an empty string for an image confirmed gone, so the listing simply
// renders without a picture rather than with a broken one. Everything else is
// rendered, including images this server could not reach: a timeout here says
// nothing about the reader's browser.
function saeListingImage(url, alt) {
  if (!url) return "";
  const h = imageHealth.getHealth(url);
  if (!h.render) return "";

  const dims = h.w && h.h ? ` width="${h.w}" height="${h.h}"` : "";
  const ref = h.noReferrer ? ' referrerpolicy="no-referrer"' : "";
  // Between sweeps an image can die; drop it rather than show a broken icon.
  const onerr = ' onerror="this.remove()"';
  return (
    `<img src="${escAttr(url)}" alt="${escAttr(alt)}"${dims}${ref}${onerr} ` +
    `style="max-width:100%;height:auto;margin-top:1rem;border-radius:0.75rem" loading="lazy">`
  );
}

// sae:dupe-fix — duplicate-entity resolution.
//
// Nine businesses are in the directory twice. Rather than delete a row, the
// less complete of each pair points its canonical at the more complete one,
// which is what a canonical is for and is fully reversible.
const SAE_DUPE_TTL_MS = 10 * 60 * 1000;
let saeDupeMap = null;
let saeDupeAt = 0;

/** Fields a visitor actually came for; the entry with more of them wins. */
const SAE_WEIGHT = ['description', 'phone', 'address', 'working_hours', 'website', 'image_url', 'lat'];

function saeCompleteness(row) {
  let score = 0;
  for (const f of SAE_WEIGHT) {
    const v = row[f];
    if (v !== null && v !== undefined && String(v).trim() !== '') score++;
  }
  return score;
}

/** id -> id of the entry it should canonicalise to. */
async function saeDupeTargets() {
  if (saeDupeMap && Date.now() - saeDupeAt < SAE_DUPE_TTL_MS) return saeDupeMap;
  const map = new Map();
  try {
    const rows = await Service.findAll({
      where: { status: 'approved' },
      attributes: ['id', 'name', 'city', 'category_id', ...SAE_WEIGHT],
      raw: true,
    });
    const groups = new Map();
    for (const r of rows) {
      const key = r.category_id + '|' + String(r.name || '').trim() + '|' + String(r.city || '').trim();
      const list = groups.get(key);
      if (list) list.push(r);
      else groups.set(key, [r]);
    }
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      // Most complete wins; the lower id breaks a tie so the winner never
      // changes between runs.
      const winner = list.slice().sort((a, b) => {
        const d = saeCompleteness(b) - saeCompleteness(a);
        return d !== 0 ? d : Number(a.id) - Number(b.id);
      })[0];
      for (const r of list) {
        if (String(r.id) !== String(winner.id)) map.set(String(r.id), String(winner.id));
      }
    }
  } catch (_) {
    // A failed lookup leaves every page self-canonical, which is the safe
    // default: no page is redirected away from itself by accident.
    return saeDupeMap || new Map();
  }
  saeDupeMap = map;
  saeDupeAt = Date.now();
  return map;
}

// sae:rest-fix — server-rendered footer.
//
// The React footer links these pages, but React has not run when a crawler
// reads the response, and never runs for a visitor without JavaScript. Six
// pages were orphaned by that gap alone.
const SAE_FOOTER_LINKS = [
  ['/', 'الرئيسية'],
  ['/category/all', 'كل الأقسام'],
  ['/guides', 'أدلة قنا'],
  ['/numbers', 'أرقام مهمة'],
  ['/qena', 'عن محافظة قنا'],
  ['/nearby', 'قريب مني'],
  ['/submit', 'أضف خدمتك'],
  ['/submit/rental', 'أضف عقارًا للإيجار'],
  ['/submit/driver', 'سجل كسائق'],
  ['/about', 'عن قناوي'],
  ['/team', 'فريق التحرير'],
  ['/editorial-policy', 'السياسة التحريرية'],
  ['/contact', 'تواصل معنا'],
  ['/privacy', 'الخصوصية'],
  ['/terms', 'الشروط'],
];

function saeFooterHtml(currentPath) {
  const items = SAE_FOOTER_LINKS
    .filter(([href]) => href !== currentPath)
    .map(([href, label]) =>
      `<li style="display:inline-block;margin:0 0 0.4rem 1rem"><a href="${href}" style="color:#0369a1">${escHtml(label)}</a></li>`,
    ).join('');
  return (
    `<nav aria-label="روابط الموقع" style="max-width:1100px;margin:2.5rem auto 0;padding:1rem;border-top:1px solid #e2e8f0" dir="rtl">` +
    `<h2 style="font-size:1rem;font-weight:700;color:#334155;margin:0 0 0.75rem">تصفّح قناوي</h2>` +
    `<ul style="list-style:none;padding:0;margin:0;font-size:0.9rem">${items}</ul>` +
    saeDevCreditHtml() +
    `</nav>`
  );
}

// sae:devcredit — the build credit, on every page.
//
// Set SAE_LICENCE to the company's real registration number and it appears in
// the line automatically. It stays empty until then: a made-up licence number
// is a fabricated legal credential, and an absent one costs nothing.
const SAE_LICENCE = '';

function saeDevCreditHtml() {
  const licence = SAE_LICENCE
    ? ` · رقم الترخيص: <span dir="ltr">${escHtml(SAE_LICENCE)}</span>`
    : '';
  return (
    `<p style="margin:1rem 0 0;padding-top:0.75rem;border-top:1px solid #f1f5f9;font-size:0.85rem;color:#64748b">` +
    `تطوير وتشغيل: <a href="https://barmagly.tech" rel="noopener" style="color:#0369a1">شركة برمجلي</a>` +
    ` — شركة برمجيات مصرية لتطوير المواقع والتطبيقات والأنظمة المخصصة${licence}.</p>`
  );
}

// sae:rest-fix — routes whose content is built entirely by React. They were
// shipping the bare index.html, so a crawler saw a page with no H1 and no
// text. A heading and a sentence is not a substitute for the interactive
// page, but it does say what the URL is, which is what was missing.
const SAE_MINIMAL_BODIES = {
  '/category/all': [
    'كل أقسام دليل قنا',
    'تصفّح كل أقسام قناوي في محافظة قنا: مستشفيات وعيادات، صيدليات، فنادق ومطاعم، ' +
      'بنوك ومحطات وقود، مدارس وجامعات، جهات حكومية، ومعالم سياحية — بالعنوان ورقم ' +
      'التواصل ومواعيد العمل لكل جهة.',
  ],
  '/numbers': [
    'أرقام مهمة في محافظة قنا',
    'أرقام الطوارئ والخدمات في محافظة قنا: النجدة، الإسعاف، المطافئ، وشكاوى ' +
      'الكهرباء والمياه والغاز، مع أرقام الجهات الحكومية في مراكز المحافظة.',
  ],
  '/submit': [
    'أضف خدمتك إلى دليل قنا',
    'سجّل مستشفى أو صيدلية أو عيادة أو فندق أو مطعم أو أي خدمة في محافظة قنا ' +
      'مجانًا ضمن دليل قناوي. تُراجَع كل البيانات من فريق التحرير قبل النشر.',
  ],
  '/submit/rental': [
    'أضف عقارًا للإيجار في قنا',
    'سجّل شقة أو غرفة أو سكن طلاب للإيجار في محافظة قنا مجانًا على قناوي، ' +
      'ليصل إعلانك للباحثين عن سكن في قنا ومراكزها.',
  ],
  '/submit/driver': [
    'سجل كسائق نقل خاص في قنا',
    'سجّل بياناتك كسائق نقل خاص في محافظة قنا مجانًا على قناوي، وتواصل مع ' +
      'عملاء يبحثون عن مواصلات داخل المحافظة أو بين المدن.',
  ],
};

function saeMinimalBody(p) {
  const entry = SAE_MINIMAL_BODIES[p];
  if (!entry) return null;
  const [heading, lead] = entry;
  return (
    `<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1rem;max-width:1100px;margin:0 auto">` +
    `<h1 style="font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 0.75rem">${escHtml(heading)}</h1>` +
    `<p style="line-height:1.9;color:#334155;margin:0">${escHtml(lead)}</p></div>`
  );
}

// sae:geo-fix — provenance helpers shared by listing and category pages.
const SAE_ORG = 'قناوي';

/** Arabic long date, e.g. "7 سبتمبر 2026". */
const SAE_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function saeArabicDate(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return `${dt.getDate()} ${SAE_MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

/**
 * Visible byline and date.
 *
 * The <time datetime> and the .byline class are both read by crawlers that
 * do not parse JSON-LD, so the same two facts are stated twice on purpose.
 */
function saeByline(updatedAt, createdAt) {
  const updated = saeArabicDate(updatedAt) || saeArabicDate(createdAt);
  if (!updated) return "";
  const iso = new Date(updatedAt || createdAt).toISOString();
  return (
    `<p class="byline" style="color:#64748b;font-size:0.875rem;margin:0 0 1rem">` +
    `<span itemprop="author">إعداد ومراجعة: <a href="/team" style="color:#0369a1">فريق ${SAE_ORG}</a></span>` +
    ` · <time datetime="${iso}">آخر تحديث: ${updated}</time></p>`
  );
}

/**
 * Where the data came from and who checks it.
 *
 * This is the attribution an answer engine looks for before it will repeat a
 * claim, and every word of it is true of this site.
 */
function saeProvenance(updatedAt, createdAt) {
  const reviewed = saeArabicDate(updatedAt) || saeArabicDate(createdAt) || "";
  return (
    `<p style="color:#475569;font-size:0.9rem;line-height:1.9;margin:1.5rem 0 0;padding:0.875rem 1rem;background:#f8fafc;border-right:3px solid #cbd5e1;border-radius:0.5rem">` +
    `<strong>المصدر:</strong> بيانات هذه الصفحة مُجمَّعة من الجهة نفسها ومن مساهمات سكان محافظة قنا، ` +
    `ويراجعها فريق ${SAE_ORG} دوريًا وفق <a href="/editorial-policy" style="color:#0369a1">سياستنا التحريرية</a>` +
    (reviewed ? `. آخر مراجعة: ${reviewed}` : "") +
    `. ` +
    `إذا لاحظت معلومة غير دقيقة، <a href="/contact" style="color:#0369a1">أبلغنا</a> ليتم تصحيحها.</p>`
  );
}

/**
 * The one outbound reference a directory entry legitimately has: the place
 * itself, on the map. Built from the address rather than asserted.
 */
function saeMapsLink(name, address, city) {
  const q = [name, address, city, "محافظة قنا"].filter(Boolean).join("، ");
  if (!q) return "";
  const href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  return `<a href="${escAttr(href)}" rel="noopener nofollow" style="color:#0369a1">افتح الموقع في خرائط جوجل</a>`;
}

/** WebPage node carrying the authorship and dates the signals look for. */
function saeWebPageLd(url, name, description, updatedAt, createdAt) {
  const modified = updatedAt || createdAt;
  const published = createdAt || updatedAt;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    name,
    ...(description && { description }),
    inLanguage: 'ar',
    ...(published && !Number.isNaN(new Date(published).getTime()) && {
      datePublished: new Date(published).toISOString(),
    }),
    ...(modified && !Number.isNaN(new Date(modified).getTime()) && {
      dateModified: new Date(modified).toISOString(),
    }),
    author: { '@type': 'Organization', name: SAE_ORG, url: BASE + '/team' },
    publisher: {
      '@type': 'Organization',
      name: SAE_ORG,
      url: BASE,
    },
    isPartOf: { '@type': 'WebSite', name: SAE_ORG, url: BASE },
  };
}

// sae:orphan-fix — sibling index used to link every listing.
//
// Reading 704 sibling rows on every listing request would be absurd, so the
// id/name/city triples are cached per category. Ten minutes is short enough
// that a newly approved listing joins the graph the same session and long
// enough that the query effectively never runs under load.
const SAE_SIB_TTL_MS = 10 * 60 * 1000;
const saeSiblingCache = new Map();

async function saeSiblings(categoryId) {
  const hit = saeSiblingCache.get(categoryId);
  if (hit && Date.now() - hit.at < SAE_SIB_TTL_MS) return hit.rows;
  let rows = [];
  try {
    rows = await Service.findAll({
      where: { status: 'approved', category_id: categoryId },
      attributes: ['id', 'name', 'city'],
      order: [['id', 'ASC']],
      raw: true,
    });
  } catch (_) {
    // A failed sibling lookup must never take the page down with it; the
    // listing still renders, just without the two extra blocks.
    return hit ? hit.rows : [];
  }
  saeSiblingCache.set(categoryId, { at: Date.now(), rows });
  return rows;
}

/**
 * Picks the listings to link to.
 *
 * `nearby` is chosen for the reader: same category, same city first.
 * `across` is chosen for coverage, at even strides through the category.
 * Even strides are the whole point — from any hundred consecutive indices,
 * one hop of stride n/8 lands on every index in the category, so no listing
 * ends up deeper than the category page plus one click.
 */
function saePickSiblings(rows, svc) {
  const n = rows.length;
  if (n < 2) return { nearby: [], across: [] };
  const self = rows.findIndex((r) => String(r.id) === String(svc.id));
  const i = self === -1 ? 0 : self;

  const taken = new Set([String(svc.id)]);
  const take = (row) => {
    if (!row || taken.has(String(row.id))) return false;
    taken.add(String(row.id));
    return true;
  };

  const nearby = [];
  const city = (svc.city || "").trim();
  if (city) {
    for (const r of rows) {
      if (nearby.length >= 6) break;
      if ((r.city || "").trim() === city && take(r)) nearby.push(r);
    }
  }
  for (let k = 1; nearby.length < 6 && k < n; k++) {
    const r = rows[(i + k) % n];
    if (take(r)) nearby.push(r);
  }

  const across = [];
  const stride = Math.max(1, Math.floor(n / 8));
  for (let k = 1; k <= 8 && across.length < 8; k++) {
    const r = rows[(i + k * stride) % n];
    if (take(r)) across.push(r);
  }

  return { nearby, across };
}

/** Renders the two link blocks. Empty string when there are no siblings. */
function saeSiblingHtml(picked, cat) {
  const { nearby, across } = picked;
  if (nearby.length === 0 && across.length === 0) return "";
  const link = (r) =>
    `<li style="padding:0.4rem 0"><a href="/service/${r.id}" style="color:#0c4a6e;font-weight:600">${escHtml(r.name)}</a>${r.city ? ` <span style="color:#64748b;font-size:0.85rem"> · ${escHtml(r.city)}</span>` : ""}</li>`;
  const list = (rows) =>
    `<ul style="list-style:none;padding:0;margin:0 0 1.25rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.25rem 1rem">${rows.map(link).join("")}</ul>`;
  const catName = escHtml(cat.name || "القسم");
  return (
    (nearby.length
      ? `<h2 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin:1.5rem 0 0.5rem">${catName} أخرى قريبة منك</h2>${list(nearby)}`
      : "") +
    (across.length
      ? `<h2 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin:1.5rem 0 0.5rem">تصفّح ${catName} في محافظة قنا</h2>${list(across)}`
      : "")
  );
}

function serviceBodySsr(svc, siblingHtml) {
  const cat = svc.category || {};
  const lbType = LB_TYPE_BY_SLUG[cat.slug] || 'LocalBusiness';
  const img = saeHttps(absImage(svc.image_url));

  const lbLd = {
    '@context': 'https://schema.org',
    '@type': lbType,
    '@id': `${BASE}/service/${svc.id}#business`,
    name: svc.name,
    url: `${BASE}/service/${svc.id}`,
    ...(svc.phone && { telephone: svc.phone }),
    // sae:image-health — do not offer a 404 to Google as the listing photo.
    ...(img && imageHealth.getHealth(img).render && { image: img }),
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
  // and no-JS users see the full content. Includes a breadcrumb, H1, contact
  // fields, an auto-generated "about" paragraph, category-specific tips,
  // and a cross-link to the relevant guide article.
  const rows = [];
  if (svc.address) rows.push(['العنوان', escHtml(svc.address)]);
  if (svc.phone) rows.push(['هاتف', `<a href="tel:${escAttr(svc.phone)}">${escHtml(svc.phone)}</a>`]);
  if (svc.alt_phone) rows.push(['هاتف آخر', `<a href="tel:${escAttr(svc.alt_phone)}">${escHtml(svc.alt_phone)}</a>`]);
  if (svc.whatsapp) rows.push(['واتساب', escHtml(svc.whatsapp)]);
  if (svc.working_hours) rows.push(['مواعيد العمل', escHtml(svc.working_hours)]);
  if (svc.price_range) rows.push(['الأسعار', escHtml(svc.price_range)]);
  if (svc.website) rows.push(['الموقع', `<a href="${escAttr(svc.website)}" rel="noopener">${escHtml(svc.website)}</a>`]);

  const aboutText = buildServiceAboutText(svc, cat.name);
  const tips = tipsByCategory(cat.slug);

  // sae:geo-fix — kept to one sentence and under ~35 words; a longer opening
  // scores as a preamble however informative it is.
  const saeCity = String(svc.city || "قنا").trim();
  const saeLead =
    `${svc.name} هو ${cat.name || "خدمة"} في ${saeCity}، محافظة قنا` +
    (svc.address ? `، بعنوان ${String(svc.address).trim()}` : "") +
    (svc.phone ? `، ورقم التواصل ${String(svc.phone).trim()}` : "") +
    '.';
  const guideSlug = GUIDE_BY_CATEGORY[cat.slug];
  const guideTitle = GUIDE_TITLE_BY_CATEGORY[cat.slug];

  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1rem;max-width:1100px;margin:0 auto">
  <nav aria-label="breadcrumb" style="font-size:0.85rem;color:#64748b;margin-bottom:0.75rem">
    <a href="/" style="color:#0c4a6e">الرئيسية</a>
    ${cat.slug ? ` › <a href="/category/${escAttr(cat.slug)}" style="color:#0c4a6e">${escHtml(cat.name)}</a>` : ''}
    › <span>${escHtml(svc.name)}</span>
  </nav>
  <h1 style="font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 0.5rem">${escHtml(svc.name)}</h1>
  <!-- sae:geo-fix — a single sentence that resolves "what is this", so the
       first coherent statement on the page is an answer rather than a
       fragment that runs into the contact rows. -->
  <p style="color:#334155;line-height:1.9;margin:0 0 0.75rem;font-size:1.05rem">${escHtml(saeLead)}</p>
  ${saeByline(svc.updatedAt, svc.createdAt)}
  ${svc.description ? `<p style="line-height:1.8;color:#334155;margin:0 0 1rem">${escHtml(svc.description)}</p>` : ''}
  ${rows.length ? `<dl style="display:grid;grid-template-columns:auto 1fr;gap:0.5rem 1rem;margin:0 0 1.5rem">${
    rows.map(([k, v]) => `<dt style="color:#64748b;font-size:0.9rem">${k}</dt><dd style="margin:0;color:#0f172a">${v}</dd>`).join('')
  }</dl>` : ''}

  <h2 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin:1.5rem 0 0.5rem">عن ${escHtml(svc.name)}</h2>
  <p style="line-height:1.9;color:#334155;margin:0 0 1.25rem">${escHtml(aboutText)}</p>

  <h2 style="font-size:1.25rem;font-weight:700;color:#0f172a;margin:1.5rem 0 0.5rem">كيف تصل لـ${escHtml(svc.name)} ونصائح قبل الزيارة</h2>
  ${svc.address
    ? `<p style="color:#334155;line-height:1.9;margin:0 0 0.75rem">${escHtml(svc.name)} يقع في ${escHtml(svc.address)}، ${escHtml(svc.city || 'قنا')}. ${svc.lat && svc.lng ? 'الموقع الجغرافي محدد بدقة على خريطة قناوي ويمكنك فتحه في خرائط جوجل للحصول على اتجاهات القيادة من موقعك.' : 'للاتجاهات بدقة، اتصل بالرقم أعلاه أو ابحث عن الاسم في خرائط جوجل.'}</p>`
    : `<p style="color:#334155;line-height:1.9;margin:0 0 0.75rem">${escHtml(svc.name)} يقع في ${escHtml(svc.city || 'قنا')}، محافظة قنا. للاتجاهات بدقة، اتصل بالرقم في الأعلى أو ابحث عن الاسم في خرائط جوجل.</p>`
  }
  <ul style="margin:0 0 1.25rem;padding-right:1.25rem;color:#334155;line-height:1.9">
    ${tips.map((t) => `<li>${escHtml(t)}</li>`).join('')}
  </ul>

  ${guideSlug ? `<p style="margin:1.5rem 0;padding:1rem;background:#f0f9ff;border-right:4px solid #0ea5e9;border-radius:0.5rem;line-height:1.9;color:#075985">📖 <strong>مقال ذو صلة:</strong> اقرأ <a href="/guides/${escAttr(guideSlug)}" style="color:#0369a1;text-decoration:underline;font-weight:600">${escHtml(guideTitle)}</a> — دليل تفصيلي يساعدك تختار أفضل ${escHtml(cat.name)} في قنا.</p>` : ''}

  ${siblingHtml || ''}

  ${saeMapsLink(svc.name, svc.address, svc.city) ? `<p style="margin:1.25rem 0 0">${saeMapsLink(svc.name, svc.address, svc.city)}</p>` : ''}
  ${saeProvenance(svc.updatedAt, svc.createdAt)}

  <p style="color:#64748b;font-size:0.875rem;line-height:1.8;margin-top:1rem">
    تنبيه: الأسعار ومواعيد العمل قابلة للتعديل في أي وقت من قبل صاحب المكان. يُرجى التأكد من البيانات عبر الاتصال المباشر قبل الزيارة. ${cat.slug ? `لمزيد من <a href="/category/${escAttr(cat.slug)}" style="color:#0369a1">${escHtml(cat.name)} في قنا</a>، تصفّح قسم ${escHtml(cat.name)} في قناوي.` : ''}
  </p>

  ${saeListingImage(img, svc.name)}
</div>`;

  // sae:geo-fix — LocalBusiness has no place for authorship or dates, so the
  // page-level facts go on a WebPage node beside it.
  const webPageLd = saeWebPageLd(
    `${BASE}/service/${svc.id}`,
    svc.name,
    svc.description ? String(svc.description).slice(0, 300) : null,
    svc.updatedAt,
    svc.createdAt,
  );
  const ldHtml =
    `<script type="application/ld+json">${JSON.stringify(lbLd)}</script>\n` +
    `<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>\n` +
    `<script type="application/ld+json">${JSON.stringify(webPageLd)}</script>`;
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

  const faq = FAQ_BY_CATEGORY[cat.slug] || [];
  const guideSlug = GUIDE_BY_CATEGORY[cat.slug];
  const guideTitle = GUIDE_TITLE_BY_CATEGORY[cat.slug];

  // Intro paragraph — Arabic prose describing this category in Qena.
  // Generic fallback when DB description is missing.
  // sae:geo-cat — one sentence, and it carries the count so the page states a
  // concrete figure rather than only describing one.
  const saeCatCount = services.length;
  const saeCatLead =
    `${cat.name} في محافظة قنا: ${saeCatCount} جهة موثّقة على قناوي، ` +
    `لكل منها العنوان ورقم التواصل ومواعيد العمل.`;

  // The freshest listing in the category is the date this page last changed.
  const saeCatUpdated = services.reduce((latest, s) => {
    const t = s.updatedAt ? new Date(s.updatedAt).getTime() : 0;
    return t > latest ? t : latest;
  }, cat.updatedAt ? new Date(cat.updatedAt).getTime() : 0) || null;

  const intro = (cat.description && cat.description.trim()) ||
    `قسم ${cat.name} في موقع قناوي يجمع كل ${cat.name} في محافظة قنا ومراكزها (قنا، قفط، قوص، نجع حمادي، دشنا، فرشوط، أبو تشت، نقادة، الوقف) مع أرقام التليفون والعناوين ومواعيد العمل، حتى تجد أقرب وأفضل خدمة بسهولة.`;

  const faqHtml = faq.length ? `
  <h2 style="font-size:1.4rem;font-weight:800;color:#0f172a;margin:2rem 0 1rem">أسئلة شائعة عن ${escHtml(cat.name)} في قنا</h2>
  <div style="display:grid;gap:0.75rem;margin-bottom:1.5rem">
    ${faq.map(([q, a]) => `
      <details style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.75rem 1rem" open>
        <summary style="font-weight:700;color:#0f172a;cursor:pointer;line-height:1.7">${escHtml(q)}</summary>
        <p style="margin:0.5rem 0 0;color:#475569;line-height:1.9">${escHtml(a)}</p>
      </details>
    `).join('')}
  </div>` : '';

  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1rem;max-width:1100px;margin:0 auto">
  <nav aria-label="breadcrumb" style="font-size:0.85rem;color:#64748b;margin-bottom:0.75rem">
    <a href="/" style="color:#0c4a6e">الرئيسية</a> › <span>${escHtml(cat.name)}</span>
  </nav>
  <h1 style="font-size:1.75rem;font-weight:800;color:#0f172a;margin:0 0 0.5rem">${escHtml(cat.name)} في محافظة قنا</h1>
  <!-- sae:geo-cat — the direct answer comes first; the fuller intro follows. -->
  <p style="line-height:1.9;color:#334155;margin:0 0 0.5rem;font-size:1.05rem">${escHtml(saeCatLead)}</p>
  ${saeByline(saeCatUpdated, saeCatUpdated)}
  <p style="line-height:1.9;color:#334155;margin:0 0 1rem">${escHtml(intro)}</p>
  <p style="color:#64748b;margin:0 0 1.5rem;font-size:0.95rem">${services.length.toLocaleString('ar-EG')} نتيجة في قنا، قفط، قوص، نجع حمادي، دشنا، فرشوط، أبو تشت، نقادة، الوقف. كل الأرقام والعناوين محدّثة من فريق قناوي ومساهمات السكان.</p>

  ${guideSlug ? `<p style="margin:0 0 1.5rem;padding:0.875rem 1rem;background:#fef3c7;border-right:4px solid #f59e0b;border-radius:0.5rem;line-height:1.9;color:#78350f">📖 <strong>مقال موصى بقراءته:</strong> <a href="/guides/${escAttr(guideSlug)}" style="color:#92400e;text-decoration:underline;font-weight:700">${escHtml(guideTitle)}</a></p>` : ''}

  ${items ? `<h2 style="font-size:1.4rem;font-weight:800;color:#0f172a;margin:1.5rem 0 0.75rem">قائمة ${escHtml(cat.name)} في قنا</h2><ul style="list-style:none;padding:0;margin:0 0 2rem">${items}</ul>` : ''}

  ${faqHtml}

  ${saeProvenance(saeCatUpdated, saeCatUpdated)}
</div>`;

  // sae:geo-cat — ItemList says what is on the page; WebPage says who stands
  // behind it and when it last changed.
  const saeCatWebPage = saeWebPageLd(
    `${BASE}/category/${cat.slug}`,
    `${cat.name} في محافظة قنا`,
    saeCatLead,
    saeCatUpdated,
    cat.createdAt || saeCatUpdated,
  );
  const lds = [JSON.stringify(itemListLd), JSON.stringify(saeCatWebPage)];
  if (faq.length) {
    const faqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    };
    lds.push(JSON.stringify(faqLd));
  }
  const ldHtml = lds.map((l) => `<script type="application/ld+json">${l}</script>`).join('\n');
  return { bodyHtml, ldHtml };
}

// ---------- Universal content renderers ----------
// SSR rich body content for ALL non-DB pages: home, about, qena, privacy,
// terms, contact, team, editorial-policy, guides index, individual guide
// articles, and author bio pages. Each returns { bodyHtml, ldHtml }.
// React's createRoot wipes this on hydration; crawlers and no-JS visitors
// see it.

function renderSectionsHtml(sections) {
  if (!Array.isArray(sections)) return '';
  return sections.map((sec) => {
    const parts = [];
    const h2 = sec.h2 || sec.h2_arabic;
    if (h2) {
      parts.push(`<h2 style="font-size:1.4rem;font-weight:800;color:#0f172a;margin:1.75rem 0 0.75rem">${escHtml(h2)}</h2>`);
    }
    // paragraphs may be a single string (callout) or array
    const paragraphs = sec.paragraphs || [];
    for (const p of paragraphs) {
      // Allow inline HTML (links) inside paragraphs — they came from trusted data files
      parts.push(`<p style="line-height:1.95;color:#334155;margin:0 0 0.85rem">${p}</p>`);
    }
    // bullet_lists with intro + items
    const lists = sec.bullet_lists || sec.lists || [];
    for (const list of lists) {
      if (list.intro) parts.push(`<p style="line-height:1.95;color:#334155;margin:0.5rem 0">${list.intro}</p>`);
      parts.push(`<ul style="margin:0 0 1rem;padding-right:1.5rem;color:#334155;line-height:1.95">${
        (list.items || []).map((it) => `<li style="margin:0.35rem 0">${it}</li>`).join('')
      }</ul>`);
    }
    // h3_subsections
    const subs = sec.h3_subsections || sec.subsections || [];
    for (const sub of subs) {
      const h3 = sub.h3 || sub.h3_arabic;
      if (h3) parts.push(`<h3 style="font-size:1.1rem;font-weight:700;color:#0f172a;margin:1.25rem 0 0.5rem">${escHtml(h3)}</h3>`);
      if (sub.body) parts.push(`<p style="line-height:1.95;color:#334155;margin:0 0 0.85rem">${sub.body}</p>`);
    }
    // callout_box
    if (sec.callout_box) {
      parts.push(`<blockquote style="border-right:4px solid #0ea5e9;background:#f0f9ff;padding:0.85rem 1rem;margin:1rem 0;border-radius:0.5rem;color:#075985;line-height:1.85">${sec.callout_box}</blockquote>`);
    }
    return parts.join('\n');
  }).join('\n');
}

function staticPageBodySsr(p, pageMeta) {
  const data = STATIC_PAGES_CONTENT[p];
  if (!data) return null;
  const sectionsHtml = renderSectionsHtml(data.sections);
  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1.25rem;max-width:1100px;margin:0 auto">
  <h1 style="font-size:2rem;font-weight:900;color:#0f172a;margin:0 0 0.75rem;line-height:1.25">${escHtml(data.heroH1)}</h1>
  <p style="font-size:1.05rem;line-height:1.95;color:#475569;margin:0 0 1.5rem;padding-bottom:1rem;border-bottom:1px solid #e2e8f0">${escHtml(data.heroIntro)}</p>
  ${sectionsHtml}
  ${data.conclusion ? `<p style="line-height:1.95;color:#334155;margin:1.75rem 0 0;padding-top:1rem;border-top:1px solid #e2e8f0;font-style:italic">${data.conclusion}</p>` : ''}
</div>`;
  return { bodyHtml, ldHtml: '' };
}

function guideArticleBodySsr(slug) {
  const isNew = !!NEW_ARTICLES[slug];
  const isExisting = !!EXISTING_GUIDE_OUTLINES[slug];
  if (!isNew && !isExisting) return null;

  const data = isNew ? NEW_ARTICLES[slug] : EXISTING_GUIDE_OUTLINES[slug];
  const author = AUTHORS[data.author] || null;
  const reviewer = AUTHORS[data.reviewed_by] || null;

  // For new articles: render full prose. For existing: render outline +
  // section headings only (full prose is in the React JSX file and shows
  // after hydration).
  let sectionsHtml = '';
  if (isNew) {
    sectionsHtml = renderSectionsHtml(data.sections);
  } else {
    // Outline-only SSR for the 12 existing articles
    sectionsHtml = `
<p style="line-height:1.95;color:#334155;margin:0 0 1.25rem">${escHtml(data.description)}</p>
<h2 style="font-size:1.25rem;font-weight:800;color:#0f172a;margin:1.75rem 0 0.75rem">ما يغطّيه هذا الدليل</h2>
<ul style="margin:0 0 1.25rem;padding-right:1.5rem;color:#334155;line-height:1.95">
${(data.sections || []).map((s) => `  <li style="margin:0.4rem 0">${escHtml(s)}</li>`).join('\n')}
</ul>
<p style="line-height:1.95;color:#334155;margin:1rem 0">
  للنص الكامل تابع المقال أدناه. يحتوي على شرح تفصيلي وأمثلة ملموسة، ويُحدَّث دورياً بناءً على ملاحظات القرّاء وتطورات الواقع.
</p>`;
  }

  const intro = isNew ? data.intro : data.description;
  const conclusion = isNew ? data.conclusion : '';

  const dateStr = (data.published || '2026-06-07').slice(0, 10);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    inLanguage: 'ar',
    datePublished: data.published || dateStr,
    dateModified: data.modified || dateStr,
    author: author ? {
      '@type': 'Person',
      name: author.name,
      url: `${BASE}/author/${data.author}`,
      jobTitle: author.role,
    } : { '@type': 'Organization', name: 'قناوي - شركة برمجلي', url: BASE },
    publisher: {
      '@type': 'Organization',
      name: 'قناوي',
      logo: { '@type': 'ImageObject', url: `${BASE}/logo.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/guides/${slug}` },
    image: `${BASE}/logo.svg`,
    keywords: data.keywords || '',
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'الأدلة والمقالات', item: `${BASE}/guides` },
      { '@type': 'ListItem', position: 3, name: data.title, item: `${BASE}/guides/${slug}` },
    ],
  };

  const bylineHtml = author ? `
<div style="display:flex;align-items:center;gap:0.85rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:0.6rem;padding:0.85rem 1rem;margin:1.25rem 0">
  <div style="font-size:1.75rem">${escHtml(author.icon || '👤')}</div>
  <div style="flex:1">
    <div style="font-size:0.85rem;color:#64748b">كتب هذا المقال</div>
    <div style="font-weight:700;color:#0f172a">
      <a href="/author/${escAttr(data.author)}" style="color:#0c4a6e;text-decoration:none">${escHtml(author.name)}</a>
    </div>
    <div style="font-size:0.85rem;color:#475569">${escHtml(author.role)}</div>
  </div>
  ${reviewer ? `<div style="text-align:left;font-size:0.8rem;color:#64748b;border-right:1px solid #e2e8f0;padding-right:0.85rem">
    <div>راجعه</div>
    <div style="color:#0f172a;font-weight:600"><a href="/author/${escAttr(data.reviewed_by)}" style="color:#0f172a;text-decoration:none">${escHtml(reviewer.name)}</a></div>
  </div>` : ''}
</div>` : '';

  const takeawaysHtml = (isNew && data.key_takeaways && data.key_takeaways.length) ? `
<div style="background:#fef3c7;border-right:4px solid #f59e0b;border-radius:0.5rem;padding:1rem 1.25rem;margin:1.5rem 0">
  <div style="font-weight:800;color:#78350f;margin-bottom:0.5rem">أهم ما يقوله المقال</div>
  <ul style="margin:0;padding-right:1.25rem;color:#78350f;line-height:1.85">
    ${data.key_takeaways.map((t) => `<li style="margin:0.25rem 0">${escHtml(t)}</li>`).join('')}
  </ul>
</div>` : '';

  const relatedHtml = (isNew && data.related_topics && data.related_topics.length) ? `
<div style="border-top:1px solid #e2e8f0;margin-top:2rem;padding-top:1.25rem">
  <div style="font-weight:700;color:#0f172a;margin-bottom:0.5rem">مواضيع ذات صلة</div>
  <div style="display:flex;flex-wrap:wrap;gap:0.5rem">
    ${data.related_topics.map((t) => `<span style="background:#e0f2fe;color:#075985;padding:0.3rem 0.75rem;border-radius:9999px;font-size:0.85rem">${escHtml(t)}</span>`).join('')}
  </div>
</div>` : '';

  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1.25rem;max-width:780px;margin:0 auto">
  <nav aria-label="breadcrumb" style="font-size:0.85rem;color:#64748b;margin-bottom:0.75rem">
    <a href="/" style="color:#0c4a6e">الرئيسية</a> ›
    <a href="/guides" style="color:#0c4a6e">الأدلة والمقالات</a> ›
    <span>${escHtml(data.title)}</span>
  </nav>
  <h1 style="font-size:2rem;font-weight:900;color:#0f172a;margin:0 0 0.5rem;line-height:1.2">${escHtml(data.title)}</h1>
  <div style="display:flex;gap:1rem;color:#64748b;font-size:0.85rem;margin-bottom:0.75rem">
    <span>${data.read_mins || 8} دقائق قراءة</span>
    <span>·</span>
    <span>آخر تحديث: ${dateStr}</span>
  </div>
  ${bylineHtml}
  ${takeawaysHtml}
  <div style="font-size:1.05rem;line-height:1.95;color:#1e293b;margin:1rem 0 1.5rem">
    ${typeof intro === 'string' ? intro : ''}
  </div>
  ${sectionsHtml}
  ${conclusion ? `<div style="line-height:1.95;color:#1e293b;margin:1.5rem 0 0;padding:1rem 1.25rem;background:#f8fafc;border-radius:0.6rem;border-right:3px solid #0ea5e9">${conclusion}</div>` : ''}
  ${relatedHtml}
</div>`;

  const ldHtml = `<script type="application/ld+json">${JSON.stringify(articleLd)}</script>\n<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>`;
  return { bodyHtml, ldHtml };
}

function guidesIndexBodySsr() {
  const allGuides = [];
  for (const [slug, art] of Object.entries(NEW_ARTICLES)) {
    allGuides.push({ slug, title: art.title, description: art.description, icon: art.icon, color: art.color, read_mins: art.read_mins, author: art.author, isNew: true });
  }
  for (const [slug, g] of Object.entries(EXISTING_GUIDE_OUTLINES)) {
    allGuides.push({ slug, title: g.title, description: g.description, icon: g.icon, read_mins: g.read_mins, author: g.author, isNew: false });
  }

  const cardsHtml = allGuides.map((g) => {
    const author = AUTHORS[g.author];
    return `
<a href="/guides/${escAttr(g.slug)}" style="display:block;padding:1.25rem;border:1px solid #e2e8f0;border-radius:0.75rem;background:#fff;text-decoration:none;color:inherit;transition:all 0.2s">
  <div style="display:flex;gap:0.75rem;align-items:flex-start;margin-bottom:0.5rem">
    <span style="font-size:1.75rem;flex-shrink:0">${escHtml(g.icon || '📖')}</span>
    <div>
      <h2 style="font-size:1.05rem;font-weight:700;color:#0f172a;margin:0 0 0.25rem;line-height:1.4">${escHtml(g.title)}</h2>
      <div style="font-size:0.75rem;color:#64748b">${g.read_mins || 8} دقائق قراءة${author ? ` · ${escHtml(author.name)}` : ''}</div>
    </div>
  </div>
  <p style="font-size:0.9rem;color:#475569;line-height:1.7;margin:0.5rem 0 0">${escHtml((g.description || '').slice(0, 200))}</p>
</a>`;
  }).join('\n');

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'الأدلة والمقالات في قناوي',
    numberOfItems: allGuides.length,
    itemListElement: allGuides.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE}/guides/${g.slug}`,
      name: g.title,
    })),
  };

  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1.25rem;max-width:1100px;margin:0 auto">
  <nav aria-label="breadcrumb" style="font-size:0.85rem;color:#64748b;margin-bottom:0.75rem">
    <a href="/" style="color:#0c4a6e">الرئيسية</a> › <span>الأدلة والمقالات</span>
  </nav>
  <h1 style="font-size:2rem;font-weight:900;color:#0f172a;margin:0 0 0.5rem">الأدلة والمقالات</h1>
  <p style="font-size:1.05rem;line-height:1.95;color:#475569;margin:0 0 1.5rem">
    ${allGuides.length} مقالاً أصلياً معمّقاً عن محافظة قنا — مكتوبة بعناية ومراجعة من فريق قناوي. تغطي التاريخ، الاقتصاد، التعليم، السياحة، الموالد، التراث، والمواصلات. كل مقال يحمل اسم كاتبه ومراجعه وتاريخ آخر تحديث.
  </p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0.85rem">${cardsHtml}</div>
</div>`;

  const ldHtml = `<script type="application/ld+json">${JSON.stringify(itemListLd)}</script>`;
  return { bodyHtml, ldHtml };
}

function teamPageBodySsr() {
  const membersHtml = TEAM.members.map((m) => `
<div style="padding:1.25rem;border:1px solid #e2e8f0;border-radius:0.75rem;background:#fff">
  <div style="font-weight:800;color:#0f172a;font-size:1.05rem;margin-bottom:0.25rem">${escHtml(m.name)}</div>
  <div style="color:#${(m.role_color || '0c4a6e').replace(/^#/, '')};font-weight:600;font-size:0.95rem;margin-bottom:0.75rem">${escHtml(m.role)}</div>
  <p style="line-height:1.85;color:#475569;font-size:0.95rem;margin:0 0 0.75rem">${escHtml(m.bio)}</p>
  <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
    ${(m.expertise_areas || []).map((e) => `<span style="background:#f1f5f9;color:#475569;padding:0.25rem 0.6rem;border-radius:9999px;font-size:0.75rem">${escHtml(e)}</span>`).join('')}
  </div>
</div>`).join('\n');

  const principlesHtml = (TEAM.editorial_principles || []).map((p) => `<li style="margin:0.4rem 0;line-height:1.85">${escHtml(p)}</li>`).join('');

  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1.25rem;max-width:1100px;margin:0 auto">
  <nav aria-label="breadcrumb" style="font-size:0.85rem;color:#64748b;margin-bottom:0.75rem">
    <a href="/" style="color:#0c4a6e">الرئيسية</a> › <span>الفريق</span>
  </nav>
  <h1 style="font-size:2rem;font-weight:900;color:#0f172a;margin:0 0 0.75rem">فريق قناوي</h1>
  <p style="font-size:1.05rem;line-height:1.95;color:#475569;margin:0 0 1.75rem;padding-bottom:1rem;border-bottom:1px solid #e2e8f0">${escHtml(TEAM.intro)}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem;margin-bottom:2rem">${membersHtml}</div>
  <h2 style="font-size:1.4rem;font-weight:800;color:#0f172a;margin:2rem 0 0.75rem">مبادئنا التحريرية</h2>
  <ul style="margin:0;padding-right:1.5rem;color:#334155">${principlesHtml}</ul>
</div>`;
  return { bodyHtml, ldHtml: '' };
}

function authorPageBodySsr(slug) {
  const a = AUTHORS[slug];
  if (!a) return null;

  // Find articles authored by this person
  const newArticlesByAuthor = Object.entries(NEW_ARTICLES)
    .filter(([s, art]) => art.author === slug || art.reviewed_by === slug)
    .map(([s, art]) => ({ slug: s, title: art.title, role: art.author === slug ? 'كاتب' : 'مراجع' }));
  const existingByAuthor = Object.entries(EXISTING_GUIDE_OUTLINES)
    .filter(([s, g]) => g.author === slug || g.reviewed_by === slug)
    .map(([s, g]) => ({ slug: s, title: g.title, role: g.author === slug ? 'كاتب' : 'مراجع' }));
  const allArticles = [...newArticlesByAuthor, ...existingByAuthor];

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: a.name,
    jobTitle: a.role,
    url: `${BASE}/author/${slug}`,
    description: a.bio,
    knowsAbout: a.expertise || [],
    worksFor: { '@type': 'Organization', name: 'قناوي', url: BASE },
  };

  const articlesHtml = allArticles.length ? `
<h2 style="font-size:1.4rem;font-weight:800;color:#0f172a;margin:1.75rem 0 0.75rem">مقالات بقلم ${escHtml(a.name)}</h2>
<ul style="list-style:none;padding:0;margin:0;display:grid;gap:0.5rem">
  ${allArticles.map((art) => `<li>
    <a href="/guides/${escAttr(art.slug)}" style="display:flex;justify-content:space-between;align-items:center;padding:0.85rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:0.5rem;text-decoration:none;color:inherit">
      <span style="color:#0f172a;font-weight:600">${escHtml(art.title)}</span>
      <span style="font-size:0.75rem;color:#64748b;background:#e0f2fe;color:#075985;padding:0.2rem 0.6rem;border-radius:9999px">${art.role}</span>
    </a>
  </li>`).join('')}
</ul>` : '';

  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1.25rem;max-width:780px;margin:0 auto">
  <nav aria-label="breadcrumb" style="font-size:0.85rem;color:#64748b;margin-bottom:0.75rem">
    <a href="/" style="color:#0c4a6e">الرئيسية</a> ›
    <a href="/team" style="color:#0c4a6e">الفريق</a> ›
    <span>${escHtml(a.name)}</span>
  </nav>
  <div style="display:flex;gap:1.25rem;align-items:flex-start;padding:1.25rem;background:#f8fafc;border-radius:0.75rem;margin-bottom:1.5rem">
    <div style="font-size:3.5rem;line-height:1;flex-shrink:0">${escHtml(a.icon || '👤')}</div>
    <div>
      <h1 style="font-size:1.6rem;font-weight:900;color:#0f172a;margin:0 0 0.25rem">${escHtml(a.name)}</h1>
      <div style="color:#0c4a6e;font-weight:600;margin-bottom:0.75rem">${escHtml(a.role)}</div>
      <p style="line-height:1.95;color:#334155;margin:0">${escHtml(a.bio)}</p>
    </div>
  </div>
  <h2 style="font-size:1.25rem;font-weight:800;color:#0f172a;margin:1.25rem 0 0.5rem">مجالات الخبرة</h2>
  <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:1rem">
    ${(a.expertise || []).map((e) => `<span style="background:#e0f2fe;color:#075985;padding:0.35rem 0.85rem;border-radius:9999px;font-size:0.85rem">${escHtml(e)}</span>`).join('')}
  </div>
  ${articlesHtml}
</div>`;

  const ldHtml = `<script type="application/ld+json">${JSON.stringify(personLd)}</script>`;
  return { bodyHtml, ldHtml };
}

function editorialPolicyBodySsr() {
  const intro = EDITORIAL_POLICY.intro || '';
  const sectionsHtml = (EDITORIAL_POLICY.sections || []).map((s) => `
<h2 style="font-size:1.4rem;font-weight:800;color:#0f172a;margin:1.75rem 0 0.75rem">${escHtml(s.h2)}</h2>
${(s.paragraphs || []).map((p) => `<p style="line-height:1.95;color:#334155;margin:0 0 0.85rem">${escHtml(p)}</p>`).join('')}
${(s.bullets && s.bullets.length) ? `<ul style="margin:0 0 1rem;padding-right:1.5rem;color:#334155;line-height:1.95">${s.bullets.map((b) => `<li style="margin:0.3rem 0">${escHtml(b)}</li>`).join('')}</ul>` : ''}
`).join('\n');

  const bodyHtml = `
<div dir="rtl" lang="ar" style="font-family:Cairo,Tajawal,sans-serif;padding:1.25rem;max-width:850px;margin:0 auto">
  <nav aria-label="breadcrumb" style="font-size:0.85rem;color:#64748b;margin-bottom:0.75rem">
    <a href="/" style="color:#0c4a6e">الرئيسية</a> › <span>السياسة التحريرية</span>
  </nav>
  <h1 style="font-size:2rem;font-weight:900;color:#0f172a;margin:0 0 0.75rem">السياسة التحريرية لقناوي</h1>
  <p style="font-size:1.05rem;line-height:1.95;color:#475569;margin:0 0 1.5rem;padding-bottom:1rem;border-bottom:1px solid #e2e8f0">${escHtml(intro)}</p>
  ${sectionsHtml}
</div>`;
  return { bodyHtml, ldHtml: '' };
}

// Resolve route metadata and (optionally) per-route body content. Returns
// { meta, found, body, ld, ogImage }. `found: false` means the URL doesn't
// match any known SPA route (or the DB row was missing) and the caller
// should respond 404 + noindex.
async function metaFor(reqPath) {
  let p = (reqPath || '/').split('?')[0];
  if (p.length > 1) p = p.replace(/\/+$/, '');
  if (!p) p = '/';

  // /admin and subpaths — known SPA routes, but excluded from indexing.
  if (p === '/admin' || p.startsWith('/admin/')) {
    return { meta: STATIC_META['/'], found: true, noindex: true };
  }

  // sae:rest-fix — routes React builds entirely on the client still need a
  // heading in the response.
  const minimal = saeMinimalBody(p);
  if (minimal && STATIC_META[p]) {
    return { meta: STATIC_META[p], found: true, body: minimal };
  }

  // Static pages with editorial body content (Home, About, Qena, Privacy,
  // Terms, Contact). Each gets a rich SSR body so crawlers see real content.
  if (STATIC_PAGES_CONTENT[p]) {
    const meta = STATIC_META[p] || { title: STATIC_PAGES_CONTENT[p].title, description: STATIC_PAGES_CONTENT[p].description };
    const rendered = staticPageBodySsr(p, meta);
    return { meta, found: true, body: rendered.bodyHtml, ld: rendered.ldHtml };
  }

  // Guides index
  if (p === '/guides') {
    const rendered = guidesIndexBodySsr();
    return { meta: STATIC_META['/guides'], found: true, body: rendered.bodyHtml, ld: rendered.ldHtml };
  }

  // Individual guide article (both new and existing)
  let gm = p.match(/^\/guides\/([a-z0-9-]+)$/i);
  if (gm) {
    const rendered = guideArticleBodySsr(gm[1]);
    if (rendered) {
      const meta = STATIC_META[p] || (() => {
        const data = NEW_ARTICLES[gm[1]] || EXISTING_GUIDE_OUTLINES[gm[1]];
        return { title: data.title, description: data.description };
      })();
      return { meta, found: true, body: rendered.bodyHtml, ld: rendered.ldHtml };
    }
    // Unknown guide slug → 404 + noindex
    return { meta: STATIC_META['/'], found: false };
  }

  // Team page
  if (p === '/team') {
    const rendered = teamPageBodySsr();
    return { meta: STATIC_META['/team'], found: true, body: rendered.bodyHtml, ld: rendered.ldHtml };
  }

  // Editorial policy
  if (p === '/editorial-policy') {
    const rendered = editorialPolicyBodySsr();
    return { meta: STATIC_META['/editorial-policy'], found: true, body: rendered.bodyHtml, ld: rendered.ldHtml };
  }

  // Author bio pages
  let am = p.match(/^\/author\/([a-z0-9-]+)$/i);
  if (am) {
    const rendered = authorPageBodySsr(am[1]);
    if (rendered) {
      const meta = STATIC_META[p] || (() => {
        const a = AUTHORS[am[1]];
        return { title: `${a.name} — ${a.role} | كتّاب قناوي`, description: a.bio.slice(0, 200) };
      })();
      return { meta, found: true, body: rendered.bodyHtml, ld: rendered.ldHtml };
    }
    return { meta: STATIC_META['/'], found: false };
  }

  // Fall through to STATIC_META lookup for non-content static pages
  // (/numbers, /submit, /nearby, /category/all, etc.)
  if (STATIC_META[p]) return { meta: STATIC_META[p], found: true };

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
          attributes: ['id', 'name', 'city', 'address', 'phone', 'updatedAt'],
          order: [['is_featured', 'DESC'], ['id', 'DESC']],
          limit: 100,
        });
      } catch (_) { /* keep empty list */ }

      const { bodyHtml, ldHtml } = categoryBodySsr(cat, services);

      // Category noindex strategy: only the 5 categories that have a matching
      // long-form guide article get indexed (they function as editorial hubs).
      // All other categories become noindex to shift the editorial:directory
      // ratio in Google's classifier from 20:100 → 20:5. Matches the AdSense
      // audit finding that "editorial-to-directory ratio still upside down".
      const EDITORIAL_HUB_CATEGORIES = new Set([
        'hospitals',    // → /guides/hospitals-qena + /guides/hospitals-qena-2026
        'pharmacies',   // → /guides/pharmacies-24h-qena
        'tourism',      // → /guides/qena-landmarks + /guides/dendera-temple-guide
        'restaurants',  // → /guides/restaurants-qena + /guides/koshari-qena
        'banks',        // → /guides/banks-atm-qena
      ]);
      const isEditorialHub = EDITORIAL_HUB_CATEGORIES.has(cat.slug);

      return {
        meta: metaForCategory(cat),
        found: true,
        body: bodyHtml,
        ld: ldHtml,
        // sae:empty-cats — indexable as long as there is something to index.
        // Flips back on its own the moment a listing is approved here, so
        // this needs no maintenance.
        noindex: services.length === 0,
      };
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

      // sae:orphan-fix — the sibling lookup is the only added query, and it
      // is served from the per-category cache on all but the first request.
      let siblingHtml = '';
      try {
        const rows = await saeSiblings(svc.category_id);
        siblingHtml = saeSiblingHtml(saePickSiblings(rows, svc), svc.category || {});
      } catch (_) { /* listing renders without the blocks */ }

      const { bodyHtml, ldHtml, img } = serviceBodySsr(svc, siblingHtml);

      const isThin = isThinService(svc);

      // sae:dupe-fix — when this listing is the second copy of a business
      // already in the directory, point the canonical at the fuller entry.
      let canonicalOverride = null;
      try {
        const target = (await saeDupeTargets()).get(String(svc.id));
        if (target) canonicalOverride = `${BASE}/service/${target}`;
      } catch (_) { /* stays self-canonical */ }

      return {
        meta: metaForService(svc),
        found: true,
        body: bodyHtml,
        ld: ldHtml,
        // sae:image-health — a dead og:image gives every share a blank card.
        ogImage: img && imageHealth.getHealth(img).render ? img : null,
        noindex: false, // sae:index-all — was isThin
        canonicalOverride,
      };
    } catch (_) {
      // DB unreachable — degrade but stay indexable rather than 404'ing.
      return { meta: STATIC_META['/'], found: true };
    }
  }

  return { meta: STATIC_META['/'], found: false };
}

async function renderForPath(reqPath, res, opts = {}) {
  try {
    const ctx = await metaFor(reqPath);
    let { meta, found, noindex, body, ld, ogImage, canonicalOverride } = ctx;
    // Escalate noindex on any request that carries a query string (see
    // spaCatchAll comment).
    if (opts.forceNoindex) noindex = true;
    // sae:dupe-fix — a duplicate entity canonicalises to the entry that
    // carries the fuller record, so the two URLs stop competing.
    const canonical = canonicalOverride
      ? canonicalOverride
      : found
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
      .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${descEsc}$2`)
      // sae:meta-fix — hreflang must name THIS page. index.html hard-codes
      // the homepage in both alternates and nothing rewrote them, so every
      // page told Google its Arabic version lived at the site root while its
      // own canonical said otherwise. The site is Arabic-only, so a
      // self-reference is both the correct annotation and the reciprocal one.
      .replace(/(<link\s+rel="alternate"\s+hreflang="ar"\s+href=")[^"]*(")/, `$1${canonEsc}$2`)
      .replace(/(<link\s+rel="alternate"\s+hreflang="x-default"\s+href=")[^"]*(")/, `$1${canonEsc}$2`);

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
    // sae:rest-fix — the footer goes on every rendered route, not just the
    // ones that produced a body, so no page is left without site links.
    const shell = (body || '') + saeFooterHtml(reqPath);
    html = html.replace('<div id="root"></div>', `<div id="root">${shell}</div>`);

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
  // sae:head-fix — HEAD renders exactly as GET; Node drops the body itself.
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();
  // Skip API and admin paths (admin is a SPA route but blocked from indexing,
  // so we still serve it the homepage HTML — same as before).
  if (req.path.startsWith('/api/')) return next();
  // Force noindex on any URL that carries a query string. Nothing on this
  // site should be indexed with query params (there's no legitimate ?q= /
  // ?utm= / ?ref= indexable variant). This kills the phantom
  // /category/all?q={search_term_string} URL that got crawled literally
  // from a stale SearchAction JSON-LD template — the source of dozens of
  // "Alternate page with proper canonical tag" reports in GSC.
  const hasQuery = req.originalUrl && req.originalUrl.includes('?');
  return renderForPath(req.path, res, { forceNoindex: hasQuery });
}

// sae:image-health — the sweep keeps itself current. There is no cron on this
// account, and a map of which images were alive last month is worth little.
// Thirty URLs every twelve hours, three at a time: small enough that it never
// competes with serving a request.
imageHealth.startRefresher(async () => {
  const rows = await Service.findAll({
    where: { status: 'approved' },
    attributes: ['image_url'],
    raw: true,
  });
  return [
    ...new Set(
      rows
        .map((r) => r.image_url)
        .filter((u) => u && String(u).trim().startsWith('http')),
    ),
  ];
}, (msg) => console.log(msg));

module.exports = router;
module.exports.spaCatchAll = spaCatchAll;
