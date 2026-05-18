import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MapPin, Clock, DollarSign, Globe, MessageCircle, ChevronRight, Edit3, Info, Navigation2, BookOpen } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../lib/api.js';
import { Icon } from '../lib/icons.jsx';
import AdSlot from '../components/AdSlot.jsx';
import CorrectionModal from '../components/CorrectionModal.jsx';
import SEO from '../components/SEO.jsx';

// Default marker fix for Leaflet + Vite
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Map a category slug → guide article slug to cross-link rich content from
// service pages. AdSense rewards internal linking to editorial content.
const GUIDE_BY_CATEGORY = {
  hospitals: 'hospitals-qena',
  clinics: 'hospitals-qena',
  pharmacies: 'pharmacies-24h-qena',
  hotels: 'hotels-qena',
  restaurants: 'restaurants-qena',
  banks: 'banks-atm-qena',
  tourism: 'qena-landmarks',
  transport: 'qena-to-cairo-transport',
  'private-transport': 'qena-to-cairo-transport',
};

const GUIDE_TITLE_BY_CATEGORY = {
  hospitals: 'دليل أفضل مستشفيات قنا',
  clinics: 'دليل المستشفيات والعيادات في قنا',
  pharmacies: 'صيدليات قنا 24 ساعة',
  hotels: 'دليل فنادق قنا',
  restaurants: 'أفضل مطاعم قنا',
  banks: 'بنوك وصرافات قنا',
  tourism: 'معالم قنا السياحية',
  transport: 'الانتقال من قنا للقاهرة',
  'private-transport': 'الانتقال من قنا للقاهرة',
};

// Generate a unique "about this place" paragraph from the service's own fields.
// Each service gets prose Google can index — not just contact info.
function buildAboutText(s, catName) {
  const sentences = [];
  const city = s.city || 'قنا';
  sentences.push(`${s.name} هي إحدى ${catName || 'الخدمات'} الموجودة في ${city}، محافظة قنا، صعيد مصر.`);
  if (s.address) {
    sentences.push(`المكان يقع في: ${s.address}.`);
  }
  if (s.working_hours) {
    sentences.push(`مواعيد العمل: ${s.working_hours}.`);
  }
  if (s.phone) {
    sentences.push(`يمكنك التواصل المباشر مع ${s.name} عبر الرقم ${s.phone} للاستفسار عن أي تفاصيل قبل الزيارة.`);
  }
  if (s.price_range) {
    sentences.push(`نطاق الأسعار: ${s.price_range}.`);
  }
  if (s.website) {
    sentences.push(`الموقع الإلكتروني الرسمي: ${s.website}.`);
  }
  if (s.whatsapp) {
    sentences.push(`متاح أيضاً التواصل عبر واتساب: ${s.whatsapp}.`);
  }
  if (s.lat && s.lng) {
    sentences.push(`الموقع الجغرافي محدد بدقة على خريطة قناوي، ويمكنك فتحه مباشرة في خرائط جوجل للحصول على اتجاهات القيادة من موقعك الحالي.`);
  }
  sentences.push(`جميع البيانات في صفحة ${s.name} تم تجميعها وتحديثها من خلال فريق قناوي ومساهمات المستخدمين، وإذا لاحظت أي معلومة تحتاج تصحيحاً، يمكنك استخدام زر "إرسال تصحيح" داخل الصفحة.`);
  return sentences.join(' ');
}

// Tips paragraph by category — small editorial blurbs targeted at the user's
// actual intent for that type of place. Adds unique words per page beyond
// the database row.
function tipsByCategory(slug, s) {
  const tips = {
    hospitals: [
      'إذا كانت الحالة طارئة، توجّه فوراً لقسم الطوارئ بدون انتظار حجز.',
      'لو كنت من خارج المدينة، احرص على معرفة موقف السيارات قبل الذهاب.',
      'احمل بطاقتك الشخصية وأي تقارير طبية سابقة معك.',
      'اتصل قبل الذهاب للتأكد من توفر الطبيب أو التخصص المطلوب.',
    ],
    clinics: [
      'اتصل لحجز موعد كشف قبل الذهاب لتجنّب الانتظار.',
      'اسأل عن سعر الكشف وسعر الفحوصات المطلوبة.',
      'احمل أي تقارير أو أشعة سابقة معك.',
      'بعض العيادات تخصم رسوم الإعادة خلال 15 يوم.',
    ],
    pharmacies: [
      'لو تحتاج روشتة، احمل صورة منها على تليفونك.',
      'اسأل عن البديل الجنريك الأرخص لو الدواء غالي.',
      'افحص تاريخ صلاحية الدواء قبل ترك الصيدلية.',
      'كثير من صيدليات قنا تقدّم خدمة توصيل بدون رسوم للطلبات الكبيرة.',
    ],
    hotels: [
      'اسأل عن السعر شاملاً الإفطار والضرائب.',
      'تأكد من توفر مكيف لو الزيارة في الصيف.',
      'الحجز قبل أسبوع من زيارة معبد دندرة موصى به.',
      'الحجز عبر منصات الإنترنت قد يكون أرخص من الحجز المباشر.',
    ],
    restaurants: [
      'اسأل عن السعر قبل الطلب — كثير من المطاعم لا تعرض قائمة أسعار.',
      'الإكرامية 5-10٪ من الفاتورة معتاد.',
      'للحجز في المناسبات، اتصل قبل يوم على الأقل.',
      'اطلب مياه معدنية مغلقة إذا كنت من خارج قنا.',
    ],
    cafes: [
      'الكافيهات تكون أكثر هدوءاً صباحاً وأكثر ازدحاماً مساءً.',
      'الحد الأدنى للطلب موجود في بعض الكافيهات — اسأل قبل الجلوس.',
      'كثير من الكافيهات لديها واي فاي مجاني للزبائن.',
    ],
    banks: [
      'مواعيد العمل الرسمية للبنوك في مصر: الأحد-الخميس 8:30 صباحاً - 3 ظهراً.',
      'في رمضان: من 9 صباحاً حتى 1 ظهراً عادة.',
      'احرص على معرفة الأوراق المطلوبة قبل الذهاب لتجنّب الاستياء.',
      'لاستفسار سريع، اتصل بخط البنك الساخن قبل الذهاب.',
    ],
    'gas-stations': [
      'كثير من محطات الوقود تعمل ٢٤ ساعة.',
      'احمل نقوداً سائلة — ليس كل المحطات تقبل بطاقات الائتمان.',
      'بعض المحطات تقدّم خدمات تغيير زيت، غسيل، وتبديل إطارات.',
    ],
    schools: [
      'مواعيد التسجيل تختلف حسب نوع المدرسة (حكومية/خاصة).',
      'احرص على معرفة الكتب المطلوبة والزي الموحد قبل بداية العام.',
      'اسأل عن خدمات الباص ومواعيد الإنصراف.',
    ],
    tourism: [
      'الموسم الأفضل للزيارة: أكتوبر-أبريل (الجو معتدل).',
      'احمل ماء وقبعة، خاصة للمعابد المكشوفة.',
      'استئجار مرشد محلي يكشف تفاصيل لن تجدها في الكتيبات.',
      'بعض المواقع تتطلب تذكرة منفصلة للتصوير.',
    ],
    government: [
      'مواعيد العمل: الأحد-الخميس 9 صباحاً - 2 ظهراً عادة.',
      'احمل أصل بطاقتك وصور كافية.',
      'اسأل قبل الذهاب عن الأوراق المطلوبة للخدمة.',
      'بعض الخدمات الآن متاحة إلكترونياً عبر بوابة الحكومة المصرية.',
    ],
  };
  return tips[slug] || [
    'تواصل مع الخدمة قبل الذهاب للتأكد من ساعات العمل.',
    'احفظ رقم المكان في تليفونك للوصول السريع.',
    'لو وجدت معلومة غير دقيقة، أرسل لنا تصحيحاً ليستفيد الجميع.',
  ];
}

export default function ServiceDetail() {
  const { id } = useParams();
  const [s, setS] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/services/${id}`).then((r) => {
      setS(r.data);
      // Fetch related services in same category (limit 6, exclude this one).
      const catSlug = r.data?.category?.slug;
      if (catSlug) {
        api.get('/services', { params: { category: catSlug, includeCategory: '0', limit: 8 } })
          .then((rr) => {
            const others = (rr.data.rows || []).filter((x) => x.id !== r.data.id).slice(0, 6);
            setRelated(others);
          }).catch(() => {});
      }
    }).finally(() => setLoading(false));
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
  // Only show real images — skip Unsplash category fallbacks / empty URLs.
  const realImage = s.image_url && !s.image_url.toLowerCase().includes('unsplash.com') ? s.image_url : null;

  // Per-service SEO — dynamic title, description, LocalBusiness JSON-LD,
  // and BreadcrumbList so Google shows rich breadcrumbs in SERPs.
  const seoTitle = `${s.name} — ${cat.name || 'خدمات قنا'} | قناوي دليل قنا`;
  const seoDesc = [
    s.name,
    cat.name,
    s.address || (s.city ? `${s.city}، محافظة قنا` : 'محافظة قنا'),
    s.phone ? `هاتف: ${s.phone}` : '',
    s.working_hours,
  ].filter(Boolean).join(' · ').slice(0, 300);
  const seoKeywords = [
    s.name, `${s.name} قنا`, cat.name ? `${cat.name} قنا` : '',
    s.city || '', s.phone || '',
    'دليل قنا', 'قناوي', 'محافظة قنا',
  ].filter(Boolean).join(', ');

  const lbType = ({
    hospitals: 'Hospital', clinics: 'MedicalClinic', pharmacies: 'Pharmacy',
    hotels: 'Hotel', restaurants: 'Restaurant', cafes: 'CafeOrCoffeeShop',
    banks: 'BankOrCreditUnion', 'gas-stations': 'GasStation',
    shops: 'Store', transport: 'LocalBusiness',
    government: 'GovernmentOffice', education: 'EducationalOrganization',
    tourism: 'TouristAttraction',
  })[cat.slug] || 'LocalBusiness';

  const lbLd = {
    '@context': 'https://schema.org',
    '@type': lbType,
    name: s.name,
    url: `https://qinawy.com/service/${s.id}`,
    ...(s.phone && { telephone: s.phone }),
    ...(realImage && { image: realImage.startsWith('http') ? realImage : `https://qinawy.com${realImage}` }),
    ...(s.description && { description: s.description.slice(0, 300) }),
    ...((s.address || s.city) && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: s.address || '',
        addressLocality: s.city || 'قنا',
        addressRegion: 'محافظة قنا',
        addressCountry: 'EG',
      },
    }),
    ...(s.lat && s.lng && {
      geo: { '@type': 'GeoCoordinates', latitude: Number(s.lat), longitude: Number(s.lng) },
    }),
    ...(s.working_hours && { openingHours: s.working_hours }),
    ...(s.website && { sameAs: [s.website] }),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://qinawy.com/' },
      cat.slug && { '@type': 'ListItem', position: 2, name: cat.name, item: `https://qinawy.com/category/${cat.slug}` },
      { '@type': 'ListItem', position: cat.slug ? 3 : 2, name: s.name, item: `https://qinawy.com/service/${s.id}` },
    ].filter(Boolean),
  };

  return (
    <div>
      <SEO
        path={`/service/${s.id}`}
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
        image={realImage}
        jsonLd={[lbLd, breadcrumbLd]}
      />
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
              </div>
            </div>
          )}

          {/* About this place — auto-generated unique paragraph from the
              service's own fields. Gives Googlebot + readers a textual summary
              beyond the contact form. */}
          <div className="card p-5">
            <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-brand-600" /> عن {s.name}
            </h2>
            <p className="text-slate-700 leading-8 text-sm sm:text-base">
              {buildAboutText(s, cat.name)}
            </p>
          </div>

          {/* How to find it — tips specific to this category */}
          <div className="card p-5">
            <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Navigation2 className="w-4 h-4 text-brand-600" /> كيف تصل لـ{s.name} ونصائح قبل الزيارة
            </h2>
            <p className="text-slate-700 leading-8 text-sm mb-3">
              {s.address
                ? `${s.name} يقع في ${s.address}، ${s.city || 'قنا'}. `
                : `${s.name} يقع في ${s.city || 'قنا'}، محافظة قنا. `}
              {hasMap
                ? 'الموقع محدد بدقة على الخريطة أعلاه — يمكنك الضغط على "فتح في خرائط جوجل" للحصول على اتجاهات القيادة من موقعك.'
                : 'للحصول على الاتجاهات بدقة، اتصل بالرقم في الأعلى أو ابحث عن الاسم في خرائط جوجل.'}
            </p>
            <ul className="list-disc pr-5 space-y-1.5 text-sm text-slate-700 leading-7">
              {tipsByCategory(cat.slug, s).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Cross-link to the guide article for this category. Internal
              linking to long-form editorial content boosts AdSense quality
              signals and Google ranking. */}
          {GUIDE_BY_CATEGORY[cat.slug] && (
            <Link to={`/guides/${GUIDE_BY_CATEGORY[cat.slug]}`}
                  className="card p-5 hover:ring-2 hover:ring-brand-300 transition block group">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-500 mb-0.5">مقال ذو صلة</div>
                  <div className="font-bold text-slate-900 group-hover:text-brand-700 transition">
                    {GUIDE_TITLE_BY_CATEGORY[cat.slug]}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-6">
                    دليل تفصيلي مكتوب يساعدك تختار أفضل {cat.name} في قنا.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-600 transition shrink-0" />
              </div>
            </Link>
          )}

          {/* Related services in the same category */}
          {related.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-slate-900 mb-3">
                {cat.name ? `${cat.name} أخرى في قنا` : 'خدمات أخرى مشابهة'}
              </h2>
              <ul className="divide-y divide-slate-100">
                {related.map((r) => (
                  <li key={r.id} className="py-2.5">
                    <Link to={`/service/${r.id}`} className="block hover:bg-slate-50 -mx-2 px-2 py-1 rounded transition">
                      <div className="font-semibold text-slate-800 text-sm">{r.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-2">
                        {r.city && <span>{r.city}</span>}
                        {r.address && <span className="truncate max-w-[200px]">{r.address}</span>}
                        {r.phone && <span dir="ltr">{r.phone}</span>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {cat.slug && (
                <Link to={`/category/${cat.slug}`} className="btn-outline w-full justify-center mt-4 text-sm">
                  عرض كل {cat.name} في قنا
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {/* Service image — natural aspect ratio (no cropping). Opens full-size
              on click. `h-auto` + `object-contain` keeps the full image visible. */}
          {realImage && (
            <a href={realImage} target="_blank" rel="noreferrer"
               className="card overflow-hidden block bg-slate-50 hover:ring-2 hover:ring-brand-300 transition">
              <img src={realImage} alt={s.name}
                   className="w-full h-auto max-h-96 object-contain"
                   onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} />
            </a>
          )}

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
