import { useEffect, useMemo, useState } from 'react';
import { Phone, Search, AlertTriangle } from 'lucide-react';
import api from '../lib/api.js';

export default function PublicNumbersPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public-numbers').then((r) => setRows(r.data)).finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const filtered = rows.filter((r) =>
      !q || r.name.includes(q) || r.phone.includes(q) || (r.group_name || '').includes(q)
    );
    const map = {};
    for (const r of filtered) {
      const g = r.group_name || 'أخرى';
      map[g] = map[g] || [];
      map[g].push(r);
    }
    return Object.entries(map);
  }, [rows, q]);

  return (
    <div>
      <div className="bg-gradient-to-bl from-red-50 to-white border-b border-slate-100">
        <div className="container-p py-8">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">أرقام مهمة وطوارئ</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">الأرقام التي قد تحتاجها</h1>
          <p className="text-slate-600 text-sm">اضغط على أي رقم للاتصال مباشرة.</p>
          <div className="mt-4 flex items-center gap-2 bg-white rounded-2xl p-2 border border-slate-200 max-w-md">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input className="flex-1 bg-transparent outline-none px-1" placeholder="ابحث في الأرقام..."
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      <section className="container-p py-8 space-y-8">
        {loading && (
          <div className="text-center text-slate-500">جارٍ التحميل...</div>
        )}
        {!loading && grouped.map(([group, items]) => (
          <div key={group}>
            <h2 className="text-lg font-bold mb-3">{group}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((n) => (
                <a key={n.id} href={`tel:${n.phone}`}
                   className={`card p-4 flex items-center gap-3 hover:shadow-soft transition ${n.is_emergency ? 'border-red-100 bg-red-50/30' : ''}`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${n.is_emergency ? 'bg-red-100 text-red-700' : 'bg-brand-50 text-brand-700'}`}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{n.name}</div>
                    {n.description && <div className="text-xs text-slate-500 truncate">{n.description}</div>}
                  </div>
                  <div dir="ltr" className={`font-mono text-sm font-bold copyable ${n.is_emergency ? 'text-red-700' : 'text-slate-700'}`}>{n.phone}</div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
