import { useEffect, useState } from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import api from '../lib/api.js';

// Seamless infinite marquee — the track contains two identical rows side by side
// and animates by -50% so the second copy seamlessly replaces the first.
export default function EmergencyStrip() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/public-numbers', { params: { emergency: '1' } })
      .then((r) => setItems((r.data || []).slice(0, 8)))
      .catch(() => {});
  }, []);

  if (!items.length) return null;

  // Faster marquee the more items you have, capped to a readable window
  const durationSec = Math.max(18, Math.min(40, items.length * 4.5));

  const Pill = ({ n }) => (
    <a href={`tel:${n.phone}`}
       className="shrink-0 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-white border border-red-100 text-red-700 hover:bg-red-50 hover:border-red-200 transition shadow-sm">
      <Phone className="w-3.5 h-3.5" />
      <b>{n.name}</b>
      <span className="opacity-70">·</span>
      <span dir="ltr" className="font-bold copyable">{n.phone}</span>
    </a>
  );

  return (
    <section className="border-b border-slate-100 bg-gradient-to-l from-red-50/60 via-red-50/30 to-red-50/60 relative">
      <div className="container-p py-3 flex items-center gap-3">
        <span className="tag-emergency shrink-0 relative z-10 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 animate-pulse-soft" /> أرقام طوارئ
        </span>

        {/* Marquee viewport with fade masks on both edges */}
        <div className="flex-1 min-w-0 relative overflow-hidden"
             style={{
               maskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)',
               WebkitMaskImage: 'linear-gradient(to left, transparent, black 5%, black 95%, transparent)',
             }}>
          {/* Track: two identical copies so translate -50% is seamless */}
          <div className="flex items-center gap-3 w-max marquee-track"
               style={{ animationDuration: `${durationSec}s` }}>
            {[...items, ...items].map((n, i) => (
              <Pill key={`${n.id}-${i}`} n={n} />
            ))}
          </div>
        </div>
      </div>

      {/* Inline keyframes — scoped via unique class, pause on hover */}
      <style>{`
        .marquee-track {
          animation-name: qena-marquee-rtl;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .marquee-track:hover { animation-play-state: paused; }
        /* RTL: items appear on the right, so animate transform from 0 to +50%
           (items flow out to the right as new ones come in from the left). */
        @keyframes qena-marquee-rtl {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
