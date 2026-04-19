import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Phone, Plus, Info, Home, X, MapPin, Scroll } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', label: 'الرئيسية', icon: Home },
  { to: '/category/all', label: 'الخدمات', icon: MapPin },
  { to: '/numbers', label: 'أرقام مهمة', icon: Phone },
  { to: '/qena', label: 'عن قنا', icon: Scroll },
  { to: '/submit', label: 'أضف خدمة', icon: Plus },
  { to: '/about', label: 'عن الموقع', icon: Info },
];

// Bottom tab bar on mobile — main 5 destinations
const tabBarLinks = [
  { to: '/', label: 'الرئيسية', icon: Home, end: true },
  { to: '/category/all', label: 'الخدمات', icon: MapPin },
  { to: '/numbers', label: 'أرقام', icon: Phone },
  { to: '/submit', label: 'أضف', icon: Plus },
  { to: '/qena', label: 'قنا', icon: Scroll },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barmagly attribution bar */}
      <div className="bg-gradient-to-l from-brand-900 via-brand-800 to-brand-900 text-white text-[11px] sm:text-xs">
        <div className="container-p flex items-center justify-between h-9 gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="hidden sm:inline">🎁 خدمة مجانية لكل سكان محافظة قنا — مقدمة من</span>
            <span className="sm:hidden">🎁 مجاناً من</span>
            <a href="https://barmagly.tech/" target="_blank" rel="noreferrer"
               className="font-bold hover:text-amber-300 transition">شركة برمجلي</a>
          </div>
          <a href="tel:01010254819" dir="ltr" className="hidden sm:inline-flex items-center gap-1 hover:text-amber-300 transition">
            <Phone className="w-3 h-3" /> 01010254819
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="container-p flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <img src="/logo.svg" alt="قناوي" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-sm transition-transform group-hover:scale-105" />
            <div className="leading-tight min-w-0">
              <div className="font-extrabold text-slate-900 text-base sm:text-lg">قناوي</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 truncate">
                <img src="/qena-coat.jpg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] object-cover" alt="" />
                دليل قنا · عروس الصعيد
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
          <button className="lg:hidden btn-ghost min-h-11 min-w-11" onClick={() => setOpen(true)} aria-label="القائمة">
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
                className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-xl p-4 pt-[max(1rem,env(safe-area-inset-top))] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                    <img src="/logo.svg" className="w-9 h-9" alt="" />
                    <div className="leading-tight">
                      <div className="font-extrabold">قناوي</div>
                      <div className="text-[10px] text-slate-500">دليل قنا</div>
                    </div>
                  </Link>
                  <button className="btn-ghost min-h-11 min-w-11" onClick={() => setOpen(false)} aria-label="إغلاق"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex flex-col gap-1">
                  {links.map((l) => (
                    <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-xl ${isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'}`}>
                      <l.icon className="w-5 h-5" /> {l.label}
                    </NavLink>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-2 text-center font-semibold">تواصل مع شركة برمجلي</div>
                  <div className="grid gap-2">
                    <a href="tel:01010254819" dir="ltr"
                       className="btn bg-amber-500 text-slate-900 hover:bg-amber-400 w-full justify-center font-bold">
                      <Phone className="w-4 h-4" /> شركة برمجلي · 01010254819
                    </a>
                    <a href="tel:+201060049287" dir="ltr"
                       className="btn bg-emerald-600 text-white hover:bg-emerald-500 w-full justify-center">
                      <Phone className="w-4 h-4" /> م. أحمد كمال · +20 10 6004 9287
                    </a>
                    <a href="tel:+201204593124" dir="ltr"
                       className="btn bg-emerald-600 text-white hover:bg-emerald-500 w-full justify-center">
                      <Phone className="w-4 h-4" /> م. خالد أحمد · +20 12 0459 3124
                    </a>
                  </div>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 pb-[calc(68px+env(safe-area-inset-bottom))] lg:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 mt-12">
        <div className="bg-gradient-to-l from-amber-500 via-amber-600 to-amber-500 text-slate-900">
          <div className="container-p py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
            <div className="font-bold text-sm md:text-base">
              🎁 هذا الموقع مجاني بالكامل — مصمم ومقدم من{' '}
              <a href="https://barmagly.tech/" target="_blank" rel="noreferrer" className="underline decoration-dotted hover:text-amber-900">شركة برمجلي</a>{' '}
              هدية لسكان محافظة قنا
            </div>
            <a href="tel:01010254819" dir="ltr" className="inline-flex items-center gap-2 bg-slate-900 text-amber-300 px-4 py-1.5 rounded-full font-bold hover:bg-slate-800 transition whitespace-nowrap">
              <Phone className="w-4 h-4" /> 01010254819
            </a>
          </div>
        </div>
        <div className="container-p py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="sm:col-span-2 md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.svg" className="w-11 h-11" alt="" />
              <div>
                <div className="text-white font-extrabold text-xl">قناوي</div>
                <div className="text-xs text-brand-300 flex items-center gap-1 mt-0.5">
                  <img src="/qena-coat.jpg" className="w-4 h-4 rounded-[2px] object-cover" alt="" />
                  دليل قنا · Qinawy.com
                </div>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-400">
              مبادرة خيرية مجانية تجمع كل الخدمات والأرقام المهمة التي يحتاجها المواطن في محافظة قنا — مستشفيات، فنادق، مطاعم، أرقام طوارئ، ومعالم سياحية — في مكان واحد. مصممة ومقدمة مجاناً من{' '}
              <a href="https://barmagly.tech/" target="_blank" rel="noreferrer" className="text-amber-300 hover:text-amber-200 font-semibold">شركة برمجلي</a>.
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
            <div className="mt-3 space-y-2">
              <a href="tel:01010254819" dir="ltr"
                 className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 text-xs font-bold px-3 py-2 rounded-lg transition w-full justify-center shadow-sm">
                <Phone className="w-3.5 h-3.5" />
                <span>شركة برمجلي · 01010254819</span>
              </a>
              <div>
                <div className="text-[11px] text-slate-400 mb-1">م. أحمد كمال — مؤسس</div>
                <a href="tel:+201060049287" dir="ltr"
                   className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition w-full justify-center shadow-sm">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+20 10 6004 9287</span>
                </a>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 mb-1">م. خالد أحمد — مؤسس</div>
                <a href="tel:+201204593124" dir="ltr"
                   className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition w-full justify-center shadow-sm">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+20 12 0459 3124</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500 px-4">
          © {new Date().getFullYear()} قناوي · qinawy.com · كل الحقوق محفوظة · مقدمة مجاناً من
          <a className="px-1 text-brand-300 hover:text-white" href="https://barmagly.tech/" target="_blank" rel="noreferrer">شركة برمجلي</a>
        </div>
      </footer>

      {/* Mobile bottom tab bar (app-like) */}
      <nav aria-label="التنقل السريع"
           className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {tabBarLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition ${isActive ? 'text-brand-700' : 'text-slate-500 hover:text-brand-600'}`
              }>
              {({ isActive }) => (
                <>
                  <span className={`flex items-center justify-center w-10 h-7 rounded-full transition ${isActive ? 'bg-brand-50' : ''}`}>
                    <l.icon className="w-5 h-5" />
                  </span>
                  <span>{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
