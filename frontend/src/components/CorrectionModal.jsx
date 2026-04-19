import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, AlertCircle, Send } from 'lucide-react';
import api from '../lib/api.js';
import LocationPicker from './LocationPicker.jsx';
import ImageUploader from './ImageUploader.jsx';

const FIELDS = [
  { k: 'name', l: 'اسم المكان' },
  { k: 'phone', l: 'رقم الهاتف' },
  { k: 'address', l: 'العنوان' },
  { k: 'location', l: 'الموقع على الخريطة' },
  { k: 'working_hours', l: 'مواعيد العمل' },
  { k: 'website', l: 'الموقع الإلكتروني' },
  { k: 'closed', l: 'المكان مغلق نهائياً' },
  { k: 'other', l: 'شيء آخر' },
];

export default function CorrectionModal({ service, onClose }) {
  const [field, setField] = useState('phone');
  const [newValue, setNewValue] = useState('');
  const [pin, setPin] = useState(
    service.lat && service.lng ? { lat: Number(service.lat), lng: Number(service.lng) } : null
  );
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const currentVal = {
    name: service.name,
    phone: service.phone,
    address: service.address,
    location: service.lat && service.lng ? `${Number(service.lat).toFixed(5)}, ${Number(service.lng).toFixed(5)}` : '—',
    working_hours: service.working_hours,
    website: service.website,
  }[field] || '—';

  async function submit(e) {
    e && e.preventDefault();
    const fieldLabel = FIELDS.find((f) => f.k === field)?.l || field;

    // Build the correction message in a consistent format the admin can parse easily
    const lines = [];
    lines.push(`الخدمة: ${service.name} (#${service.id})`);
    lines.push(`الحقل: ${fieldLabel}`);
    lines.push(`القيمة الحالية: ${currentVal}`);
    if (field === 'location' && pin) {
      lines.push(`القيمة المقترحة: ${pin.lat.toFixed(6)}, ${pin.lng.toFixed(6)}`);
    } else if (field === 'closed') {
      lines.push(`الإجراء المقترح: ${newValue || 'إزالة المكان من الموقع (مغلق نهائياً)'}`);
    } else {
      lines.push(`القيمة المقترحة: ${newValue}`);
    }
    if (note) lines.push(`ملاحظات: ${note}`);
    if (imageUrl) lines.push(`📎 صورة مرفقة: ${imageUrl}`);

    if (field !== 'location' && !newValue && field !== 'closed') {
      toast.error('اكتب القيمة الصحيحة المقترحة');
      return;
    }
    if (field === 'location' && !pin) {
      toast.error('اختر الموقع الصحيح على الخريطة');
      return;
    }

    setLoading(true);
    try {
      await api.post('/suggestions', {
        kind: 'correction',
        subject: `تصحيح ${fieldLabel} لـ ${service.name}`,
        message: lines.join('\n'),
        name: name || null,
        contact: contact || null,
        service_id: service.id,
      });
      toast.success('تم إرسال التصحيح — شكراً لمساهمتك');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'تعذّر الإرسال، حاول لاحقاً');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto relative"
        style={{ zIndex: 10001 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3.5 flex items-center justify-between"
          style={{ zIndex: 10002 }}
        >
          <div>
            <h3 className="font-bold text-slate-900">إرسال تصحيح</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{service.name}</p>
          </div>
          <button onClick={onClose} className="btn-ghost !p-2"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-2 bg-brand-50 border border-brand-100 text-brand-900 rounded-xl p-3 text-xs leading-6">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>اختر الحقل الذي تريد تصحيحه فقط — الإدارة ستراجع التعديل وتنشره بعد التحقق.</div>
          </div>

          {/* Field selector chips */}
          <div>
            <label className="block text-sm font-semibold mb-2">ما الذي تريد تصحيحه؟</label>
            <div className="flex flex-wrap gap-1.5">
              {FIELDS.map((f) => (
                <button key={f.k} type="button" onClick={() => setField(f.k)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    field === f.k
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          {/* Current value */}
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">القيمة الحالية</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 break-all">
              {currentVal && currentVal !== '—' ? currentVal : <span className="text-slate-400">— غير محددة</span>}
            </div>
          </div>

          {/* Correct value input */}
          {field === 'location' ? (
            <div>
              <label className="block text-sm font-semibold mb-2">الموقع الصحيح على الخريطة</label>
              <LocationPicker value={pin} onChange={setPin} height={260} />
            </div>
          ) : field === 'closed' ? (
            <div>
              <label className="block text-sm font-semibold mb-2">تفاصيل (اختياري)</label>
              <textarea className="input min-h-[80px]" value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="مثلاً: مغلق منذ شهر / انتقل لموقع آخر / تم تحويله لفرع آخر..." />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold mb-2">القيمة الصحيحة *</label>
              <input
                className="input"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                dir={['phone', 'website'].includes(field) ? 'ltr' : 'rtl'}
                placeholder={
                  field === 'phone' ? 'مثال: 01012345678'
                  : field === 'website' ? 'https://example.com'
                  : 'اكتب القيمة الصحيحة'
                }
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">ملاحظات إضافية (اختياري)</label>
            <textarea className="input min-h-[70px]" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="أي تفاصيل تساعد الإدارة على التحقق..." />
          </div>

          {/* Optional proof image — helpful for address/phone corrections */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              صورة مرفقة <span className="text-slate-400 text-xs font-normal">(اختياري — لافتة المحل، بطاقة العمل، شاشة اتصال...)</span>
            </label>
            <ImageUploader
              value={imageUrl}
              onChange={(url) => setImageUrl(url || '')}
              endpoint="/services/submit/upload"
              label="أرفق صورة"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <label className="block">
              <span className="block text-xs text-slate-500 mb-1">اسمك (اختياري)</span>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="block text-xs text-slate-500 mb-1">وسيلة تواصل (اختياري)</span>
              <input dir="ltr" className="input" value={contact} onChange={(e) => setContact(e.target.value)}
                placeholder="هاتف / بريد إلكتروني" />
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button disabled={loading} className="btn-primary flex-1 justify-center">
              <Send className="w-4 h-4" />
              {loading ? 'جارٍ الإرسال...' : 'إرسال التصحيح'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
