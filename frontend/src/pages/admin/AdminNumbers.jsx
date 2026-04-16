import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Phone } from 'lucide-react';
import api from '../../lib/api.js';

export default function AdminNumbers() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() {
    const r = await api.get('/public-numbers');
    setRows(r.data);
  }
  useEffect(() => { load(); }, []);

  async function save(f) {
    try {
      if (f.id) await api.put(`/public-numbers/${f.id}`, f);
      else await api.post('/public-numbers', f);
      toast.success('تم الحفظ'); setEditing(null); load();
    } catch (e) { toast.error(e.response?.data?.error || 'خطأ'); }
  }
  async function del(n) {
    if (!confirm(`حذف ${n.name}؟`)) return;
    await api.delete(`/public-numbers/${n.id}`);
    toast.success('تم الحذف'); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">الأرقام العامة</h1>
        <button className="btn-primary" onClick={() => setEditing({ group_name: 'طوارئ', is_active: true })}>
          <Plus className="w-4 h-4" /> إضافة رقم
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-right">الاسم</th>
              <th className="p-3 text-right">الرقم</th>
              <th className="p-3 text-right">المجموعة</th>
              <th className="p-3 text-right">طوارئ</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((n) => (
              <tr key={n.id} className="border-t border-slate-100">
                <td className="p-3 font-semibold">{n.name}</td>
                <td className="p-3" dir="ltr">{n.phone}</td>
                <td className="p-3 text-slate-600">{n.group_name}</td>
                <td className="p-3">{n.is_emergency ? '✓' : ''}</td>
                <td className="p-3 text-end">
                  <button onClick={() => setEditing(n)} className="btn-ghost"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => del(n)} className="btn-ghost text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <NumEditor v={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function NumEditor({ v, onClose, onSave }) {
  const [f, setF] = useState({
    id: v.id, name: v.name || '', phone: v.phone || '',
    group_name: v.group_name || 'طوارئ', description: v.description || '',
    is_emergency: !!v.is_emergency, sort_order: v.sort_order || 0, is_active: v.is_active !== false,
  });
  const up = (k, val) => setF({ ...f, [k]: val });
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold">{f.id ? 'تعديل رقم' : 'إضافة رقم'}</h3>
          <button onClick={onClose} className="btn-ghost"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="p-5 space-y-3">
          <label className="block"><span className="text-sm">الاسم *</span>
            <input className="input mt-1" value={f.name} onChange={(e) => up('name', e.target.value)} required /></label>
          <label className="block"><span className="text-sm">الرقم *</span>
            <input dir="ltr" className="input mt-1" value={f.phone} onChange={(e) => up('phone', e.target.value)} required /></label>
          <label className="block"><span className="text-sm">المجموعة</span>
            <input className="input mt-1" value={f.group_name} onChange={(e) => up('group_name', e.target.value)} /></label>
          <label className="block"><span className="text-sm">الوصف</span>
            <input className="input mt-1" value={f.description} onChange={(e) => up('description', e.target.value)} /></label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={f.is_emergency} onChange={(e) => up('is_emergency', e.target.checked)} />
            <span className="text-sm">رقم طوارئ</span>
          </label>
          <div className="pt-2"><button className="btn-primary">حفظ</button></div>
        </form>
      </div>
    </div>
  );
}
