import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Star } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';

export default function ServiceCard({ s }) {
  const cat = s.category || {};
  return (
    <Link to={`/service/${s.id}`}
      className="card p-4 flex flex-col gap-3 hover:shadow-soft hover:-translate-y-0.5 transition group">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
             style={{ backgroundColor: (cat.color || '#0ea5e9') + '15', color: cat.color || '#0ea5e9' }}>
          <Icon name={cat.icon} className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 truncate">{s.name}</h3>
            {s.is_featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
          </div>
          {cat.name && <div className="text-xs text-slate-500">{cat.name}</div>}
        </div>
      </div>
      {s.description && (
        <p className="text-sm text-slate-600 line-clamp-2 leading-6">{s.description}</p>
      )}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {s.address && (
          <span className="chip"><MapPin className="w-3 h-3" /> {s.city || s.address}</span>
        )}
        {s.phone && (
          <span className="chip"><Phone className="w-3 h-3" /> {s.phone}</span>
        )}
        {s.working_hours && (
          <span className="chip"><Clock className="w-3 h-3" /> {s.working_hours}</span>
        )}
      </div>
    </Link>
  );
}
