import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';

export default function ServiceCard({ s }) {
  const cat = s.category || {};
  const color = cat.color || '#0ea5e9';
  return (
    <Link to={`/service/${s.id}`}
      className="card overflow-hidden flex flex-col hover:shadow-soft hover:-translate-y-1 transition group">
      {s.image_url && (
        <div className="h-36 bg-slate-100 relative overflow-hidden">
          <img src={s.image_url} alt="" loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} />
          <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-black/40 to-transparent" />
          {s.is_featured && (
            <span className="absolute top-2 right-2 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-900" /> مميز
            </span>
          )}
        </div>
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ backgroundColor: color + '18', color }}>
            <Icon name={cat.icon} className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
              {!s.image_url && s.is_featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
            </div>
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
