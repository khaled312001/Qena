import { Link } from 'react-router-dom';
import { BookOpen, ChevronLeft, Clock, User } from 'lucide-react';
import SEO from '../components/SEO.jsx';
import NEW_ARTICLES from '../data/articles.json';
import AUTHORS from '../data/authors.json';

// Hub page for long-form Arabic content. AdSense reviewers and Google both
// score sites higher when there's editorial content alongside the directory
// data. Each guide lives at /guides/:slug.
// EXISTING_GUIDES are the 12 hand-coded ones; NEW_ARTICLES are 7 generated
// via Workflow and rendered by ArticleViewer from frontend/src/data/articles.json.
const EXISTING_GUIDES = [
  {
    slug: 'hospitals-qena',
    title: 'دليل أفضل مستشفيات قنا 2026 — حكومية وخاصة',
    excerpt: 'دليل مفصّل لكل مستشفيات محافظة قنا: المستشفى الجامعي، العام، الجديدة، التأمين الصحي، ومستشفيات النواحي. تخصصات، أرقام، عيادات خارجية، وحالات الطوارئ.',
    readMins: 8,
    icon: '🏥',
    color: '#ef4444',
  },
  {
    slug: 'pharmacies-24h-qena',
    title: 'صيدليات قنا 24 ساعة — أرقام، توصيل، وأقرب فرع',
    excerpt: 'دليل صيدليات قنا التي تعمل ٢٤ ساعة، أرقام التوصيل المنزلي، وأكبر سلاسل الصيدليات (العزبي، سيف، 19011 الأهلي) في كل مراكز المحافظة.',
    readMins: 6,
    icon: '💊',
    color: '#10b981',
  },
  {
    slug: 'dendera-temple-guide',
    title: 'معبد دندرة الكامل — التاريخ، المواعيد، وكيف تصل',
    excerpt: 'تعرّف على معبد حتحور في دندرة، أحد أهم المعابد المصرية الباقية. تاريخه البطلمي، أبراج زودياك، طريقة الوصول من قنا وأسعار الدخول 2026.',
    readMins: 10,
    icon: '🏛️',
    color: '#f59e0b',
  },
  {
    slug: 'qena-to-cairo-transport',
    title: 'الانتقال من قنا للقاهرة — قطار، أتوبيس، أو سيارة',
    excerpt: 'مقارنة كاملة بين السفر من قنا إلى القاهرة بالقطار (مكيف وعادي)، بأتوبيسات الشركات (سوبر جيت، GoBus)، أو بالسيارة الخاصة. أسعار 2026 ومدة الرحلة.',
    readMins: 7,
    icon: '🚆',
    color: '#0ea5e9',
  },
  {
    slug: 'restaurants-qena',
    title: 'أفضل مطاعم قنا — مشويات، أسماك، شرقي وغربي',
    excerpt: 'أشهر مطاعم محافظة قنا والمأكولات الأشهر فيها. كشري، مشويات، أسماك من نهر النيل، حمام محشي، وأشهر المقاهي للسهرة.',
    readMins: 6,
    icon: '🍽️',
    color: '#f97316',
  },
  {
    slug: 'hotels-qena',
    title: 'فنادق قنا — حجز، أسعار، والأقرب لمعابد دندرة',
    excerpt: 'دليل الفنادق في محافظة قنا: من فنادق ٤ نجوم في وسط المدينة إلى منتجعات على النيل في نجع حمادي. أسعار 2026 وأماكن للسياح.',
    readMins: 5,
    icon: '🏨',
    color: '#8b5cf6',
  },
  {
    slug: 'banks-atm-qena',
    title: 'بنوك وصرافات قنا — الأهلي، مصر، CIB، QNB وأكثر',
    excerpt: 'كل فروع البنوك في محافظة قنا، أماكن الصراف الآلي (ATM) التي تعمل ٢٤ ساعة، ومواعيد العمل الرسمية للبنوك الحكومية والخاصة.',
    readMins: 6,
    icon: '🏦',
    color: '#0c4a6e',
  },
  {
    slug: 'qena-landmarks',
    title: 'معالم قنا السياحية — معابد، أديرة، ومواقع أثرية',
    excerpt: 'جولة كاملة في معالم محافظة قنا: معبد دندرة، معبد قفط، نقادة الأثرية، دير الصليب، قلعة الشيخ همام، وأماكن لا يعرفها معظم الزوار.',
    readMins: 9,
    icon: '🗺️',
    color: '#16a34a',
  },
  {
    slug: 'qena-emergency-numbers',
    title: 'أرقام الطوارئ والخدمات الحكومية في قنا — احفظها الآن',
    excerpt: 'دليل شامل لأرقام الطوارئ في محافظة قنا: نجدة، إسعاف، مطافئ، شكاوى كهرباء ومياه وغاز، إنقاذ الطرق السريعة، وأرقام المحافظة والوزارات.',
    readMins: 5,
    icon: '🚨',
    color: '#dc2626',
  },
  {
    slug: 'qena-history',
    title: 'تاريخ محافظة قنا — من حضارة نقادة إلى اليوم',
    excerpt: 'رحلة شاملة في تاريخ محافظة قنا: حضارة نقادة قبل الأسرات، العصر الفرعوني، البطلمي، الروماني، القبطي، الإسلامي، حتى مصر الحديثة.',
    readMins: 12,
    icon: '📜',
    color: '#7c2d12',
  },
  {
    slug: 'qena-education',
    title: 'التعليم في قنا — جامعات، مدارس، معاهد، ومراكز تدريب',
    excerpt: 'دليل التعليم الكامل في محافظة قنا. جامعة جنوب الوادي، كلياتها، المدارس الحكومية والخاصة، المعاهد، وسكن الطلاب.',
    readMins: 8,
    icon: '🎓',
    color: '#1d4ed8',
  },
  {
    slug: 'qena-economy',
    title: 'اقتصاد قنا — الزراعة، الصناعة، السياحة، والتجارة',
    excerpt: 'دليل اقتصاد قنا 2026. القطاعات الرئيسية: قصب السكر، الصناعة (الألومنيوم، السكر)، السياحة، التجارة، وفرص الاستثمار.',
    readMins: 9,
    icon: '💼',
    color: '#0e7490',
  },
];

// Build the combined list: 7 new articles (from JSON) + 12 existing (above).
// New articles are tagged isNew=true so the UI can highlight them.
const NEW_FROM_DATA = Object.entries(NEW_ARTICLES).map(([slug, a]) => ({
  slug, title: a.title, excerpt: a.description, readMins: a.read_mins,
  icon: a.icon, color: a.color, author: a.author, isNew: true,
}));

const GUIDES = [...NEW_FROM_DATA, ...EXISTING_GUIDES];

export default function Guides() {
  return (
    <div>
      <SEO
        path="/guides"
        title="الأدلة والمقالات | قناوي - دليل قنا الشامل"
        description="مقالات وأدلة عن محافظة قنا: مستشفيات، صيدليات، فنادق، مطاعم، معبد دندرة، الانتقال للقاهرة، البنوك، والمعالم السياحية. دليلك الشامل للحياة في قنا."
        keywords="مقالات قنا, أدلة قنا, دليل قنا, معبد دندرة, مستشفيات قنا, صيدليات قنا, فنادق قنا, مطاعم قنا"
      />
      <div className="bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 text-white">
        <div className="container-p py-12">
          <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs mb-4">
            <BookOpen className="w-4 h-4" /> {GUIDES.length} مقال أصلي
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">الأدلة والمقالات</h1>
          <p className="text-brand-100 text-sm md:text-base max-w-2xl leading-7">
            دلائل مفصّلة عن خدمات ومعالم محافظة قنا — مكتوبة لتساعدك تأخذ قرار أسرع وأفضل، سواء كنت من سكان قنا أو زائراً.
          </p>
        </div>
      </div>

      <section className="container-p py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map((g) => {
            const author = g.author ? AUTHORS[g.author] : null;
            return (
              <Link key={g.slug} to={`/guides/${g.slug}`}
                    className="card p-5 hover:ring-2 hover:ring-brand-300 transition group block">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl shrink-0" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))' }}>
                    {g.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    {g.isNew && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-1">
                        جديد
                      </span>
                    )}
                    <h2 className="font-bold text-slate-900 leading-snug group-hover:text-brand-700 transition">
                      {g.title}
                    </h2>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {g.readMins} دقائق</span>
                      {author && (
                        <span className="inline-flex items-center gap-1">
                          <User className="w-3 h-3" /> {author.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-7 line-clamp-3 mb-3">{g.excerpt}</p>
                <div className="text-brand-700 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  اقرأ المقال <ChevronLeft className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export { GUIDES };
