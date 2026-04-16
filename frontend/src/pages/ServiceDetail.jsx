import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MapPin, Clock, DollarSign, Globe, MessageCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../lib/api.js';
import { Icon } from '../lib/icons.jsx';

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
        <div className="container-p py-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link to="/" className="hover:text-brand-600">الرئيسية</Link>
            <ChevronRight className="w-4 h-4" />
            {cat.slug && (
              <>
                <Link to={`/category/${cat.slug}`} className="hover:text-brand-600">{cat.name}</Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="truncate">{s.name}</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: (cat.color || '#0ea5e9') + '15', color: cat.color || '#0ea5e9' }}>
              <Icon name={cat.icon} className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{s.name}</h1>
              {cat.name && <div className="text-sm text-slate-500 mt-0.5">{cat.name} · {s.city}</div>}
              {s.description && <p className="text-slate-600 mt-3 leading-7">{s.description}</p>}
            </div>
          </div>
        </div>
      </div>

      <section className="container-p py-8 grid lg:grid-cols-3 gap-6">
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
              <div className="p-3 border-t border-slate-100 text-center">
                <a target="_blank" rel="noreferrer"
                   href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`}
                   className="btn-outline text-sm">
                  <MapPin className="w-4 h-4" /> فتح في خرائط جوجل
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
                <Phone className="w-4 h-4" /> {s.phone}
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
          </div>

          <div className="card p-5">
            <h3 className="font-bold mb-2">هل المعلومات غير صحيحة؟</h3>
            <p className="text-sm text-slate-500 mb-3">ساعدنا بتصحيح البيانات</p>
            <Link to={`/submit?type=correction&service=${s.id}`} className="btn-outline w-full justify-center">
              <ArrowLeft className="w-4 h-4" /> إرسال تصحيح
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Row({ icon: Ic, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3">
      <Ic className="w-4 h-4 text-slate-400 shrink-0" />
      <div className="text-sm text-slate-500 w-28 shrink-0">{label}</div>
      {href ? (
        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
           className="text-brand-700 hover:text-brand-800 font-medium break-all">{value}</a>
      ) : (
        <span className="text-slate-800 break-all">{value}</span>
      )}
    </div>
  );
}
