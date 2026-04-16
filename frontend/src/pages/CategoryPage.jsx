import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import api from '../lib/api.js';
import ServiceCard from '../components/ServiceCard.jsx';
import { Icon } from '../lib/icons.jsx';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { includeCategory: '1', limit: 100 };
    if (slug && slug !== 'all') params.category = slug;
    if (q) params.q = q;
    const jobs = [api.get('/services', { params })];
    if (slug && slug !== 'all') jobs.push(api.get(`/categories/${slug}`));
    Promise.all(jobs)
      .then(([svc, cat]) => {
        setServices(svc.data.rows);
        setCategory(cat ? cat.data : null);
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [slug, q]);

  return (
    <div>
      <div className="bg-gradient-to-bl from-slate-50 to-white border-b border-slate-100">
        <div className="container-p py-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link to="/" className="hover:text-brand-600">الرئيسية</Link>
            <ChevronRight className="w-4 h-4" />
            <span>{category?.name || 'كل الخدمات'}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                   style={{ backgroundColor: (category?.color || '#0ea5e9') + '15', color: category?.color || '#0ea5e9' }}>
                <Icon name={category?.icon} className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{category?.name || 'كل الخدمات'}</h1>
                {category?.description && (
                  <p className="text-slate-500 text-sm mt-1">{category.description}</p>
                )}
              </div>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); setSearchParams(q ? { q } : {}); }}
              className="flex items-center gap-2 bg-white rounded-2xl p-2 border border-slate-200 w-full md:w-96">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input className="flex-1 bg-transparent outline-none px-1" placeholder="ابحث داخل القسم..."
                value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn-primary" type="submit">بحث</button>
            </form>
          </div>
        </div>
      </div>

      <section className="container-p py-8">
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 h-40 bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}
        {!loading && services.length === 0 && (
          <div className="card p-10 text-center text-slate-500">
            لا توجد خدمات حالياً في هذا القسم. ساعدنا بإضافة واحدة من خلال زر
            <Link to="/submit" className="text-brand-600 font-bold px-1">أضف خدمة</Link>.
          </div>
        )}
        {!loading && services.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (<ServiceCard key={s.id} s={s} />))}
          </div>
        )}
      </section>
    </div>
  );
}
