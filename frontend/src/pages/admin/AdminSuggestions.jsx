import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, X, Trash2, Clock, Inbox, Phone, MapPin, Building2, Edit, AlertCircle } from 'lucide-react';
import api from '../../lib/api.js';

const KIND = { new_service: 'خدمة جديدة', correction: 'تصحيح', complaint: 'شكوى', other: 'أخرى' };
const STATUS = { pending: 'قيد المراجعة', reviewed: 'تمت المراجعة', rejected: 'مرفوضة', approved: 'منشورة' };

export default function AdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);
  const [tab, setTab] = useState('all');  // all | services | suggestions
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [sugg, svc] = await Promise.all([
        api.get('/suggestions', { params: statusFilter ? { status: statusFilter } : {} }),
        // Always load pending services when viewing "pending" filter
        statusFilter === 'pending' || !statusFilter
          ? api.get('/services', { params: { status: 'pending', limit: 200, includeCategory: '1' } })
          : Promise.resolve({ data: { rows: [] } }),
      ]);
      setSuggestions(sugg.data);
      setPendingServices(svc.data.rows || []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [statusFilter]);

  async function setSuggStatus(row, status) {
    await api.put(`/suggestions/${row.id}`, { status });
    toast.success('تم التحديث'); load();
  }
  async function delSugg(row) {
    if (!confirm('حذف هذا الاقتراح؟')) return;
    await api.delete(`/suggestions/${row.id}`);
    toast.success('تم الحذف'); load();
  }
  async function approveService(s) {
    await api.post(`/services/${s.id}/approve`);
    toast.success('تم نشر الخدمة'); load();
  }
  async function rejectService(s) {
    await api.post(`/services/${s.id}/reject`);
    toast.success('تم الرفض'); load();
  }
  async function delService(s) {
    if (!confirm(`حذف ${s.name}؟`)) return;
    await api.delete(`/services/${s.id}`);
    toast.success('تم الحذف'); load();
  }

  const showServices = (tab === 'all' || tab === 'services') && (statusFilter === 'pending' || !statusFilter);
  const showSuggestions = tab === 'all' || tab === 'suggestions';

  const totalPending = pendingServices.length + suggestions.filter((s) => s.status === 'pending').length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">المراجعات الإدارية</h1>
          <p className="text-slate-500 text-sm mt-1">
            الخدمات الجديدة من المستخدمين + الاقتراحات والشكاوى
          </p>
        </div>
        {totalPending > 0 && (
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full text-sm font-bold">
            <AlertCircle className="w-4 h-4" /> {totalPending} عنصر يحتاج مراجعتك
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="card p-2 mb-4 flex flex-wrap gap-1.5">
        <Tab active={tab === 'all'} onClick={() => setTab('all')} label="الكل" count={pendingServices.length + suggestions.length} />
        <Tab active={tab === 'services'} onClick={() => setTab('services')} label="خدمات جديدة" count={pendingServices.length} icon={Building2} color="brand" />
        <Tab active={tab === 'suggestions'} onClick={() => setTab('suggestions')} label="اقتراحات وشكاوى" count={suggestions.length} icon={Inbox} color="amber" />
      </div>

      {/* Status filter */}
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600">الحالة:</span>
        {['pending', 'reviewed', 'rejected', ''].map((s) => (
          <button key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm transition ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>
            {s ? STATUS[s] : 'الكل'}
          </button>
        ))}
      </div>

      {loading && <div className="text-center text-slate-500 py-8">جارٍ التحميل...</div>}

      {!loading && (
        <div className="space-y-6">
          {/* Pending Services Section */}
          {showServices && pendingServices.length > 0 && (
            <div>
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-700" />
                خدمات جديدة من المستخدمين ({pendingServices.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {pendingServices.map((s) => (
                  <ServiceCard key={s.id} s={s} onApprove={approveService} onReject={rejectService} onDelete={delService} />
                ))}
              </div>
            </div>
          )}

          {/* Suggestions Section */}
          {showSuggestions && (
            <div>
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Inbox className="w-5 h-5 text-amber-700" />
                اقتراحات وشكاوى ({suggestions.length})
              </h2>
              {suggestions.length === 0 ? (
                <div className="card p-10 text-center text-slate-500">
                  <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  لا توجد اقتراحات بهذه الحالة
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {suggestions.map((r) => (
                    <SuggestionCard key={r.id} r={r} onStatus={setSuggStatus} onDelete={delSugg} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state when no services AND showing "all" or "services" tab */}
          {!loading && showServices && pendingServices.length === 0 && tab === 'services' && (
            <div className="card p-10 text-center text-slate-500">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              لا توجد خدمات جديدة قيد المراجعة
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Tab({ active, onClick, label, count, icon: Ic, color = 'brand' }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
        active ? `bg-${color}-600 text-white shadow-sm` : 'hover:bg-slate-100 text-slate-700'
      }`}>
      {Ic && <Ic className="w-4 h-4" />}
      {label}
      {count > 0 && (
        <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
          active ? 'bg-white text-slate-900' : 'bg-amber-500 text-white'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function ServiceCard({ s, onApprove, onReject, onDelete }) {
  const cat = s.category || {};
  return (
    <div className="card p-4 border-r-4 border-r-brand-500">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="chip bg-brand-50 text-brand-700 border border-brand-100">خدمة جديدة</span>
            {cat.name && <span className="chip">{cat.name}</span>}
            <span className="chip bg-amber-50 text-amber-700">قيد المراجعة</span>
          </div>
          <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
            <Clock className="w-3 h-3 inline" /> {new Date(s.created_at).toLocaleString('ar-EG')}
          </div>
        </div>
      </div>
      {s.description && (
        <p className="text-sm text-slate-700 leading-6 line-clamp-3 mb-2">{s.description}</p>
      )}
      <div className="text-xs text-slate-600 space-y-1 mb-3">
        {s.address && <div className="flex items-start gap-1.5"><MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {s.address}</div>}
        {s.phone && <div className="flex items-center gap-1.5" dir="ltr"><Phone className="w-3 h-3" /> {s.phone}</div>}
        {(s.submitted_by_name || s.submitted_by_contact) && (
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 mt-1">
            أرسلها: {s.submitted_by_name || '—'} · تواصل: <span dir="ltr">{s.submitted_by_contact || '—'}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 justify-end flex-wrap">
        <button onClick={() => onApprove(s)}
          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition">
          <Check className="w-3.5 h-3.5" /> نشر
        </button>
        <button onClick={() => onReject(s)}
          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium transition">
          <X className="w-3.5 h-3.5" /> رفض
        </button>
        <Link to={`/admin/services?edit=${s.id}`}
          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium transition">
          <Edit className="w-3.5 h-3.5" /> تعديل
        </Link>
        <button onClick={() => onDelete(s)} className="btn-ghost text-red-600 !p-1.5">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SuggestionCard({ r, onStatus, onDelete }) {
  return (
    <div className="card p-4 border-r-4 border-r-amber-400">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="chip">{KIND[r.kind] || r.kind}</span>
            <span className={`chip ${r.status === 'pending' ? 'bg-amber-50 text-amber-700' : r.status === 'reviewed' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {STATUS[r.status]}
            </span>
          </div>
          <h3 className="font-bold text-slate-900">{r.subject || '(بدون عنوان)'}</h3>
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
          <button onClick={() => onStatus(r, 'reviewed')} className="btn-outline text-emerald-700 text-xs !py-1.5 !px-2.5">
            <Check className="w-3.5 h-3.5" /> مراجعة
          </button>
        )}
        {r.status !== 'rejected' && (
          <button onClick={() => onStatus(r, 'rejected')} className="btn-outline text-red-700 text-xs !py-1.5 !px-2.5">
            <X className="w-3.5 h-3.5" /> رفض
          </button>
        )}
        <button onClick={() => onDelete(r)} className="btn-ghost text-red-600 !p-1.5"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
