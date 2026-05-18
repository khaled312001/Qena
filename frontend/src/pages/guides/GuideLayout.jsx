import { Link } from 'react-router-dom';
import { ChevronRight, Clock, BookOpen, Phone, ArrowLeft } from 'lucide-react';
import SEO from '../../components/SEO.jsx';

// Shared frame for every guide article. Children render the body prose.
// Pass `meta` with title, description, keywords, slug, readMins, etc.
// Sets per-page SEO and an Article JSON-LD block so Google can show
// rich-result chips ("Article" type) for each guide.
export default function GuideLayout({ meta, children }) {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description,
    inLanguage: 'ar',
    datePublished: meta.published || '2026-05-16',
    dateModified: meta.modified || '2026-05-16',
    author: {
      '@type': 'Organization',
      name: 'قناوي - شركة برمجلي',
      url: 'https://qinawy.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'قناوي',
      logo: { '@type': 'ImageObject', url: 'https://qinawy.com/logo.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://qinawy.com/guides/${meta.slug}` },
    image: meta.image ? `https://qinawy.com${meta.image}` : 'https://qinawy.com/logo.svg',
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://qinawy.com/' },
      { '@type': 'ListItem', position: 2, name: 'الأدلة', item: 'https://qinawy.com/guides' },
      { '@type': 'ListItem', position: 3, name: meta.title, item: `https://qinawy.com/guides/${meta.slug}` },
    ],
  };

  return (
    <div>
      <SEO
        path={`/guides/${meta.slug}`}
        title={`${meta.title} | قناوي`}
        description={meta.description}
        keywords={meta.keywords}
        jsonLd={[articleLd, breadcrumbLd]}
      />
      <div className="bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 text-white">
        <div className="container-p py-10">
          <div className="flex items-center gap-2 text-xs text-brand-200 mb-3 flex-wrap">
            <Link to="/" className="hover:text-white">الرئيسية</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/guides" className="hover:text-white">الأدلة</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="truncate">{meta.title}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">{meta.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-brand-100">
            <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {meta.readMins} دقائق قراءة</span>
            <span className="inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> دليل قناوي</span>
            <span>آخر تحديث: مايو 2026</span>
          </div>
        </div>
      </div>

      <article className="container-p py-10 max-w-3xl text-slate-800 leading-8 guide-prose">
        {children}

        {/* End of article — call to action */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="grid sm:grid-cols-2 gap-3">
            <Link to="/guides" className="card p-4 hover:ring-2 hover:ring-brand-300 transition group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">العودة لـ</div>
                  <div className="font-bold text-slate-900 group-hover:text-brand-700">كل المقالات</div>
                </div>
              </div>
            </Link>
            <Link to={meta.relatedCategory || '/category/all'} className="card p-4 hover:ring-2 hover:ring-brand-300 transition group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">تصفح</div>
                  <div className="font-bold text-slate-900 group-hover:text-emerald-700">{meta.relatedLabel || 'الخدمات'}</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </article>

      <style>{`
        .guide-prose h2 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 2rem 0 0.75rem; }
        .guide-prose h3 { font-size: 1.15rem; font-weight: 700; color: #0f172a; margin: 1.5rem 0 0.5rem; }
        .guide-prose p { margin: 0 0 1rem; line-height: 2; }
        .guide-prose ul, .guide-prose ol { padding-right: 1.5rem; margin: 0 0 1rem; }
        .guide-prose li { margin: 0.35rem 0; line-height: 1.9; }
        .guide-prose a { color: #0369a1; text-decoration: underline; }
        .guide-prose a:hover { color: #0c4a6e; }
        .guide-prose b, .guide-prose strong { color: #0f172a; font-weight: 700; }
        .guide-prose blockquote {
          border-right: 4px solid #0ea5e9;
          background: #f0f9ff;
          padding: 1rem 1.25rem;
          margin: 1.25rem 0;
          border-radius: 0.5rem;
          color: #075985;
        }
        .guide-prose table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
        .guide-prose th, .guide-prose td { border: 1px solid #e2e8f0; padding: 0.6rem 0.75rem; text-align: right; }
        .guide-prose th { background: #f8fafc; font-weight: 700; color: #0f172a; }
      `}</style>
    </div>
  );
}
