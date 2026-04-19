import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Star, ArrowLeft } from 'lucide-react';
import api from '../lib/api.js';

// Auto-scrolling RTL marquee that shows already-approved services in a category.
// We duplicate the list so the CSS keyframe can loop seamlessly with translate3d.
export default function ApprovedMarquee({
  categorySlug,
  title = 'العروض المنشورة',
  subtitle,
  accent = 'sky',
  speed = 60,
  emptyText = 'لسه مفيش عروض منشورة في هذا القسم — كن الأول!',
}) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    api.get('/services', {
      params: { category: categorySlug, limit: 30, includeCategory: '1' },
    }).then((r) => { if (alive) setItems(r.data.rows || []); })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, [categorySlug]);

  if (items === null) return null;
  if (!items.length) {
    return (
      <div className="card p-4 text-center text-sm text-slate-500 leading-7">
        {emptyText}
      </div>
    );
  }

  // Only duplicate (and animate) when we have enough items for a real loop.
  // With ≤3 items the duplication is visually obvious and looks like a bug.
  const shouldLoop = items.length >= 4;
  const loop = shouldLoop ? [...items, ...items] : items;
  const duration = Math.max(20, items.length * speed / 4);

  const accentMap = {
    sky:     { ring: 'ring-sky-200',     dot: 'bg-sky-500',     pill: 'bg-sky-50 text-sky-700',     btn: 'text-sky-700 hover:text-sky-900' },
    emerald: { ring: 'ring-emerald-200', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700', btn: 'text-emerald-700 hover:text-emerald-900' },
  };
  const a = accentMap[accent] || accentMap.sky;

  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${a.dot} animate-pulse`} />
          <h3 className="font-bold text-slate-900">{title}</h3>
          <span className={`text-[11px] px-2 py-0.5 rounded-full ${a.pill}`}>{items.length}</span>
        </div>
        <Link to={`/category/${categorySlug}`}
          className={`text-xs font-semibold inline-flex items-center gap-1 ${a.btn}`}>
          عرض الكل <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>
      {subtitle && <div className="text-xs text-slate-500 mb-3">{subtitle}</div>}

      <div className="relative overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)',
        }}>
        <div className="approved-marquee flex gap-3 w-max" style={{ animationDuration: `${duration}s` }}>
          {loop.map((s, i) => (
            <Link key={`${s.id}-${i}`} to={`/service/${s.id}`}
              className={`shrink-0 w-[260px] sm:w-[280px] bg-white border border-slate-200 ${a.ring} rounded-xl p-3 hover:shadow-md hover:-translate-y-0.5 transition-all`}>
              <div className="flex items-start gap-2">
                {s.image_url ? (
                  <img src={s.image_url} alt="" loading="lazy"
                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-100"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className={`w-12 h-12 rounded-lg shrink-0 ${a.pill} flex items-center justify-center font-bold text-lg`}>
                    {(s.name || '?').slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 line-clamp-1">{s.name}</div>
                  {s.tags && (
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{s.tags}</div>
                  )}
                  {s.address && (
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" /> {s.address}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                {s.phone ? (
                  <span dir="ltr" className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <Phone className="w-3 h-3" /> {s.phone}
                  </span>
                ) : <span className="text-[11px] text-slate-400">—</span>}
                {s.price_range && (
                  <span className="text-[11px] text-slate-600 font-semibold">{s.price_range}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .approved-marquee {
          animation-name: approved-rtl;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          will-change: transform;
        }
        .approved-marquee:hover { animation-play-state: paused; }
        @keyframes approved-rtl {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) { .approved-marquee { animation: none; } }
      `}</style>
    </div>
  );
}
