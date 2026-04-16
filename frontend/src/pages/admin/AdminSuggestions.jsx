import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X, Trash2, Clock } from 'lucide-react';
import api from '../../lib/api.js';

export default function AdminSuggestions() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('pending');

  async function load() {
    const r = await api.get('/suggestions', { params: filter ? { status: filter } : {} });
    setRows(r.data);
  }
  useEffect(() => { load(); }, [filter]);

  async function setStatus(row, status) {
    await api.put(`/suggestions/${row.id}`, { status });
    toast.success('تم التحديث'); load();
  }
  async function del(row) {
    if (!confirm('حذف هذا الاقتراح؟')) return;
    await api.delete(`/suggestions/${row.id}`);
    toast.success('تم الحذف'); load();
  }

  const LABEL = { pending: 'قيد المراجعة', reviewed: 'تمت المراجعة', rejected: 'مرفوضة' };
  const KIND = { new_service: 'خدمة جديدة', correction: 'تصحيح', complaint: 'شكوى', other: 'أخرى' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">الاقتراحات والشكاوى</h1>

      <div className="card p-3 md:p-4 mb-4 flex flex-wrap gap-2">
        {['pending', 'reviewed', 'rejected', ''].map((s) => (
          <button key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm ${filter === s ? 'bg-brand-600 text-white' : 'bg-slate-100'}`}>
            {s ? LABEL[s] : 'الكل'}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {rows.length === 0 && <div className="card p-6 text-center text-slate-500 col-span-2">لا توجد اقتراحات</div>}
        {rows.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="chip">{KIND[r.kind] || r.kind}</span>
                  <span className={`chip ${r.status === 'pending' ? 'bg-amber-50 text-amber-700' : r.status === 'reviewed' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {LABEL[r.status]}
                  </span>
                </div>
                <h3 className="font-bold">{r.subject || '(بدون عنوان)'}</h3>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(r.created_at).toLocaleString('ar-EG')}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-6 whitespace-pre-wrap">{r.message}</p>
            {(r.name || r.contact) && (
              <div className="mt-3 text-xs text-slate-500">
                من: {r.name || '—'} · تواصل: <span dir="ltr">{r.contact || '—'}</span>
              </div>
            )}
            <div className="mt-3 flex items-center gap-1 justify-end">
              {r.status !== 'reviewed' && (
                <button onClick={() => setStatus(r, 'reviewed')} className="btn-outline text-emerald-700 text-sm">
                  <Check className="w-4 h-4" /> مراجعة
                </button>
              )}
              {r.status !== 'rejected' && (
                <button onClick={() => setStatus(r, 'rejected')} className="btn-outline text-red-700 text-sm">
                  <X className="w-4 h-4" /> رفض
                </button>
              )}
              <button onClick={() => del(r)} className="btn-ghost text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
