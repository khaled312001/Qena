import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Navigation, MapPin, Phone, AlertTriangle, Loader2, RefreshCw,
  Crosshair, ShieldAlert, Pill, Hospital, Stethoscope, BedDouble,
  Utensils, Coffee, Fuel, Landmark, Building2,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import api from '../lib/api.js';
import { Icon } from '../lib/icons.jsx';

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="10" fill="#0ea5e9" stroke="white" stroke-width="3"/><circle cx="14" cy="14" r="4" fill="white"/></svg>`),
  iconSize: [28, 28], iconAnchor: [14, 14],
});
const svcIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const QUICK = [
  { slug: 'pharmacies', label: 'صيدلية', icon: Pill, color: '#10b981' },
  { slug: 'hospitals', label: 'مستشفى', icon: Hospital, color: '#ef4444' },
  { slug: 'clinics', label: 'طبيب', icon: Stethoscope, color: '#dc2626' },
  { slug: 'restaurants', label: 'مطعم', icon: Utensils, color: '#f97316' },
  { slug: 'cafes', label: 'كافيه', icon: Coffee, color: '#a16207' },
  { slug: 'hotels', label: 'فندق', icon: BedDouble, color: '#8b5cf6' },
  { slug: 'gas-stations', label: 'وقود', icon: Fuel, color: '#64748b' },
  { slug: 'banks', label: 'بنك', icon: Landmark, color: '#059669' },
  { slug: 'all', label: 'أي شيء', icon: Building2, color: '#0ea5e9' },
];

function formatDist(km) {
  if (km < 1) return `${Math.round(km * 1000)} م`;
  return `${km.toFixed(1)} كم`;
}

export default function NearbyPage() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [category, setCategory] = useState('pharmacies');
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const hasTriedAutoRef = useRef(false);

  function requestLocation() {
    if (!('geolocation' in navigator)) {
      setError('المتصفح لا يدعم خدمة تحديد الموقع');
      return;
    }
    setError(null); setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setError('رفضت السماح بالوصول للموقع. افتح إعدادات المتصفح للسماح بالموقع لهذا الموقع.');
        else if (err.code === 2) setError('تعذّر تحديد موقعك. تأكد من تفعيل GPS.');
        else if (err.code === 3) setError('انتهت مهلة تحديد الموقع. حاول مجدداً.');
        else setError('حدث خطأ في تحديد الموقع.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  // Try once automatically on mount (permission-wise this still prompts user)
  useEffect(() => {
    if (hasTriedAutoRef.current) return;
    hasTriedAutoRef.current = true;
    // Only auto-request if permission is already granted
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((p) => {
        if (p.state === 'granted') requestLocation();
      }).catch(() => {});
    }
  }, []);

  // Fetch nearby services whenever coords or category changes
  useEffect(() => {
    if (!coords) return;
    setLoadingResults(true);
    api.get('/services/nearby', {
      params: { lat: coords.lat, lng: coords.lng, category, limit: 30, maxKm: 80 },
    }).then((r) => setResults(r.data.rows || []))
      .catch(() => setResults([]))
      .finally(() => setLoadingResults(false));
  }, [coords, category]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/hero-pattern.svg)', backgroundSize: 'cover' }} />
        <div className="container-p py-10 md:py-14 relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs mb-3 backdrop-blur">
              <Crosshair className="w-4 h-4" /> أقرب خدمة إليك
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">اعثر على أقرب خدمة</h1>
            <p className="text-white/90 leading-7 text-base md:text-lg">
              حدد موقعك ونعرض لك <b>أقرب</b> صيدلية، مستشفى، طبيب، مطعم، كافيه، بنك، أو محطة وقود — مرتبة حسب المسافة الفعلية.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container-p py-8 md:py-10">
        {/* Category chips */}
        <div className="card p-3 md:p-4 mb-6">
          <div className="text-xs font-semibold text-slate-600 mb-2">اختر نوع الخدمة</div>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => {
              const active = category === q.slug;
              return (
                <button key={q.slug} onClick={() => setCategory(q.slug)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition border ${active ? 'text-white shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
                  style={active ? { backgroundColor: q.color, borderColor: q.color } : {}}>
                  <q.icon className="w-4 h-4" />
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location status */}
        {!coords && !error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
              <Navigation className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold mb-2">حدد موقعك للبدء</h2>
            <p className="text-slate-600 text-sm leading-7 max-w-md mx-auto mb-5">
              نحتاج موقعك الحالي فقط لعرض أقرب الخدمات إليك. <b>لا نحفظ موقعك</b> — يُستخدم محلياً في جهازك فقط.
            </p>
            <button onClick={requestLocation} disabled={locating}
              className="btn-primary text-base px-6 py-3">
              {locating ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ التحديد...</> : <><Crosshair className="w-5 h-5" /> السماح بتحديد الموقع</>}
            </button>
            <p className="text-xs text-slate-400 mt-4">
              عند الضغط، سيطلب المتصفح إذنك للوصول إلى GPS.
            </p>
          </motion.div>
        )}

        {error && (
          <div className="card p-6 border-red-200 bg-red-50/40">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 mb-1">تعذّر تحديد موقعك</h3>
                <p className="text-sm text-red-700 leading-7 mb-3">{error}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={requestLocation} className="btn-primary text-sm">
                    <RefreshCw className="w-4 h-4" /> حاول مجدداً
                  </button>
                  <Link to="/category/all" className="btn-outline text-sm">
                    تصفح كل الخدمات بدون موقع
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results + map */}
        {coords && (
          <div className="grid lg:grid-cols-[1fr,1.1fr] gap-4 md:gap-6">
            {/* List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm">
                  <span className="text-slate-500">موقعك: </span>
                  <span dir="ltr" className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  </span>
                  <button onClick={requestLocation} className="text-brand-700 text-xs mr-2 hover:underline inline-flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> تحديث
                  </button>
                </div>
                <div className="text-xs text-slate-500">{results.length} نتيجة</div>
              </div>

              {loadingResults && (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="card p-4 h-20 bg-slate-100 animate-pulse" />
                  ))}
                </div>
              )}

              {!loadingResults && results.length === 0 && (
                <div className="card p-8 text-center text-slate-500">
                  لا توجد نتائج قريبة. جرّب نوع خدمة آخر.
                </div>
              )}

              {!loadingResults && results.length > 0 && (
                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                  {results.map((s, i) => (
                    <NearbyCard key={s.id} s={s} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="card overflow-hidden h-[60vh] lg:h-[70vh] lg:sticky lg:top-24">
              <MapContainer center={[coords.lat, coords.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[coords.lat, coords.lng]} icon={userIcon}>
                  <Popup>موقعك الحالي</Popup>
                </Marker>
                {coords.acc && coords.acc < 500 && (
                  <Circle center={[coords.lat, coords.lng]} radius={coords.acc}
                    pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.1, weight: 1 }} />
                )}
                {results.map((s) => (
                  <Marker key={s.id} position={[Number(s.lat), Number(s.lng)]} icon={svcIcon}>
                    <Popup>
                      <div className="font-bold text-sm mb-1">{s.name}</div>
                      <div className="text-xs text-slate-600">{formatDist(s.distance_km)}</div>
                      <Link to={`/service/${s.id}`} className="text-brand-700 text-xs font-semibold mt-1 inline-block">
                        التفاصيل ←
                      </Link>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Privacy note */}
        <div className="mt-8 flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-2xl mx-auto">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
          <div className="leading-6">
            <b>الخصوصية:</b> موقعك يُستخدم فقط في جهازك لحساب المسافات، ولا يُرسل إلى أي خادم ولا يُحفظ.
          </div>
        </div>
      </section>
    </div>
  );
}

function NearbyCard({ s, rank }) {
  const cat = s.category || {};
  const color = cat.color || '#0ea5e9';
  const phoneDigits = (s.phone || '').replace(/[^\d+]/g, '');
  return (
    <div className="card p-3 hover:shadow-soft transition relative">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: color + '18', color }}>
            <Icon name={cat.icon} className="w-5 h-5" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
            {rank}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/service/${s.id}`} className="font-bold text-slate-900 hover:text-brand-700 block truncate">
            {s.name}
          </Link>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
            {cat.name && <span>{cat.name}</span>}
            <span className="inline-flex items-center gap-0.5 font-bold text-brand-700">
              <MapPin className="w-3 h-3" /> {formatDist(s.distance_km)}
            </span>
          </div>
          {s.address && <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{s.address}</div>}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {phoneDigits ? (
          <a href={`tel:${phoneDigits}`} dir="ltr"
             className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition">
            <Phone className="w-3.5 h-3.5" /> اتصال
          </a>
        ) : null}
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`}
           target="_blank" rel="noreferrer"
           className="flex-1 inline-flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2 rounded-lg transition">
          <Navigation className="w-3.5 h-3.5" /> اتجاهات
        </a>
      </div>
    </div>
  );
}
