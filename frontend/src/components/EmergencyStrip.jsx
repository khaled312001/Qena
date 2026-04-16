import { useEffect, useState } from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import api from '../lib/api.js';

export default function EmergencyStrip() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/public-numbers', { params: { emergency: '1' } })
      .then((r) => setItems(r.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  if (!items.length) return null;
  return (
    <section className="border-b border-slate-100 bg-red-50/40">
      <div className="container-p py-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <span className="tag-emergency shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" /> أرقام طوارئ
        </span>
        {items.map((n) => (
          <a key={n.id} href={`tel:${n.phone}`}
             className="shrink-0 inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-white border border-red-100 text-red-700 hover:bg-red-50 transition">
            <Phone className="w-3.5 h-3.5" /> <b>{n.name}</b> · {n.phone}
          </a>
        ))}
      </div>
    </section>
  );
}
