import { Users, Shield, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO.jsx';
import TEAM from '../data/team.json';

export default function Team() {
  return (
    <div>
      <SEO
        path="/team"
        title="فريق قناوي — مؤسسون ومحررون ومراجعون"
        description="تعرّف على فريق قناوي: المؤسسون من شركة برمجلي، باحث التاريخ، المراسلة الميدانية، المراجع الطبي، والمحررة اللغوية."
        keywords="فريق قناوي, محرري قناوي, شركة برمجلي, مؤسسي قناوي"
      />
      <div className="bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 text-white">
        <div className="container-p py-10">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs mb-3">
            <Users className="w-4 h-4" /> {(TEAM.members || []).length} عضواً
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">فريق قناوي</h1>
          <p className="text-brand-100 text-sm md:text-base max-w-3xl leading-7">{TEAM.intro}</p>
        </div>
      </div>

      <section className="container-p py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(TEAM.members || []).map((m, i) => (
            <div key={i} className="card p-5">
              <div className="font-extrabold text-slate-900 text-lg mb-1">{m.name}</div>
              <div className="font-semibold mb-3 text-sm" style={{ color: m.role_color ? `#${String(m.role_color).replace(/^#/, '')}` : '#0c4a6e' }}>
                {m.role}
              </div>
              <p className="text-slate-600 text-sm leading-7 mb-3">{m.bio}</p>
              <div className="flex flex-wrap gap-1.5">
                {(m.expertise_areas || []).map((e, ei) => (
                  <span key={ei} className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full">{e}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-p pb-12">
        <div className="card p-6 bg-gradient-to-bl from-amber-50 via-white to-brand-50 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-extrabold text-slate-900">مبادئنا التحريرية</h2>
          </div>
          <ul className="space-y-2">
            {(TEAM.editorial_principles || []).map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 leading-7 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
