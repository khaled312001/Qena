import SEO from '../components/SEO.jsx';

// Privacy Policy — Arabic, covers what AdSense reviewers and Egyptian/EU
// users expect: data collected, cookies, third-party (AdSense, Analytics,
// hosting), retention, user rights, contact for data requests.
export default function Privacy() {
  const lastUpdated = '16 مايو 2026';
  return (
    <div className="bg-white">
      <SEO
        path="/privacy"
        title="سياسة الخصوصية | قناوي - دليل قنا"
        description="سياسة الخصوصية الخاصة بموقع قناوي (qinawy.com). تعرّف على البيانات التي نجمعها، استخدام الكوكيز، إعلانات Google AdSense، وحقوقك كمستخدم في محافظة قنا."
        keywords="سياسة الخصوصية قناوي, خصوصية قنا, qinawy privacy policy, كوكيز قناوي"
      />
      <div className="bg-gradient-to-bl from-brand-700 via-brand-800 to-brand-900 text-white">
        <div className="container-p py-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">سياسة الخصوصية</h1>
          <p className="text-brand-100 text-sm">آخر تحديث: {lastUpdated}</p>
        </div>
      </div>

      <article className="container-p py-10 max-w-3xl leading-8 text-slate-800 prose-arabic">
        <p>
          نحن في <b>قناوي</b> (الموقع: <a href="https://qinawy.com" className="text-brand-700 underline">qinawy.com</a>)، التابع لـ
          <a href="https://barmagly.tech" target="_blank" rel="noreferrer" className="text-brand-700 underline mx-1">شركة برمجلي</a>،
          نلتزم بحماية خصوصية زوار الموقع. توضّح هذه السياسة طبيعة المعلومات التي نجمعها، طريقة استخدامها، الجهات التي تتم مشاركتها معها، وحقوقك كمستخدم. باستخدامك للموقع فإنك توافق على هذه السياسة.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">1. البيانات التي نجمعها</h2>
        <p>نجمع نوعين من البيانات:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li>
            <b>بيانات يقدّمها المستخدم طوعاً:</b> عند إضافة خدمة عبر نموذج <a href="/submit" className="text-brand-700 underline">/submit</a>،
            أو إرسال تصحيح لخدمة قائمة، أو التسجيل كسائق نقل خاص، نطلب اسم الجهة، عنواناً، رقم تليفون، صورة، ووصفاً. هذه البيانات تُنشر علناً على الموقع بعد المراجعة.
          </li>
          <li>
            <b>بيانات تُجمع تلقائياً:</b> عنوان IP، نوع المتصفح ونظام التشغيل، الصفحات التي تزورها، تاريخ ووقت الزيارة، ومُحيل الإحالة (referrer). تُستخدم لقياس الأداء، اكتشاف الإساءة، وتحسين التجربة.
          </li>
          <li>
            <b>بيانات الموقع الجغرافي:</b> إذا منحت إذن المتصفح لاستخدام موقعك في صفحة "الأقرب إليك"،
            نستخدم الإحداثيات لحساب أقرب الخدمات إليك فقط — لا نخزّن إحداثياتك على خوادمنا.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">2. كيف نستخدم هذه البيانات</h2>
        <ul className="list-disc pr-6 space-y-2">
          <li>تقديم خدمات الدليل وعرض الأماكن القريبة منك.</li>
          <li>مراجعة الإضافات والتصحيحات قبل نشرها للجمهور.</li>
          <li>قياس استخدام الموقع وتحسين الأداء (Google Analytics وGoogle Tag Manager).</li>
          <li>عرض إعلانات ذات صلة عبر شبكة Google AdSense.</li>
          <li>الحماية من إساءة الاستخدام (تكرار الإرسال، البرمجيات الآلية، البريد المزعج).</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">3. ملفات تعريف الارتباط (Cookies)</h2>
        <p>
          نستخدم ملفات الكوكيز التي يضعها متصفحك عند زيارة الموقع للأغراض التالية:
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li><b>كوكيز ضرورية:</b> تذكّر تفضيلات العرض (شبكة/قائمة، اللغة) دون الحاجة لإعادة الضبط في كل زيارة.</li>
          <li><b>كوكيز قياس الأداء:</b> Google Analytics لمعرفة أكثر الصفحات زيارة وزمن التحميل.</li>
          <li><b>كوكيز الإعلانات:</b> Google AdSense وشركاؤها يستخدمون الكوكيز لعرض إعلانات أكثر صلة بك بناءً على زياراتك السابقة لهذا الموقع ومواقع أخرى.</li>
        </ul>
        <p>
          يمكنك إيقاف الكوكيز من إعدادات متصفحك، لكن قد يؤثر ذلك على بعض وظائف الموقع.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">4. الإعلانات وGoogle AdSense</h2>
        <p>
          يستخدم قناوي شبكة <b>Google AdSense</b> (الناشر: <span dir="ltr">ca-pub-3653156634481888</span>) لعرض إعلانات تموّل تطوير وتشغيل الموقع. ولأن AdSense طرف ثالث:
        </p>
        <ul className="list-disc pr-6 space-y-2">
          <li>تضع Google والشركاء كوكيز على متصفحك لعرض إعلانات تستهدف اهتماماتك بناءً على زياراتك لمواقع شريكة لـGoogle.</li>
          <li>
            يمكنك إيقاف الإعلانات المخصصة عبر إعدادات إعلانات Google:
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-brand-700 underline mx-1">google.com/settings/ads</a>.
          </li>
          <li>
            يمكنك إيقاف الكوكيز الخاصة بأطراف ثالثة موزّعة عبر:
            <a href="https://www.aboutads.info" target="_blank" rel="noreferrer" className="text-brand-700 underline mx-1">aboutads.info</a>
            و
            <a href="https://www.youronlinechoices.eu" target="_blank" rel="noreferrer" className="text-brand-700 underline mx-1">youronlinechoices.eu</a>.
          </li>
          <li>
            للمزيد عن سياسة Google لإعلانات الشركاء راجع:
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-brand-700 underline mx-1">policies.google.com/technologies/ads</a>.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">5. مشاركة البيانات مع أطراف ثالثة</h2>
        <p>لا نبيع بياناتك. نشارك بيانات محدودة فقط مع:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li><b>Google</b> (AdSense, Analytics, Tag Manager, Fonts) — لتشغيل الإعلانات والقياس.</li>
          <li><b>Hostinger</b> — مزود الاستضافة الذي يحتفظ بسجلات الخادم.</li>
          <li><b>OpenStreetMap / Leaflet</b> — لعرض الخرائط داخل صفحات الخدمة.</li>
          <li><b>السلطات المختصة</b> — إذا طُلب منا قانونياً عبر أمر قضائي مصري.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">6. الاحتفاظ بالبيانات</h2>
        <p>
          البيانات المُقدَّمة لإضافة خدمة تُحفظ طوال فترة وجود الخدمة على الدليل. سجلات الخادم تُحذف تلقائياً خلال 90 يوماً.
          الكوكيز الخاصة بالإعلانات والقياس تخضع لمدد Google القياسية (عادة 30-540 يوماً).
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">7. حقوقك</h2>
        <p>لك الحق في:</p>
        <ul className="list-disc pr-6 space-y-2">
          <li>طلب نسخة من البيانات التي بحوزتنا عنك.</li>
          <li>طلب تصحيح أي معلومة خاطئة عبر صفحة <a href="/service/" className="text-brand-700 underline">الخدمة</a> أو زر "إرسال تصحيح".</li>
          <li>طلب حذف بيانات خدمة تابعة لك من الدليل.</li>
          <li>الانسحاب من تتبع الكوكيز عبر إعدادات متصفحك.</li>
        </ul>
        <p>
          لأي طلب من هذه الطلبات، تواصل معنا عبر صفحة <a href="/contact" className="text-brand-700 underline">/contact</a> أو على البريد:
          <a href="mailto:barmaglyy@gmail.com" className="text-brand-700 underline mx-1">barmaglyy@gmail.com</a>.
          سنرد خلال 14 يوم عمل.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">8. حماية الأطفال</h2>
        <p>
          الموقع غير موجّه للأطفال دون 13 عاماً. لا نجمع عمداً بيانات من أطفال. إذا علم ولي أمر أن طفله أرسل بيانات شخصية، يُرجى التواصل معنا لحذفها فوراً.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">9. أمان البيانات</h2>
        <p>
          نستخدم اتصال HTTPS لتشفير كل البيانات المرسلة بين متصفحك وخوادمنا. كلمات سر إدارة الموقع مُشفّرة بـbcrypt. مع ذلك لا توجد طريقة نقل عبر الإنترنت آمنة 100%، ولا يمكننا ضمان الأمان المطلق.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">10. تعديل هذه السياسة</h2>
        <p>
          قد نُحدّث هذه السياسة من وقت لآخر. سننشر التعديل مع تاريخه الجديد في أعلى الصفحة. التغييرات الجوهرية سيتم الإشعار عنها على الصفحة الرئيسية.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900">11. الاتصال بنا</h2>
        <p>لأي استفسار عن هذه السياسة:</p>
        <ul className="list-none space-y-1 mt-2">
          <li>📧 <a href="mailto:barmaglyy@gmail.com" className="text-brand-700 underline">barmaglyy@gmail.com</a></li>
          <li>📞 <a href="tel:01010254819" dir="ltr" className="text-brand-700 underline">01010254819</a> — شركة برمجلي</li>
          <li>🌐 <a href="https://barmagly.tech" target="_blank" rel="noreferrer" className="text-brand-700 underline">barmagly.tech</a></li>
          <li>📄 <a href="/terms" className="text-brand-700 underline">شروط الاستخدام</a></li>
        </ul>
      </article>
    </div>
  );
}
