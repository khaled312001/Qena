import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CheckCircle2, Home, BedDouble, Key, MapPin, ShieldCheck,
  Users, Wifi, Snowflake, Refrigerator, Shirt, Flame, Bath,
  ChefHat, ArrowUpDown, UserCheck, GraduationCap, Briefcase,
} from 'lucide-react';
import api from '../lib/api.js';
import LocationPicker from '../components/LocationPicker.jsx';
import ApprovedMarquee from '../components/ApprovedMarquee.jsx';
import ImageUploader from '../components/ImageUploader.jsx';

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'شقة كاملة', icon: Home,      desc: 'تأجير شقة كاملة' },
  { id: 'room',      label: 'غرفة',      icon: Key,       desc: 'غرفة داخل شقة مشتركة' },
  { id: 'bed',       label: 'سرير',      icon: BedDouble, desc: 'سرير في غرفة مشتركة' },
  { id: 'studio',    label: 'استوديو',   icon: Home,      desc: 'وحدة استوديو للأفراد' },
];

const AUDIENCE = [
  { id: 'boys',      label: 'شباب فقط',    icon: Users },
  { id: 'girls',     label: 'بنات فقط',    icon: Users },
  { id: 'families',  label: 'عائلات',      icon: UserCheck },
  { id: 'students',  label: 'طلاب',        icon: GraduationCap },
  { id: 'employees', label: 'موظفون',      icon: Briefcase },
];

const AMENITIES = [
  { id: 'ac',              label: 'مكيف',           icon: Snowflake },
  { id: 'wifi',             label: 'واي فاي',         icon: Wifi },
  { id: 'furnished',        label: 'مفروش بالكامل',    icon: Home },
  { id: 'fridge',           label: 'ثلاجة',           icon: Refrigerator },
  { id: 'washer',           label: 'غسالة',           icon: Shirt },
  { id: 'heater',           label: 'سخان',            icon: Flame },
  { id: 'private_bath',     label: 'حمام خاص',        icon: Bath },
  { id: 'kitchen',          label: 'مطبخ',            icon: ChefHat },
  { id: 'elevator',         label: 'أسانسير',         icon: ArrowUpDown },
  { id: 'near_uni',         label: 'قريب من الجامعة',  icon: GraduationCap },
];

// Examples of well-known landmarks near Qena University — students & owners
// recognize these by name, so chips help auto-fill but the address field stays free.
const QENA_AREAS = [
  'الشئون', 'دردشة المساكن', 'حوض 10', 'شارع الجميل', 'البنزيون',
  'جامعة قنا', 'الكلية', 'وسط المدينة',
];

export default function RentalSubmit() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: 'owner',
    owner_name: '',
    phone: '',
    whatsapp: '',
    property_type: 'room',
    title: '',
    area: '',
    address: '',
    floor: '',
    rooms_total: '',
    beds_total: '',
    beds_available: '',
    price_bed: '',
    price_room: '',
    price_apartment: '',
    deposit: '',
    audience: [],
    amenities: [],
    distance_to_uni: '',
    description: '',
    image_url: '',
  });
  const [pin, setPin] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleInArr = (k, v) => setForm((f) => ({
    ...f,
    [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
  }));

  const pType = PROPERTY_TYPES.find((p) => p.id === form.property_type);
  const isApt = form.property_type === 'apartment' || form.property_type === 'studio';
  const isBed = form.property_type === 'bed';
  const isRoom = form.property_type === 'room';

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.owner_name.trim()) { toast.error('اكتب اسمك'); return; }
    if (!form.phone.trim()) { toast.error('رقم الهاتف مطلوب'); return; }
    if (!form.area.trim() && !form.address.trim()) { toast.error('حدد المنطقة أو العنوان'); return; }

    setLoading(true);
    try {
      // Name: "<property> — <area>"
      const isSeeker = form.role === 'seeker';
      const nameBase = form.title.trim() || `${pType.label}${form.area ? ` — ${form.area}` : ''}`;
      const name = (isSeeker ? `🔍 طلب سكن: ${nameBase}` : nameBase).slice(0, 160);

      // Tags: filterable chips
      const tagParts = [isSeeker ? 'طلب بحث' : pType.label];
      if (isSeeker) tagParts.push(pType.label);
      if (isBed && form.beds_available) tagParts.push(`${form.beds_available} سرير متاح`);
      if (isRoom && form.rooms_total) tagParts.push(`${form.rooms_total} غرف`);
      form.audience.forEach((a) => {
        const item = AUDIENCE.find((x) => x.id === a);
        if (item) tagParts.push(item.label);
      });
      form.amenities.slice(0, 5).forEach((a) => {
        const item = AMENITIES.find((x) => x.id === a);
        if (item) tagParts.push(item.label);
      });
      const tags = tagParts.join(', ').slice(0, 255);

      // Price range
      let priceRange = '';
      if (isBed && form.price_bed) priceRange = `${form.price_bed} ج/سرير`;
      else if (isRoom && form.price_room) priceRange = `${form.price_room} ج/غرفة`;
      else if (isApt && form.price_apartment) priceRange = `${form.price_apartment} ج/شهر`;

      // Structured description
      const descLines = [];
      descLines.push(pType.label + (form.title ? ` — ${form.title}` : ''));
      if (form.floor) descLines.push(`الدور: ${form.floor}`);
      if (form.rooms_total) descLines.push(`عدد الغرف: ${form.rooms_total}`);
      if (form.beds_total) descLines.push(`عدد الأسرّة الكلي: ${form.beds_total}`);
      if (form.beds_available) descLines.push(`الأسرّة المتاحة الآن: ${form.beds_available}`);
      if (form.audience.length) {
        const labels = form.audience.map((a) => AUDIENCE.find((x) => x.id === a)?.label).filter(Boolean);
        descLines.push(`الفئة: ${labels.join('، ')}`);
      }
      if (form.amenities.length) {
        const labels = form.amenities.map((a) => AMENITIES.find((x) => x.id === a)?.label).filter(Boolean);
        descLines.push(`المميزات: ${labels.join('، ')}`);
      }
      if (form.distance_to_uni) descLines.push(`المسافة للجامعة: ${form.distance_to_uni}`);
      if (form.price_bed) descLines.push(`سعر السرير: ${form.price_bed} ج/شهر`);
      if (form.price_room) descLines.push(`سعر الغرفة: ${form.price_room} ج/شهر`);
      if (form.price_apartment) descLines.push(`سعر الشقة الكامل: ${form.price_apartment} ج/شهر`);
      if (form.deposit) descLines.push(`التأمين: ${form.deposit}`);
      if (form.description) descLines.push('', form.description);
      const description = descLines.join('\n').slice(0, 1500);

      const catResp = await api.get('/categories');
      const cat = catResp.data.find((c) => c.slug === 'student-housing');
      if (!cat) throw new Error('قسم السكن غير مُهيأ — تواصل مع الإدارة');

      const payload = {
        category_id: cat.id,
        name,
        description,
        city: 'قنا',
        address: form.address || form.area,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || null,
        price_range: priceRange || null,
        tags,
        image_url: form.image_url || null,
        lat: pin?.lat || null,
        lng: pin?.lng || null,
        submitted_by_name: form.owner_name,
        submitted_by_contact: form.phone,
      };

      await api.post('/services/submit', payload);
      setSent(true);
      toast.success(isSeeker
        ? 'تم إرسال طلبك — الإدارة ستراجعه قبل النشر'
        : 'تم إرسال العرض — الإدارة ستراجعه قبل النشر');
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
          <h2 className="text-2xl font-bold mb-2">شكراً — تم استلام العرض</h2>
          <p className="text-slate-600 leading-7 mb-6">
            عرض السكن قيد المراجعة. بعد الموافقة سيظهر في قسم <b>سكن طلابي</b> ويستطيع الطلاب والموظفون التواصل معك مباشرة.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link to="/category/student-housing" className="btn-primary">رؤية القسم</Link>
            <Link to="/" className="btn-outline">الرئيسية</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-bl from-sky-700 via-sky-800 to-sky-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/hero-pattern.svg)', backgroundSize: 'cover' }} />
        <div className="container-p py-10 md:py-14 relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs mb-3">
              <Home className="w-4 h-4" /> اعرض سكنك مجاناً
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">أضِف شقة أو غرفة للإيجار</h1>
            <p className="text-white/90 leading-8 text-base md:text-lg">
              لو عندك <b>شقة مفروشة، غرفة، أو سرير</b> للإيجار في قنا — اعرضها هنا مجاناً.
              طلاب <b>جامعة قنا</b> والموظفون سيتواصلون معك مباشرة. حدد المواصفات والسعر والفئة المستهدفة.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container-p py-8 md:py-10">
        <div className="max-w-3xl mx-auto mb-6">
          <ApprovedMarquee
            categorySlug="student-housing"
            title="عروض السكن المنشورة"
            subtitle="شقق وغرف وأسرّة معتمدة من الإدارة — اضغط على أي عرض للتفاصيل"
            accent="sky"
          />
        </div>
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto space-y-5">
          {/* Disclaimer — important */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-4 text-sm leading-7">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">إخلاء مسؤولية</div>
              <div>
                قناوي منصة <b>عرض وتواصل فقط</b>. نحن لسنا طرفاً في أي تعاقد بينك وبين المستأجر،
                ولا نتحمل أي مسؤولية عن عمليات الاحتيال أو النزاعات أو المدفوعات. يرجى التحقق من كل التفاصيل
                والمستندات قبل الدفع. الإدارة قد ترفض أي عرض يحتوي بيانات غير موثوقة.
              </div>
            </div>
          </div>

          {/* Role */}
          <Card title="أنت">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'owner',   label: 'مالك السكن',         desc: 'أعرض شقتي' },
                { id: 'agent',   label: 'سمسار / وسيط',       desc: 'أعرض شقة عميل' },
                { id: 'seeker',  label: 'طالب / موظف',         desc: 'أبحث عن سكن' },
              ].map((r) => (
                <button type="button" key={r.id} onClick={() => update('role', r.id)}
                  className={`rounded-xl border p-3 text-sm font-bold transition text-center ${
                    form.role === r.id
                      ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-100 text-sky-900'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}>
                  <div>{r.label}</div>
                  <div className="text-[11px] font-normal text-slate-500 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
            {form.role === 'seeker' && (
              <div className="mt-3 text-xs bg-sky-50 border border-sky-200 text-sky-900 rounded-lg p-2.5 leading-6">
                <b>نشر طلب بحث:</b> سيظهر طلبك في قسم السكن. الملاك والسماسرة سيتواصلون معك لو لاقوا ما يناسب طلبك.
              </div>
            )}
          </Card>

          {/* Owner info */}
          <Card title="بيانات التواصل">
            <div className="grid md:grid-cols-2 gap-3">
              <Field label={
                form.role === 'owner' ? 'اسم المالك *'
                : form.role === 'agent' ? 'اسم السمسار *'
                : 'اسمك *'
              }>
                <input className="input" value={form.owner_name}
                  onChange={(e) => update('owner_name', e.target.value)} required />
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
              <Field label={form.role === 'seeker' ? 'عنوان طلبك (اختياري)' : 'عنوان مختصر للعرض (اختياري)'}>
                <input className="input" placeholder={
                  form.role === 'seeker'
                    ? 'مثال: طالب أبحث عن سرير بجوار الجامعة'
                    : 'مثال: شقة طلاب بنات بجوار الجامعة'
                } value={form.title} onChange={(e) => update('title', e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Property type */}
          <Card title="نوع العرض" icon={Home}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PROPERTY_TYPES.map((v) => {
                const active = form.property_type === v.id;
                return (
                  <button type="button" key={v.id} onClick={() => update('property_type', v.id)}
                    className={`text-right rounded-xl border p-3 transition ${
                      active ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-100'
                             : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        active ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
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

          {/* Capacity */}
          <Card title="المواصفات" icon={BedDouble}>
            <div className="grid md:grid-cols-3 gap-3">
              <Field label="الدور (اختياري)">
                <input className="input" placeholder="مثال: الثاني"
                  value={form.floor} onChange={(e) => update('floor', e.target.value)} />
              </Field>
              <Field label="عدد الغرف">
                <input dir="ltr" type="number" min="0" max="20" className="input"
                  placeholder="مثال: 3"
                  value={form.rooms_total} onChange={(e) => update('rooms_total', e.target.value)} />
              </Field>
              <Field label="عدد الأسرّة (الكلي)">
                <input dir="ltr" type="number" min="0" max="40" className="input"
                  placeholder="مثال: 6"
                  value={form.beds_total} onChange={(e) => update('beds_total', e.target.value)} />
              </Field>
              <Field label="الأسرّة المتاحة الآن">
                <input dir="ltr" type="number" min="0" max="40" className="input"
                  placeholder="كم سرير فاضي؟"
                  value={form.beds_available} onChange={(e) => update('beds_available', e.target.value)} />
              </Field>
              <Field label="المسافة للجامعة (اختياري)">
                <input className="input" placeholder="مثال: 5 دقائق مشي"
                  value={form.distance_to_uni} onChange={(e) => update('distance_to_uni', e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Audience */}
          <Card title="الفئة المستهدفة" icon={UserCheck}>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE.map((a) => {
                const active = form.audience.includes(a.id);
                return (
                  <button type="button" key={a.id} onClick={() => toggleInArr('audience', a.id)}
                    className={`inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-full border transition ${
                      active ? 'bg-sky-600 text-white border-sky-600'
                             : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}>
                    <a.icon className="w-4 h-4" /> {a.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Amenities */}
          <Card title="المميزات (اختر ما ينطبق)">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AMENITIES.map((a) => {
                const active = form.amenities.includes(a.id);
                return (
                  <button type="button" key={a.id} onClick={() => toggleInArr('amenities', a.id)}
                    className={`inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border transition ${
                      active ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                             : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}>
                    <a.icon className={`w-4 h-4 ${active ? 'text-emerald-600' : 'text-slate-500'}`} />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Pricing */}
          <Card title="السعر (الإيجار الشهري)">
            <div className="grid md:grid-cols-3 gap-3">
              {(isBed || isRoom) && (
                <Field label="سعر السرير / شهر (ج)">
                  <input dir="ltr" type="number" min="0" className="input"
                    placeholder="مثال: 700"
                    value={form.price_bed} onChange={(e) => update('price_bed', e.target.value)} />
                </Field>
              )}
              {(isRoom || isApt) && (
                <Field label="سعر الغرفة / شهر (ج)">
                  <input dir="ltr" type="number" min="0" className="input"
                    placeholder="مثال: 1500"
                    value={form.price_room} onChange={(e) => update('price_room', e.target.value)} />
                </Field>
              )}
              {isApt && (
                <Field label="سعر الشقة كاملة / شهر (ج)">
                  <input dir="ltr" type="number" min="0" className="input"
                    placeholder="مثال: 5000"
                    value={form.price_apartment} onChange={(e) => update('price_apartment', e.target.value)} />
                </Field>
              )}
              <Field label="التأمين (اختياري)">
                <input className="input" placeholder="مثال: شهر مقدم"
                  value={form.deposit} onChange={(e) => update('deposit', e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Location */}
          <Card title="الموقع" icon={MapPin}>
            <div className="mb-3">
              <div className="text-xs text-slate-600 mb-2">
                أمثلة لمناطق قريبة من الجامعة (اضغط لتُملأ تلقائياً، أو اكتب أي منطقة في خانة العنوان):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QENA_AREAS.map((c) => {
                  const active = form.area === c;
                  return (
                    <button type="button" key={c} onClick={() => update('area', active ? '' : c)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border transition ${
                        active ? 'bg-sky-600 text-white border-sky-600'
                               : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}>{c}</button>
                  );
                })}
              </div>
            </div>
            <Field label="العنوان التفصيلي">
              <input className="input"
                placeholder="مثال: الشئون - دردشة المساكن - حوض 10 - شارع الجميل - البنزيون..."
                value={form.address} onChange={(e) => update('address', e.target.value)} />
            </Field>
            <div className="mt-3">
              <div className="text-xs text-slate-600 mb-2">ثبّت الموقع على الخريطة (اختياري):</div>
              <LocationPicker value={pin} onChange={setPin} height={240} />
            </div>
          </Card>

          {/* Image upload */}
          <Card title="صورة للسكن (اختياري)">
            <div className="text-xs text-slate-500 mb-2 leading-6">
              صورة واضحة للشقة أو الغرفة تساعد المستأجرين على اتخاذ قرار أسرع.
              الصور بدون تحديد موقع دقيق أو أرقام أشخاص غير مرغوب فيها قد تُرفض.
            </div>
            <ImageUploader
              value={form.image_url}
              onChange={(url) => update('image_url', url || '')}
              endpoint="/services/submit/upload"
              label="اختر صورة للسكن"
            />
          </Card>

          {/* Description */}
          <Card title="وصف إضافي (اختياري)">
            <textarea className="input min-h-[120px]"
              placeholder="اذكر أي تفاصيل مهمة: مساحة الغرف، قواعد السكن، شروط التعاقد..."
              value={form.description} onChange={(e) => update('description', e.target.value)} />
          </Card>

          <button disabled={loading}
            className="btn bg-sky-600 hover:bg-sky-700 text-white w-full justify-center text-base py-3">
            {loading ? 'جارٍ الإرسال...' : 'إرسال للمراجعة'}
          </button>

          <div className="text-[11px] text-slate-500 text-center leading-6">
            بإرسال العرض أنت تقرّ بأن المعلومات صحيحة وأنك مسؤول وحدك عن أي تعاقد مع المستأجر.
            قناوي وبرمجلي غير مسؤولين عن أي عمليات احتيال أو نزاعات.
          </div>
        </form>
      </section>
    </div>
  );
}

function Card({ title, icon: Ic, children }) {
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
        {Ic && <Ic className="w-4 h-4 text-sky-700" />}
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
