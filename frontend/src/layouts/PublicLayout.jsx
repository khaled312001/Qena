import { Outlet, Link, NavLink } from 'react-router-dom';
import { Menu, Phone, Plus, MapPinned, Info, Home, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', label: 'الرئيسية', icon: Home },
  { to: '/numbers', label: 'أرقام مهمة', icon: Phone },
  { to: '/submit', label: 'أضف خدمة', icon: Plus },
  { to: '/about', label: 'عن الموقع', icon: Info },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="container-p flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="دليل قنا" className="w-9 h-9 drop-shadow" />
            <div className="leading-tight">
              <div className="font-extrabold text-slate-900 text-lg">دليل قنا</div>
              <div className="text-[11px] text-slate-500">Qena Guide · مجاناً</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end
                className={({ isActive }) =>
                  `btn-ghost text-sm ${isActive ? 'bg-brand-50 text-brand-700' : ''}`}>
                <l.icon className="w-4 h-4" /> {l.label}
              </NavLink>
            ))}
          </nav>
          <button className="md:hidden btn-ghost" onClick={() => setOpen(true)} aria-label="القائمة">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              className="md:hidden fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}>
              <motion.aside
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl p-4"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                    <img src="/logo.svg" className="w-8 h-8" alt="" />
                    <span className="font-bold">دليل قنا</span>
                  </Link>
                  <button className="btn-ghost" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
                </div>
                <div className="flex flex-col gap-1">
                  {links.map((l) => (
                    <NavLink key={l.to} to={l.to} end onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl ${isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'}`}>
                      <l.icon className="w-5 h-5" /> {l.label}
                    </NavLink>
                  ))}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300 mt-12">
        <div className="container-p py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.svg" className="w-9 h-9" alt="" />
              <div>
                <div className="text-white font-bold text-lg">دليل قنا</div>
                <div className="text-xs text-slate-400">خدمة مجانية لسكان محافظة قنا</div>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              مبادرة خيرية تجمع كل الخدمات والأرقام التي يحتاجها المواطن في محافظة قنا والضواحي في مكان واحد.
            </p>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">روابط سريعة</div>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">مقدمة من</div>
            <a href="https://barmagly.tech/" target="_blank" rel="noreferrer"
               className="text-white font-bold hover:text-brand-300 transition">
              شركة برمجلي
            </a>
            <div className="text-sm text-slate-400 mt-2 leading-6">
              م. أحمد كمال &nbsp;·&nbsp; م. خالد أحمد
              <br/>للتواصل: <a href="tel:01010254819" className="hover:text-white">01010254819</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} دليل قنا · جميع الحقوق محفوظة · مقدمة من
          <a className="px-1 text-brand-300 hover:text-white" href="https://barmagly.tech/" target="_blank" rel="noreferrer">برمجلي</a>
        </div>
      </footer>
    </div>
  );
}
