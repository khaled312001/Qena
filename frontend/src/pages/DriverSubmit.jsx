import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CheckCircle2, Info, Car, Truck, Bike, Bus, Users,
  ShieldCheck, MapPin, Clock,
} from 'lucide-react';
import api from '../lib/api.js';
import LocationPicker from '../components/LocationPicker.jsx';
import ApprovedMarquee from '../components/ApprovedMarquee.jsx';
import ImageUploader from '../components/ImageUploader.jsx';

const VEHICLE_TYPES = [
  { id: 'microbus',   label: 'ميكروباص',      icon: Bus,   desc: 'رحلات داخلية وبين المحافظات' },
  { id: 'sedan',      label: 'سيارة ملاكي',   icon: Car,   desc: 'سيدان - 4 راكب' },
  { id: '7seater',    label: 'سيارة 7 راكب',  icon: Users, desc: 'عائلية كبيرة' },
  { id: 'truck',      label: 'سيارة نقل',     icon: Truck, desc: 'شحن ونقل بضائع' },
  { id: 'motorcycle', label: 'موتوسيكل',      icon: Bike,  desc: 'توصيل سريع داخل المدينة' },
];

// Egyptian governorates for inter-city trips
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية',
  'الأقصر', 'أسوان', 'سوهاج', 'أسيوط',
  'البحر الأحمر (الغردقة / سفاجا)', 'مرسى علم', 'شرم الشيخ',
  'بني سويف', 'المنيا', 'الفيوم',
  'المنصورة', 'طنطا', 'الزقازيق', 'دمياط', 'الإسماعيلية', 'بورسعيد', 'السويس',
];

const QENA_CITIES = [
  'قنا', 'نجع حمادي', 'قوص', 'دشنا', 'فرشوط', 'أبو تشت', 'نقادة', 'قفط', 'الوقف',
];

// Truck tonnage options (when vehicle = truck)
const TRUCK_SIZES = ['1 طن', '3 طن', '5 طن', '7 طن', '10 طن', 'مقطورة', 'أخرى'];

export default function DriverSubmit() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    driver_name: '',
    phone: '',
    whatsapp: '',
    vehicle_type: 'microbus',
    vehicle_model: '',
    vehicle_plate: '',
    passenger_capacity: '',
    truck_size: '',
    within_qena: true,
    qena_cities: [],
    inter_gov: [],
    other_areas: '',
    working_hours: '',
    price_range: '',
    description: '',
    contact_note: '',
    image_url: '',
  });
  const [basePin, setBasePin] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleInArr = (k, v) => setForm((f) => ({
    ...f,
    [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
  }));
  const isTruck = form.vehicle_type === 'truck';
  const isMoto = form.vehicle_type === 'motorcycle';

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.driver_name.trim()) { toast.error('اكتب اسم السائق'); return; }
    if (!form.phone.trim()) { toast.error('رقم الهاتف مطلوب'); return; }

    setLoading(true);
    try {
      const vt = VEHICLE_TYPES.find((v) => v.id === form.vehicle_type);
      // Build a concise, readable name for the admin list
      const name = `${vt.label} — ${form.driver_name.trim()}`;

      // Put vehicle type + routes in tags so they're filterable later.
      const tagParts = [vt.label];
      if (form.vehicle_model) tagParts.push(form.vehicle_model);
      if (isTruck && form.truck_size) tagParts.push(form.truck_size);
      if (!isTruck && form.passenger_capacity) tagParts.push(`${form.passenger_capacity} راكب`);
      if (form.within_qena) tagParts.push('داخل قنا');
      if (form.inter_gov.length) tagParts.push('بين المحافظات');
      const tags = tagParts.join(', ').slice(0, 255);

      // Build a clean description for the card
      const descLines = [];
      descLines.push(`${vt.label}${form.vehicle_model ? ` (${form.vehicle_model})` : ''}`);
      if (form.vehicle_plate) descLines.push(`رقم اللوحة: ${form.vehicle_plate}`);
      if (!isTruck && form.passenger_capacity) descLines.push(`سعة: ${form.passenger_capacity} راكب`);
      if (isTruck && form.truck_size) descLines.push(`الحمولة: ${form.truck_size}`);
      if (form.within_qena) {
        descLines.push(`يعمل داخل قنا${form.qena_cities.length ? `: ${form.qena_cities.join('، ')}` : ''}`);
      }
      if (form.inter_gov.length) descLines.push(`رحلات بين المحافظات: ${form.inter_gov.join('، ')}`);
      if (form.other_areas) descLines.push(`مناطق أخرى: ${form.other_areas}`);
      if (form.description) descLines.push(form.description);
      const description = descLines.join('\n');

      const payload = {
        name: name.slice(0, 160),
        description: description.slice(0, 1000),
        city: 'محافظة قنا',
        address: form.qena_cities[0] || 'قنا',
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || null,
        working_hours: form.working_hours || null,
        price_range: form.price_range || null,
        tags,
        image_url: form.image_url || null,
        lat: basePin?.lat || null,
        lng: basePin?.lng || null,
        submitted_by_name: form.driver_name,
        submitted_by_contact: form.contact_note || form.phone,
        // category_id is set by the admin or inferred — we send via a slug helper below
      };

      // We need the category_id. Fetch it once.
      const catResp = await api.get('/categories');
      const cat = catResp.data.find((c) => c.slug === 'private-transport');
      if (!cat) throw new Error('قسم المواصلات الخاصة غير مُهيأ — تواصل مع الإدارة');
      payload.category_id = cat.id;

      await api.post('/services/submit', payload);
      setSent(true);
      toast.success('تم إرسال البيانات — الإدارة ستراجعها قبل النشر');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'تعذّر الإرسال');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="container-p py-16">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card p-8 text-center max-w-xl mx-auto">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">شكراً — تم استلام البيانات</h2>
          <p className="text-slate-600 leading-7 mb-6">
            بيانات سيارتك قيد المراجعة. بعد الموافقة سيظهر ملفك في قسم <b>مواصلات خاصة</b>
            ويستطيع الناس التواصل معك مباشرة.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link to="/category/private-transport" className="btn-primary">رؤية القسم</Link>
            <Link to="/" className="btn-outline">الرئيسية</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-bl from-emerald-700 via-emerald-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/hero-pattern.svg)', backgroundSize: 'cover' }} />
        <div className="container-p py-10 md:py-14 relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs mb-3">
              <Car className="w-4 h-4" /> سجّل سيارتك مجاناً
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">سجّل كـ سائق على قناوي</h1>
            <p className="text-white/90 leading-8 text-base md:text-lg">
              لو عندك <b>ميكروباص، ملاكي، 7 راكب، نقل، أو موتوسيكل</b> — سجّل سيارتك وخلي الناس في قنا تتواصل معك
              مباشرة لرحلات داخلية أو بين المحافظات (الأقصر، الغردقة، القاهرة، إلخ). كل المحافظة تشوفك.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container-p py-8 md:py-10">
        <div className="max-w-3xl mx-auto mb-6">
          <ApprovedMarquee
            categorySlug="private-transport"
            title="السائقون المعتمدون"
            subtitle="ميكروباص، ملاكي، نقل، موتوسيكل — معتمدون من الإدارة، اضغط للتواصل"
            accent="emerald"
          />
        </div>
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto space-y-5">
          {/* Notice */}
          <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-sm leading-7">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <b>كل التسجيلات تخضع لمراجعة الإدارة</b> قبل النشر. يُرجى كتابة بيانات صحيحة —
              الإدارة قد تطلب مستندات ترخيص قبل الموافقة.
            </div>
          </div>

          {/* Vehicle type */}
          <Card title="نوع السيارة" icon={Car}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {VEHICLE_TYPES.map((v) => {
                const active = form.vehicle_type === v.id;
                return (
                  <button type="button" key={v.id} onClick={() => update('vehicle_type', v.id)}
                    className={`text-right rounded-xl border p-3 transition ${
                      active ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-100'
                             : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <v.icon className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-sm">{v.label}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-5">{v.desc}</div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Driver identity */}
          <Card title="بيانات السائق">
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="اسم السائق *">
                <input className="input" value={form.driver_name}
                  onChange={(e) => update('driver_name', e.target.value)} required />
              </Field>
              <Field label="رقم الهاتف *">
                <input dir="ltr" className="input" value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="01xxxxxxxxx" required />
              </Field>
              <Field label="واتساب (اختياري)">
                <input dir="ltr" className="input" value={form.whatsapp}
                  onChange={(e) => update('whatsapp', e.target.value)}
                  placeholder="01xxxxxxxxx" />
              </Field>
              <Field label="مواعيد العمل">
                <input className="input" placeholder="مثال: 6 ص - 12 م، أو 24 ساعة"
                  value={form.working_hours} onChange={(e) => update('working_hours', e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Vehicle details */}
          <Card title="تفاصيل السيارة">
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="موديل السيارة / الماركة">
                <input className="input" placeholder={
                  isMoto ? 'مثال: سوزوكي سمارت' :
                  isTruck ? 'مثال: إيسوزو / هيونداي' :
                  'مثال: تويوتا هايس، رينو لوجان...'
                } value={form.vehicle_model} onChange={(e) => update('vehicle_model', e.target.value)} />
              </Field>
              <Field label="رقم اللوحة (اختياري)">
                <input className="input" placeholder="مثال: ق ن ق 1234"
                  value={form.vehicle_plate} onChange={(e) => update('vehicle_plate', e.target.value)} />
              </Field>
              {!isTruck && !isMoto && (
                <Field label="عدد الركاب (ما عدا السائق)">
                  <input dir="ltr" type="number" min="1" max="50" className="input"
                    placeholder="مثال: 14"
                    value={form.passenger_capacity}
                    onChange={(e) => update('passenger_capacity', e.target.value)} />
                </Field>
              )}
              {isTruck && (
                <Field label="الحمولة / حجم النقل">
                  <select className="input" value={form.truck_size}
                    onChange={(e) => update('truck_size', e.target.value)}>
                    <option value="">— اختر —</option>
                    {TRUCK_SIZES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              )}
              <Field label="نطاق الأسعار (اختياري)">
                <input className="input" placeholder="اقتصادي / متوسط / مرتفع"
                  value={form.price_range} onChange={(e) => update('price_range', e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Service area */}
          <Card title="نطاق الخدمة" icon={MapPin}>
            <label className="flex items-center gap-2 mb-3">
              <input type="checkbox" checked={form.within_qena}
                onChange={(e) => update('within_qena', e.target.checked)} />
              <span className="font-semibold">أعمل داخل محافظة قنا</span>
            </label>

            {form.within_qena && (
              <div className="mb-4">
                <div className="text-xs text-slate-600 mb-2">المدن التي تخدمها داخل قنا (اختياري):</div>
                <div className="flex flex-wrap gap-1.5">
                  {QENA_CITIES.map((c) => {
                    const active = form.qena_cities.includes(c);
                    return (
                      <button type="button" key={c} onClick={() => toggleInArr('qena_cities', c)}
                        className={`text-xs px-2.5 py-1.5 rounded-full border transition ${
                          active ? 'bg-emerald-600 text-white border-emerald-600'
                                 : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}>{c}</button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs text-slate-600 mb-2">رحلات بين المحافظات (اختر ما تخدمه):</div>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {GOVERNORATES.map((g) => {
                  const active = form.inter_gov.includes(g);
                  return (
                    <button type="button" key={g} onClick={() => toggleInArr('inter_gov', g)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border transition ${
                        active ? 'bg-brand-600 text-white border-brand-600'
                               : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}>{g}</button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs text-slate-600 mb-1">مناطق أخرى (اختياري)</label>
              <input className="input text-sm" placeholder="مثال: طريق سفاجا الصحراوي، أي منطقة..."
                value={form.other_areas} onChange={(e) => update('other_areas', e.target.value)} />
            </div>
          </Card>

          {/* Base location */}
          <Card title="موقع السائق الأساسي (اختياري)" icon={MapPin}>
            <p className="text-xs text-slate-500 mb-3">حدد المكان الذي تبدأ منه رحلاتك عادةً — يساعد الزبائن القريبين يختاروك.</p>
            <LocationPicker value={basePin} onChange={setBasePin} height={240} />
          </Card>

          {/* Image upload */}
          <Card title="صورة للسيارة (اختياري)" icon={Car}>
            <p className="text-xs text-slate-500 mb-3">
              صورة واضحة للسيارة أو الميكروباص تعطي الزبون ثقة. لا ترفع صور شخصية
              أو بيانات بطاقتك الشخصية.
            </p>
            <ImageUploader
              value={form.image_url}
              onChange={(url) => update('image_url', url || '')}
              endpoint="/services/submit/upload"
              label="اختر صورة للسيارة"
            />
          </Card>

          {/* Extra */}
          <Card title="ملاحظات">
            <textarea className="input min-h-[90px]" placeholder="أي تفاصيل تريد إضافتها عن خدمتك..."
              value={form.description} onChange={(e) => update('description', e.target.value)} />
          </Card>

          <button disabled={loading}
            className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full justify-center text-base py-3">
            {loading ? 'جارٍ الإرسال...' : 'إرسال للمراجعة'}
          </button>
        </form>
      </section>
    </div>
  );
}

function Card({ title, icon: Ic, children }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        {Ic && <Ic className="w-4 h-4 text-emerald-700" />}
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
