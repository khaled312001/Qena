// Comprehensive Qift (قفط) import — doctors, shops, restaurants, cafes, supermarkets
// Sourced from Google Maps exports supplied by the owner.
// Only items explicitly in قفط — excludes items labeled قنا or other centers.
// Smart dedup by normalized name + phone (across existing services).
require('dotenv').config();
const { sequelize, Category, Service } = require('../models');

// -------------------- DOCTORS / MEDICAL --------------------
const medical = [
  { name: 'عيادة د. أبو الحسن الشاذلي', phone: '01030108991', tags: 'طبيب', address: 'الجيش، قفط', working_hours: 'يغلق 11م', rating: 5.0, reviews: 3 },
  { name: 'د. محمد ثابت البغدادي', phone: '01119497658', tags: 'علاج بالحركة,علاج طبيعي', address: 'المحطة، قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 3 },
  { name: 'عيادة د. محمد دبش لطب الأسنان', phone: '01065767190', tags: 'أسنان', address: 'XRW6+MC6، الجمهورية، قفط', working_hours: 'يغلق 10م', rating: 4.8, reviews: 5 },
  { name: 'كيدز كلينك لطب الأطفال - قفط', phone: '01030108991', tags: 'أطفال,حديثي الولادة', address: 'شارع الجيش، أمام كشري الاسكندراني، قفط', working_hours: 'يغلق 11م', rating: 4.0 },
  { name: 'عيادة د. علي محمد الصادق', tags: 'باطنة', address: '2R27+32G، قفط', rating: 5.0, reviews: 1 },
  { name: 'عيادة د. شاذلي محمد علي', phone: '01014568158', tags: 'باطنة', address: '2R28+39W، قفط', rating: 4.7, reviews: 6 },
  { name: 'مستشفى قفط التخصصي', tags: 'مستشفى,تخصصي', address: 'قفط', working_hours: '24 ساعة', rating: 3.8, reviews: 80 },
  { name: 'عيادة د. مصطفى فهمي فؤاد', phone: '01126575726', tags: 'باطنة,سكر,قلب', address: 'قفط', working_hours: 'يفتح الاثنين 4م' },
  { name: 'مستشفى الإسراء - قفط', phone: '0962864085', tags: 'مستشفى', address: '2R26+323، الجيش، قفط', working_hours: '24 ساعة', rating: 3.8, reviews: 22 },
  { name: 'د. وائل الشاذلي للعيون', phone: '01155352258', tags: 'عيون', address: 'XRX7+C25، درب السبعي، قفط', working_hours: 'يفتح 5م', rating: 5.0 },
  { name: 'مركز الأماني للعلاج الطبيعي - قفط', phone: '01146342055', tags: 'علاج طبيعي', address: 'XRW6+7X7، الشيخ الأنصاري، قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 4 },
  { name: 'د. محمود حسن عبد النور جلدية', tags: 'جلدية', address: '2R28+39W، قفط' },
  { name: 'عيادة د. سعود للقلب - قفط', tags: 'قلب', address: 'XRV2+CM8، قفط', rating: 5.0 },
  { name: 'عيادة د. أيمن حمدان - الخصوبة', tags: 'خصوبة,تخصصي', address: 'XRX6+H2V، قفط' },
  { name: 'عيادة د. محمد عبد النعيم - جراحة عامة', phone: '01012311450', tags: 'جراحة عامة', address: '2R26+323، مستشفى الإسراء، أمام كوبري الزعير، قفط', working_hours: 'يفتح 5م', rating: 5.0 },
  { name: 'عيادات الجودي التخصصية - قفط', phone: '01012866867', tags: 'عيادة متخصصة', address: 'قفط، بجوار مسجد الصفا والمروة', working_hours: 'يفتح 4م' },
  { name: 'عيادة د. محمد حامد أبو شنب', tags: 'باطنة', address: 'XRW5+QXJ، الجيش، قفط' },
  { name: 'عيادة د. محمد كمال الشاذلي - قفط', phone: '01090484059', tags: 'قلب', address: 'كوبري المرور، قفط', working_hours: 'يفتح 5م' },
  { name: 'عيادة د. سعد أبو السعود', phone: '01145862414', tags: 'أطفال', address: 'XRX7+X47، أحمد عرابي، قفط', working_hours: 'يفتح 7م', rating: 3.0, reviews: 4 },
  { name: 'مستشفى د. إمبابي - قفط', tags: 'نساء وتوليد,مستشفى', address: 'XRV7+5GJ، قفط', rating: 5.0 },
  { name: 'عياده د. أيمن عدلي', tags: 'نساء وتوليد', address: 'عمارة أحمد بكري، شقة 2، المحطة، قفط', rating: 5.0, reviews: 2 },
  { name: 'عيادة د. محمد عبد الرجال - أسنان', tags: 'أسنان', address: 'XRV3+J5M، المحطة، قفط' },
  { name: 'عيادة د. حمادة أبو السعود - عيون', phone: '01152642477', tags: 'عيون', address: 'XRW7+46V، الشيخ الأنصاري، قفط', working_hours: 'يفتح 5م', rating: 5.0, reviews: 4 },
  { name: 'مركز أجيال لطب الأطفال - قفط', phone: '01002920999', tags: 'أطفال,مستشفى', address: 'الجيش، قفط، كوبري الزعير', working_hours: '24 ساعة' },
  { name: 'عياده د. محمود عويس - قفط', tags: 'عيون', address: '2R28+39W، الشهر العقاري القديم، قفط', working_hours: 'الاثنين 4م' },
  { name: 'عياده د. محمد حسن مهنا - قفط', tags: 'عيون', address: 'XVW2+W45، قفط', rating: 5.0 },
  { name: 'عياده أسنان د. محمد حسين بالعويضات', tags: 'أسنان', address: 'XRR8+M49، قفط', working_hours: 'الاثنين 12ص', rating: 5.0 },
  { name: 'عيادة د. شمس الدين عبد الله', phone: '01044656504', tags: 'أسنان,جراحة فم', address: 'نجع الحمرة، قفط', working_hours: 'يفتح 4م', rating: 5.0 },
  { name: 'Dr. Mohamed Hussein Dental Clinic', phone: '+96898855924', tags: 'أسنان', address: 'XRR8+98C، قفط' },
  { name: 'عمارة العمدة حافظ - عيادات أطفال', tags: 'أطفال', address: 'XR9W+5JM، قفط' },
  { name: 'عيادة باسم متري - جراحة عظام', tags: 'جراحة عظام', address: 'XRX7+48F، خوفو، قفط' },
  { name: 'د. إيناس عبد السمط', tags: 'طبيب', address: 'XRR8+89C، قفط', rating: 5.0 },
];

// -------------------- PHARMACIES --------------------
const pharmacies = [
  { name: 'صيدلية د. سماح أحمد مصري - قفط', phone: '01204002328', tags: 'صيدلية,24 ساعة', address: 'الجمهورية، قفط', working_hours: '24 ساعة', rating: 4.3, reviews: 3 },
  { name: 'صيدلية د. ميادة - قفط', tags: 'صيدلية', address: 'XRV2+CM8، قفط' },
];

// -------------------- HOTELS --------------------
const hotels = [
  { name: 'فندق العويضي - قفط', phone: '01022164099', tags: 'فندق', address: 'XRV6+X6F، الجسر، قفط', rating: 3.5, reviews: 46 },
];

// -------------------- GOVERNMENT / UTILITIES --------------------
const government = [
  { name: 'شركة مصر العليا لتوزيع الكهرباء - قفط', phone: '0966910801', tags: 'كهرباء,مرافق', address: 'قفط', working_hours: '24 ساعة', rating: 3.1, reviews: 12 },
  { name: 'المصرية للاتصالات - قفط', phone: '0966917666', tags: 'اتصالات,سنترال', address: 'قفط', working_hours: 'يغلق 9م', rating: 3.8, reviews: 135 },
  { name: 'المنطقة الصناعية بقفط', tags: 'مكتب حكومي', address: 'XVJJ+97V، قفط', rating: 3.7, reviews: 6 },
];

// -------------------- EDUCATION --------------------
const education = [
  { name: 'إدارة قفط التعليمية - الحسابات', phone: '0966910302', tags: 'مؤسسة تعليمية,حكومي', address: '2R26+C7Q، شارع مجلس المدينة، قفط', working_hours: 'يغلق 9م', rating: 2.9, reviews: 31 },
];
const schools = [
  { name: 'أكاديمية الإسراء - قفط', tags: 'مركز تعليمي', address: 'المحطة، قفط', working_hours: 'يغلق 9م', rating: 5.0 },
  { name: 'مدرسة النهضة الابتدائية - قفط', tags: 'مدرسة ابتدائية', address: 'XRX6+X36، قفط' },
];

// -------------------- RESTAURANTS (قفط فقط) --------------------
const restaurants = [
  { name: 'كشري الاسكندراني - قفط', tags: 'كشري,مطعم', address: 'قفط', working_hours: 'يغلق 3ص', rating: 3.4, reviews: 199 },
  { name: 'العز للطيور - قفط', tags: 'مطعم,طيور', address: '2R26+CM3، حارة الشهيد فرغلي، قفط', rating: 5.0, reviews: 5 },
  { name: 'سندوتشات مشحت ومحمود - قفط', tags: 'إفطار,سندوتشات,سفري', address: 'XRX5+3RC، قفط', rating: 5.0, reviews: 4 },
  { name: 'كبابجي التكيه - قفط', tags: 'مشويات,لحوم', address: 'XRV6+VFH، قفط', working_hours: '24 ساعة' },
  { name: 'مطعم سكنانه - قفط', tags: 'إفطار', address: 'XRV6+Q39، الجسر، قفط', rating: 4.0, reviews: 4 },
  { name: 'مطعم الانسجام أبو هارون - قفط', tags: 'مطعم', address: 'XRW6+323، قفط', working_hours: '24 ساعة' },
  { name: 'كشك خش هتجيبك للسندوتشات', tags: 'وجبات سريعة,سندوتشات,سفري', address: 'شارع مدرسة الصنايع، قفط', working_hours: 'يغلق 11م', rating: 5.0 },
  { name: 'مطعم حسن - قفط', tags: 'مطعم,داخل المكان,سفري', address: 'XQ9R+6G9، طريق قوص-قفط، الشيخية', rating: 4.3, reviews: 3 },
  { name: 'مطعم سعيد القريشي - قفط', tags: 'مطعم,سفري', address: '2R72+VCH، قفط', working_hours: 'يفتح الاثنين 6ص', rating: 5.0, reviews: 2 },
  { name: 'مطعم أبو عوده - قفط', tags: 'مشويات,لحوم', address: '2R7X+F9H، قفط', rating: 1.0 },
  { name: 'آل البيت - قفط', tags: 'مطعم', address: 'XRW6+5VF، القصير-قنا، قفط' },
  { name: 'البركة - قفط', tags: 'مطعم,drive-thru', address: 'قفط', working_hours: '24 ساعة' },
];

// -------------------- CAFES (قفط فقط) --------------------
const cafes = [
  { name: 'كافيه الكورنيش - قفط', tags: 'كافيه', address: 'البارود، قفط', working_hours: 'يغلق 1ص', rating: 4.5, reviews: 39 },
  { name: 'كافيه ركنة فاروق - قفط', tags: 'مقهى,كافيه', address: 'XRV6+X42، الجسر، قفط', working_hours: 'يغلق 12:30ص', rating: 4.0, reviews: 38 },
  { name: 'Marena Cafe - قفط', tags: 'مقهى,كافيه', address: 'كوبري القلعة، قفط', working_hours: '24 ساعة', rating: 4.1, reviews: 80 },
  { name: 'El-Montzah Coffee - قفط', tags: 'مقهى,كافيه', address: 'XRW5+WR6، قفط', working_hours: '24 ساعة', rating: 3.4, reviews: 160 },
  { name: 'مقهى أم كلثوم - قفط', tags: 'كافيه,توصيل', address: 'أحمد عرابي، قفط', working_hours: 'يغلق 11م', rating: 4.2, reviews: 25 },
  { name: 'ميرس كافيه Merce Cafe', tags: 'كافيه,توصيل', address: '2R38+P6V، قفط', rating: 4.4, reviews: 34 },
  { name: 'ع الماشي - قفط', tags: 'مقهى فني', address: 'XRW5+QR6، الجيش، قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 4 },
  { name: 'كافية ع المااشى', tags: 'مقهى', address: 'XRP6+CC7، الجيش، قفط', working_hours: 'يغلق 3ص', rating: 4.0, reviews: 29 },
  { name: 'بلايستيشن القوصي - قفط', tags: 'كافيه,ألعاب', address: 'XRX6+2PV، مصطفى كامل، قفط' },
  { name: 'بلايستيشن CR7 - قفط', tags: 'مقهى,ألعاب', address: 'XRV7+5HV، قفط', working_hours: 'يغلق 10م', rating: 4.6, reviews: 5 },
  { name: 'مقهى المندره - قفط', tags: 'كافيه', address: 'XRV2+FM2، بجوار محطة قطار، قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 2 },
  { name: 'كافتريا الممشى - قفط', tags: 'مقهى', address: 'أمام المستشفى، قفط' },
  { name: 'كافيه أفندينا - قفط', tags: 'كافيه', address: '2R28+39W، بجوار الشهر العقاري، قفط' },
  { name: 'مطحن بن العمري - قفط', tags: 'كافيه,بن', address: 'XRX6+FXM، قفط' },
  { name: 'مطاحن وكافيه بن الجمال', tags: 'كافيه,بن', address: 'XRV7+R6M، بجوار هندسة الري، قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 2 },
  { name: 'محل حلواني الشروق - قفط', tags: 'كافيه,حلواني', address: 'XRX6+583، قفط', rating: 4.0, reviews: 4 },
  { name: 'Mazag - قفط', tags: 'كافيه', address: 'XRW4+GR، قفط', rating: 5.0 },
  { name: 'Almahata Cafee - قفط', tags: 'مقهى', address: 'المحطة، قفط', rating: 4.5, reviews: 2 },
  { name: 'Alforsan - قفط', tags: 'كافيه,سفري', address: 'البراهمة، بجوار البنزينة، قفط', rating: 5.0 },
  { name: 'كافيه ولاد العم أبو الزاهي', tags: 'كافيه', address: 'XRV6+X6G، فندق العويضي، قفط', rating: 5.0 },
];

// -------------------- SHOPS (قفط فقط) --------------------
const shops = [
  // Clothing
  { name: 'سلمي للملابس - قفط', phone: '01205486592', tags: 'ملابس', address: '2R27+355، قفط', rating: 4.0 },
  { name: 'محلات حارس العمري - قفط', phone: '01226815590', tags: 'ملابس,أقمشة,مفروشات', address: 'XRX7+V39، أحمد عرابي، قفط', working_hours: 'يغلق 10م', rating: 4.0, reviews: 6 },
  { name: 'محل ليليان للملابس البيتي', phone: '01154050244', tags: 'ملابس بيتي', address: 'XRX5+HX7، الجيش، قفط', working_hours: '24 ساعة', rating: 4.5, reviews: 2 },
  { name: 'سندريلا - قفط', phone: '01558587764', tags: 'ملابس', address: 'قفط، الظافرية', rating: 5.0, reviews: 2 },
  { name: 'محل لمسات خليجية', phone: '01116245805', tags: 'ملابس', address: 'XRW7+75W، الشيخ الأنصاري، قفط', rating: 5.0 },
  { name: 'محل البتول للملابس - قفط', tags: 'ملابس', address: '2R37+H9F، قفط' },
  // Jewelry
  { name: 'مصوغات ومجوهرات مختار', phone: '01113583311', tags: 'مجوهرات,ذهب', address: '2R27+452، شجرة الدر، قفط', working_hours: 'يغلق 9م', rating: 5.0 },
  { name: 'مصوغات الرشيد الذهبية', phone: '01224602803', tags: 'مجوهرات,ذهب', address: '12 شجرة الدر، قفط', working_hours: 'يغلق 11م', rating: 4.0, reviews: 6 },
  { name: 'محل العطار للمصوغات الذهبية', phone: '01288808537', tags: 'مجوهرات,ذهب', address: 'الثورة، قفط', working_hours: 'يغلق 10م' },
  // Home & tools
  { name: 'خالد الجهني للأدوات الصحية', phone: '01223737750', tags: 'أدوات صحية,مركز تسوق', address: '2R25+RFJ، قفط', working_hours: 'يغلق 10م', rating: 4.8, reviews: 13 },
  { name: 'محل الرحاب للمنظفات', tags: 'منظفات,سلع منزلية', address: '2R27+J23، امتداد مكتب الصحة، قفط', working_hours: 'يغلق 12ص', rating: 5.0 },
  { name: 'محل فرحة للأدوات المنزلية', phone: '01004296637', tags: 'أدوات منزلية', address: 'أحمد عرابي، قفط', working_hours: 'يغلق 10م', rating: 3.7, reviews: 3 },
  { name: 'سنتر سلامه الصياد', phone: '01060464845', tags: 'خردوات', address: 'XRX7+J89، توت عنخ آمون، قفط', working_hours: 'يفتح الاثنين 9ص', rating: 4.3, reviews: 4 },
  { name: 'محل الصديقان - قفط', tags: 'خردوات', address: 'XRW7+J3Q، الأنصاري، قفط', rating: 5.0, reviews: 2 },
  // Wedding supplies
  { name: 'بيت الملكة لتجهيزات العرائس', phone: '01224014929', tags: 'عرائس,تجهيزات', address: 'شارع الثورة، المعمل، قفط', working_hours: 'يغلق 10م', rating: 4.1, reviews: 9 },
  // Shoes
  { name: 'كوتشى & شوز - قفط', phone: '01273653664', tags: 'أحذية', address: 'بجوار مسجد الفتح، كوبري المرور، قفط', working_hours: 'يغلق 10م', rating: 5.0, reviews: 3 },
  // Cosmetics / medical
  { name: 'العالمية للمستحضرات والمستلزمات الطبية - قفط', phone: '01155780782', tags: 'مستلزمات طبية,مستحضرات تجميل', address: 'الجيش، بجوار المستشفى، قفط', working_hours: 'يغلق 10:30م', rating: 5.0, reviews: 2 },
  { name: 'الممشى التجاري - قفط', tags: 'مركز تجاري,مستحضرات تجميل', address: 'XRX5+2RJ، قفط', rating: 4.3, reviews: 12 },
  { name: 'الأمين للمنظفات وأدوات التجميل', phone: '01024254321', tags: 'منظفات,تجميل', address: 'قفط', rating: 5.0 },
  { name: 'محل بيوتي هوم - قفط', tags: 'مستحضرات تجميل', address: '2R72+VFC، قفط', rating: 1.0 },
  // Mobile / electronics
  { name: 'Tamer GSM - قفط', phone: '01203111466', tags: 'صيانة موبايل', working_hours: 'يغلق 10:30م', rating: 3.9, reviews: 27 },
  { name: 'شركة جلاكسي لخدمات المحمول - قفط', phone: '01146201040', tags: 'موبايل,إلكترونيات,توصيل', address: 'XRW7+66M، شارع الأنصاري، قفط', working_hours: '24 ساعة', rating: 4.4, reviews: 13 },
  { name: 'محل العصبة الهاشمية للإلكترونيات', phone: '01227648071', tags: 'إلكترونيات,توصيل', address: 'شارع شجرة الدر، قفط', working_hours: 'يغلق 10م', rating: 5.0, reviews: 3 },
  { name: 'محل العمدة لخدمات المحمول', tags: 'صيانة موبايل', address: '2Q7X+MJQ، قفط' },
  { name: 'أورجينال للأجهزة الكهربائية والتكييف', phone: '01090923207', tags: 'إلكترونيات,تكييف', address: 'مدينة قفط', working_hours: 'يفتح الاثنين 9ص', rating: 4.8, reviews: 13 },
  { name: 'محل محمود طربوش لصيانة الشاشات', tags: 'صيانة إلكترونيات', address: 'XRCX+M2C، قفط', working_hours: '24 ساعة', rating: 1.0 },
  // Perfumes
  { name: 'مزايا للعطور - قفط', phone: '01207459726', tags: 'عطور,توصيل', address: 'XRX5+9WM، الجيش، قفط', working_hours: 'يغلق 11:30م', rating: 5.0, reviews: 5 },
  // Printing / gifts / crafts
  { name: 'فرست كت ليزر للهدايا - قفط', phone: '01226793466', tags: 'هدايا,ليزر,توصيل', address: 'المحطة، قفط', working_hours: 'يغلق 10م', rating: 5.0, reviews: 2 },
  { name: 'عمر للطباعة - قفط', phone: '01124052903', tags: 'طباعة,هدايا', address: '2R6X+P9H، قفط', working_hours: '24 ساعة', rating: 4.0 },
  { name: 'محل سيدار للستائر - قفط', phone: '01274535541', tags: 'ستائر,خياط', address: 'XRW6+CP7، مصطفى كامل، قفط', working_hours: '24 ساعة' },
  { name: 'Tarzy - قفط', phone: '01274384076', tags: 'خياطة', address: 'بعد د. حمادة أبو سعود، قفط', working_hours: 'يفتح الاثنين 12ص' },
  { name: 'معرض تابلوهات سر ابتسامتك', phone: '01550753560', tags: 'هدايا,تابلوهات', address: 'XRGX+RM2، قفط', working_hours: 'يغلق 9م', rating: 5.0 },
  { name: 'مكتبة الجزيرية الحديثة', phone: '01558569066', tags: 'مكتبة,هدايا', address: '2QJR+43V، البراهمة، قفط', working_hours: 'يغلق 11م', rating: 5.0 },
  // Optical
  { name: 'عمر للبصريات - قفط', phone: '01112387212', tags: 'بصريات', address: 'شارع أبو بكر الصديق، قفط', working_hours: 'يغلق 11م' },
  { name: 'محمد علي للنظارات', phone: '01157611101', tags: 'نظارات', working_hours: 'يغلق 10م', rating: 2.9, reviews: 10 },
  { name: 'نظارات عيون مصرية', phone: '01112387212', tags: 'بصريات', address: 'شارع أحمد عرابي، قفط', working_hours: 'يغلق 11:30م', rating: 5.0 },
  // Auto parts
  { name: 'محلات الخطيب لقطع الغيار', phone: '01091448034', tags: 'قطع غيار,اكسسوارات سيارات,إطارات,بطاريات', address: 'XRJX+6XG، قفط', working_hours: 'يغلق 10م', rating: 5.0 },
  { name: 'محل المنياوي لقطع غيار السيارات', phone: '01066275831', tags: 'قطع غيار سيارات', address: 'XVJ2+5V7، طريق قفط', working_hours: '24 ساعة', rating: 5.0 },
  { name: 'محل دهانات التويتي', tags: 'دهانات,مواد بناء', address: '2R8P+RM2، قفط', rating: 4.0 },
  { name: 'محل أبو ستة للحدايد والبويات', phone: '01220412624', tags: 'حدايد,بويات,مواد بناء', address: 'XQRQ+MQP، قفط', working_hours: '24 ساعة' },
  // Misc
  { name: 'Oriflame Qena - مركز خدمة أوريفليم', phone: '01002670023', tags: 'مستحضرات تجميل,أوريفليم', working_hours: 'يغلق 10م', rating: 4.2, reviews: 15 },
  { name: 'تيتان للعطور ومستحضرات التجميل', phone: '01015958729', tags: 'عطور,مستحضرات تجميل', working_hours: '24 ساعة' },
  { name: 'أرنوب للمعجنات - قفط', phone: '01150325660', tags: 'معجنات,توصيل', address: 'بورسعيد، قفط' },
  { name: 'محلات الحسن والحسين للستائر والتنجيد', tags: 'ستائر,تنجيد', address: 'XR2X+P8X، قفط' },
  { name: 'Abeer Grocery Store - قفط', tags: 'كماليات سيارات', working_hours: '24 ساعة', rating: 3.9, reviews: 44 },
];

// -------------------- SUPERMARKETS (قفط فقط) --------------------
const supermarkets = [
  { name: 'ماركت السعادة - قفط', phone: '01008827057', tags: 'سوبرماركت', address: 'XRX5+7W3، الجيش، قفط', working_hours: '24 ساعة', rating: 5.0 },
  { name: 'آسر ماركت - قفط', tags: 'سوبرماركت,توصيل', address: '2R26+VXW، المنشية، قفط', rating: 5.0, reviews: 3 },
  { name: 'أبو حرشه - قفط', tags: 'سوبرماركت', address: '2R25+36M، قفط', rating: 4.5, reviews: 2 },
  { name: 'ماركت زمان - قفط', phone: '01033390648', tags: 'سوبرماركت', address: 'بجوار فرن بالهنا والشفا، درب السبعي، قفط', working_hours: 'يغلق 1:30ص' },
  { name: 'سوبر ماركت أم الدنيا - قفط', tags: 'متجر', address: 'XRX5+XF2، قفط', rating: 5.0 },
  { name: 'ماركت البربري - قفط', tags: 'بقالة', address: '2R27+23V، قفط', rating: 5.0 },
  { name: 'نور ماركت 1 - قفط', tags: 'بقالة', address: 'XRX5+QX4، أمام كشري الاسكندراني، قفط', rating: 5.0 },
  { name: 'الحمزاوي ماركت', tags: 'سوبرماركت', address: 'XRX7+XMH، السادات، قفط' },
  { name: 'هايبر أسواق المصطفى - قفط', phone: '01212606069', tags: 'بقالة,هايبر', address: 'البراهمة، قفط', working_hours: '24 ساعة', rating: 4.3, reviews: 58 },
  { name: 'سوبر ماركت الحرمين - قفط', tags: 'بقالة', address: 'بجوار المزدلفة للزيوت، غرب كوبري المرور، قفط', working_hours: 'يغلق 2ص', rating: 4.0 },
  { name: 'مالك ماركت الصايغ', tags: 'سوبرماركت', address: 'XRX7+J39، قفط' },
  { name: 'ناصر الزيات - قفط', phone: '01222414103', tags: 'سوبرماركت', address: '2R28+38P، الظافرية، قفط', working_hours: 'يغلق 2ص', rating: 2.3, reviews: 3 },
  { name: 'سوبر ماركت نور - قفط', tags: 'سوبرماركت', address: 'XRV6+RMX، جسر، قفط', rating: 4.5, reviews: 2 },
  { name: 'العبد فيزا فاملى - قفط', phone: '01201235034', tags: 'سوبرماركت,فيزا', address: 'السادات، قفط', working_hours: 'يغلق 11:30م' },
  { name: 'سوبر ماركت جاد - قفط', tags: 'سوبرماركت', address: 'XRR8+98C، قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 2 },
  { name: 'هايبر أسواق المصطفى - فرع المحطة', tags: 'سوبرماركت,هايبر', address: 'XRV3+H9X، المحطة، قفط' },
  { name: 'الأنصاري ماركت - قفط', tags: 'سوبرماركت', address: 'XRV6+V74، قفط', working_hours: 'يفتح الاثنين 7ص', rating: 3.8, reviews: 53 },
  { name: 'عمار ماركت - قفط', phone: '01228013009', tags: 'سوبرماركت', address: 'XRXC+C7F، دسوقي باشا، قفط', working_hours: '24 ساعة', rating: 4.0, reviews: 3 },
  { name: 'ماركت الحسن والحسين - الجيش قفط', tags: 'بقالة', address: 'الجيش، قفط', rating: 4.7, reviews: 6 },
  { name: 'سوبر ماركت صابر - قفط', phone: '01119512360', tags: 'بقالة', address: 'XQVX+647، قفط', working_hours: 'يغلق 10م', rating: 3.3, reviews: 9 },
  { name: 'شريف همام ماركت', tags: 'سوبرماركت', address: 'XRV7+6GJ، قفط', rating: 4.0, reviews: 2 },
  { name: 'عمرو الحجيري - قفط', tags: 'بقالة', address: '2R26+2G3، قفط' },
  { name: 'سوبر ماركت المؤيد - قفط', tags: 'سوبرماركت', address: '2R7W+6FC، قفط', working_hours: '24 ساعة', rating: 4.8, reviews: 4 },
  { name: 'محل الفردوس مجمدات', phone: '01060600850', tags: 'سوق,مجمدات', address: 'XRX7+XMH، معمل الثقة، قفط' },
  { name: 'مؤسسة قنا ربيت', phone: '01067321950', tags: 'مستلزمات صناعية,توصيل', address: '2Q6X+CP9، البراهمة، قفط', working_hours: 'يغلق 9م', rating: 5.0, reviews: 4 },
  { name: 'سوبر ماركت علي بخيت', tags: 'سوبرماركت', address: '2R7W+9X6، قفط', working_hours: 'يغلق 11م', rating: 4.0, reviews: 20 },
  { name: 'سوبر ماركة الفارس', phone: '01222288888', tags: 'بقالة', address: 'XRXC+RRF، آل عمر، قفط', rating: 4.5, reviews: 2 },
  { name: 'سوبر ماركت أبو عشرة - طلعت عصام', phone: '01092617438', tags: 'سوبرماركت', address: 'نجع الشيخ أحمد، قفط', rating: 4.6, reviews: 29 },
  { name: 'ماركت شيخ العرب - قفط', tags: 'سوبرماركت', address: 'XRP4+67R، جسر، قفط' },
  { name: 'الفاروق لتجارة الجملة - قفط', phone: '0962919677', tags: 'بقالة,جملة,توصيل', address: '2R49+Q42، قفط', working_hours: 'يغلق 10م', rating: 3.5, reviews: 34 },
  { name: 'عطية بخيت بخيت - قفط', tags: 'سوبرماركت', address: '2V4C+FFQ، قفط', working_hours: '24 ساعة', rating: 5.0, reviews: 3 },
  { name: 'ماركت الإخلاص - قفط', phone: '01000894565', tags: 'سوبرماركت', address: '2Q8X+52G، قفط' },
  { name: 'ماركت العفيفى - قفط', tags: 'بقالة', address: '2Q7X+P3C، قفط', rating: 5.0 },
  { name: 'كشك السعادة', tags: 'بقالة', address: 'أول الجسر، قفط' },
  { name: 'مقلي الفتح', tags: 'بقالة', address: 'شارع جسر، قفط' },
  { name: 'سوبر ماركت الضحي', phone: '01024415582', tags: 'سوبرماركت', address: 'XRGW+8XP، القصير، قفط' },
  { name: 'مؤسسة شيبة الدريدي', phone: '01274478846', tags: 'سوبر ماركت,عروض خصم', address: 'الشارع الرئيسي، قفط', working_hours: '24 ساعة' },
  { name: 'جمعيتي الجيلاني - قفط', phone: '01025679922', tags: 'بقالة', address: 'قفط', rating: 5.0, reviews: 6 },
  { name: 'هاييبر بشرة خير', tags: 'بقالة', address: '2RM4+C84، قفط', rating: 4.8, reviews: 4 },
  { name: 'مكتب T E للطيران والسياحة - طلعت عصام', phone: '01092617438', tags: 'سفريات,سياحة', address: 'نجع الشيخ أحمد، قفط', rating: 5.0 },
];

function normalize(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652ـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/^د\s*[\.\/]\s*/, '').replace(/^الدكتور\s*/, '').replace(/^الأستاذ\s*/, '')
    .replace(/^عيادة\s*/, '').replace(/^مركز\s*/, '').replace(/^مستشفى\s*/, '')
    .replace(/^محل\s*/, '').replace(/^سوبر\s*ماركت\s*/, '').replace(/^ماركت\s*/, '')
    .replace(/[^\w\u0600-\u06FF]+/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}
function normPhone(p) {
  if (!p) return null;
  return p.toString().replace(/[^0-9]/g, '').replace(/^20/, '0');
}

async function importBatch(categorySlug, items, defaultCity = 'قفط') {
  const cat = await Category.findOne({ where: { slug: categorySlug } });
  if (!cat) { console.log(`! missing category: ${categorySlug}`); return { inserted: 0, enriched: 0, skipped: 0 }; }

  // Dedup against entire services table (any category) to catch cross-category duplicates
  const existing = await Service.findAll({ attributes: ['id', 'name', 'phone', 'address', 'tags', 'category_id'] });
  const byName = new Map();
  const byPhone = new Map();
  for (const e of existing) {
    byName.set(normalize(e.name), e);
    const p = normPhone(e.phone);
    if (p && p.length >= 10) byPhone.set(p, e);
  }

  let inserted = 0, enriched = 0, skipped = 0;
  for (const d of items) {
    const nn = normalize(d.name);
    const np = normPhone(d.phone);
    let match = np ? byPhone.get(np) : null;
    if (!match) {
      match = byName.get(nn);
      if (!match) {
        for (const [k, v] of byName) {
          if (nn.length < 6 || k.length < 6) continue;
          if (k.includes(nn) || nn.includes(k)) { match = v; break; }
        }
      }
    }
    if (match) {
      const patch = {};
      if (!match.phone && d.phone) patch.phone = d.phone;
      if (!match.address && d.address) patch.address = d.address;
      if (!match.tags && d.tags) patch.tags = d.tags;
      if (Object.keys(patch).length) { await Service.update(patch, { where: { id: match.id } }); enriched++; }
      else skipped++;
      continue;
    }
    const desc = d.rating
      ? `${(d.tags || '').split(',')[0]} · تقييم ${d.rating} (${d.reviews || 0} مراجعة)`.trim()
      : ((d.tags || '').split(',')[0] || null);
    await Service.create({
      category_id: cat.id,
      name: d.name.slice(0, 160),
      description: desc,
      city: d.city || defaultCity,
      address: d.address || null,
      phone: d.phone || null,
      working_hours: d.working_hours || null,
      tags: d.tags || null,
      status: 'approved',
    });
    inserted++;
    byName.set(nn, { id: null, name: d.name });
    if (np) byPhone.set(np, { id: null });
  }
  return { inserted, enriched, skipped };
}

async function main() {
  await sequelize.authenticate();
  let grand = { inserted: 0, enriched: 0, skipped: 0 };
  const batches = [
    ['clinics', medical],
    ['pharmacies', pharmacies],
    ['hotels', hotels],
    ['government', government],
    ['education', education],
    ['schools', schools],
    ['restaurants', restaurants],
    ['cafes', cafes],
    ['shops', shops],
    ['shops', supermarkets],  // supermarkets go under shops
  ];
  for (const [slug, items] of batches) {
    const r = await importBatch(slug, items);
    console.log(`  ${slug.padEnd(14)} (${items.length.toString().padStart(3)}) → inserted=${r.inserted} enriched=${r.enriched} skipped=${r.skipped}`);
    grand.inserted += r.inserted; grand.enriched += r.enriched; grand.skipped += r.skipped;
  }
  console.log(`\n✓ TOTAL inserted=${grand.inserted} enriched=${grand.enriched} skipped=${grand.skipped}`);
  console.log(`  total services now: ${await Service.count()}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
