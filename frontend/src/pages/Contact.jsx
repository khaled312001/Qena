import { useState } from 'react';
import { Phone, Mail, Globe, MapPin, Send, MessageCircle, Edit3 } from 'lucide-react';
import SEO from '../components/SEO.jsx';
import api from '../lib/api.js';
import toast from 'react-hot-toast';

// Contact page — required by AdSense reviewers + builds user trust.
// Three channels: phone, email, in-page form (which submits as a 'feedback'
// suggestion via /api/suggestions so admins can read it from the existing
// admin dashboard with no new backend).
export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function send(e) {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 10) {
      toast.error('الرسالة قصيرة جداً (10 حروف على الأقل).');
      return;
    }
    setSubmitting(true);
    try {
      // Reuse the /suggestions endpoint as a general feedback channel
      // (kind='other' surfaces in admin dashboard alongside corrections).
      await api.post('/suggestions', {
        kind: 'other',
        subject: subject || 'رسالة من صفحة تواصل معنا',
        message,
        name: name || null,
        contact: email || null,
      });
      toast.success('وصلتنا رسالتك. سنرد خلال 1-3 أيام عمل.');
      setName(''); setEmail(''); setSubject(''); setMessage('');
    } catch (e) {
      toast.error('تعذّر إرسال الرسالة. حاول مجدداً أو اتصل بنا مباشرة.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <SEO
        path="/contact"
        title="تواصل معنا | قناوي - دليل قنا"
        description="تواصل مع فريق قناوي - دليل محافظة قنا. أرقام تليفون، بريد إلكتروني، ونموذج رسالة. للاقتراحات، الإعلانات، طلب تصحيح بيانات، أو الشراكات."
        keywords="تواصل قناوي, اتصل بنا قناوي, qinawy contact, إعلان في قناوي, بريد قناوي"
      />
      <div className="bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 text-white">
        <div className="container-p py-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">تواصل معنا</h1>
          <p className="text-brand-100 text-sm md:text-base max-w-2xl leading-7">
            أهلاً بك. سواء كان عندك اقتراح، طلب إعلان، تصحيح بيانات، أو شراكة — اختر القناة المناسبة وسنرد عليك بإذن الله.
          </p>
        </div>
      </div>

      <section className="container-p py-10 grid md:grid-cols-3 gap-4">
        <ContactCard icon={Phone} title="اتصال هاتفي" subtitle="الرقم الرسمي لشركة برمجلي"
          actions={[
            { label: '01010254819', href: 'tel:01010254819' },
            { label: 'م. أحمد كمال — 01060049287', href: 'tel:+201060049287' },
            { label: 'م. خالد أحمد — 01204593124', href: 'tel:+201204593124' },
          ]} />
        <ContactCard icon={Mail} title="بريد إلكتروني" subtitle="للاستفسارات الرسمية والشراكات"
          actions={[
            { label: 'barmaglyy@gmail.com', href: 'mailto:barmaglyy@gmail.com' },
          ]} />
        <ContactCard icon={Globe} title="موقعنا الرسمي" subtitle="شركة برمجلي - مطورو الموقع"
          actions={[
            { label: 'barmagly.tech', href: 'https://barmagly.tech', external: true },
          ]} />
      </section>

      <section className="container-p pb-12 grid md:grid-cols-[1fr,320px] gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-brand-700" />
            <h2 className="text-lg font-bold text-slate-900">أرسل لنا رسالة</h2>
          </div>
          <form onSubmit={send} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="الاسم">
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="input" placeholder="اختياري" />
              </Field>
              <Field label="البريد الإلكتروني">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input" placeholder="email@example.com" dir="ltr" />
              </Field>
            </div>
            <Field label="الموضوع">
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input">
                <option value="">— اختر موضوعاً —</option>
                <option value="اقتراح">اقتراح لتطوير الموقع</option>
                <option value="إعلان">رغبة في إعلان أو رعاية</option>
                <option value="تصحيح">تصحيح بيانات خدمة</option>
                <option value="شراكة">طلب شراكة</option>
                <option value="مشكلة">إبلاغ عن مشكلة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </Field>
            <Field label="الرسالة">
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                rows={6} className="input" required minLength={10}
                placeholder="اكتب رسالتك هنا (10 حروف على الأقل)..." />
            </Field>
            <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto justify-center">
              <Send className="w-4 h-4" /> {submitting ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
            </button>
            <p className="text-xs text-slate-500 leading-6">
              بإرسال هذه الرسالة تكون قد قرأت ووافقت على
              <a href="/privacy" className="text-brand-700 underline mx-1">سياسة الخصوصية</a>
              و
              <a href="/terms" className="text-brand-700 underline mx-1">شروط الاستخدام</a>.
              لن نشارك بريدك أو رسالتك مع أي طرف ثالث.
            </p>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-brand-700" />
              <h3 className="font-bold text-slate-900">العنوان</h3>
            </div>
            <p className="text-sm text-slate-600 leading-7">
              شركة برمجلي<br />
              محافظة قنا — جمهورية مصر العربية<br />
              <span className="text-xs text-slate-500">العمل عن بُعد · تواصل عبر الهاتف أو البريد</span>
            </p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Edit3 className="w-4 h-4 text-brand-700" />
              <h3 className="font-bold text-slate-900">تصحيح خدمة قائمة</h3>
            </div>
            <p className="text-sm text-slate-600 leading-7 mb-3">
              لتصحيح اسم/رقم/عنوان/إحداثيات خدمة بعينها بسرعة، افتح صفحة الخدمة واضغط زر
              "إرسال تصحيح" داخل الصفحة.
            </p>
            <a href="/category/all" className="btn-outline w-full justify-center text-sm">
              تصفح الخدمات
            </a>
          </div>
          <div className="card p-5 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-amber-700" />
              <h3 className="font-bold text-amber-900">مهم — تنبيه</h3>
            </div>
            <p className="text-sm text-amber-900 leading-7">
              نحن <b>لسنا</b> الخدمات المعروضة في الدليل (مثلاً المستشفيات والصيدليات). إذا كنت تحتاج التواصل
              مع خدمة معينة، اتصل بها مباشرة عبر الرقم المنشور في صفحتها.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function ContactCard({ icon: Ic, title, subtitle, actions }) {
  return (
    <div className="card p-5">
      <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-3">
        <Ic className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-3">{subtitle}</p>
      <div className="space-y-1.5">
        {actions.map((a) => (
          <a key={a.label} href={a.href} target={a.external ? '_blank' : undefined} rel="noreferrer"
             className="block text-sm text-brand-700 hover:text-brand-800 font-semibold break-all">
            {a.label}
          </a>
        ))}
      </div>
    </div>
  );
}
