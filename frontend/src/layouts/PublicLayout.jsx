import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Phone, Plus, Info, Home, X, MapPin, Scroll, Navigation, Car, BedDouble } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', label: 'الرئيسية', icon: Home },
  { to: '/nearby', label: 'الأقرب إليك', icon: Navigation },
  { to: '/category/all', label: 'الخدمات', icon: MapPin },
  { to: '/numbers', label: 'أرقام مهمة', icon: Phone },
  { to: '/qena', label: 'عن قنا', icon: Scroll },
  { to: '/submit', label: 'أضف خدمة', icon: Plus },
  { to: '/submit/driver', label: 'سجّل كسائق', icon: Car },
  { to: '/submit/rental', label: 'اعرض سكن', icon: BedDouble },
  { to: '/about', label: 'عن الموقع', icon: Info },
];

// Bottom tab bar on mobile — main 5 destinations
const tabBarLinks = [
  { to: '/', label: 'الرئيسية', icon: Home, end: true },
  { to: '/nearby', label: 'الأقرب', icon: Navigation },
  { to: '/category/all', label: 'الخدمات', icon: MapPin },
  { to: '/numbers', label: 'أرقام', icon: Phone },
  { to: '/submit', label: 'أضف', icon: Plus },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barmagly attribution bar — seamless RTL marquee */}
      <div className="bg-gradient-to-l from-brand-900 via-brand-800 to-brand-900 text-white text-[12px] sm:text-xs relative overflow-hidden">
        <div className="relative h-9 flex items-center"
          style={{
            maskImage: 'linear-gradient(to left, transparent, black 4%, black 96%, transparent)',
            WebkitMaskImage: 'linear-gradient(to left, transparent, black 4%, black 96%, transparent)',
          }}>
          <div className="flex items-center gap-10 w-max topbar-marquee">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
                <span className="opacity-90">دليل قنا الشامل · مقدم من</span>
                <a href="https://barmagly.tech/" target="_blank" rel="noreferrer"
                   className="font-extrabold text-amber-300 hover:text-amber-200 transition">شركة برمجلي</a>
                <span className="opacity-70">|</span>
                <a href="tel:01010254819" dir="ltr" className="inline-flex items-center gap-1 hover:text-amber-300 transition">
                  <Phone className="w-3 h-3" /> <span className="copyable">01010254819</span>
                </a>
                <span className="opacity-60 mx-2">✦</span>
                <a href="https://barmagly.tech/" target="_blank" rel="noreferrer"
                   className="hover:text-amber-300 transition">barmagly.tech</a>
                <span className="opacity-60 mx-2">✦</span>
              </span>
            ))}
          </div>
        </div>
        <style>{`
          .topbar-marquee {
            animation: topbar-rtl 28s linear infinite;
            will-change: transform;
          }
          .topbar-marquee:hover { animation-play-state: paused; }
          @keyframes topbar-rtl {
            from { transform: translate3d(0, 0, 0); }
            to   { transform: translate3d(50%, 0, 0); }
          }
          @media (prefers-reduced-motion: reduce) { .topbar-marquee { animation: none; } }
        `}</style>
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
      </header>

      {/* Mobile drawer — OUTSIDE header because backdrop-blur on header
          creates a containing block that breaks position:fixed */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="lg:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}>
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-[82vw] max-w-[340px] bg-white shadow-2xl flex flex-col overflow-hidden"
              style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-100 bg-gradient-to-bl from-brand-50 to-white shrink-0">
                <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 min-w-0">
                  <img src="/logo.svg" className="w-10 h-10 shrink-0" alt="" />
                  <div className="leading-tight min-w-0">
                    <div className="font-extrabold text-slate-900">قناوي</div>
                    <div className="text-[11px] text-slate-500 truncate">دليل قنا · مجاناً</div>
                  </div>
                </Link>
                <button className="btn-ghost min-h-11 min-w-11 shrink-0" onClick={() => setOpen(false)} aria-label="إغلاق"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 flex-1 flex flex-col gap-1 overflow-y-auto">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-xl text-[15px] ${isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'hover:bg-slate-50'}`}>
                    <l.icon className="w-5 h-5 shrink-0" /> {l.label}
                  </NavLink>
                ))}
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 mb-2 text-center font-semibold">📞 تواصل مع شركة برمجلي</div>
                  <div className="grid gap-2">
                    <a href="tel:01010254819" dir="ltr"
                       className="btn bg-amber-500 text-slate-900 hover:bg-amber-400 w-full justify-center font-bold text-sm">
                      <Phone className="w-4 h-4" /> <span className="copyable">01010254819</span>
                    </a>
                    <a href="tel:+201060049287" dir="ltr"
                       className="btn bg-emerald-600 text-white hover:bg-emerald-500 w-full justify-center text-sm">
                      <Phone className="w-4 h-4" /> م. أحمد — 10 6004 9287
                    </a>
                    <a href="tel:+201204593124" dir="ltr"
                       className="btn bg-emerald-600 text-white hover:bg-emerald-500 w-full justify-center text-sm">
                      <Phone className="w-4 h-4" /> م. خالد — 12 0459 3124
                    </a>
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pb-[calc(68px+env(safe-area-inset-bottom))] lg:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 mt-12">
        {/* Barmagly sponsor banner — clean, minimal, branded */}
        <div className="relative overflow-hidden border-b border-white/5"
             style={{ backgroundImage: 'linear-gradient(110deg, #0f172a 0%, #0c4a6e 45%, #075985 100%)' }}>
          <div className="absolute -top-8 -left-10 w-56 h-56 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute -bottom-8 right-10 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="container-p py-5 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                  <img src="/logo.svg" className="w-7 h-7 sm:w-8 sm:h-8" alt="" />
                </div>
                <div className="leading-tight text-white text-right min-w-0">
                  <div className="text-[11px] sm:text-xs text-brand-200 font-medium">مصمم ومقدم من</div>
                  <a href="https://barmagly.tech/" target="_blank" rel="noreferrer"
                     className="font-extrabold text-base sm:text-lg hover:text-amber-300 transition truncate block">
                    شركة برمجلي
                  </a>
                  <div className="text-[11px] sm:text-xs text-slate-300/80 mt-0.5">مبادرة مجانية لخدمة أهل محافظة قنا</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href="tel:01010254819" dir="ltr"
                   className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 px-4 py-2 rounded-xl font-extrabold shadow-lg shadow-amber-400/20 transition">
                  <Phone className="w-4 h-4" />
                  <span>01010254819</span>
                </a>
                <a href="https://barmagly.tech/" target="_blank" rel="noreferrer"
                   className="hidden sm:inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-3 py-2 rounded-xl text-sm font-semibold transition">
                  barmagly.tech ↗
                </a>
              </div>
            </div>
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
              مبادرة مجانية تجمع كل الخدمات والأرقام المهمة التي يحتاجها المواطن في محافظة قنا — مستشفيات، فنادق، مطاعم، أرقام طوارئ، ومعالم سياحية — في مكان واحد. مصممة ومقدمة مجاناً من{' '}
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
