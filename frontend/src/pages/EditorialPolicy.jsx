import { Scroll } from 'lucide-react';
import SEO from '../components/SEO.jsx';
import POLICY from '../data/editorial-policy.json';

export default function EditorialPolicy() {
  return (
    <div>
      <SEO
        path="/editorial-policy"
        title="السياسة التحريرية | قناوي - دليل قنا"
        description="سياسة قناوي التحريرية: كيف نختار المحتوى، كيف نتحقق من المعلومات، التصحيحات، شفافية الإعلانات، وعلاقتنا مع المعلنين."
        keywords="السياسة التحريرية قناوي, شفافية الإعلانات, تصحيحات قناوي"
      />
      <div className="bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 text-white">
        <div className="container-p py-10">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs mb-3">
            <Scroll className="w-4 h-4" /> آخر تحديث: 7 يونيو 2026
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">السياسة التحريرية لقناوي</h1>
          <p className="text-brand-100 text-sm md:text-base max-w-3xl leading-7">{POLICY.intro}</p>
        </div>
      </div>

      <article className="container-p py-10 max-w-3xl text-slate-800 leading-8">
        {(POLICY.sections || []).map((s, i) => (
          <section key={i} className="mb-7">
            <h2 className="text-xl font-extrabold text-slate-900 mb-3">{s.h2}</h2>
            {(s.paragraphs || []).map((p, pi) => (
              <p key={pi} className="leading-8 mb-3 text-slate-700">{p}</p>
            ))}
            {s.bullets && s.bullets.length > 0 && (
              <ul className="list-disc pr-5 space-y-1 leading-7 text-slate-700">
                {s.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
