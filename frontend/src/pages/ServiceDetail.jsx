import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MapPin, Clock, DollarSign, Globe, MessageCircle, ChevronRight, Edit3, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../lib/api.js';
import { Icon } from '../lib/icons.jsx';
import AdSlot from '../components/AdSlot.jsx';
import CorrectionModal from '../components/CorrectionModal.jsx';

// Default marker fix for Leaflet + Vite
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export default function ServiceDetail() {
  const { id } = useParams();
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => {
    api.get(`/services/${id}`).then((r) => setS(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container-p py-16 text-center text-slate-500">جارٍ التحميل...</div>;
  if (!s) return (
    <div className="container-p py-16 text-center">
      <p className="text-slate-600 mb-4">الخدمة غير موجودة.</p>
      <Link to="/" className="btn-primary">العودة للرئيسية</Link>
    </div>
  );

  const cat = s.category || {};
  const hasMap = s.lat && s.lng;

  return (
    <div>
      <div className="bg-gradient-to-bl from-brand-50/60 to-white border-b border-slate-100">
        <div className="container-p py-6 sm:py-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-3 flex-wrap">
            <Link to="/" className="hover:text-brand-600">الرئيسية</Link>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {cat.slug && (
              <>
                <Link to={`/category/${cat.slug}`} className="hover:text-brand-600">{cat.name}</Link>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </>
            )}
            <span className="truncate max-w-[60%]">{s.name}</span>
          </div>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: (cat.color || '#0ea5e9') + '15', color: cat.color || '#0ea5e9' }}>
              <Icon name={cat.icon} className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 break-words">{s.name}</h1>
              {cat.name && <div className="text-xs sm:text-sm text-slate-500 mt-0.5">{cat.name}{s.city ? ` · ${s.city}` : ''}</div>}
              {s.description && <p className="text-slate-600 mt-3 leading-7 text-sm sm:text-base whitespace-pre-line">{s.description}</p>}
            </div>
          </div>
        </div>
      </div>

      <section className="container-p py-6 sm:py-8 grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-slate-900 mb-4">معلومات الاتصال والعنوان</h2>
            <dl className="divide-y divide-slate-100">
              <Row icon={MapPin} label="العنوان" value={s.address} />
              <Row icon={Phone} label="هاتف" value={s.phone} href={s.phone ? `tel:${s.phone}` : null} />
              <Row icon={Phone} label="هاتف آخر" value={s.alt_phone} href={s.alt_phone ? `tel:${s.alt_phone}` : null} />
              <Row icon={MessageCircle} label="واتساب" value={s.whatsapp} href={s.whatsapp ? `https://wa.me/${s.whatsapp.replace(/\D/g,'')}` : null} />
              <Row icon={Clock} label="مواعيد العمل" value={s.working_hours} />
              <Row icon={DollarSign} label="الأسعار" value={s.price_range} />
              <Row icon={Globe} label="الموقع الإلكتروني" value={s.website} href={s.website} />
            </dl>
            <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-6">
                <b>تنبيه:</b> الأسعار ومواعيد العمل قابلة للتعديل في أي وقت من قبل صاحب المكان.
                يُرجى التأكد من البيانات عبر الاتصال المباشر قبل الزيارة. إن لاحظت خطأً، أرسل لنا
                <button type="button" onClick={() => setCorrecting(true)} className="text-amber-950 font-bold hover:underline px-1">تصحيحاً</button>.
              </div>
            </div>
          </div>

          {hasMap && (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold">الموقع على الخريطة</div>
              <div className="h-72 md:h-96">
                <MapContainer
                  center={[Number(s.lat), Number(s.lng)]}
                  zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[Number(s.lat), Number(s.lng)]} icon={markerIcon}>
                    <Popup>{s.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="p-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
                <a target="_blank" rel="noreferrer"
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                     [s.name, s.address, s.city || 'قنا', 'محافظة قنا'].filter(Boolean).join(' ')
                   )}`}
                   className="btn bg-sky-600 text-white hover:bg-sky-700 text-sm">
                  <MapPin className="w-4 h-4" /> فتح في خرائط جوجل
                </a>
                <a target="_blank" rel="noreferrer"
                   href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`}
                   className="btn-outline text-sm">
                  <MapPin className="w-4 h-4" /> موقع دقيق (إحداثيات)
                </a>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold mb-3">اتصل الآن</h3>
            {s.phone ? (
              <a href={`tel:${s.phone}`} className="btn-primary w-full justify-center">
                <Phone className="w-4 h-4" /> <span className="copyable">{s.phone}</span>
              </a>
            ) : (
              <div className="text-sm text-slate-500">لا يوجد رقم متاح</div>
            )}
            {s.whatsapp && (
              <a href={`https://wa.me/${s.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                 className="btn bg-emerald-500 text-white hover:bg-emerald-600 w-full justify-center mt-2">
                <MessageCircle className="w-4 h-4" /> واتساب
              </a>
            )}
            {/* Always-available Google Maps search by name + Qena —
                works even if the service has no stored lat/lng */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                [s.name, s.address, s.city || 'قنا', 'محافظة قنا'].filter(Boolean).join(' ')
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn bg-sky-600 text-white hover:bg-sky-700 w-full justify-center mt-2">
              <MapPin className="w-4 h-4" /> فتح في خرائط جوجل
            </a>
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-2">هل المعلومات غير صحيحة؟</h3>
            <p className="text-sm text-slate-500 mb-3">صحح حقل واحد فقط (الاسم / الهاتف / العنوان / الموقع) في ثوانٍ.</p>
            <button type="button" onClick={() => setCorrecting(true)} className="btn-outline w-full justify-center">
              <Edit3 className="w-4 h-4" /> إرسال تصحيح
            </button>
          </div>

          {/* Sidebar ad slot — non-intrusive, won't show unless configured */}
          <AdSlot slot={AdSlot.SIDEBAR || AdSlot.INLINE} format="auto" />
        </aside>
      </section>

      {correcting && (
        <CorrectionModal service={s} onClose={() => setCorrecting(false)} />
      )}
    </div>
  );
}

function Row({ icon: Ic, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3">
      <Ic className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
      <div className="text-xs sm:text-sm text-slate-500 w-20 sm:w-28 shrink-0 pt-0.5">{label}</div>
      <div className="flex-1 min-w-0">
        {href ? (
          <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
             className="text-brand-700 hover:text-brand-800 font-medium break-words text-sm sm:text-base copyable">{value}</a>
        ) : (
          <span className="text-slate-800 break-words text-sm sm:text-base copyable">{value}</span>
        )}
      </div>
    </div>
  );
}
