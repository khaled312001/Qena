import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FolderTree, Phone, Inbox, Check, Clock } from 'lucide-react';
import api from '../../lib/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/stats').then((r) => setStats(r.data)); }, []);

  const tiles = stats ? [
    { label: 'إجمالي الخدمات', value: stats.services, icon: Building2, color: 'bg-brand-50 text-brand-700', to: '/admin/services' },
    { label: 'خدمات معتمدة', value: stats.approved, icon: Check, color: 'bg-emerald-50 text-emerald-700', to: '/admin/services?status=approved' },
    { label: 'قيد المراجعة', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-700', to: '/admin/services?status=pending' },
    { label: 'الأقسام', value: stats.categories, icon: FolderTree, color: 'bg-violet-50 text-violet-700', to: '/admin/categories' },
    { label: 'أرقام عامة', value: stats.numbers, icon: Phone, color: 'bg-rose-50 text-rose-700', to: '/admin/numbers' },
    { label: 'اقتراحات جديدة', value: stats.suggPending, icon: Inbox, color: 'bg-sky-50 text-sky-700', to: '/admin/suggestions' },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">لوحة التحكم</h1>
      <p className="text-slate-500 text-sm mb-6">نظرة عامة على محتوى الدليل</p>

      {!stats && <div className="text-slate-500">جارٍ التحميل...</div>}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {tiles.map((t) => (
            <Link key={t.label} to={t.to} className="card p-4 hover:shadow-soft transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${t.color}`}>
                <t.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-extrabold">{t.value}</div>
              <div className="text-xs text-slate-500">{t.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 card p-6">
        <h2 className="font-bold mb-2">مرحباً بك في لوحة الإدارة</h2>
        <p className="text-slate-600 text-sm leading-7">
          من هنا يمكنك إدارة جميع بيانات دليل قنا: إضافة خدمات وأقسام جديدة، الموافقة على ما يرسله المستخدمون، وإدارة الأرقام العامة.
        </p>
      </div>
    </div>
  );
}
