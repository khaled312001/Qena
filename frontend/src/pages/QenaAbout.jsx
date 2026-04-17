import { motion } from 'framer-motion';
import { MapPin, Landmark, Users, Scroll, Building2, Wheat, Ship, Sun } from 'lucide-react';

const STATS = [
  { label: 'عاصمة المحافظة', value: 'مدينة قنا', icon: Landmark },
  { label: 'المساحة', value: '10,798 كم²', icon: MapPin },
  { label: 'عدد السكان', value: '+3.4 مليون', icon: Users },
  { label: 'المراكز الإدارية', value: '9 مراكز', icon: Building2 },
];

const CENTERS = [
  { name: 'قنا', note: 'العاصمة · الساحل الشرقي للنيل' },
  { name: 'نجع حمادي', note: 'مركز صناعي (الألومنيوم) وزراعي' },
  { name: 'قوص', note: 'من أقدم مدن الصعيد التاريخية' },
  { name: 'دشنا', note: 'زراعة قصب السكر والقمح' },
  { name: 'فرشوط', note: 'معروفة بصناعة السكر والزراعة' },
  { name: 'أبو تشت', note: 'مركز زراعي بشمال المحافظة' },
  { name: 'نقادة', note: 'مهد الحضارة المصرية القديمة' },
  { name: 'قفط', note: 'مدينة تاريخية قديمة (كوبتوس)' },
  { name: 'الوقف', note: 'مركز شرق النيل' },
];

const LANDMARKS = [
  {
    name: 'معبد دندرة',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Dendera_7_977.PNG/1024px-Dendera_7_977.PNG',
    credit: 'Wikimedia / CC BY-SA',
    text: 'من أجمل المعابد المصرية القديمة وأكثرها اكتمالاً، مخصص للإلهة حتحور، ويقع شمال غرب مدينة قنا. يضم مشاهد فلكية ونقوشاً تعد من أروع ما أبدعه الفن الفرعوني.',
  },
  {
    name: 'نقادة — مهد الحضارة',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Naqada_Egypt.jpg/1024px-Naqada_Egypt.jpg',
    credit: 'Wikimedia / CC BY',
    text: 'مدينة نقادة يرجع تاريخها لما قبل الأسرات (حضارة نقادة)، وتعد من أقدم مناطق الاستيطان في وادي النيل، وتضم مقابر وأواني فخارية شهدت ميلاد الحضارة المصرية.',
  },
  {
    name: 'نهر النيل والزراعة',
    img: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&q=80',
    credit: 'Unsplash',
    text: 'يمر نهر النيل في قلب المحافظة ويمنحها أراض زراعية خصبة. تُشتهر قنا بزراعة قصب السكر والقمح وقصب السكر والنخيل، وتعد من أهم منتجي السكر في مصر.',
  },
];

const HISTORY = [
  { era: 'قبل الأسرات', note: 'حضارة نقادة (4500–3100 ق.م) — من أقدم حضارات وادي النيل ومهد الثقافة المصرية الأولى.' },
  { era: 'العصر الفرعوني', note: 'ازدهرت مدن قفط (كوبتوس) ودندرة وقوص كمراكز دينية وتجارية هامة.' },
  { era: 'العصر اليوناني والروماني', note: 'أصبحت قفط طريقاً تجارياً رئيسياً بين وادي النيل والبحر الأحمر.' },
  { era: 'العصر الإسلامي', note: 'ازدهرت قوص كعاصمة للصعيد خلال العصرين الفاطمي والأيوبي، وكانت ميناءً بحرياً نيلياً.' },
  { era: 'العصر الحديث', note: 'تحولت قنا إلى مركز صناعي وزراعي مهم، خاصة مع إنشاء مصانع الألومنيوم والسكر.' },
];

export default function QenaAbout() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-brand-900 via-brand-800 to-sky-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(/hero-pattern.svg)', backgroundSize: 'cover' }} />
        <div className="container-p relative py-16 md:py-24">
          <div className="flex items-start gap-5 max-w-3xl">
            <img src="/qena-flag.svg" alt="علم قنا" className="w-20 h-14 md:w-28 md:h-20 rounded-md shadow-lg ring-2 ring-white/20 shrink-0" />
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-xs mb-3">
                <Scroll className="w-4 h-4" /> محافظة قنا · عروس الصعيد
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3" style={{ fontFamily: 'Amiri, Cairo, serif' }}>
                قنا
              </h1>
              <p className="text-brand-100 text-base md:text-xl leading-8">
                محافظة عريقة في صعيد مصر، تُعرف بـ <b className="text-white">«عروس الصعيد»</b>، وتجمع بين عبق التاريخ الفرعوني، وجمال نهر النيل، ودفء أهل الصعيد.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-p -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card p-4 md:p-5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-2">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-lg md:text-2xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-xs md:text-sm text-slate-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Overview */}
      <section className="container-p py-12 grid md:grid-cols-[1fr,1.4fr] gap-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">نظرة عامة</h2>
          <p className="text-slate-700 leading-8">
            تقع محافظة قنا في وسط صعيد مصر على ضفاف نهر النيل، وتحدها من الشمال محافظة سوهاج ومن الجنوب الأقصر، ومن الشرق البحر الأحمر ومن الغرب الوادي الجديد. تتميز بموقعها عند الانحناءة الشهيرة لنهر النيل، مما جعلها مركزاً زراعياً وصناعياً وسياحياً على مر العصور.
          </p>
          <p className="text-slate-700 leading-8 mt-3">
            أرض قنا غنية بالمعابد الفرعونية مثل <b>دندرة</b>، ومهد حضارة <b>نقادة</b> ما قبل الأسرات، إلى جانب المدن الإسلامية العريقة كـ<b>قوص</b> و<b>قفط</b>. واليوم تشتهر بصناعة الألومنيوم والسكر وزراعة قصب السكر.
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-soft min-h-[280px] border border-slate-100">
          <iframe
            title="خريطة قنا"
            className="w-full h-[320px]"
            src="https://www.openstreetmap.org/export/embed.html?bbox=32.0%2C25.5%2C33.2%2C26.6&amp;layer=mapnik"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      </section>

      {/* Landmarks */}
      <section className="container-p pb-12">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-5">معالم ومعلومات</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {LANDMARKS.map((l, i) => (
            <motion.div key={l.name}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card overflow-hidden flex flex-col">
              <div className="h-48 bg-slate-100 overflow-hidden">
                <img src={l.img} alt={l.name} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-1">{l.name}</h3>
                <p className="text-sm text-slate-600 leading-7 flex-1">{l.text}</p>
                <div className="text-[11px] text-slate-400 mt-2">المصدر: {l.credit}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Centers */}
      <section className="container-p pb-12">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-5">مدن ومراكز قنا</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CENTERS.map((c) => (
            <div key={c.name} className="card p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{c.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="container-p pb-16">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-5">قنا عبر العصور</h2>
        <div className="relative border-r-2 border-brand-200 pr-6 space-y-6">
          {HISTORY.map((h, i) => (
            <motion.div key={h.era}
              initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative">
              <span className="absolute -right-[33px] top-1 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-brand-100" />
              <div className="card p-5">
                <div className="text-brand-700 font-bold mb-1">{h.era}</div>
                <p className="text-slate-700 leading-7">{h.note}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Economy */}
      <section className="container-p pb-16">
        <div className="card p-6 md:p-8 bg-gradient-to-bl from-amber-50 via-white to-brand-50 border-amber-100">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 flex items-center gap-2">
            <Wheat className="w-7 h-7 text-amber-600" /> اقتصاد قنا
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <Econ icon={Wheat} title="الزراعة" text="قصب السكر والقمح والخضروات والفاكهة والنخيل، وتعد من أكبر منتجي قصب السكر في مصر." />
            <Econ icon={Building2} title="الصناعة" text="مصانع الألومنيوم بنجع حمادي، وصناعة السكر بقوص ونجع حمادي ودشنا، وصناعات يدوية تقليدية." />
            <Econ icon={Ship} title="النقل والتجارة" text="ميناء نيلي نشط، وعقدة سكة حديد رئيسية تربط الصعيد بالبحر الأحمر والقاهرة وأسوان." />
          </div>
        </div>
      </section>
    </div>
  );
}

function Econ({ icon: Ic, title, text }) {
  return (
    <div className="flex gap-3">
      <div className="w-11 h-11 rounded-xl bg-white border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
        <Ic className="w-5 h-5" />
      </div>
      <div>
        <div className="font-bold mb-1">{title}</div>
        <p className="text-slate-600 leading-7">{text}</p>
      </div>
    </div>
  );
}
