import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight, Clock, BookOpen, ArrowLeft, User } from 'lucide-react';
import SEO from '../../components/SEO.jsx';
import ARTICLES from '../../data/articles.json';
import AUTHORS from '../../data/authors.json';

// Generic renderer for the 7 new long-form articles. Their content lives in
// frontend/src/data/articles.json (same JSON the backend SSR reads), so any
// edit to the article shows up identically in SSR and after hydration.
export default function ArticleViewer() {
  const { slug } = useParams();
  const article = ARTICLES[slug];

  if (!article) return <Navigate to="/guides" replace />;

  const author = AUTHORS[article.author];
  const reviewer = AUTHORS[article.reviewed_by];

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    inLanguage: 'ar',
    datePublished: article.published || '2026-06-07',
    dateModified: article.modified || '2026-06-07',
    author: author ? {
      '@type': 'Person',
      name: author.name,
      url: `https://qinawy.com/author/${article.author}`,
      jobTitle: author.role,
    } : { '@type': 'Organization', name: 'قناوي' },
    publisher: {
      '@type': 'Organization',
      name: 'قناوي',
      logo: { '@type': 'ImageObject', url: 'https://qinawy.com/logo.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://qinawy.com/guides/${slug}` },
    image: 'https://qinawy.com/logo.svg',
    keywords: article.keywords || '',
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://qinawy.com/' },
      { '@type': 'ListItem', position: 2, name: 'الأدلة والمقالات', item: 'https://qinawy.com/guides' },
      { '@type': 'ListItem', position: 3, name: article.title, item: `https://qinawy.com/guides/${slug}` },
    ],
  };

  return (
    <div>
      <SEO
        path={`/guides/${slug}`}
        title={`${article.title} | قناوي`}
        description={article.description}
        keywords={article.keywords}
        jsonLd={[articleLd, breadcrumbLd]}
      />

      <div className="bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 text-white">
        <div className="container-p py-10">
          <div className="flex items-center gap-2 text-xs text-brand-200 mb-3 flex-wrap">
            <Link to="/" className="hover:text-white">الرئيسية</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/guides" className="hover:text-white">الأدلة والمقالات</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="truncate">{article.title}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-3 leading-tight">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-brand-100">
            <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {article.read_mins} دقائق قراءة</span>
            <span className="inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> دليل قناوي</span>
            <span>آخر تحديث: {article.modified || '7 يونيو 2026'}</span>
          </div>
        </div>
      </div>

      <article className="container-p py-8 max-w-3xl">
        {/* Byline + reviewer */}
        {author && (
          <div className="card p-4 mb-6 flex items-center gap-3">
            <div className="text-3xl shrink-0" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
              {author.icon || '👤'}
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500">كتب هذا المقال</div>
              <Link to={`/author/${article.author}`} className="font-bold text-slate-900 hover:text-brand-700">
                {author.name}
              </Link>
              <div className="text-xs text-slate-600 mt-0.5">{author.role}</div>
            </div>
            {reviewer && (
              <div className="text-left text-xs border-r border-slate-200 pr-3">
                <div className="text-slate-500">راجعه</div>
                <Link to={`/author/${article.reviewed_by}`} className="font-semibold text-slate-900 hover:text-brand-700">
                  {reviewer.name}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Key takeaways */}
        {article.key_takeaways && article.key_takeaways.length > 0 && (
          <div className="card p-4 mb-6 bg-amber-50 border-amber-200 border-r-4 border-r-amber-500">
            <div className="font-bold text-amber-900 mb-2">أهم ما يقوله المقال</div>
            <ul className="space-y-1 pr-5 list-disc text-amber-900 leading-7 text-sm">
              {article.key_takeaways.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}

        {/* Intro */}
        <p className="text-slate-700 leading-9 mb-6 text-base">
          {article.intro}
        </p>

        {/* Sections */}
        {(article.sections || []).map((sec, si) => (
          <section key={si} className="mb-8">
            {sec.h2_arabic && (
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-3 leading-snug">
                {sec.h2_arabic}
              </h2>
            )}
            {(sec.paragraphs || []).map((p, pi) => (
              <p key={pi} className="text-slate-700 leading-9 mb-4">{p}</p>
            ))}
            {(sec.bullet_lists || []).map((list, li) => (
              <div key={li} className="mb-4">
                {list.intro && <p className="text-slate-700 leading-9 mb-2">{list.intro}</p>}
                <ul className="list-disc pr-5 space-y-1.5 text-slate-700 leading-8">
                  {(list.items || []).map((item, ii) => <li key={ii}>{item}</li>)}
                </ul>
              </div>
            ))}
            {(sec.h3_subsections || []).map((sub, subi) => (
              <div key={subi} className="mb-4">
                {sub.h3_arabic && (
                  <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">{sub.h3_arabic}</h3>
                )}
                {sub.body && <p className="text-slate-700 leading-9">{sub.body}</p>}
              </div>
            ))}
            {sec.callout_box && (
              <blockquote className="border-r-4 border-brand-500 bg-brand-50 rounded-lg p-4 my-4 text-brand-900 leading-8">
                {sec.callout_box}
              </blockquote>
            )}
          </section>
        ))}

        {/* Conclusion */}
        {article.conclusion && (
          <div className="bg-slate-50 border-r-4 border-brand-500 rounded-lg p-4 my-6 text-slate-800 leading-9">
            {article.conclusion}
          </div>
        )}

        {/* Related topics */}
        {article.related_topics && article.related_topics.length > 0 && (
          <div className="border-t border-slate-200 mt-8 pt-6">
            <div className="font-bold text-slate-900 mb-2">مواضيع ذات صلة</div>
            <div className="flex flex-wrap gap-2">
              {article.related_topics.map((t, i) => (
                <span key={i} className="bg-sky-50 text-sky-800 text-xs px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* End-of-article navigation */}
        <div className="mt-10 pt-6 border-t border-slate-200">
          <Link to="/guides" className="card p-4 hover:ring-2 hover:ring-brand-300 transition group flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500">العودة لـ</div>
              <div className="font-bold text-slate-900 group-hover:text-brand-700">كل المقالات</div>
            </div>
          </Link>
        </div>
      </article>
    </div>
  );
}
