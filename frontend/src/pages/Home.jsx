import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Plus, ChevronLeft, Scroll, Sparkles, MapPin, Heart, CheckCircle2, ShieldCheck, Navigation } from 'lucide-react';
import api from '../lib/api.js';
import { Icon } from '../lib/icons.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import EmergencyStrip from '../components/EmergencyStrip.jsx';
import SearchBox from '../components/SearchBox.jsx';
import AdSlot from '../components/AdSlot.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Only fetch "important places" for the featured strip — hospitals, medical,
    // government, landmarks, education. Skip shops / cafes / salons / gas / banks.
    const PRIORITY = ['hospitals', 'clinics', 'pharmacies', 'government', 'tourism', 'education'];
    const priorityCalls = PRIORITY.map((slug) =>
      api.get('/services', {
        params: { category: slug, featured: '1', limit: 2, includeCategory: '1' },
      }).then((r) => r.data.rows).catch(() => [])
    );

    Promise.all([
      api.get('/categories/with-counts'),
      Promise.all(priorityCalls),
    ]).then(([c, priorityRows]) => {
      setCategories(c.data);
      // Flatten + dedupe + cap at 6
      const seen = new Set();
      const merged = [];
      for (const rows of priorityRows) {
        for (const s of rows) {
          if (seen.has(s.id)) continue;
          seen.add(s.id);
          merged.push(s);
        }
      }
      setFeatured(merged.slice(0, 6));
      const total = c.data.reduce((acc, x) => acc + (x.services_count || 0), 0);
      setStats({ services: total, categories: c.data.length });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden isolate">
        {/* Layered backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-bl from-[#0b3f66] via-[#0c4a6e] to-[#082f49]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/hero-pattern.svg)', backgroundSize: 'cover', opacity: 0.25 }} />
        {/* Sun glow */}
        <div className="absolute -top-32 right-[20%] w-[420px] h-[420px] rounded-full bg-gradient-radial from-amber-300/30 via-amber-400/10 to-transparent blur-3xl" style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.35) 0%, rgba(252,211,77,0.05) 55%, transparent 75%)' }} />
        <div className="absolute -bottom-40 -left-32 w-[520px] h-[520px] rounded-full bg-gradient-radial from-sky-400/25 to-transparent blur-3xl" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.28) 0%, transparent 70%)' }} />
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent)',
        }} />

        <div className="container-p relative py-10 sm:py-16 md:py-20 text-white">
          <div className="grid lg:grid-cols-[1.35fr,1fr] gap-8 lg:gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              {/* Tagline badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full backdrop-blur mb-5">
                <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300/60" />
                <span>خدمة خيرية مجانية</span>
                <span className="h-3 w-px bg-white/25" />
                <span className="text-amber-200/90">مقدمة من شركة برمجلي</span>
              </div>

              {/* Headline */}
              <h1 className="font-extrabold mb-4 leading-[1.08] tracking-tight" style={{ fontFamily: 'Cairo, sans-serif' }}>
                <span className="block text-3xl sm:text-5xl md:text-[3.75rem]">دليل قنا</span>
                <span className="block text-2xl sm:text-4xl md:text-5xl mt-2 text-white/95">
                  كل خدمات{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-200 via-yellow-300 to-amber-300">
                    عروس الصعيد
                  </span>
                </span>
                <span className="block text-xl sm:text-3xl md:text-4xl mt-2 text-white/85 font-bold">
                  في مكان واحد
                </span>
              </h1>

              {/* Subheading — shorter, clearer, conversational */}
              <p className="text-white/85 text-sm sm:text-base md:text-lg leading-7 sm:leading-8 max-w-xl">
                ابحث عن مستشفى قريب · صيدلية ٢٤ ساعة · رقم طوارئ · أقرب فرع بنك أو مطعم — بإحداثيات دقيقة على الخريطة.
              </p>

              {/* Trust row */}
              <div className="mt-5 flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-white/75">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> بيانات محقّقة من Google</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-sky-300" /> بدون إعلانات</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-300" /> مركز قنا ومراكزها</span>
              </div>

              {/* Search */}
              <div className="mt-6 sm:mt-7">
                <SearchBox />
              </div>

              {/* Actions */}
              <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2">
                <Link to="/nearby"
                  className="btn bg-emerald-500 text-white hover:bg-emerald-600 font-bold shadow-lg shadow-emerald-500/30">
                  <Navigation className="w-4 h-4" /> الأقرب إليك الآن
                </Link>
                <Link to="/numbers" className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur border border-white/15">
                  <Phone className="w-4 h-4" /> أرقام طوارئ
                </Link>
                <Link to="/qena" className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur border border-white/15">
                  <Scroll className="w-4 h-4" /> عن قنا
                </Link>
                <Link to="/submit" className="btn bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold shadow-lg shadow-amber-400/25">
                  <Plus className="w-4 h-4" /> أضف خدمتك
                </Link>
                <Link to="/submit/driver" className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur border border-white/15">
                  <Plus className="w-4 h-4" /> سجّل كسائق
                </Link>
              </div>

              {/* Stats */}
              {stats && (
                <div className="mt-7 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3 max-w-md">
                  <Stat value={stats.services.toLocaleString('ar-EG')} label="خدمة حقيقية" />
                  <Stat value={stats.categories} label="قسم متنوّع" />
                  <Stat value="١٠٠٪" label="مجاناً دائماً" />
                </div>
              )}
            </motion.div>

            {/* Right visual — coat of arms + logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="hidden lg:block relative">
              <div className="relative">
                {/* Orbit ring */}
                <div className="absolute inset-0 rounded-full border border-white/15" style={{ clipPath: 'inset(0 0 25% 0 round 9999px)' }} />
                {/* Glow behind coat */}
                <div className="absolute inset-0 bg-gradient-radial from-amber-300/30 to-transparent blur-2xl rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.3), transparent 60%)' }} />
                {/* Coat of arms card */}
                <div className="relative w-full max-w-xs mx-auto rounded-3xl shadow-2xl ring-1 ring-white/20 bg-gradient-to-bl from-white to-amber-50 p-5 rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-amber-100">
                    <img src="/qena-coat.jpg" alt="شعار محافظة قنا الرسمي" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center mt-3">
                    <div className="text-sky-900 font-extrabold text-base">محافظة قنا</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">الشعار الرسمي</div>
                  </div>
                </div>
                {/* Floating logo chip */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-2 ring-1 ring-amber-100">
                  <img src="/logo.svg" alt="" className="w-16 h-16" />
                </motion.div>
                {/* Floating Arabic label */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-5 -left-6 bg-amber-400 text-amber-950 font-extrabold text-sm px-4 py-2 rounded-xl shadow-xl -rotate-6">
                  قناوي · Qinawy
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave divider */}
        <svg className="absolute bottom-0 inset-x-0 w-full h-10 sm:h-14 text-slate-50" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,48 C240,96 480,0 720,32 C960,64 1200,16 1440,48 L1440,80 L0,80 Z" />
        </svg>
      </section>

      <EmergencyStrip />

      {/* Categories */}
      <section className="container-p py-8 sm:py-12">
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <div className="text-brand-600 text-xs sm:text-sm font-semibold mb-1">تصفح الخدمات</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900">أقسام الدليل</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">اختر القسم لتصفح جميع الخدمات المتاحة في محافظة قنا</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 sm:p-5 h-28 sm:h-32 animate-pulse bg-slate-100" />
          ))}
          {!loading && categories.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}>
              <Link to={`/category/${c.slug}`}
                className="card p-4 sm:p-5 h-full flex flex-col hover:-translate-y-1 hover:shadow-soft transition group relative overflow-hidden">
                <div className="absolute -top-4 -left-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full opacity-[0.08] group-hover:opacity-[0.14] transition"
                  style={{ backgroundColor: c.color || '#0ea5e9' }} />
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 relative"
                  style={{ backgroundColor: (c.color || '#0ea5e9') + '18', color: c.color || '#0ea5e9' }}>
                  <Icon name={c.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="font-bold text-slate-900 mb-0.5 text-sm sm:text-base leading-snug">{c.name}</div>
                <div className="text-[11px] sm:text-xs text-slate-500">{c.services_count || 0} خدمة</div>
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-brand-500 transition absolute top-4 left-4 sm:top-5 sm:left-5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ad slot between Categories and Qena strip — non-intrusive */}
      <div className="container-p">
        <AdSlot slot={AdSlot.INLINE} format="horizontal" />
      </div>

      {/* Qena strip */}
      <section className="container-p py-6">
        <Link to="/qena" className="block">
          <motion.div whileHover={{ y: -2 }}
            className="relative card overflow-hidden p-6 md:p-8 bg-gradient-to-bl from-amber-50 via-white to-brand-50 border-amber-100">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
              <img src="/qena-coat.jpg" className="w-16 h-16 rounded-lg shadow ring-2 ring-white object-cover" alt="شعار قنا" />
              <div className="flex-1">
                <div className="text-amber-700 text-xs font-semibold mb-1">تعرف على محافظتنا</div>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-1">قنا — عروس الصعيد</h3>
                <p className="text-sm text-slate-600 leading-7">
                  تاريخ يمتد آلاف السنين، معابد فرعونية (دندرة)، مهد حضارة نقادة، 9 مراكز إدارية، وأهل طيبون.
                </p>
              </div>
              <div className="btn-primary whitespace-nowrap">
                <Scroll className="w-4 h-4" /> اقرأ المزيد
              </div>
            </div>
          </motion.div>
        </Link>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container-p py-10">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-brand-600 text-sm font-semibold mb-1">مختارات</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">خدمات مميزة</h2>
            </div>
            <Link to="/category/all" className="text-brand-700 text-sm font-semibold hover:underline hidden sm:inline-flex items-center gap-1">
              كل الخدمات <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((s) => (<ServiceCard key={s.id} s={s} />))}
          </div>
        </section>
      )}

      {/* Second ad slot before CTA */}
      <div className="container-p">
        <AdSlot slot={AdSlot.INLINE} format="horizontal" />
      </div>

      {/* CTA */}
      <section className="container-p py-14">
        <div className="card p-6 md:p-10 bg-gradient-to-bl from-brand-600 to-brand-800 text-white border-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/hero-pattern.svg)', backgroundSize: 'cover' }} />
          <div className="relative md:flex items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">تعرف خدمة غير موجودة؟</h3>
              <p className="text-white/90 text-sm md:text-base leading-7">
                ساعدنا نخدم أهل قنا بشكل أفضل. أضف أي خدمة أو محل، وسنراجعها وننشرها مجاناً.
              </p>
            </div>
            <Link to="/submit" className="btn mt-4 md:mt-0 shrink-0 bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold">
              <Plus className="w-4 h-4" /> أضف خدمة الآن
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="group bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-2xl p-3 sm:p-4 text-center hover:bg-white/[0.12] hover:border-white/20 transition-all">
      <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-none">{value}</div>
      <div className="text-[10px] sm:text-[11px] text-white/70 mt-1.5">{label}</div>
    </div>
  );
}
