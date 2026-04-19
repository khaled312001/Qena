import { Heart, Users, Phone, Mail, Globe, Gift, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div>
      <div className="bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/hero-pattern.svg)', backgroundSize: 'cover' }} />
        <div className="container-p py-16 relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs mb-4">
              <Heart className="w-4 h-4" /> مبادرة خيرية مجانية — لا إعلانات، لا رسوم
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">عن قناوي</h1>
            <p className="text-white/90 leading-7 sm:leading-8 text-sm sm:text-base md:text-lg">
              قناوي (qinawy.com) مبادرة مجانية من <b className="text-amber-300">شركة برمجلي</b> لسكان محافظة قنا. تجميع كل المعلومات والخدمات التي يحتاجها المواطن في مكان واحد — من مستشفيات وفنادق ومطاعم وأرقام طوارئ وحتى معالم سياحية.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="container-p py-12 grid md:grid-cols-3 gap-6">
        <Card icon={Gift} title="100% مجاني">
          الدليل مجاني بالكامل. لا إعلانات مزعجة ولا رسوم اشتراك ولا حدود استخدام. نكرّس وقتنا ومواردنا لخدمة أهلنا في قنا.
        </Card>
        <Card icon={Heart} title="خدمة مجتمعية">
          مبادرة خيرية نقدمها لأهلنا في قنا لتسهيل وصولهم للخدمات بسرعة — مستشفى قريب، صيدلية 24 ساعة، أو رقم طوارئ.
        </Card>
        <Card icon={Users} title="بمشاركتكم">
          يمكن لأي شخص إضافة خدمة جديدة أو تصحيح معلومة لأي مكان. نراجع كل مساهمة ثم ننشرها.
        </Card>
      </section>

      {/* Barmagly showcase */}
      <section className="container-p pb-14">
        <div className="card p-6 md:p-10 bg-gradient-to-bl from-amber-50 via-white to-brand-50 border-amber-200 relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-72 h-72 bg-amber-100 rounded-full blur-3xl opacity-60" />
          <div className="relative grid md:grid-cols-[1.3fr,1fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs mb-4">
                <Sparkles className="w-4 h-4" /> مصمم ومطور من
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">شركة برمجلي</h2>
              <p className="text-slate-700 leading-8 mb-5">
                شركة متخصصة في تطوير البرمجيات والحلول الرقمية للشركات والمؤسسات في مصر والوطن العربي. قدّمنا هذه البوابة <b>مجاناً بالكامل</b> لأهل قنا، إيماناً منا بأن التكنولوجيا يجب أن تخدم المجتمع أولاً.
              </p>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <span><b>المؤسسون:</b> م. أحمد كمال &nbsp;·&nbsp; م. خالد أحمد</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-700">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-slate-500">شركة برمجلي — الرقم الرسمي</span>
                    <a href="tel:01010254819" dir="ltr" className="hover:text-brand-700 font-bold text-base">01010254819</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-700">
                    <Globe className="w-4 h-4" />
                  </div>
                  <a href="https://barmagly.tech/" target="_blank" rel="noreferrer" className="hover:text-brand-700 font-bold">barmagly.tech</a>
                </div>
              </dl>

              {/* Founders direct call buttons */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-500 mb-3">اتصال مباشر بالمؤسسين</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <a href="tel:+201060049287" dir="ltr"
                     className="flex items-center gap-3 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition rounded-xl p-3 group">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="text-right flex-1 min-w-0" dir="rtl">
                      <div className="text-xs text-slate-500">م. أحمد كمال</div>
                      <div dir="ltr" className="font-bold text-slate-800 text-sm">+20 10 6004 9287</div>
                    </div>
                  </a>
                  <a href="tel:+201204593124" dir="ltr"
                     className="flex items-center gap-3 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition rounded-xl p-3 group">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="text-right flex-1 min-w-0" dir="rtl">
                      <div className="text-xs text-slate-500">م. خالد أحمد</div>
                      <div dir="ltr" className="font-bold text-slate-800 text-sm">+20 12 0459 3124</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <a href="https://barmagly.tech/" target="_blank" rel="noreferrer" className="btn-primary">
                  <Globe className="w-4 h-4" /> زيارة موقعنا
                </a>
                <a href="tel:01010254819" className="btn-outline">
                  <Phone className="w-4 h-4" /> اتصل بشركة برمجلي
                </a>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
              <div className="mb-4 flex items-center justify-center">
                <img src="/logo.svg" alt="" className="w-20 h-20 drop-shadow-xl" />
              </div>
              <div className="font-extrabold text-lg text-slate-900 mb-1">عندك خدمة في قنا؟</div>
              <p className="text-sm text-slate-600 mb-4 leading-6">سجّل خدمتك أو محلك مجاناً بالكامل — الإدارة تراجع وتنشر.</p>
              <a href="/submit" className="btn-primary w-full justify-center">أضف خدمة الآن</a>
            </div>
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
      <div className="font-bold text-slate-900 mb-2 text-lg">{title}</div>
      <p className="text-slate-600 text-sm leading-7">{children}</p>
    </div>
  );
}
