import { Outlet, Link, NavLink } from 'react-router-dom';
import { Menu, Phone, Plus, Info, Home, X, MapPin, Scroll } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', label: 'الرئيسية', icon: Home },
  { to: '/category/all', label: 'الخدمات', icon: MapPin },
  { to: '/numbers', label: 'أرقام مهمة', icon: Phone },
  { to: '/qena', label: 'عن قنا', icon: Scroll },
  { to: '/submit', label: 'أضف خدمة', icon: Plus },
  { to: '/about', label: 'عن الموقع', icon: Info },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="container-p flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="بوابة قنا" className="w-10 h-10 drop-shadow-sm transition-transform group-hover:scale-105" />
            <div className="leading-tight">
              <div className="font-extrabold text-slate-900 text-lg">بوابة قنا</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <img src="/qena-flag.svg" className="w-4 h-2.5 rounded-[1px]" alt="" />
                عروس الصعيد · مجاناً
              </div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-0.5">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) =>
                  `btn-ghost text-sm ${isActive ? 'bg-brand-50 text-brand-700' : ''}`}>
                <l.icon className="w-4 h-4" /> {l.label}
              </NavLink>
            ))}
          </nav>
          <button className="lg:hidden btn-ghost" onClick={() => setOpen(true)} aria-label="القائمة">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              className="lg:hidden fixed inset-0 z-50 bg-black/40"
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
                    <span className="font-extrabold">بوابة قنا</span>
                  </Link>
                  <button className="btn-ghost" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
                </div>
                <div className="flex flex-col gap-1">
                  {links.map((l) => (
                    <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
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

      <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 mt-12">
        <div className="container-p py-12 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.svg" className="w-11 h-11" alt="" />
              <div>
                <div className="text-white font-extrabold text-xl">بوابة قنا</div>
                <div className="text-xs text-brand-300 flex items-center gap-1 mt-0.5">
                  <img src="/qena-flag.svg" className="w-4 h-2.5 rounded-[1px]" alt="" />
                  عروس الصعيد · Qena Gateway
                </div>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              مبادرة خيرية مجانية تجمع كل الخدمات والأرقام المهمة التي يحتاجها المواطن في محافظة قنا — مستشفيات، فنادق، مطاعم، أرقام طوارئ، ومعالم سياحية — في مكان واحد.
            </p>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">روابط سريعة</div>
            <ul className="space-y-2 text-sm">
              {links.slice(0, 5).map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition flex items-center gap-2">
                    <l.icon className="w-3.5 h-3.5" /> {l.label}
                  </Link>
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
            <div className="text-sm text-slate-400 mt-2 leading-7">
              م. أحمد كمال<br/>
              م. خالد أحمد<br/>
              <a href="tel:01010254819" dir="ltr" className="hover:text-white">01010254819</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} بوابة قنا · كل الحقوق محفوظة · مقدمة مجاناً من
          <a className="px-1 text-brand-300 hover:text-white" href="https://barmagly.tech/" target="_blank" rel="noreferrer">شركة برمجلي</a>
        </div>
      </footer>
    </div>
  );
}
