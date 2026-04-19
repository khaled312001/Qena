import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Plus, ChevronLeft, Scroll, Sparkles } from 'lucide-react';
import api from '../lib/api.js';
import { Icon } from '../lib/icons.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import EmergencyStrip from '../components/EmergencyStrip.jsx';
import SearchBox from '../components/SearchBox.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/categories/with-counts'),
      api.get('/services', { params: { featured: '1', limit: 6, includeCategory: '1' } }),
    ]).then(([c, f]) => {
      setCategories(c.data);
      setFeatured(f.data.rows);
      const total = c.data.reduce((acc, x) => acc + (x.services_count || 0), 0);
      setStats({ services: total, categories: c.data.length });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900" />
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/hero-pattern.svg)', backgroundSize: 'cover', opacity: 0.45 }} />
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />

        <div className="container-p relative py-16 md:py-24 text-white">
          <div className="grid lg:grid-cols-[1.4fr,1fr] gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur mb-4">
                <Sparkles className="w-3.5 h-3.5" /> خدمة مجانية لسكان محافظة قنا · مقدمة من برمجلي
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.15] mb-4" style={{ fontFamily: 'Cairo, sans-serif' }}>
                بوابة قنا
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-300 via-yellow-300 to-amber-200">
                  عروس الصعيد
                </span>{' '}
                في إيدك
              </h1>
              <p className="text-white/90 text-base md:text-lg leading-8 max-w-xl">
                دليل مجاني شامل لكل الخدمات في قنا — مستشفيات، فنادق، مطاعم، كافيهات، محلات، بنوك، أرقام طوارئ، ومعالم سياحية — بإحداثيات دقيقة على الخريطة.
              </p>
              <div className="mt-7">
                <SearchBox />
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Link to="/numbers" className="btn bg-white/15 text-white hover:bg-white/25 backdrop-blur border border-white/10">
                  <Phone className="w-4 h-4" /> أرقام مهمة
                </Link>
                <Link to="/qena" className="btn bg-white/15 text-white hover:bg-white/25 backdrop-blur border border-white/10">
                  <Scroll className="w-4 h-4" /> عن قنا
                </Link>
                <Link to="/submit" className="btn bg-amber-400 text-amber-950 hover:bg-amber-300 font-bold">
                  <Plus className="w-4 h-4" /> أضف خدمتك
                </Link>
              </div>
              {stats && (
                <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
                  <Stat value={stats.services} label="خدمة" />
                  <Stat value={stats.categories} label="قسم" />
                  <Stat value={'100%'} label="مجاناً" />
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="hidden lg:block">
              <div className="relative">
                <div className="w-full max-w-xs mx-auto rounded-2xl shadow-2xl ring-4 ring-white/20 rotate-[-3deg] bg-white p-4">
                  <img src="/qena-coat.jpg" alt="شعار محافظة قنا الرسمي" className="w-full h-auto rounded-xl" />
                  <div className="text-center mt-3 text-sky-900 text-sm font-bold">محافظة قنا</div>
                </div>
                <img src="/logo.svg" alt="" className="absolute -top-8 -right-8 w-24 h-24 drop-shadow-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <EmergencyStrip />

      {/* Categories */}
      <section className="container-p py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-brand-600 text-sm font-semibold mb-1">تصفح الخدمات</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">أقسام البوابة</h2>
            <p className="text-sm text-slate-500 mt-1">اختر القسم لتصفح جميع الخدمات المتاحة في محافظة قنا</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5 h-32 animate-pulse bg-slate-100" />
          ))}
          {!loading && categories.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}>
              <Link to={`/category/${c.slug}`}
                className="card p-5 h-full flex flex-col hover:-translate-y-1 hover:shadow-soft transition group relative overflow-hidden">
                <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-[0.08] group-hover:opacity-[0.14] transition"
                  style={{ backgroundColor: c.color || '#0ea5e9' }} />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 relative"
                  style={{ backgroundColor: (c.color || '#0ea5e9') + '18', color: c.color || '#0ea5e9' }}>
                  <Icon name={c.icon} className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-900 mb-0.5">{c.name}</div>
                <div className="text-xs text-slate-500">{c.services_count || 0} خدمة متاحة</div>
                <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition absolute top-5 left-5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

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
    <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3 text-center">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-[11px] text-white/80">{label}</div>
    </div>
  );
}
