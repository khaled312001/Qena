import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CheckCircle2, Info } from 'lucide-react';
import api from '../lib/api.js';
import LocationPicker from '../components/LocationPicker.jsx';

export default function SubmitService() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultType = searchParams.get('type') === 'correction' ? 'correction' : 'new_service';
  const [form, setForm] = useState({
    type: defaultType,
    name: '',
    description: '',
    category_id: '',
    city: 'قنا',
    address: '',
    phone: '',
    whatsapp: '',
    working_hours: '',
    price_range: '',
    website: '',
    lat: null,
    lng: null,
    submitted_by_name: '',
    submitted_by_contact: '',
  });
  const [pin, setPin] = useState(null);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.type === 'correction') {
        await api.post('/suggestions', {
          kind: 'correction',
          subject: `تصحيح: ${form.name}`,
          message: form.description || 'تصحيح بيانات',
          name: form.submitted_by_name,
          contact: form.submitted_by_contact,
          service_id: Number(searchParams.get('service')) || null,
        });
      } else {
        const { type, ...rest } = form;
        if (!rest.category_id) { toast.error('اختر القسم'); setLoading(false); return; }
        if (pin) { rest.lat = pin.lat; rest.lng = pin.lng; }
        await api.post('/services/submit', rest);
      }
      setSent(true);
      toast.success('تم الإرسال بنجاح');
    } catch (err) {
      toast.error(err.response?.data?.error || 'تعذّر الإرسال');
    } finally {
      setLoading(false);
    }
  }

  if (sent) return (
    <div className="container-p py-16">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="card p-8 text-center max-w-xl mx-auto">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold mb-2">شكراً لمساهمتك!</h2>
        <p className="text-slate-600 leading-7 mb-6">
          تم استلام بياناتك وسيتم مراجعتها من قبل الإدارة قبل نشرها.
        </p>
        <Link to="/" className="btn-primary">العودة للرئيسية</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="container-p py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
          {form.type === 'correction' ? 'إرسال تصحيح' : 'إضافة خدمة جديدة'}
        </h1>
        <p className="text-slate-500 mb-6 text-sm">
          املأ البيانات وسيتم مراجعتها من إدارة الدليل قبل نشرها.
        </p>

        <div className="flex items-center gap-2 bg-brand-50 text-brand-800 border border-brand-100 rounded-xl p-3 mb-6">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-sm">كل ما ترسله يخضع لمراجعة إدارية. نرحب بأي إضافة تفيد أهل قنا.</p>
        </div>

        <form onSubmit={onSubmit} className="card p-5 md:p-6 space-y-4">
          <Field label="اسم الخدمة / المكان" required>
            <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </Field>

          {form.type !== 'correction' && (
            <Field label="القسم" required>
              <select className="input" value={form.category_id} onChange={(e) => update('category_id', e.target.value)} required>
                <option value="">— اختر القسم —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          )}

          <Field label="الوصف / ملاحظات">
            <textarea className="input min-h-[100px]" value={form.description}
              onChange={(e) => update('description', e.target.value)} />
          </Field>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="المدينة">
              <input className="input" value={form.city} onChange={(e) => update('city', e.target.value)} />
            </Field>
            <Field label="العنوان">
              <input className="input" value={form.address} onChange={(e) => update('address', e.target.value)} />
            </Field>
          </div>

          {/* Location picker — only for new service submissions (not corrections) */}
          {form.type !== 'correction' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                موقع المكان على الخريطة <span className="text-slate-400 text-xs font-normal">(اختياري لكن مفيد جداً)</span>
              </label>
              <LocationPicker value={pin} onChange={setPin} height={260} />
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-3">
            <Field label="رقم الهاتف">
              <input dir="ltr" className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </Field>
            <Field label="واتساب">
              <input dir="ltr" className="input" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} />
            </Field>
            <Field label="مواعيد العمل">
              <input className="input" placeholder="مثال: 9 ص - 10 م" value={form.working_hours} onChange={(e) => update('working_hours', e.target.value)} />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="الأسعار">
              <input className="input" placeholder="اقتصادي / متوسط / مرتفع" value={form.price_range} onChange={(e) => update('price_range', e.target.value)} />
            </Field>
            <Field label="الموقع الإلكتروني">
              <input dir="ltr" className="input" value={form.website} onChange={(e) => update('website', e.target.value)} />
            </Field>
          </div>

          <hr className="my-2" />
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="اسمك (اختياري)">
              <input className="input" value={form.submitted_by_name} onChange={(e) => update('submitted_by_name', e.target.value)} />
            </Field>
            <Field label="وسيلة تواصل (اختياري)">
              <input dir="ltr" className="input" placeholder="هاتف / بريد إلكتروني"
                value={form.submitted_by_contact} onChange={(e) => update('submitted_by_contact', e.target.value)} />
            </Field>
          </div>

          <div className="pt-2">
            <button disabled={loading} className="btn-primary w-full md:w-auto">
              {loading ? 'جارِ الإرسال...' : 'إرسال للمراجعة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
