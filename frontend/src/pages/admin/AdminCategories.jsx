import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../lib/api.js';
import { Icon, ICON_MAP } from '../../lib/icons.jsx';

export default function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    const r = await api.get('/categories');
    setRows(r.data);
  }
  useEffect(() => { load(); }, []);

  async function save(f) {
    try {
      if (f.id) await api.put(`/categories/${f.id}`, f);
      else await api.post('/categories', f);
      toast.success('تم الحفظ'); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'خطأ'); }
  }
  async function del(c) {
    if (!confirm(`حذف ${c.name}؟ (الخدمات التابعة لن تُحذف)`)) return;
    await api.delete(`/categories/${c.id}`);
    toast.success('تم الحذف'); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">الأقسام</h1>
        <button className="btn-primary" onClick={() => setEditing({ icon: 'MapPin', color: '#0ea5e9', sort_order: rows.length + 1, is_active: true })}>
          <Plus className="w-4 h-4" /> إضافة قسم
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((c) => (
          <div key={c.id} className="card p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: (c.color || '#0ea5e9') + '15', color: c.color || '#0ea5e9' }}>
              <Icon name={c.icon} className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-slate-500">/{c.slug}</div>
            </div>
            <button onClick={() => setEditing(c)} className="btn-ghost"><Edit className="w-4 h-4" /></button>
            <button onClick={() => del(c)} className="btn-ghost text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {editing && <CatEditor v={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function CatEditor({ v, onClose, onSave }) {
  const [f, setF] = useState({
    id: v.id, slug: v.slug || '', name: v.name || '', description: v.description || '',
    icon: v.icon || 'MapPin', color: v.color || '#0ea5e9',
    sort_order: v.sort_order || 0, is_active: v.is_active !== false,
  });
  const update = (k, val) => setF({ ...f, [k]: val });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold">{f.id ? 'تعديل قسم' : 'إضافة قسم'}</h3>
          <button onClick={onClose} className="btn-ghost"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="p-5 space-y-3">
          <label className="block"><span className="text-sm">الاسم *</span>
            <input className="input mt-1" value={f.name} onChange={(e) => update('name', e.target.value)} required /></label>
          <label className="block"><span className="text-sm">الرابط المختصر (slug)</span>
            <input dir="ltr" className="input mt-1" value={f.slug} onChange={(e) => update('slug', e.target.value)}
              placeholder="يولد تلقائياً لو فاضي" /></label>
          <label className="block"><span className="text-sm">الوصف</span>
            <textarea className="input mt-1" value={f.description} onChange={(e) => update('description', e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-sm">الأيقونة</span>
              <select className="input mt-1" value={f.icon} onChange={(e) => update('icon', e.target.value)}>
                {Object.keys(ICON_MAP).map((k) => <option key={k} value={k}>{k}</option>)}
              </select></label>
            <label className="block"><span className="text-sm">اللون</span>
              <input type="color" className="input mt-1 h-[42px]" value={f.color} onChange={(e) => update('color', e.target.value)} /></label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-sm">الترتيب</span>
              <input type="number" className="input mt-1" value={f.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} /></label>
            <label className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={f.is_active} onChange={(e) => update('is_active', e.target.checked)} />
              <span className="text-sm">نشط</span>
            </label>
          </div>
          <div className="pt-2"><button className="btn-primary">حفظ</button></div>
        </form>
      </div>
    </div>
  );
}
