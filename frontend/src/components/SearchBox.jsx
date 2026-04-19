import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, Loader2 } from 'lucide-react';
import api from '../lib/api.js';
import { Icon } from '../lib/icons.jsx';

export default function SearchBox({ autoFocus = false, variant = 'light' }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    const term = q.trim();
    if (term.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const r = await api.get('/services', { params: { q: term, limit: 8, includeCategory: '1' } });
        setResults(r.data.rows);
        setOpen(true);
        setHighlight(-1);
      } catch (_) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timerRef.current);
  }, [q]);

  function submit(e) {
    e && e.preventDefault();
    if (highlight >= 0 && results[highlight]) {
      nav(`/service/${results[highlight].id}`);
      setOpen(false);
      return;
    }
    if (q.trim()) nav(`/category/all?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  }

  function onKey(e) {
    if (!open || !results.length) {
      if (e.key === 'Enter') submit(e);
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, -1)); }
    else if (e.key === 'Enter') submit(e);
    else if (e.key === 'Escape') setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <form onSubmit={submit}
        className={`flex items-center gap-1.5 sm:gap-2 rounded-2xl p-1.5 sm:p-2 shadow-2xl ${variant === 'light' ? 'bg-white' : 'bg-white/90 backdrop-blur'}`}>
        <div className="w-9 h-9 flex items-center justify-center text-slate-400 shrink-0">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => q.length >= 2 && setOpen(true)} onKeyDown={onKey}
          autoFocus={autoFocus}
          inputMode="search"
          enterKeyHint="search"
          className="flex-1 min-w-0 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 px-1 text-sm sm:text-base"
          placeholder="ابحث عن مستشفى، فندق، صيدلية..." />
        <button type="submit" className="btn-primary !px-3 sm:!px-4 shrink-0">بحث</button>
      </form>

      {open && q.trim().length >= 2 && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[420px] overflow-y-auto z-40 text-right">
          {results.length === 0 && !loading && (
            <div className="p-5 text-center text-slate-500 text-sm">
              لا توجد نتائج لـ <b>"{q}"</b>
              <div className="mt-3">
                <button onClick={submit} className="btn-outline text-sm">اضغط Enter للبحث الشامل</button>
              </div>
            </div>
          )}
          {results.map((s, i) => {
            const cat = s.category || {};
            return (
              <button key={s.id}
                onClick={() => { nav(`/service/${s.id}`); setOpen(false); }}
                onMouseEnter={() => setHighlight(i)}
                className={`w-full text-right p-3 flex items-start gap-3 transition border-b border-slate-50 last:border-0 ${highlight === i ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                     style={{ backgroundColor: (cat.color || '#0ea5e9') + '18', color: cat.color || '#0ea5e9' }}>
                  <Icon name={cat.icon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate text-sm">{s.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5 truncate">
                    {cat.name && <span>{cat.name}</span>}
                    {s.address && <span className="inline-flex items-center gap-0.5 truncate copyable"><MapPin className="w-3 h-3" />{s.address.slice(0, 30)}</span>}
                    {s.phone && <span className="inline-flex items-center gap-0.5 copyable" dir="ltr"><Phone className="w-3 h-3" />{s.phone}</span>}
                  </div>
                </div>
              </button>
            );
          })}
          {results.length > 0 && (
            <button onClick={submit} className="w-full p-3 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50 transition border-t border-slate-100">
              عرض كل النتائج لـ "{q}" ←
            </button>
          )}
        </div>
      )}
    </div>
  );
}
