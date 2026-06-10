import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight, BookOpen, User } from 'lucide-react';
import SEO from '../components/SEO.jsx';
import AUTHORS from '../data/authors.json';
import ARTICLES from '../data/articles.json';

// Author bio page — establishes E-E-A-T (Experience, Expertise,
// Authoritativeness, Trust) signals critical for AdSense and Google.
// Lists all articles the author wrote or reviewed, with Person JSON-LD.
export default function Author() {
  const { slug } = useParams();
  const author = AUTHORS[slug];

  if (!author) return <Navigate to="/team" replace />;

  // Articles authored OR reviewed by this person (new articles only — existing
  // 12 guides aren't in the JSON data; SSR backend still wires them via the
  // EXISTING_GUIDE_OUTLINES on the server side).
  const articles = Object.entries(ARTICLES)
    .filter(([s, a]) => a.author === slug || a.reviewed_by === slug)
    .map(([s, a]) => ({ slug: s, title: a.title, role: a.author === slug ? 'كاتب' : 'مراجع' }));

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role,
    url: `https://qinawy.com/author/${slug}`,
    description: author.bio,
    knowsAbout: author.expertise || [],
    worksFor: { '@type': 'Organization', name: 'قناوي', url: 'https://qinawy.com' },
  };

  return (
    <div>
      <SEO
        path={`/author/${slug}`}
        title={`${author.name} — ${author.role} | كتّاب قناوي`}
        description={author.bio.slice(0, 200)}
        jsonLd={[personLd]}
      />

      <div className="bg-gradient-to-bl from-brand-50/60 to-white border-b border-slate-100">
        <div className="container-p py-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 flex-wrap">
            <Link to="/" className="hover:text-brand-600">الرئيسية</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/team" className="hover:text-brand-600">الفريق</Link>
            <ChevronRight className="w-3 h-3" />
            <span>{author.name}</span>
          </div>
        </div>
      </div>

      <section className="container-p py-8 max-w-3xl">
        <div className="card p-5 mb-5 flex items-start gap-4">
          <div className="text-5xl shrink-0">{author.icon || '👤'}</div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">{author.name}</h1>
            <div className="font-semibold mb-3" style={{ color: author.color || '#0c4a6e' }}>{author.role}</div>
            <p className="text-slate-700 leading-8">{author.bio}</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mt-6 mb-3">مجالات الخبرة</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {(author.expertise || []).map((e, i) => (
            <span key={i} className="bg-sky-50 text-sky-800 text-sm px-3 py-1 rounded-full">{e}</span>
          ))}
        </div>

        {articles.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-slate-900 mt-6 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-700" />
              مقالات بقلم {author.name}
            </h2>
            <div className="space-y-2">
              {articles.map((art) => (
                <Link
                  key={art.slug}
                  to={`/guides/${art.slug}`}
                  className="card p-3 hover:ring-2 hover:ring-brand-300 transition flex items-center justify-between"
                >
                  <span className="text-slate-900 font-semibold">{art.title}</span>
                  <span className="text-xs text-sky-800 bg-sky-50 px-2 py-1 rounded-full">{art.role}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
