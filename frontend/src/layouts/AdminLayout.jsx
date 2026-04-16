import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LayoutDashboard, FolderTree, Building2, Phone, Inbox, LogOut, Menu, X } from 'lucide-react';
import api from '../lib/api.js';

const navItems = [
  { to: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, end: true },
  { to: '/admin/services', label: 'الخدمات', icon: Building2 },
  { to: '/admin/categories', label: 'الأقسام', icon: FolderTree },
  { to: '/admin/numbers', label: 'الأرقام العامة', icon: Phone },
  { to: '/admin/suggestions', label: 'الاقتراحات', icon: Inbox },
];

export default function AdminLayout() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('qena_token');
    if (!t) { nav('/admin/login'); return; }
    api.get('/auth/me').then((r) => setMe(r.data)).catch(() => nav('/admin/login'));
  }, []);

  function logout() {
    localStorage.removeItem('qena_token');
    nav('/admin/login');
  }

  if (!me) return <div className="p-8 text-center text-slate-500">جارٍ التحميل...</div>;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className={`fixed lg:static inset-y-0 right-0 z-40 w-72 bg-white border-l border-slate-100 transition-transform ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 px-5 flex items-center gap-2.5 border-b border-slate-100">
          <img src="/logo.svg" alt="" className="w-8 h-8" />
          <div className="leading-tight">
            <div className="font-bold">دليل قنا</div>
            <div className="text-xs text-slate-500">لوحة الإدارة</div>
          </div>
          <button className="ml-auto lg:hidden btn-ghost" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((i) => (
            <NavLink key={i.to} to={i.to} end={i.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
              <i.icon className="w-5 h-5" /> {i.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
              {me.username?.[0]?.toUpperCase()}
            </div>
            <div className="text-sm">
              <div className="font-semibold">{me.display_name || me.username}</div>
              <div className="text-slate-500 text-xs">{me.role}</div>
            </div>
          </div>
          <button onClick={logout} className="btn-outline w-full justify-center text-sm">
            <LogOut className="w-4 h-4" /> تسجيل خروج
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-6 sticky top-0 z-10">
          <button className="lg:hidden btn-ghost mr-2" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button>
          <Link to="/" target="_blank" className="text-sm text-slate-600 hover:text-brand-700">فتح الموقع ↗</Link>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
