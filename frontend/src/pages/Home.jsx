import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Phone, Plus, ChevronLeft, Star } from 'lucide-react';
import api from '../lib/api.js';
import { Icon } from '../lib/icons.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import EmergencyStrip from '../components/EmergencyStrip.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/categories/with-counts'),
      api.get('/services', { params: { featured: '1', limit: 6, includeCategory: '1' } }),
    ]).then(([c, f]) => {
      setCategories(c.data);
      setFeatured(f.data.rows);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-brand-600 via-brand-700 to-brand-900" />
        <div className="absolute inset-0 opacity-20"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="container-p relative py-14 md:py-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur mb-4">
              <Star className="w-3.5 h-3.5" /> خدمة مجانية لسكان محافظة قنا
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
              كل ما تحتاجه في قنا<br />
              <span className="text-brand-200">في مكان واحد</span>
            </h1>
            <p className="text-white/90 text-base md:text-lg leading-7">
              مستشفيات · صيدليات · فنادق · مطاعم · أرقام طوارئ وخدمات حكومية — دليل مجاني مقدم من شركة برمجلي.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); if (q.trim()) location.assign(`/category/all?q=${encodeURIComponent(q)}`); }}
              className="mt-6 flex items-center gap-2 bg-white rounded-2xl p-2 shadow-soft max-w-xl">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 px-1"
                placeholder="ابحث عن مستشفى، فندق، مطعم..." />
              <button type="submit" className="btn-primary">بحث</button>
            </form>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link to="/numbers" className="btn bg-white/15 text-white hover:bg-white/25 backdrop-blur">
                <Phone className="w-4 h-4" /> أرقام مهمة
              </Link>
              <Link to="/submit" className="btn bg-white text-brand-700 hover:bg-brand-50">
                <Plus className="w-4 h-4" /> أضف خدمة جديدة
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <EmergencyStrip />

      <section className="container-p py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">أقسام الدليل</h2>
            <p className="text-sm text-slate-500 mt-1">اختر القسم لتصفح الخدمات المتاحة</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 h-28 animate-pulse bg-slate-100" />
          ))}
          {!loading && categories.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}>
              <Link to={`/category/${c.slug}`}
                className="card p-4 h-full flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-soft transition group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                     style={{ backgroundColor: (c.color || '#0ea5e9') + '15', color: c.color || '#0ea5e9' }}>
                  <Icon name={c.icon} className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.services_count || 0} خدمة</div>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-p py-6">
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-2xl font-bold text-slate-900">خدمات مميزة</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((s) => (<ServiceCard key={s.id} s={s} />))}
          </div>
        </section>
      )}

      <section className="container-p py-14">
        <div className="card p-6 md:p-8 bg-gradient-to-bl from-brand-50 to-white border-brand-100">
          <div className="md:flex items-center justify-between gap-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                هل تعرف خدمة غير موجودة في الدليل؟
              </h3>
              <p className="text-slate-600 text-sm leading-6">
                ساعدنا نخدم أهل قنا. أضف بيانات أي خدمة وسيتم مراجعتها ونشرها بواسطة الإدارة.
              </p>
            </div>
            <Link to="/submit" className="btn-primary mt-4 md:mt-0 shrink-0">
              <Plus className="w-4 h-4" /> أضف خدمة الآن
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
