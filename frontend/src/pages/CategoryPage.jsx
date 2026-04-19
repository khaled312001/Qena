import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Search, ChevronRight, ChevronDown, Filter, X, MapPin, SlidersHorizontal,
  Phone, CheckCircle2, Star, ArrowUpDown, Grid, List as ListIcon, Info,
  Layers, Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api.js';
import ServiceCard from '../components/ServiceCard.jsx';
import { Icon } from '../lib/icons.jsx';
import AdSlot from '../components/AdSlot.jsx';

const SORT_OPTIONS = [
  { v: 'important', l: 'الأهم أولاً' },
  { v: 'featured', l: 'المميز أولاً' },
  { v: 'phone', l: 'بهاتف أولاً' },
  { v: 'image', l: 'بصورة أولاً' },
  { v: 'name', l: 'أبجدياً' },
  { v: 'newest', l: 'الأحدث' },
];

// Collapsible filter section
function FilterSection({ title, icon: IconC, count, accent, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const accentBar = accent === 'red' ? 'bg-red-500' : 'bg-brand-500';
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 hover:border-slate-200 transition group"
      >
        <div className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
          {accent ? (
            <span className={`w-1 h-3.5 rounded-full ${accentBar}`} />
          ) : IconC ? (
            <IconC className="w-3.5 h-3.5 text-brand-700" />
          ) : null}
          {title}
          {count != null && <span className="text-slate-400 font-medium">({count})</span>}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && children}
    </div>
  );
}

// Importance score: featured + phone + image + coords + reviews
function importance(s) {
  let score = 0;
  if (s.is_featured) score += 50;
  if (s.phone) score += 12;
  if (s.alt_phone) score += 3;
  if (s.address) score += 5;
  if (s.lat && s.lng) score += 8;
  if (s.image_url && !String(s.image_url).includes('unsplash')) score += 10;
  if (s.website) score += 4;
  if (s.working_hours) score += 3;
  if (s.description && s.description.length > 20) score += 2;
  // Extract review count from description ("تقييم X (N مراجعة)")
  const m = s.description && s.description.match(/(\d+)\s*مراجعة/);
  if (m) score += Math.min(Number(m[1]) / 5, 20);
  if (s.views) score += Math.min(Number(s.views) / 10, 10);
  return score;
}

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState(
    (searchParams.get('tag') || '').split(',').filter(Boolean)
  );
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'important');
  const [view, setView] = useState(localStorage.getItem('qena_view') || 'grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  // Real DB-level aggregate counts + facets (independent of list pagination)
  const [dbStats, setDbStats] = useState({ total: 0, withPhone: 0, withMap: 0, withImage: 0 });
  const [dbFacets, setDbFacets] = useState(null); // { tags, cities, categories } from DB, or null → fall back to in-memory
  const [totalInDb, setTotalInDb] = useState(0);

  useEffect(() => { localStorage.setItem('qena_view', view); }, [view]);

  useEffect(() => {
    setLoading(true);
    const params = { includeCategory: '1', limit: 1000 };
    if (slug && slug !== 'all') params.category = slug;
    if (q) params.q = q;
    const aggParams = { facets: '1' };
    if (slug && slug !== 'all') aggParams.category = slug;
    if (q) aggParams.q = q;
    const jobs = [
      api.get('/services', { params }),
      api.get('/services/aggregate', { params: aggParams }).catch(() => ({ data: null })),
    ];
    if (slug && slug !== 'all') jobs.push(api.get(`/categories/${slug}`));
    Promise.all(jobs)
      .then(([svc, agg, cat]) => {
        setServices(svc.data.rows);
        setTotalInDb(svc.data.total || svc.data.rows.length);
        if (agg && agg.data) {
          setDbStats({
            total: agg.data.total || 0,
            withPhone: agg.data.withPhone || 0,
            withMap: agg.data.withMap || 0,
            withImage: agg.data.withImage || 0,
          });
          setDbFacets(agg.data.tags ? {
            tags: agg.data.tags || [],
            cities: agg.data.cities || [],
            categories: agg.data.categories || [],
          } : null);
        } else {
          setDbStats({
            total: svc.data.total || svc.data.rows.length,
            withPhone: svc.data.rows.filter((s) => s.phone).length,
            withMap: svc.data.rows.filter((s) => s.lat && s.lng).length,
            withImage: 0,
          });
          setDbFacets(null);
        }
        setCategory(cat ? cat.data : null);
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [slug, q]);

  // Doctor specialties: any tag from "clinics" (أطباء ومراكز طبية) category
  // We group them separately so they appear as a sub-section under "أطباء"
  const MEDICAL_CATEGORY_SLUGS = new Set(['clinics', 'doctors']);

  // Extract unique tags + cities + category-grouped tags.
  // When server returned facets (true DB counts) we trust them directly.
  // Otherwise we fall back to computing from the in-memory list.
  const { tagsList, medicalTagsList, generalTagsList, citiesList, categoriesList } = useMemo(() => {
    // Tag-origin map (medical vs general) always comes from the in-memory rows
    // since we know the per-row category there. This determines which bucket
    // each DB-counted tag belongs to.
    const tagOrigin = new Map(); // tag -> 'med' | 'gen'
    for (const s of services) {
      const cat = s.category || {};
      const isMed = MEDICAL_CATEGORY_SLUGS.has(cat.slug);
      if (s.tags) {
        for (const t of s.tags.split(/[,،]+/).map((x) => x.trim()).filter((x) => x && x.length > 1 && x.length < 40)) {
          if (!tagOrigin.has(t)) tagOrigin.set(t, isMed ? 'med' : 'gen');
          else if (tagOrigin.get(t) === 'gen' && isMed) tagOrigin.set(t, 'med');
        }
      }
    }

    // Prefer server-side DB facets (true totals) when available
    if (dbFacets) {
      const tagsArr = dbFacets.tags;
      const med = tagsArr.filter(([t]) => tagOrigin.get(t) === 'med');
      const gen = tagsArr.filter(([t]) => tagOrigin.get(t) !== 'med');
      return {
        tagsList: tagsArr,
        medicalTagsList: med,
        generalTagsList: gen,
        citiesList: dbFacets.cities,
        categoriesList: dbFacets.categories,
      };
    }

    // Fallback: compute from the loaded rows
    const tags = new Map();
    const medTags = new Map();
    const genTags = new Map();
    const cities = new Map();
    const cats = new Map();

    for (const s of services) {
      const cat = s.category || {};
      const isMed = MEDICAL_CATEGORY_SLUGS.has(cat.slug);

      if (cat.slug && cat.name) {
        if (!cats.has(cat.slug)) cats.set(cat.slug, { slug: cat.slug, name: cat.name, icon: cat.icon, color: cat.color, count: 0 });
        cats.get(cat.slug).count += 1;
      }
      if (s.tags) {
        for (const t of s.tags.split(/[,،]+/).map((x) => x.trim()).filter((x) => x && x.length > 1 && x.length < 40)) {
          tags.set(t, (tags.get(t) || 0) + 1);
          if (isMed) medTags.set(t, (medTags.get(t) || 0) + 1);
          else genTags.set(t, (genTags.get(t) || 0) + 1);
        }
      }
      if (s.city) cities.set(s.city, (cities.get(s.city) || 0) + 1);
    }
    return {
      tagsList: [...tags.entries()].sort((a, b) => b[1] - a[1]),
      medicalTagsList: [...medTags.entries()].sort((a, b) => b[1] - a[1]),
      generalTagsList: [...genTags.entries()].sort((a, b) => b[1] - a[1]),
      citiesList: [...cities.entries()].sort((a, b) => b[1] - a[1]),
      categoriesList: [...cats.values()].sort((a, b) => b.count - a.count),
    };
  }, [services, dbFacets]);

  // Client-side filter + sort
  const filtered = useMemo(() => {
    let out = services.filter((s) => {
      if (selectedTags.length) {
        const tagsLow = (s.tags || '').toLowerCase();
        if (!selectedTags.every((t) => tagsLow.includes(t.toLowerCase()))) return false;
      }
      if (selectedCity && s.city !== selectedCity) return false;
      return true;
    });
    const cmp = {
      important: (a, b) => importance(b) - importance(a),
      featured: (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || importance(b) - importance(a),
      name: (a, b) => (a.name || '').localeCompare(b.name || '', 'ar'),
      phone: (a, b) => (b.phone ? 1 : 0) - (a.phone ? 1 : 0) || importance(b) - importance(a),
      image: (a, b) =>
        ((b.image_url && !String(b.image_url).includes('unsplash')) ? 1 : 0) -
        ((a.image_url && !String(a.image_url).includes('unsplash')) ? 1 : 0) ||
        importance(b) - importance(a),
      newest: (a, b) => (b.id || 0) - (a.id || 0),
    }[sort] || ((a, b) => importance(b) - importance(a));
    return [...out].sort(cmp);
  }, [services, selectedTags, selectedCity, sort]);

  // Tag filter with local text search
  const visibleTags = useMemo(() => {
    if (!filterQuery) return tagsList;
    const qq = filterQuery.toLowerCase();
    return tagsList.filter(([t]) => t.toLowerCase().includes(qq));
  }, [tagsList, filterQuery]);

  function syncUrl(changes) {
    const p = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(changes)) {
      if (v === '' || v == null || (Array.isArray(v) && v.length === 0)) p.delete(k);
      else p.set(k, Array.isArray(v) ? v.join(',') : v);
    }
    setSearchParams(p);
  }

  function toggleTag(t) {
    const next = selectedTags.includes(t) ? selectedTags.filter((x) => x !== t) : [...selectedTags, t];
    setSelectedTags(next);
    syncUrl({ tag: next });
  }
  function setCity(c) {
    const v = c === selectedCity ? '' : c;
    setSelectedCity(v);
    syncUrl({ city: v });
  }
  function clearAll() {
    setSelectedTags([]); setSelectedCity(''); setFilterQuery('');
    const p = new URLSearchParams(searchParams);
    p.delete('tag'); p.delete('city');
    setSearchParams(p);
  }

  const hasFilters = selectedTags.length > 0 || selectedCity;
  // When client-side filters are active (tag/city), show counts from the currently
  // filtered subset. Otherwise show the real DB totals (not capped by the 200-row list).
  const stats = useMemo(() => {
    if (hasFilters) {
      return {
        total: filtered.length,
        withPhone: filtered.filter((s) => s.phone).length,
        withMap: filtered.filter((s) => s.lat && s.lng).length,
      };
    }
    return dbStats;
  }, [hasFilters, filtered, dbStats]);

  const FilterPanel = ({ onClose }) => (
    <div className="space-y-4">
      {/* Summary header with total + active filters badge */}
      <div className="rounded-xl bg-gradient-to-bl from-brand-50 via-white to-slate-50 border border-slate-100 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-slate-500 font-medium">النتائج المعروضة</span>
          {hasFilters && (
            <button onClick={clearAll} className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 font-medium">
              <X className="w-3 h-3" /> مسح الكل
            </button>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-brand-700 tabular-nums">{stats.total.toLocaleString('ar-EG')}</span>
          <span className="text-xs text-slate-500">من أصل {dbStats.total.toLocaleString('ar-EG')}</span>
        </div>
        {(stats.withPhone > 0 || stats.withMap > 0) && (
          <div className="flex gap-2 mt-2 text-[10px]">
            {stats.withPhone > 0 && (
              <span className="flex items-center gap-1 text-emerald-700"><Phone className="w-2.5 h-2.5" />{stats.withPhone.toLocaleString('ar-EG')}</span>
            )}
            {stats.withMap > 0 && (
              <span className="flex items-center gap-1 text-sky-700"><MapPin className="w-2.5 h-2.5" />{stats.withMap.toLocaleString('ar-EG')}</span>
            )}
          </div>
        )}
      </div>

      {/* Active filters chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCity && (
            <span className="inline-flex items-center gap-1 bg-brand-600 text-white text-[11px] px-2.5 py-1 rounded-full shadow-sm">
              <MapPin className="w-3 h-3" /> {selectedCity}
              <button onClick={() => setCity(selectedCity)} className="hover:bg-white/20 rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
          {selectedTags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 bg-brand-600 text-white text-[11px] px-2.5 py-1 rounded-full shadow-sm">
              {t}
              <button onClick={() => toggleTag(t)} className="hover:bg-white/20 rounded-full p-0.5"><X className="w-2.5 h-2.5" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Top categories — only on /category/all */}
      {slug === 'all' && categoriesList.length > 1 && (
        <FilterSection title="الأقسام" icon={Layers} count={categoriesList.length} defaultOpen>
          <div className="space-y-1">
            {categoriesList.map((c) => (
              <Link key={c.slug} to={`/category/${c.slug}`}
                className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition hover:bg-slate-50 group">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (c.color || '#0ea5e9') + '22', color: c.color || '#0ea5e9' }}>
                    <Icon name={c.icon} className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[13px] text-slate-700 truncate group-hover:text-brand-700 font-medium">{c.name}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 tabular-nums group-hover:text-brand-600">{c.count.toLocaleString('ar-EG')}</span>
              </Link>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Cities */}
      {citiesList.length > 1 && (
        <FilterSection title="المدينة" icon={Building2} count={citiesList.length} defaultOpen>
          <div className="flex flex-wrap gap-1.5">
            {citiesList.map(([c, n]) => {
              const active = selectedCity === c;
              return (
                <button key={c} onClick={() => setCity(c)}
                  className={`text-[11px] px-2.5 py-1 rounded-full transition border ${active ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white hover:bg-brand-50 hover:border-brand-300 border-slate-200 text-slate-700'}`}>
                  {c} <span className={active ? 'opacity-80' : 'text-slate-400'}>· {n}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Filter search (applies to tag groups) */}
      {tagsList.length >= 2 && (
        <div className="relative">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pr-8 pl-3 py-2 outline-none focus:border-brand-500 focus:bg-white transition"
            placeholder="ابحث داخل الفلاتر..." />
        </div>
      )}

      {/* Medical specialties */}
      {medicalTagsList.length >= 2 && (
        <FilterSection title="التخصصات الطبية" accent="red" count={medicalTagsList.length} defaultOpen>
          <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pb-1 -mx-1 px-1">
            {medicalTagsList
              .filter(([t]) => !filterQuery || t.toLowerCase().includes(filterQuery.toLowerCase()))
              .map(([t, n]) => {
                const active = selectedTags.includes(t);
                return (
                  <button key={t} onClick={() => toggleTag(t)}
                    className={`text-[11px] px-2.5 py-1 rounded-full transition border ${active ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white hover:bg-red-50 hover:border-red-300 border-slate-200 text-slate-700'}`}>
                    {t} <span className={active ? 'opacity-80' : 'text-slate-400'}>· {n}</span>
                  </button>
                );
              })}
          </div>
        </FilterSection>
      )}

      {/* General tags */}
      {generalTagsList.length >= 2 && (
        <FilterSection
          title={medicalTagsList.length ? 'فئات أخرى' : ((slug === 'clinics' || slug === 'doctors') ? 'التخصص' : 'الفئة / النوع')}
          count={generalTagsList.length}
          defaultOpen>
          <div className="flex flex-wrap gap-1.5 max-h-80 overflow-y-auto pb-1 -mx-1 px-1">
            {generalTagsList
              .filter(([t]) => !filterQuery || t.toLowerCase().includes(filterQuery.toLowerCase()))
              .map(([t, n]) => {
                const active = selectedTags.includes(t);
                return (
                  <button key={t} onClick={() => toggleTag(t)}
                    className={`text-[11px] px-2.5 py-1 rounded-full transition border ${active ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white hover:bg-brand-50 hover:border-brand-300 border-slate-200 text-slate-700'}`}>
                    {t} <span className={active ? 'opacity-80' : 'text-slate-400'}>· {n}</span>
                  </button>
                );
              })}
          </div>
        </FilterSection>
      )}

      {/* No-match message */}
      {tagsList.length >= 2 && filterQuery &&
        medicalTagsList.filter(([t]) => t.toLowerCase().includes(filterQuery.toLowerCase())).length === 0 &&
        generalTagsList.filter(([t]) => t.toLowerCase().includes(filterQuery.toLowerCase())).length === 0 && (
          <div className="text-xs text-slate-400 p-3 text-center bg-slate-50 rounded-lg">
            لا توجد فلاتر مطابقة
          </div>
        )}

      {onClose && (
        <button onClick={onClose} className="btn-primary w-full justify-center sticky bottom-0">
          عرض {stats.total.toLocaleString('ar-EG')} نتيجة
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Hero / Breadcrumb */}
      <div className="bg-gradient-to-bl from-slate-50 via-white to-brand-50/30 border-b border-slate-100">
        <div className="container-p py-6 md:py-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link to="/" className="hover:text-brand-600">الرئيسية</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">{category?.name || 'كل الخدمات'}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                   style={{ backgroundColor: (category?.color || '#0ea5e9') + '18', color: category?.color || '#0ea5e9' }}>
                <Icon name={category?.icon} className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">{category?.name || 'كل الخدمات'}</h1>
                {category?.description && (
                  <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">{category.description}</p>
                )}
              </div>
            </div>
            {/* Search inline */}
            <form onSubmit={(e) => { e.preventDefault(); syncUrl({ q }); }}
              className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-slate-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 mr-1.5" />
              <input className="flex-1 bg-transparent outline-none text-sm px-1" placeholder={`ابحث في ${category?.name || 'الخدمات'}...`}
                value={q} onChange={(e) => setQ(e.target.value)} />
              {q && (
                <button type="button" onClick={() => { setQ(''); syncUrl({ q: '' }); }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition" type="submit">بحث</button>
            </form>
          </div>

          {/* Stats row */}
          {!loading && services.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <div className="bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-700 font-medium">
                <span className="text-brand-700 font-bold">{stats.total}</span> نتيجة
              </div>
              {stats.withPhone > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {stats.withPhone} برقم هاتف
                </div>
              )}
              {stats.withMap > 0 && (
                <div className="bg-sky-50 border border-sky-200 text-sky-700 rounded-full px-3 py-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {stats.withMap} على الخريطة
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Price notice */}
      <div className="container-p pt-4">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs md:text-sm text-amber-900">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-6">
            <b>ملاحظة:</b> جميع الأسعار والبيانات قابلة للتعديل من قبل أصحاب الأماكن في أي وقت. يُرجى التأكد عبر الاتصال المباشر قبل الزيارة.
          </div>
        </div>
      </div>

      {/* Content grid */}
      <section className="container-p py-6 md:py-8">
        <div className="grid lg:grid-cols-[280px,1fr] gap-6">
          {/* Desktop sticky filter sidebar */}
          <aside className="hidden lg:block">
            {(tagsList.length >= 3 || citiesList.length > 1) && (
              <div className="card sticky top-24 max-h-[calc(100vh-7rem)] flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-slate-100 shrink-0 bg-white rounded-t-2xl">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div className="font-bold">الفلاتر</div>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <FilterPanel />
                </div>
              </div>
            )}
          </aside>

          {/* Main list */}
          <div>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 flex-1">
                {/* Mobile filter button */}
                {(tagsList.length >= 3 || citiesList.length > 1) && (
                  <button onClick={() => setMobileFilterOpen(true)}
                    className="lg:hidden inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm px-3 py-2 rounded-xl font-medium transition">
                    <Filter className="w-4 h-4" />
                    فلترة
                    {hasFilters && (
                      <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {selectedTags.length + (selectedCity ? 1 : 0)}
                      </span>
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {/* Sort */}
                <div className="relative">
                  <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <select value={sort} onChange={(e) => { setSort(e.target.value); syncUrl({ sort: e.target.value }); }}
                    className="bg-white border border-slate-200 text-sm px-3 pr-7 py-2 rounded-xl outline-none hover:border-slate-300 cursor-pointer transition">
                    {SORT_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
                {/* View toggle */}
                <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
                  <button onClick={() => setView('grid')}
                    className={`p-1.5 rounded-lg transition ${view === 'grid' ? 'bg-brand-50 text-brand-700' : 'text-slate-400 hover:text-slate-600'}`}
                    title="شبكة">
                    <Grid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setView('list')}
                    className={`p-1.5 rounded-lg transition ${view === 'list' ? 'bg-brand-50 text-brand-700' : 'text-slate-400 hover:text-slate-600'}`}
                    title="قائمة">
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card p-4 h-56 bg-slate-100 animate-pulse" />
                ))}
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="card p-12 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Search className="w-7 h-7" />
                </div>
                <p className="text-slate-700 font-semibold mb-1">لا توجد نتائج مطابقة</p>
                <p className="text-slate-500 text-sm mb-5">جرّب تغيير الفلاتر أو البحث بكلمة مختلفة</p>
                {hasFilters && (
                  <button onClick={clearAll} className="btn-outline text-sm">
                    <X className="w-4 h-4" /> مسح جميع الفلاتر
                  </button>
                )}
              </div>
            )}
            {!loading && filtered.length > 0 && (
              <>
                <div className={view === 'grid'
                  ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'grid grid-cols-1 gap-3'}>
                  {filtered.slice(0, 12).map((s) => (<ServiceCard key={s.id} s={s} />))}
                </div>
                {/* In-feed ad after first 12 results */}
                {filtered.length > 12 && (
                  <AdSlot slot={AdSlot.INFEED || AdSlot.INLINE} format="fluid" />
                )}
                {filtered.length > 12 && (
                  <div className={view === 'grid'
                    ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'grid grid-cols-1 gap-3'}>
                    {filtered.slice(12, 24).map((s) => (<ServiceCard key={s.id} s={s} />))}
                  </div>
                )}
                {filtered.length > 24 && (
                  <>
                    <AdSlot slot={AdSlot.INFEED || AdSlot.INLINE} format="fluid" />
                    <div className={view === 'grid'
                      ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-4'
                      : 'grid grid-cols-1 gap-3'}>
                      {filtered.slice(24).map((s) => (<ServiceCard key={s.id} s={s} />))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileFilterOpen(false)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-brand-700" />
                  <span className="font-bold">الفلاتر</span>
                </div>
                <button onClick={() => setMobileFilterOpen(false)} className="btn-ghost">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5">
                <FilterPanel onClose={() => setMobileFilterOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
