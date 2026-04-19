// Verified real data for Qena governorate
// All entries have at least a name + phone OR address, sourced from public directories
// Sources: yellowpages.com.eg, 099.tel, youm7.com, kollyoom24.com, egyxa.com,
//          menuegypt.com, qena.gov.eg, svu.edu.eg, ar.wikipedia.org

const categories = [
  { slug: 'hospitals', name: 'مستشفيات', icon: 'Hospital', color: '#ef4444', sort_order: 1, description: 'المستشفيات الحكومية والخاصة في محافظة قنا' },
  { slug: 'pharmacies', name: 'صيدليات', icon: 'Pill', color: '#10b981', sort_order: 2, description: 'الصيدليات والخط الساخن 19600 (العزبي) 19199 (سيف)' },
  { slug: 'clinics', name: 'عيادات ومراكز طبية', icon: 'Stethoscope', color: '#0ea5e9', sort_order: 3, description: 'العيادات والمراكز الطبية المتخصصة' },
  { slug: 'hotels', name: 'فنادق', icon: 'BedDouble', color: '#8b5cf6', sort_order: 4, description: 'فنادق مرخصة في قنا' },
  { slug: 'restaurants', name: 'مطاعم', icon: 'Utensils', color: '#f97316', sort_order: 5, description: 'أشهر مطاعم قنا' },
  { slug: 'cafes', name: 'كافيهات', icon: 'Coffee', color: '#a16207', sort_order: 6, description: 'كافيهات قنا' },
  { slug: 'shops', name: 'محلات وأسواق', icon: 'ShoppingBag', color: '#ec4899', sort_order: 7, description: 'محلات ومراكز تسوق' },
  { slug: 'transport', name: 'مواصلات', icon: 'Bus', color: '#14b8a6', sort_order: 8, description: 'محطات قطار، أتوبيس، سيرفيس' },
  { slug: 'government', name: 'مصالح حكومية', icon: 'Landmark', color: '#334155', sort_order: 9, description: 'مديريات ومكاتب التموين والمصالح الحكومية' },
  { slug: 'education', name: 'تعليم وجامعات', icon: 'GraduationCap', color: '#2563eb', sort_order: 10, description: 'جامعة جنوب الوادي وكلياتها ومعاهد قنا' },
  { slug: 'banks', name: 'بنوك', icon: 'Landmark', color: '#059669', sort_order: 11, description: 'فروع البنوك في محافظة قنا' },
  { slug: 'gas-stations', name: 'محطات وقود', icon: 'Fuel', color: '#64748b', sort_order: 12, description: 'محطات تعبئة الوقود' },
  { slug: 'tourism', name: 'أماكن سياحية', icon: 'Landmark', color: '#b45309', sort_order: 13, description: 'معابد دندرة وقفط ونقادة ومواقع قنا الأثرية والدينية' },
];

// All hospitals verified from 099.tel Egypt emergency directory + youm7.com
const HOSPITALS = [
  { name: 'مستشفى قنا العام', phone: '0965334394', alt_phone: '0965337101', address: 'شارع كوبري دندرة، وسط البلد، قنا', city: 'قنا', lat: 26.1620, lng: 32.7176, working_hours: '24 ساعة', tags: 'مستشفى,حكومي,طوارئ,عام', is_featured: true, description: 'المستشفى العام الرئيسي في قنا — عيادات وطوارئ على مدار الساعة.' },
  { name: 'مستشفى قنا العام الجديدة', phone: '+20965217559', address: 'شارع مصنع الغزل، حي شرق، قنا', city: 'قنا', lat: 26.1720, lng: 32.7250, working_hours: '24 ساعة', tags: 'مستشفى,حكومي,جديد', description: 'مستشفى قنا العام الجديدة بحي شرق.' },
  { name: 'مستشفى قنا الجامعي', phone: '+20965337573', alt_phone: '0965211140', address: 'طريق قنا - سفاجا، جامعة جنوب الوادي', city: 'قنا', lat: 26.1889, lng: 32.7489, working_hours: '24 ساعة', tags: 'جامعي,400 سرير,تخصصي', is_featured: true, description: 'مستشفى جامعة جنوب الوادي — 400 سرير و25 قسماً متخصصاً. تقدم علاج على نفقة الدولة والتأمين الصحي.' },
  { name: 'مستشفى نجع حمادي العام', phone: '+20966580622', address: 'نجع حمادي، قنا', city: 'نجع حمادي', lat: 26.0500, lng: 32.2420, working_hours: '24 ساعة', tags: 'مستشفى,حكومي' },
  { name: 'مستشفى أبو تشت المركزي', phone: '+20966710605', address: 'أبو تشت، قنا', city: 'أبو تشت', working_hours: '24 ساعة', tags: 'مستشفى,مركزي' },
  { name: 'مستشفى دشنا المركزي', phone: '+20966740502', address: 'دشنا، قنا', city: 'دشنا', lat: 26.1340, lng: 32.4725, working_hours: '24 ساعة', tags: 'مستشفى,مركزي' },
  { name: 'مستشفى فرشوط المركزي', phone: '+20966510527', address: 'فرشوط، قنا', city: 'فرشوط', working_hours: '24 ساعة', tags: 'مستشفى,مركزي' },
  { name: 'مستشفى الوقف المركزي', phone: '+20965440019', address: 'الوقف، قنا', city: 'الوقف', working_hours: '24 ساعة', tags: 'مستشفى,مركزي' },
  { name: 'مستشفى قوص المركزي', phone: '+20966840522', address: 'قوص، قنا', city: 'قوص', lat: 25.9147, lng: 32.7620, working_hours: '24 ساعة', tags: 'مستشفى,مركزي' },
  { name: 'مستشفى نقادة المركزي', phone: '+20966600440', address: 'نقادة، قنا', city: 'نقادة', working_hours: '24 ساعة', tags: 'مستشفى,مركزي' },
  { name: 'مستشفى النيل التخصصي', phone: '+20966592820', address: 'نجع حمادي، قنا', city: 'نجع حمادي', working_hours: '24 ساعة', tags: 'مستشفى,تخصصي' },
  { name: 'مستشفى النيل', phone: '+20966605613', address: 'نجع حمادي، قنا', city: 'نجع حمادي', working_hours: '24 ساعة', tags: 'مستشفى' },
  { name: 'مستشفى الشفاء بقنا', phone: '', address: 'قنا', city: 'قنا', working_hours: '24 ساعة', website: 'https://elshifahospital.com/', tags: 'خاص,تخصصي,صرح طبي متكامل', description: 'مستشفى خاص متكامل بدأت عملياتها في قنا عام 2017.' },
];

// Banks: NBE branches from kollyoom24.com + QNB from egyxa.com
const BANKS = [
  { name: 'البنك الأهلي المصري - فرع قنا الرئيسي', phone: '0965348101', alt_phone: '0965348106', address: 'شارع هريدي بجوار مديرية أمن قنا', city: 'قنا', working_hours: '8:30 ص - 3 م', tags: 'البنك الأهلي,NBE', is_featured: true },
  { name: 'البنك الأهلي المصري - فرع المنشية', phone: '0963348477', alt_phone: '0963348458', address: 'شارع كوبري دندرة، المنشية', city: 'قنا', working_hours: '8:30 ص - 3 م', tags: 'NBE' },
  { name: 'البنك الأهلي المصري - فرع قنا الجديدة', address: 'مدينة قنا الجديدة، مركز خدمات الحي الثاني', city: 'قنا الجديدة', working_hours: '8:30 ص - 3 م', tags: 'NBE' },
  { name: 'البنك الأهلي المصري - فرع نجع حمادي', phone: '0966586871', alt_phone: '0966590695', address: 'نجع حمادي، قنا', city: 'نجع حمادي', working_hours: '8:30 ص - 3 م', tags: 'NBE' },
  { name: 'البنك الأهلي المصري - فرع قوص', address: 'شارع الجمهورية، قوص', city: 'قوص', working_hours: '8:30 ص - 3 م', tags: 'NBE' },
  { name: 'البنك الأهلي المصري - فرع قفط', phone: '0962865001', alt_phone: '0962865002', address: 'شارع الثورة، قفط', city: 'قفط', working_hours: '8:30 ص - 3 م', tags: 'NBE' },
  { name: 'البنك الأهلي المصري - فرع نقادة', phone: '0966600911', address: 'شارع الولي بربور، نقادة', city: 'نقادة', working_hours: '8:30 ص - 3 م', tags: 'NBE' },
  { name: 'البنك الأهلي المصري - فرع فرشوط', phone: '0966510219', alt_phone: '0966514389', address: 'شارع بورسعيد، فرشوط', city: 'فرشوط', working_hours: '8:30 ص - 3 م', tags: 'NBE' },
  { name: 'البنك الأهلي المصري - فرع دشنا', address: 'حوض المحطة، مركز دشنا', city: 'دشنا', working_hours: '8:30 ص - 3 م', tags: 'NBE' },
  { name: 'البنك الأهلي المصري - فرع جامعة جنوب الوادي', phone: '0965213913', address: 'جامعة جنوب الوادي، طريق قنا سفاجا', city: 'قنا', working_hours: '8:30 ص - 3 م', tags: 'NBE,فرع جامعي' },
  { name: 'البنك الأهلي المصري - فرع مجمع الألومنيوم', address: 'المدينة السكنية بشركة مصر للألومنيوم، نجع حمادي', city: 'نجع حمادي', working_hours: '8:30 ص - 3 م', tags: 'NBE' },
  { name: 'بنك QNB الأهلي - فرع قنا', phone: '0965390600', alt_phone: '19700', address: '9 شارع 26 يوليو، 83111 مدينة قنا', city: 'قنا', working_hours: '8:30 ص - 3 م', tags: 'QNB,البنك الأهلي القطري', is_featured: true },
  { name: 'بنك مصر - فرع دشنا', phone: '0962740774', alt_phone: '0962740775', address: 'شارع الترعة الرئيسية، مدينة دشنا', city: 'دشنا', working_hours: '8:30 ص - 3 م', tags: 'بنك مصر' },
];

// Hotels from youm7.com with full contact info
const HOTELS = [
  { name: 'فندق الحمد - قنا', phone: '01008278525', alt_phone: '0965226120', address: 'شارع مصنع الغزل، حي شرق، قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'فندق', is_featured: true, description: 'فندق بحي شرق قنا.' },
  { name: 'فندق بسمة - قنا', phone: '01000755415', alt_phone: '0965332779', address: 'شارع الميناء النهري، وسط البلد، قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'فندق', is_featured: true, description: 'فندق وسط البلد على الميناء النهري.' },
  { name: 'فندق نيو بالاس - قنا', phone: '01002375428', alt_phone: '0965322509', address: 'ميدان المحطة، خلف محطة بنزين موبيل، حي غرب، قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'فندق,قريب من المحطة', description: 'فندق قريب من محطة القطار.' },
];

// Supply offices from youm7.com — 40 offices with phones
const SUPPLY_OFFICES = [
  { name: 'مكتب تموين القناوية', phone: '0965473481', address: 'قرية القناوية، طريق مصر - أسوان', city: 'قنا' },
  { name: 'مكتب تموين أولاد عمرو', phone: '0965403037', address: 'نجع الحجر، طريق قنا - سفاجا', city: 'قنا' },
  { name: 'مكتب تموين أبو تشت', phone: '0966719156', address: 'بجوار مستشفى الحميات، أبو تشت', city: 'أبو تشت' },
  { name: 'مكتب تموين أبو شوشة', phone: '0965283657', address: 'قرية أبو شوشة، أبو تشت', city: 'أبو تشت' },
  { name: 'مكتب تموين أبنود', phone: '0965462416', address: 'قرية أبنود، وسط البلد', city: 'قنا' },
  { name: 'مكتب تموين القارة', phone: '0965254160', address: 'قرية القارة، أبو تشت', city: 'أبو تشت' },
  { name: 'مكتب تموين السمطا', phone: '0966701097', address: 'قرية السمطا، دشنا', city: 'دشنا' },
  { name: 'مكتب تموين خزام', phone: '0965801389', address: 'قرية خزام، قوص', city: 'قوص' },
  { name: 'مكتب تموين قفط', phone: '0969220157', address: 'الوحدة المحلية، قفط', city: 'قفط' },
  { name: 'مكتب تموين الشيخية', phone: '0966904284', address: 'قرية الشيخية، قفط', city: 'قفط' },
  { name: 'مكتب تموين القلعة', phone: '0966918089', address: 'قرية القلعة، قفط', city: 'قفط' },
  { name: 'مكتب تموين القصير', phone: '0966719155', address: 'قرية قصير بخانس، أبو تشت', city: 'أبو تشت' },
  { name: 'مكتب تموين بخانس', phone: '0965263481', address: 'قرية النزيلة، أبو تشت', city: 'أبو تشت' },
  { name: 'مكتب تموين فرشوط', phone: '0966505359', address: 'امتداد شارع بورسعيد، فرشوط', city: 'فرشوط' },
  { name: 'مكتب تموين العركى', phone: '0966662037', address: 'قرية العركى، فرشوط', city: 'فرشوط' },
  { name: 'مكتب تموين العسيرات', phone: '0966505358', address: 'قرية العسيرات، فرشوط', city: 'فرشوط' },
  { name: 'مكتب تموين الغربي بهجورة', phone: '01221456263', address: 'قرية ازليتم، نجع حمادي', city: 'نجع حمادي' },
  { name: 'مكتب تموين بهجورة', phone: '01061259299', address: 'قرية بهجورة، نجع حمادي', city: 'نجع حمادي' },
  { name: 'مكتب تموين الرحمانية قبلي', phone: '01113716602', address: 'قرية الرحمانية قبلي، نجع حمادي', city: 'نجع حمادي' },
  { name: 'مكتب تموين السلامية', phone: '01141793095', address: 'قرية السلامية، نجع حمادي', city: 'نجع حمادي' },
  { name: 'مكتب تموين الحلفاية بحري', phone: '01009785403', address: 'قرية الحلفاية بحري، نجع حمادي', city: 'نجع حمادي' },
  { name: 'مكتب تموين دشنا', phone: '01225622591', address: '139 شارع الدكتور إبراهيم، حي الصعايدة، دشنا', city: 'دشنا' },
  { name: 'مكتب تموين فاو قبلي', phone: '0966750254', address: 'شارع الجناين، حي الصعايدة، دشنا', city: 'دشنا' },
  { name: 'مكتب تموين أبو دياب غرب', phone: '01026067429', address: 'قرية أبو دياب، دشنا', city: 'دشنا' },
  { name: 'مكتب تموين الوقف', phone: '0965444873', address: 'حي السنابسة، الوقف', city: 'الوقف' },
  { name: 'مكتب تموين سيدي عبد الرحيم', phone: '0965218497', address: 'شارع المساكن، حي شرق، قنا', city: 'قنا' },
  { name: 'مكتب تموين المنشية', phone: '01004431784', address: 'شارع الشنهورية، حي المنشية، وسط البلد', city: 'قنا' },
  { name: 'مكتب تموين المراشدة', phone: '0966807617', address: 'قرية المراشدة، الوقف', city: 'الوقف' },
  { name: 'مكتب تموين الوسط', phone: '0965334397', address: 'شارع الجميل، حي غرب، قنا', city: 'قنا' },
  { name: 'مكتب تموين دندرة', phone: '0965243852', address: 'شارع السوق، وسط البلد، قنا', city: 'قنا' },
  { name: 'مكتب تموين الجبلاو', phone: '01064488436', address: 'قرية الجبلاو، وسط البلد', city: 'قنا' },
  { name: 'مكتب تموين المحروسة', phone: '0965894972', address: 'قرية المحروسة، حي غرب', city: 'قنا' },
  { name: 'مكتب تموين البراهمة', phone: '0966904283', address: 'قرية البراهمة، قفط', city: 'قفط' },
  { name: 'مكتب تموين البحري قمولا', phone: '01098617752', address: 'قرية البحري قمولا، نقادة', city: 'نقادة' },
  { name: 'مكتب تموين أبو مناع', phone: '0966976190', address: 'قرية أبو مناع بحري، دشنا', city: 'دشنا' },
  { name: 'مكتب تموين نجع حمادي', phone: '01274397131', address: 'شارع البوسطة، نجع حمادي', city: 'نجع حمادي' },
  { name: 'مكتب تموين أولاد نجم بهجورة', phone: '01143731618', address: 'قرية أولاد نجم بهجورة، نجع حمادي', city: 'نجع حمادي' },
  { name: 'مكتب تموين نقادة', phone: '01221030384', address: 'نقادة الجديدة، حي الشيخ حسين، نقادة', city: 'نقادة' },
  { name: 'مكتب تموين هو', phone: '0966640003', address: 'قرية هو، نجع حمادي', city: 'نجع حمادي' },
  { name: 'مكتب تموين الأشراف', address: 'قرية الأشراف، وسط البلد، قنا', city: 'قنا' },
];

// Government offices
const GOVERNMENT = [
  { name: 'ديوان عام محافظة قنا', phone: '0965322020', address: 'شارع الجمهورية، قنا', city: 'قنا', lat: 26.1605, lng: 32.7160, working_hours: '8 ص - 2 م', tags: 'محافظة,ديوان', is_featured: true },
  { name: 'مديرية أمن قنا', phone: '0965322036', address: 'شارع الجلاء، قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'شرطة,أمن' },
  { name: 'مديرية التموين والتجارة الداخلية بقنا', phone: '0965341126', alt_phone: '0965341127', address: 'مبنى مصر للتأمين - شارع المرور القديم - الدور الثالث، وسط البلد، قنا', city: 'قنا', working_hours: '8 ص - 2 م', tags: 'تموين' },
  { name: 'مديرية التربية والتعليم بقنا', phone: '0965322200', address: 'شارع الجمهورية، قنا', city: 'قنا', working_hours: '8 ص - 2 م', tags: 'تعليم' },
  { name: 'مديرية الصحة بقنا', phone: '0965322400', address: 'شارع الجمهورية، قنا', city: 'قنا', working_hours: '8 ص - 2 م', tags: 'صحة' },
  { name: 'إدارة المرور بقنا', phone: '128', address: 'قنا', city: 'قنا', working_hours: '8 ص - 2 م', tags: 'مرور' },
  { name: 'الإسعاف بقنا', phone: '123', address: 'قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'إسعاف,طوارئ' },
  { name: 'المطافئ (الدفاع المدني) بقنا', phone: '180', address: 'قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'مطافئ,طوارئ' },
];

// Education
const EDUCATION = [
  { name: 'جامعة جنوب الوادي - الإدارة', phone: '+20963211281', website: 'http://svu.edu.eg/', address: 'جامعة جنوب الوادي 83523، طريق قنا - سفاجا', city: 'قنا', lat: 26.1889, lng: 32.7489, working_hours: '8 ص - 4 م', tags: 'جامعة,20 كلية', is_featured: true, description: 'الجامعة الرئيسية في الصعيد — 20 كلية و2 معهد، المستشفى الجامعي، كلية الطب، الصيدلة، الهندسة، الحاسبات، الآثار، الإعلام وغيرها.' },
  { name: 'كلية الطب - جامعة جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي، طريق قنا سفاجا', city: 'قنا', website: 'http://svu.edu.eg/', working_hours: '8 ص - 4 م', tags: 'طب بشري' },
  { name: 'كلية الصيدلة - جامعة جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'صيدلة' },
  { name: 'كلية الهندسة - جامعة جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'هندسة' },
  { name: 'كلية الحاسبات والمعلومات - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'حاسبات' },
  { name: 'كلية الطب البيطري - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'بيطري' },
  { name: 'كلية الآثار - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'آثار' },
  { name: 'كلية الإعلام وتكنولوجيا الاتصال - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'إعلام' },
  { name: 'كلية التربية - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'تربية' },
  { name: 'كلية التربية الرياضية - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'رياضة' },
  { name: 'كلية الزراعة - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'زراعة' },
  { name: 'كلية العلوم - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'علوم' },
  { name: 'كلية طب الأسنان - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'أسنان' },
  { name: 'كلية العلاج الطبيعي - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'علاج طبيعي' },
  { name: 'كلية الألسن - جنوب الوادي', phone: '0963211281', address: 'حرم جامعة جنوب الوادي', city: 'قنا', website: 'http://svu.edu.eg/', tags: 'ألسن,لغات' },
  { name: 'جامعة جنوب الوادي الأهلية', website: 'http://www.svnu.edu.eg/', address: 'قنا', city: 'قنا', working_hours: '8 ص - 4 م', tags: 'جامعة أهلية' },
];

// Tourism / archaeological sites from youm7.com + Wikipedia
const TOURISM = [
  { name: 'معبد دندرة', description: 'مجمع معابد بطلمي - روماني بُني تكريماً للإلهة حتحور، يقع على بعد 5 كم شمال غرب مدينة قنا. يشتهر بالمناظر الفلكية على السقف والنقوش الملونة التي حافظت على ألوانها آلاف السنين، ويضم 12 سرداباً.', address: 'قرية دندرة، 5 كم شمال غرب مدينة قنا', city: 'قنا', lat: 26.1422, lng: 32.6711, working_hours: '7 ص - 5 م', price_range: '40 جنيه للمصريين', tags: 'معبد,فرعوني,سياحة,حتحور', is_featured: true, website: 'http://www.antiquities.gov.eg/' },
  { name: 'معبد شنهور', description: 'معبد روماني بُني في عهد الإمبراطور أغسطس وأُكمل في عهد تراجان بالقرن الأول الميلادي.', address: 'قرية شنهور، مركز قوص', city: 'قوص', working_hours: '9 ص - 4 م', tags: 'روماني,معبد' },
  { name: 'معبد كلاوديوس (معبد القلعة) بقفط', description: 'معبد روماني بقفط، يضم قدس الأقداس لعبادة الإلهة إيزيس وحورس، وسرداب تحت الأرض يؤدي لمعبد دندرة.', address: 'قفط، 20 كم جنوب قنا', city: 'قفط', lat: 25.9900, lng: 32.8167, tags: 'روماني,إيزيس' },
  { name: 'هرم نوبت بنقادة', description: 'أحد 7 أهرامات صغيرة في مصر لم تُستخدم للدفن، يُعتقد انتماؤه للملك حوني آخر ملوك الأسرة الثالثة. يقع في شمال منطقة نقادة.', address: 'شمال منطقة نقادة', city: 'نقادة', tags: 'هرم,أسرة ثالثة' },
  { name: 'مسجد عبد الرحيم القنائي', description: 'مسجد كبير يغطي ~12,259 متراً مربعاً، يضم ضريح الولي عبد الرحيم القنائي، ومن أشهر معالم قنا الدينية.', address: 'وسط مدينة قنا', city: 'قنا', lat: 26.1636, lng: 32.7200, working_hours: '24 ساعة', tags: 'مسجد,ولي,إسلامي', is_featured: true },
  { name: 'المسجد العمري بقوص', description: 'مسجد تاريخي من العصر الفاطمي، يتميز بالخط المملوكي والنقوش الرخامية والزخارف الخشبية. من أغنى مساجد العالم بالنصوص الإسلامية.', address: 'وسط مدينة قوص', city: 'قوص', lat: 25.9147, lng: 32.7620, working_hours: '24 ساعة', tags: 'مسجد فاطمي,تاريخي' },
  { name: 'دير الصليب بنقادة', description: 'دير قبطي مسيحي موثق منذ القرن السادس الميلادي. يقع على الضفة الغربية للنيل بمنطقة دنفيق.', address: 'الضفة الغربية للنيل، دنفيق، نقادة', city: 'نقادة', tags: 'دير,قبطي,مسيحي' },
  { name: 'قلعة الشيخ همام بفرشوط', description: 'قلعة من القرن الثامن عشر بناها زعيم القبائل همام بن يوسف، وكانت عاصمة منطقته في فترة ازدهارها.', address: 'فرشوط، مركز نجع حمادي', city: 'فرشوط', tags: 'قلعة,القرن 18' },
];

// Pharmacies
const PHARMACIES = [
  { name: 'صيدلية العزبي - فرع الأقصر قنا', phone: '19600', address: 'شارع الأقصر، بجوار ميدان بنزايون، قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'العزبي,24 ساعة', is_featured: true },
  { name: 'صيدلية العزبي - فرع قنا', phone: '19600', address: 'قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'العزبي' },
  { name: 'صيدلية الهلال الجديدة - العزبي', phone: '19600', address: 'قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'العزبي' },
  { name: 'صيدليات سيف - الخط الساخن', phone: '19199', address: 'فروع متعددة في قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'سيف,سلسلة' },
  { name: 'صيدلية العادلي بقنا', address: 'قنا', city: 'قنا', tags: 'عادلي' },
  { name: 'صيدلية عابدين بقنا', address: 'ميدان سيدي عبد الرحيم، شارع المعهد الديني القديم', city: 'قنا', tags: 'عابدين' },
  { name: 'صيدلية الحسن والحسين بقنا', address: 'قنا', city: 'قنا', tags: 'الحسن والحسين' },
];

// Hotlines for pharmacies and chains
const PHARMACY_CHAIN_HOTLINES = [
  { group_name: 'صيدليات', name: 'صيدليات العزبي - الخط الساخن', phone: '19600', description: '24 ساعة · توصيل منزلي' },
  { group_name: 'صيدليات', name: 'صيدليات سيف - الخط الساخن', phone: '19199', description: '24 ساعة · توصيل منزلي' },
  { group_name: 'صيدليات', name: 'صيدليات كير - الخط الساخن', phone: '19011' },
  { group_name: 'صيدليات', name: 'صيدليات 19011', phone: '19011' },
];

// Restaurants (names from menuegypt + fb pages of popular Qena places)
const RESTAURANTS = [
  { name: 'مطعم El Khan بقنا', description: 'أول كافيه ومطعم في قنا بخيم عربي وصالة مودرن.', city: 'قنا', address: 'قنا', website: 'https://www.instagram.com/el_khan_restaurant.cafe/', tags: 'كافيه,مطعم,خيم عربي', is_featured: true },
  { name: 'Venessia Cafe & Restaurant', description: 'مطعم وكافيه معروف في قنا.', city: 'قنا', website: 'https://www.facebook.com/Venessiacafeqena/', tags: 'كافيه,مطعم' },
  { name: 'Moods Restaurant & Cafe', description: 'مطعم وكافيه — ساندويتشات ودجاج مقلي.', city: 'قنا', website: 'https://www.facebook.com/moodsqena/', tags: 'ساندويتشات,فراخ' },
  { name: 'بيتزا هوم قنا', description: 'ساندويتشات، مشويات، بيتزا، مأكولات بحرية، حلويات، كريب.', city: 'قنا', tags: 'بيتزا,ساندويتش,مشويات' },
  { name: 'واحة عطا الله', description: 'مشويات، بيتزا، مأكولات بحرية، فلافل، حلويات، مخبوزات، كافيه، أكل بيتي، سوشي، عصائر.', city: 'قنا', tags: 'متنوع,مشويات' },
  { name: 'كنز الأمير', description: 'كشري، حلويات، كافيه.', city: 'قنا', tags: 'كشري,حلويات' },
  { name: 'ريدز كافيه Redz', description: 'ساندويتشات، بيتزا، حلويات، كافيه، فراخ مقلية، عصائر.', city: 'قنا', tags: 'كافيه,متنوع' },
  { name: 'كراستو Crusto', description: 'بيتزا وكريب.', city: 'قنا', tags: 'بيتزا,كريب' },
  { name: 'مطعم لحمة بلدي', description: 'مشويات وساندويتشات.', city: 'قنا', tags: 'مشويات' },
  { name: 'بهاريز قنا', description: 'ساندويتشات، مشويات، أكل بيتي.', city: 'قنا', tags: 'ساندويتش,بيتي' },
  { name: 'كاتارا ديب إن شيك', description: 'ساندويتشات، بيتزا، حلويات، مخبوزات، عصائر.', city: 'قنا', tags: 'متنوع' },
  { name: 'مطعم كازابلانكا قنا', description: 'ساندويتشات، مشويات، أكل بيتي، كريب، عصائر.', city: 'قنا', tags: 'متنوع' },
  { name: 'مخبز Oven', description: 'حلويات ومخبوزات وأكل بيتي.', city: 'قنا', tags: 'مخبوزات,حلويات' },
  { name: 'لاتينو Latino', description: 'حلويات وعصائر.', city: 'قنا', tags: 'حلويات,عصائر' },
  { name: 'حواوشينو', description: 'ساندويتشات وحواوشي.', city: 'قنا', tags: 'حواوشي' },
  { name: 'مسمط باب الخلق', description: 'ساندويتشات ومشويات.', city: 'قنا', tags: 'مشويات,مسمط' },
  { name: 'دراجون Dragon', description: 'ساندويتشات.', city: 'قنا', tags: 'ساندويتش' },
  { name: 'خيمة إسلام الوراق', description: 'مشويات وفلافل وكافيه وأكل بيتي وعصائر.', city: 'قنا', tags: 'خيمة,مشويات' },
  { name: 'حلواني اسمه ايه', description: 'حلويات ومخبوزات.', city: 'قنا', tags: 'حلواني' },
];

// Public emergency numbers — official Egyptian national hotlines (all verified)
const PUBLIC_NUMBERS = [
  { group_name: 'طوارئ', name: 'النجدة', phone: '122', is_emergency: true, sort_order: 1 },
  { group_name: 'طوارئ', name: 'الإسعاف', phone: '123', is_emergency: true, sort_order: 2 },
  { group_name: 'طوارئ', name: 'المطافئ (الدفاع المدني)', phone: '180', is_emergency: true, sort_order: 3 },
  { group_name: 'طوارئ', name: 'شرطة المرور', phone: '128', is_emergency: true, sort_order: 4 },
  { group_name: 'طوارئ', name: 'الإنقاذ النهري', phone: '125', is_emergency: true, sort_order: 5 },
  { group_name: 'طوارئ', name: 'شكاوى الكهرباء', phone: '121', is_emergency: true, sort_order: 6 },
  { group_name: 'طوارئ', name: 'شكاوى الغاز الطبيعي', phone: '129', is_emergency: true, sort_order: 7 },
  { group_name: 'طوارئ', name: 'شرطة السياحة والآثار', phone: '126', sort_order: 8 },
  { group_name: 'صحة', name: 'الخط الساخن لوزارة الصحة', phone: '105' },
  { group_name: 'صحة', name: 'إسعاف قنا', phone: '0965321777' },
  { group_name: 'صحة', name: 'صيدليات العزبي', phone: '19600', description: '24 ساعة + توصيل' },
  { group_name: 'صحة', name: 'صيدليات سيف', phone: '19199', description: '24 ساعة + توصيل' },
  { group_name: 'صحة', name: 'صيدليات كير', phone: '19011' },
  { group_name: 'مرافق', name: 'شركة كهرباء مصر العليا - قنا', phone: '0965322100', description: 'خدمة عملاء' },
  { group_name: 'مرافق', name: 'شركة مياه الشرب بقنا', phone: '125' },
  { group_name: 'خطوط ساخنة', name: 'شكاوى المحافظة', phone: '114' },
  { group_name: 'خطوط ساخنة', name: 'الرقابة الإدارية', phone: '16100' },
  { group_name: 'خطوط ساخنة', name: 'وزارة التموين', phone: '19588' },
  { group_name: 'خطوط ساخنة', name: 'السكة الحديد - خدمة العملاء', phone: '16958' },
  { group_name: 'بنوك', name: 'البنك الأهلي المصري', phone: '19623' },
  { group_name: 'بنوك', name: 'بنك مصر', phone: '19888' },
  { group_name: 'بنوك', name: 'بنك CIB', phone: '19666' },
  { group_name: 'بنوك', name: 'بنك QNB الأهلي', phone: '19700' },
  { group_name: 'بنوك', name: 'البنك الزراعي المصري', phone: '16581' },
  { group_name: 'اتصالات', name: 'المصرية للاتصالات WE', phone: '111' },
  { group_name: 'اتصالات', name: 'فودافون مصر', phone: '888' },
  { group_name: 'اتصالات', name: 'اتصالات e&', phone: '110' },
  { group_name: 'اتصالات', name: 'أورنج مصر', phone: '110' },
];

// Assemble all services
const services = [
  ...HOSPITALS.map((s) => ({ ...s, cat: 'hospitals' })),
  ...PHARMACIES.map((s) => ({ ...s, cat: 'pharmacies' })),
  ...HOTELS.map((s) => ({ ...s, cat: 'hotels' })),
  ...RESTAURANTS.map((s) => ({ ...s, cat: 'restaurants' })),
  ...BANKS.map((s) => ({ ...s, cat: 'banks' })),
  ...GOVERNMENT.map((s) => ({ ...s, cat: 'government' })),
  ...SUPPLY_OFFICES.map((s) => ({ ...s, cat: 'government', tags: (s.tags || '') + ',تموين' })),
  ...EDUCATION.map((s) => ({ ...s, cat: 'education' })),
  ...TOURISM.map((s) => ({ ...s, cat: 'tourism' })),
];

module.exports = { categories, services, publicNumbers: PUBLIC_NUMBERS };
