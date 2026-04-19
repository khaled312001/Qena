import { Link } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, Phone, Clock, Star, Image as ImageIcon } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';

// Never use generic stock images. Only real scraped photos — else show themed placeholder.
function isReal(url) {
  if (!url) return false;
  const u = url.toLowerCase();
  if (u.includes('unsplash.com')) return false;
  if (u.includes('pexels.com')) return false;
  return true;
}

export default function ServiceCard({ s }) {
  const cat = s.category || {};
  const color = cat.color || '#0ea5e9';
  const [imgOk, setImgOk] = useState(true);
  const showImage = isReal(s.image_url) && imgOk;

  return (
    <Link to={`/service/${s.id}`}
      className="card overflow-hidden flex flex-col hover:shadow-soft hover:-translate-y-1 transition group">
      <div className="h-36 sm:h-40 relative overflow-hidden">
        {showImage ? (
          <img src={s.image_url} alt={s.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgOk(false)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative"
               style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}11 60%, #f8fafc 100%)` }}>
            <div className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, currentColor 1px, transparent 1px), radial-gradient(circle at 70% 70%, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px', color }} />
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner"
                 style={{ backgroundColor: color + '30', color }}>
              <Icon name={cat.icon} className="w-8 h-8" />
            </div>
          </div>
        )}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        {s.is_featured && (
          <span className="absolute top-2 right-2 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <Star className="w-3 h-3 fill-amber-900" /> مميز
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ backgroundColor: color + '18', color }}>
            <Icon name={cat.icon} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
            {cat.name && <div className="text-xs text-slate-500">{cat.name}</div>}
          </div>
        </div>
        {s.description && (
          <p className="text-sm text-slate-600 line-clamp-2 leading-6">{s.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {(s.address || s.city) && (
            <span className="chip"><MapPin className="w-3 h-3" /> {s.city || s.address}</span>
          )}
          {s.phone && (
            <span className="chip"><Phone className="w-3 h-3" /> {s.phone}</span>
          )}
          {s.working_hours && (
            <span className="chip"><Clock className="w-3 h-3" /> {s.working_hours}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
