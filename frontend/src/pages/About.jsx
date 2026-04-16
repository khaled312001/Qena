import { Heart, Users, Phone, Mail, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div>
      <div className="bg-gradient-to-bl from-brand-600 via-brand-700 to-brand-900 text-white">
        <div className="container-p py-14">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs mb-4">
              <Heart className="w-4 h-4" /> مبادرة خيرية من شركة برمجلي
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">عن دليل قنا</h1>
            <p className="text-white/90 leading-8 text-base md:text-lg">
              دليل قنا مبادرة مجانية تهدف لتجميع كل المعلومات والخدمات التي يحتاجها سكان محافظة قنا والضواحي في مكان واحد، من مستشفيات وفنادق ومطاعم وكافيهات ومصالح حكومية وأرقام طوارئ.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="container-p py-12 grid md:grid-cols-3 gap-6">
        <Card icon={Users} title="مجاني للجميع">
          الدليل مجاني بالكامل. لا إعلانات مزعجة ولا رسوم اشتراك.
        </Card>
        <Card icon={Heart} title="خدمة مجتمعية">
          مبادرة خيرية نقدمها لأهلنا في قنا لتسهيل وصولهم للخدمات بسرعة.
        </Card>
        <Card icon={Users} title="بمشاركتكم">
          يمكنك إضافة خدمة جديدة أو تصحيح معلومة لأي مكان. نراجع ثم ننشر.
        </Card>
      </section>

      <section className="container-p pb-14">
        <div className="card p-6 md:p-8 grid md:grid-cols-[1.2fr,1fr] gap-8">
          <div>
            <h2 className="text-2xl font-extrabold mb-2">شركة برمجلي</h2>
            <p className="text-slate-600 leading-7 mb-4">
              شركة متخصصة في تطوير البرمجيات والحلول الرقمية. قدمنا هذا الدليل كخدمة مجانية لأهل محافظة قنا.
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-brand-600" />
                <span><b>المؤسسون:</b> م. أحمد كمال &nbsp;·&nbsp; م. خالد أحمد</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-600" />
                <a href="tel:01010254819" dir="ltr" className="hover:text-brand-700">01010254819</a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-brand-600" />
                <a href="https://barmagly.tech/" target="_blank" rel="noreferrer" className="hover:text-brand-700">barmagly.tech</a>
              </div>
            </dl>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold mb-2">تريد إضافة خدمتك؟</h3>
            <p className="text-sm text-slate-600 mb-4">سجّل خدمتك أو محلك مجاناً وسيتم نشرها بعد المراجعة.</p>
            <a href="/submit" className="btn-primary">أضف خدمة الآن</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ icon: Ic, title, children }) {
  return (
    <div className="card p-6">
      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-3">
        <Ic className="w-6 h-6" />
      </div>
      <div className="font-bold text-slate-900 mb-1">{title}</div>
      <p className="text-slate-600 text-sm leading-7">{children}</p>
    </div>
  );
}
