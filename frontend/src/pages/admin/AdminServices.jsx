import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Check, X, Star, Search, MapPin } from 'lucide-react';
import api from '../../lib/api.js';

const STATUSES = [
  { v: 'all', l: 'الكل' },
  { v: 'approved', l: 'منشورة' },
  { v: 'pending', l: 'قيد المراجعة' },
  { v: 'rejected', l: 'مرفوضة' },
];

export default function AdminServices() {
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [status, setStatus] = useState(params.get('status') || 'all');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const p = { includeCategory: '1', limit: 200 };
    if (status !== 'all') p.status = status;
    if (q) p.q = q;
    const r = await api.get('/services', { params: p });
    setRows(r.data.rows);
    setLoading(false);
  }

  useEffect(() => { load(); }, [status]);
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);

  async function approve(s) { await api.post(`/services/${s.id}/approve`); toast.success('تم النشر'); load(); }
  async function reject(s) { await api.post(`/services/${s.id}/reject`); toast.success('تم الرفض'); load(); }
  async function del(s) {
    if (!confirm(`حذف ${s.name}؟`)) return;
    await api.delete(`/services/${s.id}`); toast.success('تم الحذف'); load();
  }
  async function save(form) {
    try {
      if (form.id) await api.put(`/services/${form.id}`, form);
      else await api.post('/services', { ...form, status: 'approved' });
      toast.success('تم الحفظ'); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'خطأ'); }
  }
  async function toggleFeatured(s) {
    await api.put(`/services/${s.id}`, { is_featured: !s.is_featured });
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">الخدمات</h1>
        <button className="btn-primary" onClick={() => setEditing({ status: 'approved', category_id: cats[0]?.id })}>
          <Plus className="w-4 h-4" /> إضافة خدمة
        </button>
      </div>

      <div className="card p-3 md:p-4 flex flex-wrap items-center gap-2 mb-4">
        {STATUSES.map((s) => (
          <button key={s.v}
            onClick={() => { setStatus(s.v); setParams(s.v === 'all' ? {} : { status: s.v }); }}
            className={`px-3 py-1.5 rounded-full text-sm ${status === s.v ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
            {s.l}
          </button>
        ))}
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-2 py-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input className="outline-none px-1 text-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث..." />
          </div>
          <button className="btn-outline" type="submit">بحث</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">القسم</th>
              <th className="p-3 text-right">العنوان</th>
              <th className="p-3 text-right">الهاتف</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6" className="p-6 text-center text-slate-500">جارٍ التحميل...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-slate-500">لا توجد نتائج</td></tr>}
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFeatured(s)} className={s.is_featured ? 'text-amber-500' : 'text-slate-300'}>
                      <Star className={`w-4 h-4 ${s.is_featured ? 'fill-amber-500' : ''}`} />
                    </button>
                    <span className="font-semibold">{s.name}</span>
                  </div>
                </td>
                <td className="p-3 text-slate-600">{s.category?.name}</td>
                <td className="p-3 text-slate-600">
                  {s.address ? (<span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.address}</span>) : '—'}
                </td>
                <td className="p-3 text-slate-600" dir="ltr">{s.phone || '—'}</td>
                <td className="p-3">
                  <span className={`chip ${
                    s.status === 'approved' ? 'bg-emerald-50 text-emerald-700'
                    : s.status === 'pending' ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'}`}>
                    {s.status === 'approved' ? 'منشورة' : s.status === 'pending' ? 'قيد المراجعة' : 'مرفوضة'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1 justify-end">
                    {s.status === 'pending' && (
                      <>
                        <button onClick={() => approve(s)} className="btn-ghost text-emerald-600" title="نشر"><Check className="w-4 h-4" /></button>
                        <button onClick={() => reject(s)} className="btn-ghost text-red-600" title="رفض"><X className="w-4 h-4" /></button>
                      </>
                    )}
                    <button onClick={() => setEditing(s)} className="btn-ghost" title="تعديل"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => del(s)} className="btn-ghost text-red-600" title="حذف"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ServiceEditor
          value={editing} cats={cats}
          onClose={() => setEditing(null)}
          onSave={save} />
      )}
    </div>
  );
}

function ServiceEditor({ value, cats, onClose, onSave }) {
  const [f, setF] = useState({
    id: value.id, name: value.name || '', description: value.description || '',
    category_id: value.category_id || cats[0]?.id,
    city: value.city || 'قنا', address: value.address || '',
    phone: value.phone || '', alt_phone: value.alt_phone || '', whatsapp: value.whatsapp || '',
    working_hours: value.working_hours || '', price_range: value.price_range || '',
    website: value.website || '', tags: value.tags || '',
    lat: value.lat || '', lng: value.lng || '',
    is_featured: !!value.is_featured, status: value.status || 'approved',
  });
  const update = (k, v) => setF({ ...f, [k]: v });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-bold">{f.id ? 'تعديل خدمة' : 'إضافة خدمة'}</h3>
          <button onClick={onClose} className="btn-ghost"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="p-4 md:p-5 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <L label="الاسم *"><input className="input" value={f.name} onChange={(e) => update('name', e.target.value)} required /></L>
            <L label="القسم *">
              <select className="input" value={f.category_id} onChange={(e) => update('category_id', Number(e.target.value))} required>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </L>
          </div>
          <L label="الوصف"><textarea className="input min-h-[80px]" value={f.description} onChange={(e) => update('description', e.target.value)} /></L>
          <div className="grid md:grid-cols-2 gap-3">
            <L label="المدينة"><input className="input" value={f.city} onChange={(e) => update('city', e.target.value)} /></L>
            <L label="العنوان"><input className="input" value={f.address} onChange={(e) => update('address', e.target.value)} /></L>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <L label="هاتف"><input dir="ltr" className="input" value={f.phone} onChange={(e) => update('phone', e.target.value)} /></L>
            <L label="هاتف آخر"><input dir="ltr" className="input" value={f.alt_phone} onChange={(e) => update('alt_phone', e.target.value)} /></L>
            <L label="واتساب"><input dir="ltr" className="input" value={f.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} /></L>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <L label="مواعيد العمل"><input className="input" value={f.working_hours} onChange={(e) => update('working_hours', e.target.value)} /></L>
            <L label="الأسعار"><input className="input" value={f.price_range} onChange={(e) => update('price_range', e.target.value)} /></L>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <L label="الموقع الإلكتروني"><input dir="ltr" className="input" value={f.website} onChange={(e) => update('website', e.target.value)} /></L>
            <L label="وسوم (كلمات مفتاحية)"><input className="input" value={f.tags} onChange={(e) => update('tags', e.target.value)} /></L>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <L label="خط العرض (lat)"><input dir="ltr" className="input" value={f.lat} onChange={(e) => update('lat', e.target.value)} /></L>
            <L label="خط الطول (lng)"><input dir="ltr" className="input" value={f.lng} onChange={(e) => update('lng', e.target.value)} /></L>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <L label="الحالة">
              <select className="input" value={f.status} onChange={(e) => update('status', e.target.value)}>
                <option value="approved">منشورة</option>
                <option value="pending">قيد المراجعة</option>
                <option value="rejected">مرفوضة</option>
              </select>
            </L>
            <label className="flex items-center gap-2 mt-7">
              <input type="checkbox" checked={f.is_featured} onChange={(e) => update('is_featured', e.target.checked)} />
              <span className="text-sm">خدمة مميزة</span>
            </label>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button className="btn-primary">حفظ</button>
            <button type="button" onClick={onClose} className="btn-outline">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function L({ label, children }) {
  return <label className="block text-sm"><span className="block mb-1 text-slate-700">{label}</span>{children}</label>;
}
