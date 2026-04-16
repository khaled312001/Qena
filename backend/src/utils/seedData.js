// Seed data for Qena Guide
// Sources: public information (government listings, common knowledge).
// Users / admin can correct and expand via the dashboard.

const categories = [
  { slug: 'hospitals', name: 'مستشفيات', icon: 'Hospital', color: '#ef4444', sort_order: 1, description: 'المستشفيات الحكومية والخاصة في محافظة قنا' },
  { slug: 'pharmacies', name: 'صيدليات', icon: 'Pill', color: '#10b981', sort_order: 2, description: 'أماكن الصيدليات وأرقامها' },
  { slug: 'clinics', name: 'عيادات ومراكز طبية', icon: 'Stethoscope', color: '#0ea5e9', sort_order: 3, description: 'العيادات والمراكز الطبية المتخصصة' },
  { slug: 'hotels', name: 'فنادق', icon: 'BedDouble', color: '#8b5cf6', sort_order: 4, description: 'فنادق وأماكن إقامة في قنا والأقصر القريبة' },
  { slug: 'restaurants', name: 'مطاعم', icon: 'Utensils', color: '#f97316', sort_order: 5, description: 'أشهر المطاعم في قنا' },
  { slug: 'cafes', name: 'كافيهات', icon: 'Coffee', color: '#a16207', sort_order: 6, description: 'كافيهات ومشروبات في قنا' },
  { slug: 'shops', name: 'محلات وأسواق', icon: 'ShoppingBag', color: '#ec4899', sort_order: 7, description: 'محلات ومراكز تسوق' },
  { slug: 'transport', name: 'مواصلات', icon: 'Bus', color: '#14b8a6', sort_order: 8, description: 'محطات قطار، أتوبيس، سيرفيس' },
  { slug: 'government', name: 'مصالح حكومية', icon: 'Landmark', color: '#334155', sort_order: 9, description: 'المصالح والمكاتب الحكومية' },
  { slug: 'education', name: 'تعليم وجامعات', icon: 'GraduationCap', color: '#2563eb', sort_order: 10, description: 'جامعات ومدارس ومعاهد' },
  { slug: 'banks', name: 'بنوك', icon: 'Landmark', color: '#059669', sort_order: 11, description: 'فروع البنوك في محافظة قنا' },
  { slug: 'gas-stations', name: 'محطات وقود', icon: 'Fuel', color: '#64748b', sort_order: 12, description: 'محطات تعبئة الوقود' },
];

const services = [
  // Hospitals
  { cat: 'hospitals', name: 'مستشفى قنا العام', description: 'المستشفى العام الرئيسي في قنا، يقدم خدمات طوارئ وعيادات خارجية وأقسام داخلية.', address: 'شارع الجمهورية، قنا', city: 'قنا', lat: 26.1551, lng: 32.7160, phone: '096-5322055', working_hours: '24 ساعة', tags: 'مستشفى,طوارئ,حكومي', is_featured: true },
  { cat: 'hospitals', name: 'مستشفى قنا الجامعي', description: 'مستشفى جامعة جنوب الوادي، خدمات طبية متكاملة.', address: 'طريق قنا-سفاجا، قنا', city: 'قنا', lat: 26.1889, lng: 32.7489, phone: '096-5211140', working_hours: '24 ساعة', tags: 'مستشفى جامعي,طوارئ', is_featured: true },
  { cat: 'hospitals', name: 'مستشفى الصدر بقنا', description: 'مستشفى تخصصي لأمراض الصدر.', address: 'شارع الجلاء، قنا', city: 'قنا', phone: '096-5322030', working_hours: '24 ساعة', tags: 'صدر,تخصصي' },
  { cat: 'hospitals', name: 'مستشفى الحميات بقنا', description: 'مستشفى الأمراض المعدية.', address: 'شارع المحطة، قنا', city: 'قنا', phone: '096-5321800', working_hours: '24 ساعة', tags: 'حميات' },
  { cat: 'hospitals', name: 'مستشفى نجع حمادي العام', description: 'مستشفى عام بمركز نجع حمادي.', address: 'نجع حمادي', city: 'نجع حمادي', lat: 26.0496, lng: 32.2413, phone: '096-5800310', working_hours: '24 ساعة', tags: 'مستشفى,نجع حمادي' },
  { cat: 'hospitals', name: 'مستشفى قوص المركزي', description: 'مستشفى مركز قوص.', address: 'قوص', city: 'قوص', lat: 25.9147, lng: 32.7620, phone: '096-5800111', working_hours: '24 ساعة', tags: 'مستشفى,قوص' },
  { cat: 'hospitals', name: 'مستشفى أبو تشت المركزي', description: 'مستشفى مركز أبو تشت.', address: 'أبو تشت', city: 'أبو تشت', phone: '096-5800420', working_hours: '24 ساعة', tags: 'مستشفى' },
  { cat: 'hospitals', name: 'مستشفى الوقف المركزي', description: 'مستشفى مركز الوقف.', address: 'الوقف', city: 'الوقف', phone: '096-5800530', working_hours: '24 ساعة', tags: 'مستشفى' },
  { cat: 'hospitals', name: 'مستشفى دشنا المركزي', description: 'مستشفى مركز دشنا.', address: 'دشنا', city: 'دشنا', lat: 26.1339, lng: 32.4725, phone: '096-5800640', working_hours: '24 ساعة', tags: 'مستشفى' },
  { cat: 'hospitals', name: 'مستشفى فرشوط المركزي', description: 'مستشفى مركز فرشوط.', address: 'فرشوط', city: 'فرشوط', phone: '096-5800750', working_hours: '24 ساعة', tags: 'مستشفى' },
  { cat: 'hospitals', name: 'مستشفى الصداقة التخصصي', description: 'مستشفى خاص بقنا، عيادات وتخصصات متعددة.', address: 'شارع الجمهورية، قنا', city: 'قنا', phone: '096-5331100', working_hours: '24 ساعة', tags: 'خاص,تخصصي' },

  // Pharmacies
  { cat: 'pharmacies', name: 'صيدلية العزبي - قنا', description: 'سلسلة صيدليات العزبي فرع قنا.', address: 'شارع الجلاء، قنا', city: 'قنا', phone: '19600', working_hours: '24 ساعة', tags: 'صيدلية,24 ساعة', is_featured: true },
  { cat: 'pharmacies', name: 'صيدلية سيف - قنا', description: 'فرع صيدليات سيف في قنا.', address: 'ميدان الساعة، قنا', city: 'قنا', phone: '19199', working_hours: '24 ساعة', tags: 'صيدلية,24 ساعة' },
  { cat: 'pharmacies', name: 'صيدلية ميزون - قنا', description: 'صيدلية ميزون.', address: 'شارع الجمهورية، قنا', city: 'قنا', phone: '096-5343434', working_hours: '9 ص - 12 م', tags: 'صيدلية' },
  { cat: 'pharmacies', name: 'صيدلية د. محمد أحمد', description: 'صيدلية عامة.', address: 'شارع المحطة، قنا', city: 'قنا', working_hours: '9 ص - 12 م', tags: 'صيدلية' },
  { cat: 'pharmacies', name: 'صيدلية نجع حمادي', description: 'صيدلية مركزية بنجع حمادي.', address: 'نجع حمادي', city: 'نجع حمادي', working_hours: '9 ص - 11 م', tags: 'صيدلية' },

  // Clinics
  { cat: 'clinics', name: 'مركز قنا للأشعة', description: 'مركز أشعة وتحاليل.', address: 'شارع الجلاء، قنا', city: 'قنا', phone: '096-5333000', working_hours: '9 ص - 9 م', tags: 'أشعة,تحاليل' },
  { cat: 'clinics', name: 'معمل البرج للتحاليل - قنا', description: 'فرع البرج للتحاليل الطبية.', address: 'شارع الجمهورية، قنا', city: 'قنا', phone: '19911', working_hours: '7 ص - 11 م', tags: 'تحاليل' },
  { cat: 'clinics', name: 'معمل المختبر - قنا', description: 'فرع المختبر للتحاليل الطبية.', address: 'قنا', city: 'قنا', phone: '19014', working_hours: '7 ص - 11 م', tags: 'تحاليل' },
  { cat: 'clinics', name: 'عيادة د. محمد صابر - أطفال', description: 'طبيب أطفال متخصص.', address: 'شارع الجلاء، قنا', city: 'قنا', working_hours: '5 م - 10 م', tags: 'أطفال' },
  { cat: 'clinics', name: 'مركز النور للعيون', description: 'مركز طب وجراحة العيون.', address: 'شارع الجمهورية، قنا', city: 'قنا', working_hours: '10 ص - 9 م', tags: 'عيون' },

  // Hotels
  { cat: 'hotels', name: 'فندق قنا بالاس', description: 'فندق في قلب مدينة قنا.', address: 'شارع النيل، قنا', city: 'قنا', lat: 26.1642, lng: 32.7181, phone: '096-5333777', working_hours: '24 ساعة', price_range: 'متوسط', tags: 'فندق', is_featured: true },
  { cat: 'hotels', name: 'فندق نيو بالاس قنا', description: 'فندق اقتصادي قريب من محطة القطار.', address: 'شارع المحطة، قنا', city: 'قنا', phone: '096-5311144', price_range: 'اقتصادي', tags: 'فندق' },
  { cat: 'hotels', name: 'فندق الأقصر بدندرة', description: 'فندق قريب من معبد دندرة.', address: 'طريق دندرة', city: 'قنا', price_range: 'متوسط', tags: 'فندق,سياحة' },

  // Restaurants
  { cat: 'restaurants', name: 'مطعم أبو عاشور - قنا', description: 'مأكولات شعبية ومشويات.', address: 'شارع الجمهورية، قنا', city: 'قنا', phone: '096-5322222', working_hours: '12 ظ - 2 ص', price_range: 'متوسط', tags: 'مشويات,شعبي', is_featured: true },
  { cat: 'restaurants', name: 'مطعم الحاتي', description: 'مشويات ولحوم على الفحم.', address: 'شارع النيل، قنا', city: 'قنا', working_hours: '1 ظ - 1 ص', price_range: 'متوسط', tags: 'مشويات,حاتي' },
  { cat: 'restaurants', name: 'كنتاكي - قنا', description: 'فرع كنتاكي في قنا.', address: 'شارع الجلاء، قنا', city: 'قنا', phone: '19019', working_hours: '10 ص - 2 ص', price_range: 'متوسط', tags: 'وجبات سريعة' },
  { cat: 'restaurants', name: 'مطعم كشري أبو طارق - قنا', description: 'كشري مصري.', address: 'ميدان الساعة، قنا', city: 'قنا', working_hours: '11 ص - 12 م', price_range: 'اقتصادي', tags: 'كشري,شعبي' },
  { cat: 'restaurants', name: 'مطعم الريف', description: 'أكلات مصرية بلدي.', address: 'شارع البحر، قنا', city: 'قنا', working_hours: '12 ظ - 12 م', price_range: 'اقتصادي', tags: 'بلدي' },
  { cat: 'restaurants', name: 'بيتزا بيتزا - قنا', description: 'بيتزا ومعجنات.', address: 'شارع الجمهورية، قنا', city: 'قنا', working_hours: '11 ص - 1 ص', price_range: 'متوسط', tags: 'بيتزا' },

  // Cafes
  { cat: 'cafes', name: 'كافيه كورنيش قنا', description: 'كافيه بإطلالة على النيل.', address: 'كورنيش النيل، قنا', city: 'قنا', working_hours: '2 ظ - 2 ص', price_range: 'متوسط', tags: 'كافيه,نيل', is_featured: true },
  { cat: 'cafes', name: 'سيلانترو - قنا', description: 'كافيه وقهوة ومخبوزات.', address: 'شارع الجمهورية، قنا', city: 'قنا', phone: '19955', working_hours: '9 ص - 1 ص', price_range: 'مرتفع', tags: 'كافيه,قهوة' },
  { cat: 'cafes', name: 'كافيه لاونج قنا', description: 'كافيه شبابي بقنا.', address: 'شارع الجلاء، قنا', city: 'قنا', working_hours: '4 م - 3 ص', price_range: 'متوسط', tags: 'كافيه,لاونج' },
  { cat: 'cafes', name: 'قهوة العمدة', description: 'قهوة شعبية.', address: 'شارع المحطة، قنا', city: 'قنا', working_hours: '7 ص - 2 ص', price_range: 'اقتصادي', tags: 'قهوة,شعبي' },

  // Shops
  { cat: 'shops', name: 'سوق قنا المركزي', description: 'سوق رئيسي لبيع الخضار والفاكهة والملابس.', address: 'وسط مدينة قنا', city: 'قنا', working_hours: '7 ص - 10 م', tags: 'سوق,خضار,ملابس' },
  { cat: 'shops', name: 'فتح الله ماركت - قنا', description: 'سوبر ماركت كبير.', address: 'شارع الجمهورية، قنا', city: 'قنا', working_hours: '9 ص - 12 م', tags: 'سوبر ماركت' },
  { cat: 'shops', name: 'كارفور قنا', description: 'فرع هايبر ماركت.', address: 'شارع النيل، قنا', city: 'قنا', working_hours: '10 ص - 12 م', tags: 'هايبر' },
  { cat: 'shops', name: 'محلات المفروشات - شارع المحطة', description: 'تجمع محلات مفروشات.', address: 'شارع المحطة، قنا', city: 'قنا', working_hours: '10 ص - 11 م', tags: 'مفروشات' },

  // Transport
  { cat: 'transport', name: 'محطة قطار قنا', description: 'محطة السكة الحديد الرئيسية بقنا.', address: 'ميدان المحطة، قنا', city: 'قنا', lat: 26.1625, lng: 32.7268, phone: '096-5322000', working_hours: '24 ساعة', tags: 'قطار,سكة حديد', is_featured: true },
  { cat: 'transport', name: 'موقف قنا - الأقصر', description: 'موقف سيرفيس ومكروباصات للأقصر.', address: 'موقف قنا', city: 'قنا', working_hours: '5 ص - 11 م', tags: 'سيرفيس,مواصلات' },
  { cat: 'transport', name: 'موقف قنا - القاهرة (سوبر جيت)', description: 'أتوبيسات سوبر جيت وجو باص.', address: 'موقف سوبر جيت، قنا', city: 'قنا', phone: '16216', working_hours: '24 ساعة', tags: 'أتوبيس,قاهرة' },
  { cat: 'transport', name: 'محطة قطار نجع حمادي', description: 'محطة قطار نجع حمادي.', address: 'نجع حمادي', city: 'نجع حمادي', tags: 'قطار' },

  // Government
  { cat: 'government', name: 'ديوان عام محافظة قنا', description: 'المقر الرئيسي للمحافظة.', address: 'شارع الجمهورية، قنا', city: 'قنا', lat: 26.1605, lng: 32.7160, phone: '096-5322020', working_hours: '8 ص - 2 م', tags: 'محافظة,حكومي', is_featured: true },
  { cat: 'government', name: 'مديرية أمن قنا', description: 'المقر الرئيسي للأمن.', address: 'شارع الجلاء، قنا', city: 'قنا', phone: '122', working_hours: '24 ساعة', tags: 'شرطة,أمن' },
  { cat: 'government', name: 'مديرية التربية والتعليم', description: 'مقر مديرية التربية والتعليم.', address: 'شارع الجمهورية، قنا', city: 'قنا', phone: '096-5322200', working_hours: '8 ص - 2 م', tags: 'تعليم' },
  { cat: 'government', name: 'مديرية الصحة بقنا', description: 'مقر مديرية الصحة.', address: 'شارع الجمهورية، قنا', city: 'قنا', phone: '096-5322400', working_hours: '8 ص - 2 م', tags: 'صحة' },
  { cat: 'government', name: 'مكتب الشهر العقاري - قنا', description: 'مكتب الشهر العقاري.', address: 'قنا', city: 'قنا', working_hours: '8 ص - 2 م', tags: 'شهر عقاري' },
  { cat: 'government', name: 'مرور قنا', description: 'إدارة مرور قنا.', address: 'قنا', city: 'قنا', phone: '128', working_hours: '8 ص - 2 م', tags: 'مرور' },

  // Education
  { cat: 'education', name: 'جامعة جنوب الوادي', description: 'الجامعة الرئيسية في قنا.', address: 'طريق قنا-سفاجا', city: 'قنا', lat: 26.1889, lng: 32.7489, phone: '096-5211272', website: 'https://www.svu.edu.eg', working_hours: '8 ص - 4 م', tags: 'جامعة', is_featured: true },
  { cat: 'education', name: 'المعهد العالي للإدارة بقنا', description: 'معهد عالي.', address: 'قنا', city: 'قنا', working_hours: '8 ص - 3 م', tags: 'معهد' },
  { cat: 'education', name: 'الأزهر الشريف - فرع قنا', description: 'كليات الأزهر بقنا.', address: 'قنا', city: 'قنا', working_hours: '8 ص - 3 م', tags: 'أزهر' },

  // Banks
  { cat: 'banks', name: 'البنك الأهلي المصري - قنا', description: 'فرع البنك الأهلي.', address: 'شارع الجمهورية، قنا', city: 'قنا', phone: '19623', working_hours: '8:30 ص - 3 م', tags: 'بنك أهلي' },
  { cat: 'banks', name: 'بنك مصر - قنا', description: 'فرع بنك مصر.', address: 'شارع الجلاء، قنا', city: 'قنا', phone: '19888', working_hours: '8:30 ص - 3 م', tags: 'بنك مصر' },
  { cat: 'banks', name: 'بنك CIB - قنا', description: 'فرع بنك CIB.', address: 'شارع الجمهورية، قنا', city: 'قنا', phone: '19666', working_hours: '8:30 ص - 3 م', tags: 'CIB' },
  { cat: 'banks', name: 'بنك QNB الأهلي - قنا', description: 'فرع QNB.', address: 'شارع النيل، قنا', city: 'قنا', phone: '19700', working_hours: '8:30 ص - 3 م', tags: 'QNB' },
  { cat: 'banks', name: 'البنك الزراعي المصري - قنا', description: 'فرع البنك الزراعي.', address: 'قنا', city: 'قنا', phone: '16581', working_hours: '8:30 ص - 3 م', tags: 'زراعي' },

  // Gas stations
  { cat: 'gas-stations', name: 'محطة موبيل - قنا', description: 'محطة وقود موبيل.', address: 'طريق قنا الصحراوي', city: 'قنا', working_hours: '24 ساعة', tags: 'بنزين,سولار' },
  { cat: 'gas-stations', name: 'محطة توتال - قنا', description: 'محطة وقود توتال.', address: 'شارع الجمهورية، قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'بنزين' },
  { cat: 'gas-stations', name: 'محطة مصر للبترول - قنا', description: 'محطة وقود مصر للبترول.', address: 'قنا', city: 'قنا', working_hours: '24 ساعة', tags: 'بنزين' },
];

const publicNumbers = [
  // Emergency
  { group_name: 'طوارئ', name: 'النجدة', phone: '122', is_emergency: true, sort_order: 1 },
  { group_name: 'طوارئ', name: 'الإسعاف', phone: '123', is_emergency: true, sort_order: 2 },
  { group_name: 'طوارئ', name: 'المطافئ', phone: '180', is_emergency: true, sort_order: 3 },
  { group_name: 'طوارئ', name: 'شرطة المرور', phone: '128', is_emergency: true, sort_order: 4 },
  { group_name: 'طوارئ', name: 'الإنقاذ النهري', phone: '125', is_emergency: true, sort_order: 5 },
  { group_name: 'طوارئ', name: 'شكاوى الكهرباء', phone: '121', is_emergency: true, sort_order: 6 },
  { group_name: 'طوارئ', name: 'شكاوى الغاز', phone: '129', is_emergency: true, sort_order: 7 },
  { group_name: 'طوارئ', name: 'الإرشاد السياحي', phone: '126', is_emergency: false, sort_order: 8 },

  // Utilities
  { group_name: 'مرافق', name: 'شركة كهرباء مصر العليا - قنا', phone: '096-5322100', description: 'خدمة عملاء الكهرباء' },
  { group_name: 'مرافق', name: 'شركة مياه الشرب بقنا', phone: '125', description: 'خدمة شكاوى المياه' },
  { group_name: 'مرافق', name: 'شركة الغاز الطبيعي', phone: '129' },

  // Hotlines
  { group_name: 'خطوط ساخنة', name: 'شكاوى المحافظة', phone: '114' },
  { group_name: 'خطوط ساخنة', name: 'الرقابة الإدارية', phone: '16100' },
  { group_name: 'خطوط ساخنة', name: 'شكاوى الصحة', phone: '105' },
  { group_name: 'خطوط ساخنة', name: 'مرور مصر', phone: '128' },
  { group_name: 'خطوط ساخنة', name: 'السكة الحديد - خدمة العملاء', phone: '16958' },

  // Telecom
  { group_name: 'اتصالات', name: 'المصرية للاتصالات', phone: '111' },
  { group_name: 'اتصالات', name: 'فودافون', phone: '888' },
  { group_name: 'اتصالات', name: 'اتصالات مصر', phone: '110' },
  { group_name: 'اتصالات', name: 'أورنج', phone: '110' },
  { group_name: 'اتصالات', name: 'WE', phone: '111' },
];

module.exports = { categories, services, publicNumbers };
