// Import new doctors/medical places (Google Maps export) — merged into the
// "clinics" category (أطباء ومراكز طبية). Dedupe by fuzzy normalized name +
// by phone match. Enrich existing entries with missing phone/address/rating.
require('dotenv').config();
const { sequelize, Category, Service } = require('../models');

// Source list — supplied by project owner from Google Maps.
// Each entry: name, phone, specialty (tags), address, working_hours, rating (optional)
const data = [
  { name: 'مركز الرازي إيليت (جلدية - تجميل - ليزر)', phone: '01080722287', tags: 'جلدية,تجميل,ليزر', address: 'المستشارين', working_hours: 'يغلق 11م', rating: 4.8, reviews: 23 },
  { name: 'د. عمرو عبد الحميد', phone: '01091500666', tags: 'طبيب', working_hours: 'يغلق 10م', rating: 3.9, reviews: 17 },
  { name: 'عيادة الأستاذ الدكتور محمود عويس — استشاري طب وجراحة العيون', phone: '01007707720', tags: 'عيون', address: 'شارع 23 يوليو، برج الروضة، الدور الثاني', working_hours: '24 ساعة', rating: 4.6, reviews: 14 },
  { name: 'د. عادل محمد غانم — استشاري طب الأطفال', phone: '01226634177', tags: 'أطفال', address: 'برج سحيله، أعلى كنتاكي، الجمهورية', working_hours: 'يغلق 6م', rating: 4.7, reviews: 14 },
  { name: 'عيادة د. عبد الرحيم فتحى لجراحة الأوعية الدموية', phone: '01011297491', tags: 'جراحة أوعية دموية', address: 'شارع المستشفى العام', working_hours: 'يغلق 6م', rating: 5.0, reviews: 17 },
  { name: 'عيادة باطنة د. إيمان حمدي فهمي', phone: '01032511700', tags: 'باطنة', address: 'شارع كوبري قنا - دندرة، بجوار غاز الأقاليم', working_hours: 'يغلق 10م', rating: 3.0, reviews: 2 },
  { name: 'الأستاذ الدكتور شمردن عز الدين', tags: 'طبيب', address: '5P47+PWF', working_hours: 'يغلق 5م', rating: 4.3, reviews: 10 },
  { name: 'عيادة د. شيماء أحمد عبد الحي لأمراض الباطنة والقلب', phone: '01011297491', tags: 'باطنة,قلب', address: 'قسم قنا', working_hours: 'يغلق 5م', rating: 5.0, reviews: 3 },
  { name: 'صيدلية د. مدحت مكرم الجديدة بقنا', phone: '01551242597', tags: 'صيدلية', address: 'بجوار ماركت الروماني، بجوار ماركت الفادي، أمام نزل شباب، الأقصر' },
  { name: 'مركز قنا للصدر والحساسية — أ.د علاء رشاد', phone: '01021991127', tags: 'صدر,حساسية', address: 'أبو بكر الصديق', working_hours: 'يغلق 8م', rating: 3.9, reviews: 29 },
  { name: 'د. أسامة إدريس', phone: '0963360123', tags: 'طبيب', address: '5P45+WCQ، 26 يوليو', working_hours: 'يغلق 8م', rating: 5.0, reviews: 10 },
  { name: 'عيادة د. سيد عبد الحميد لجراحة العظام والمفاصل والعمود الفقري', phone: '01114231952', tags: 'جراحة عظام,مفاصل,عمود فقري', address: 'أمام المستشفى العام، شارع كوبري دندرة', working_hours: 'يغلق 9:30م', rating: 3.8, reviews: 13 },
  { name: 'المركز التخصصي لعلاج السمنة والنحافة — د. آيات حلمي', phone: '01099264355', tags: 'تغذية,سمنة,نحافة', address: 'شارع المستشارين بجوار مركز الرازي', working_hours: 'يغلق 11م', rating: 4.4, reviews: 9 },
  { name: 'أ. د. محمد مسلم الحفني — استشاري المخ والأعصاب والطب النفسي', phone: '01117227166', tags: 'مخ وأعصاب,طب نفسي', address: 'قنا - الأحوال', working_hours: 'يغلق 10م', rating: 3.8, reviews: 15 },
  { name: 'مراكز تواصل لاضطرابات التخاطب — د. مصطفى عبد الرؤوف عزوز', phone: '01001369000', tags: 'تخاطب,اضطرابات النطق', address: 'الشبان المسلمين', working_hours: 'يغلق 11م', rating: 4.9, reviews: 41 },
  { name: 'Cardiology Clinic — عيادة القلب د. ديفيد جادالله', phone: '01025001850', tags: 'قلب', address: 'حوض عشرة، شارع البستان', working_hours: 'يغلق 5م', rating: 5.0, reviews: 8 },
  { name: 'عيادة د. محمد حسن مهنا', tags: 'عيون', address: 'XVW2+W45', rating: 5.0, reviews: 1 },
  { name: 'عيادة د. محمود أبو زيد — استشاري الجراحة العامة والمناظير والقولون', phone: '01067179096', tags: 'جراحة عامة,مناظير,قولون', address: 'بجوار قاعة ميراج، أمام التأمين الصحي، شارع المدارس', working_hours: 'يغلق 6م', rating: 5.0, reviews: 3 },
  { name: 'مركز أطباء القاهرة وأسيوط بقنا', phone: '01092008554', tags: 'مركز طبي', address: '5P54+JF5', working_hours: 'يغلق 10م' },
  { name: 'مستشفى الحميات', phone: '0963332012', tags: 'مستشفى,حميات', address: '5P46+PGF، 26 يوليو', working_hours: 'يغلق 1:30ص', rating: 4.1, reviews: 63 },
  { name: 'مستشفى الشفاء بقنا', phone: '01067770901', tags: 'مستشفى,خاص', address: 'أمام شارع كوبري دندرة، كورنيش النيل', working_hours: '24 ساعة', rating: 3.4, reviews: 61 },
  { name: 'عيادة د. كيرلس ملاك — أخصائي الصدر والحساسية', phone: '01273708585', tags: 'صدر,حساسية,رئة', address: 'المستشارين', rating: 5.0, reviews: 1 },
  { name: 'مركز قنا للحقن المجهري وأطفال الأنابيب', phone: '01068884443', tags: 'حقن مجهري,أطفال أنابيب,خصوبة', address: 'أمام بسمة الشمال، كوبري دندرة', working_hours: 'يغلق 8م', rating: 4.0, reviews: 22 },
  { name: 'مركز د. علي عثمان — استشاري الباطنة والقلب والسكر والغدد الصماء', phone: '01098340408', tags: 'باطنة,قلب,سكر,غدد', address: 'أمام بنك الإسكندرية، برج زمزم، 23 يوليو، ميدان مسجد ناصر', working_hours: 'يغلق 10م', rating: 5.0, reviews: 1 },
  { name: 'عيادة سيد عبد الرحيم الشاملة', phone: '0965333768', tags: 'طبيب,شامل', address: 'شارع المدارس بجوار مبنى الأمن الوطني', rating: 3.0, reviews: 30 },
  { name: 'د. جرجس روماني قديس', phone: '0963332747', tags: 'طبيب', address: '5P58+JRQ', rating: 4.3, reviews: 4 },
  { name: 'د. جمال رمضان الطويل', phone: '0965325132', tags: 'طبيب', address: 'ش 23 يوليو', rating: 5.0, reviews: 4 },
  { name: 'مستشفى قنا العسكري', tags: 'مستشفى,عسكري', address: '5P47+VJ3', working_hours: '24 ساعة', rating: 3.8, reviews: 12 },
  { name: 'د. محمد الشيخ محمد راشد — تجميل وزراعة الأسنان', phone: '01005522770', tags: 'أسنان,تجميل,زراعة', address: 'أعلى مطعم حواوشي، شارع الجميل، بحري البلد', working_hours: 'يغلق 9م', rating: 5.0, reviews: 6 },
  { name: 'د. مايكل جرجس — جراحات العظام المتقدمة', phone: '01025541044', tags: 'جراحة عظام', address: 'برج زمزم، 23 يوليو', working_hours: 'يغلق 11م', rating: 4.3, reviews: 8 },
  { name: 'Smile Eye Center', phone: '01028856480', tags: 'عيون', rating: 3.8, reviews: 15 },
  { name: 'د. إيناس صفوت', tags: 'صيدلية', address: '2QC7+39Q' },
  { name: 'د. حمدي محفوظ — باطنة وكبد وحميات', tags: 'باطنة,كبد,حميات', address: '5P58+JW4، عبيد', rating: 5.0, reviews: 1 },
  { name: 'معمل آمون قنا', phone: '01033611323', tags: 'مختبر,تحاليل', address: 'البستان', working_hours: 'يغلق 1ص', rating: 4.9, reviews: 60 },
  { name: 'عيادة د. محمد الديب', phone: '01140300556', tags: 'طبيب', address: '5P34+W5H', working_hours: '24 ساعة', rating: 5.0, reviews: 3 },
  { name: 'دار جراحات العظام بقنا', phone: '01094050997', tags: 'مستشفى,جراحة عظام', working_hours: '24 ساعة', rating: 4.5, reviews: 6 },
  { name: 'مركز نيوروكير لعناية المخ والأعصاب بقنا', phone: '01014571864', tags: 'مخ وأعصاب,مستشفى', address: 'شارع كوبري دندرة، أمام المستشفى، بجوار بنك قناة السويس، أعلى قنا سكان', working_hours: '24 ساعة', rating: 2.8, reviews: 19 },
  { name: 'عيادة أسنان د. محمد مجدي', phone: '01090122030', tags: 'أسنان', address: '5P44+WWG', working_hours: '24 ساعة', rating: 4.4, reviews: 20 },
  { name: 'د. محمد يحيي', phone: '01009083939', tags: 'جرّاح', address: 'أمام مركز الرازي الطبي، المستشارين', working_hours: 'يغلق 5م، يعيد الفتح 7م', rating: 4.2, reviews: 6 },
  { name: 'د. باسم حبشي بشاي', phone: '01005155405', tags: 'طبيب', address: 'قنا، وسط البلد', rating: 3.7, reviews: 3 },
  { name: 'د. حمدي تمام — عظام', phone: '01022233384', tags: 'جراحة عظام', address: '5P46+VV', rating: 4.7, reviews: 6 },
  { name: 'عيادة د. مصطفى آدم الطيري (جلدية وتناسلية)', phone: '01001382290', tags: 'جلدية,تناسلية', address: '5P47+PM4', rating: 4.6, reviews: 8 },
  { name: 'مركز د. محمود عبد الحميد العمدة', phone: '01003659536', tags: 'عيادة', address: '5P68+XR3 وسط ميدان سيدي عمر، برج الرواد، بجوار ماركت الحبيب', working_hours: 'يغلق 10:18م' },
  { name: 'مستشفى الصدر بقنا', tags: 'مستشفى,صدر', address: '5P46+R3X، 26 يوليو', working_hours: '24 ساعة', rating: 3.8, reviews: 30 },
  { name: 'عيادة د. محمد كمال الشاذلي', phone: '01030578687', tags: 'قلب', address: 'صيدلية د. هالة موافي، شارع المستشارين، أمام مركز الرازي', rating: 3.0, reviews: 2 },
  { name: 'Dr. Mohammed Essam Physical Therapy Center', phone: '01226403342', tags: 'علاج طبيعي', address: '5P65+63W، رقم 3', working_hours: 'يفتح 5م', rating: 5.0, reviews: 1 },
  { name: 'عيادة د. عاطف فتحي قنا', phone: '01024459102', tags: 'صحة الرجال', address: '5P47+XVQ، 26 يوليو', rating: 3.8, reviews: 4 },
  { name: 'عيادة د. خالد مسلم', phone: '01007724161', tags: 'مركز طبي', address: 'أمام مستشفى قنا العام، كوبري دندرة', working_hours: '24 ساعة', rating: 5.0, reviews: 4 },
  { name: 'EVE Health Center — مركز إيف لصحة المرأة — د. أحمد عبد الراضي الديب', phone: '01097530008', tags: 'نساء,صحة المرأة', address: 'أمام مركز الرازي الطبي، المستشارين', working_hours: 'يفتح 7م', rating: 4.5, reviews: 18 },
  { name: 'د. أبو العباس عارف محمد', phone: '0965332355', tags: 'طبيب', address: 'ش 23 يوليو', rating: 3.0, reviews: 1 },
  { name: 'د. مصطفى خضري — أستاذ النساء والحقن المجهري والعقم', phone: '01021442888', tags: 'نساء وتوليد,حقن مجهري,عقم', address: 'أمام المستشفى العام، برج تبارك', rating: 5.0, reviews: 32 },
  { name: 'د. ثروت محروث لطب وجراحات العيون', phone: '01281303105', tags: 'عيون', address: '5P47+GMC، خلف المستشفى العسكري', rating: 5.0, reviews: 2 },
  { name: 'مستشفى إرادة للطب النفسي وعلاج الإدمان', phone: '01030041118', tags: 'طب نفسي,إدمان', address: 'مركز تدريب الكنوز التابع لشركة مياه الشرب', working_hours: '24 ساعة', rating: 4.5, reviews: 8 },
  { name: 'د. ماركو جريس', phone: '01113135419', tags: 'طبيب', address: '5P5C+F66، قنا، وسط البلد', rating: 3.7, reviews: 3 },
  { name: 'د. حسن هاشم', phone: '0966602853', tags: 'طبيب', address: 'El Sheikh Hussein Rd', rating: 4.0, reviews: 3 },
  { name: 'عيادة د. عرفات الناصح', phone: '01021792810', tags: 'عيون', address: '23 يوليو، قسم قنا', rating: 5.0, reviews: 4 },
  { name: 'د. شيماء عبد الله — غدد', tags: 'غدد صماء', address: '5P48+2CC', rating: 5.0, reviews: 2 },
  { name: 'د. أسامة كمال الدين طايع', tags: 'عيادة طبية', address: '5P39+R75 حوض 10', rating: 4.0, reviews: 4 },
  { name: 'د. حسني أحمد عمر', phone: '01006360196', tags: 'أنف وأذن وحنجرة', address: '26 يوليو، أمام نادي ضباط الشرطة', working_hours: 'يفتح 7:45م', rating: 4.8, reviews: 4 },
  { name: 'مركز د. أحمد عبد الراضي محمد — استشاري القلب والباطنة', tags: 'قلب,باطنة', address: '5P5C+FVF ميدان بنزيون، برج الجبلاوي، أمام بنك القاهرة، 23 يوليو', rating: 5.0, reviews: 1 },
  { name: 'د. عماد الطيب', phone: '0963333105', tags: 'عيادة طبية', address: 'شارع المستشارين', rating: 4.8, reviews: 4 },
  { name: 'عيادة د. مينا أسعد للعيون', phone: '01277818448', tags: 'عيون', address: '5P38+XHP، البستان', rating: 5.0, reviews: 1 },
  { name: 'د. عبد الرحيم سيد توفيق', phone: '01011074241', tags: 'خدمات طبية', address: 'شارع مصطفى كامل، أمام السندريلا', rating: 5.0, reviews: 1 },
  { name: 'مركز جنين د. حمادة', phone: '0965338400', tags: 'مركز طبي,نساء', address: '5P58+F22، 23 يوليو', working_hours: '24 ساعة', rating: 4.0, reviews: 4 },
  { name: 'عيادة د. سامي راسم مشرقي', phone: '01063216624', tags: 'أطفال', address: 'شارع المستشارين، برج وشاحي، أعلى بنك أبو ظبي التجاري', rating: 3.0, reviews: 2 },
  { name: 'نقابة أطباء قنا', tags: 'نقابة,جهة طبية', address: '5P75+F3' },
  { name: 'عيادة د. أيمن عماد', phone: '01033854854', tags: 'مختبر,تحاليل', address: 'أمام بنك القاهرة، خلف حلواني منصور، 23 يوليو', rating: 4.7, reviews: 3 },
  { name: 'مركز العدار للأسنان', phone: '01554342830', tags: 'أسنان', address: 'الشنهورية', working_hours: 'يفتح 5م', rating: 4.7, reviews: 24 },
  { name: 'عيادة د. رانيا البركاوي — أخصائي الجلدية والليزر وتجميل البشرة', phone: '01287640434', tags: 'جلدية,ليزر,تجميل', address: 'عيادة د. أيمن عطيتو، ميدان المحطة، عمارة الأوقاف', working_hours: 'يفتح 7:30م', rating: 3.9, reviews: 7 },
  { name: 'د. وليد البسطاوي — أحمد بسطاوي', phone: '01144004599', tags: 'طبيب', address: 'شارع سور الشبان', rating: 4.3, reviews: 31 },
  { name: 'مركز رؤية للعيون', phone: '01002124001', tags: 'عيون', address: '5P58+M7Q، الشبان المسلمين', rating: 3.8, reviews: 20 },
  { name: 'عيادة د. شيري موريس للعيون', phone: '01061196288', tags: 'عيون', address: 'شارع المحافظة', rating: 5.0, reviews: 1 },
  { name: 'د. جورج نبيل فاضل', phone: '01205113323', tags: 'جراحة تجميل', address: '5P38+FMR، النور المحمدي', rating: 5.0, reviews: 5 },
  { name: 'عيادة د. رندا', phone: '01095438995', tags: 'نساء وتوليد', address: '5P76+MQG، السلام', working_hours: '24 ساعة', rating: 4.3, reviews: 7 },
  { name: 'مركز الفرغلي للعلاج الطبيعي', phone: '01114101380', tags: 'علاج طبيعي', address: 'بجوار فراشة حسن علام، شارع مسجد التقوى', working_hours: 'يفتح 6م', rating: 4.2, reviews: 5 },
  { name: 'عيادة د. إسراء عبد الفتاح', phone: '01554432019', tags: 'عيون', address: '5P78+3PR، قنا - ميدان سيدي عمر - برج الرواد', working_hours: 'يغلق 11م', rating: 3.0, reviews: 6 },
  { name: 'د. هاجر محمد', tags: 'طبيب', rating: 5.0, reviews: 1 },
  { name: 'عيادة د. محمد وائل محمد مصطفي — أمراض السمع والاتزان والأنف والأذن والحنجرة', phone: '01200730618', tags: 'أنف وأذن,سمع', address: '5P6G+C7 شارع الجمهورية، قسم قنا', working_hours: '24 ساعة', rating: 4.5, reviews: 8 },
  { name: 'مركز د. سعيدة محمد للأشعة التشخيصية', phone: '01095716764', tags: 'أشعة,تشخيص', address: 'المستشارين', working_hours: 'يغلق 10:30م', rating: 5.0, reviews: 1 },
  { name: 'مراكز رؤية', phone: '0965349090', tags: 'عيون', address: '5P58+J9Q', rating: 3.6, reviews: 11 },
  { name: 'د. سيد عبد الحميد — طبيب مختص في أمراض القدم', tags: 'أمراض القدم', address: '60M، قسم قنا', rating: 4.0, reviews: 1 },
  { name: 'د. سامح يني', tags: 'جراحة عظام', address: '5P47+MQP، خلف المستشفى العسكري', rating: 3.7, reviews: 3 },
  { name: 'عيادة د. حسام أحمد عطية لجراحات العظام واليد', phone: '01554004321', tags: 'جراحة عظام,يد', address: 'شارع امتداد كوبري دندرة، أمام مستشفى قنا العام، أعلى منصور شيفروليه، الدور الثالث', working_hours: '24 ساعة', rating: 3.7, reviews: 6 },
  { name: 'د. بيتر روماني وهيب', phone: '0963360451', tags: 'أطفال', address: '5P45+W8R، قنا - حي شرق', rating: 1.0, reviews: 2 },
  { name: 'د. بيشوي إدوارد — جراح الأوعية الدموية', phone: '01097518682', tags: 'جراحة أوعية دموية', address: 'التحرير', working_hours: 'يفتح الأربعاء 10ص' },
  { name: 'عيادة د. محمد أشرف قللي', phone: '01554407070', tags: 'أطفال', address: 'بجوار مطعم عيش وملح، شارع كوبري دندرة، أمام المستشفى العام', working_hours: 'يغلق 4م، يفتح 8م', rating: 5.0, reviews: 1 },
  { name: 'د. أحمد طلعت تميرك', phone: '0963335733', tags: 'طبيب,أسنان', address: '5P49+5PP، بورسعيد', working_hours: 'يغلق 12ص', rating: 3.3, reviews: 4 },
  { name: 'دار العيون', phone: '01148068111', tags: 'مستشفى,عيون', address: '5P55+XH5، المستشفى', rating: 2.8, reviews: 26 },
  { name: 'مركز الأقصى — د. أحمد عبد الرحمن', phone: '0963349098', tags: 'علاج طبيعي', working_hours: 'يغلق 10م', rating: 5.0, reviews: 3 },
  { name: 'د. أشرف كمال محمد — باطنة', tags: 'باطنة', address: '5P88+2V5، هاشم الدقيني', rating: 3.7, reviews: 3 },
  { name: 'عيادة د. مصطفى عبيد — الباطنة والجهاز الهضمي والكبد والمناظير', phone: '01006557627', tags: 'باطنة,جهاز هضمي,كبد,مناظير', address: 'أعلى بنك أبو ظبي التجاري، أول شارع المستشارين، برج وشاحي' },
  { name: 'هيئة الدواء المصرية — فرع قنا', tags: 'مكتب حكومي,دواء', address: 'أعلى صيدلية د. هشام هلال، المنشية، الشبان المسلمين', rating: 4.5, reviews: 2 },
  { name: 'عيادة الدكتور أبو العباس', tags: 'مستشفى', address: '60M، قسم قنا', rating: 4.7, reviews: 6 },
  { name: 'د. إرميا إيليا صليب — جراحة أوعية دموية', phone: '01024845497', tags: 'جراحة أوعية دموية', address: 'أمام مركز الرازي الطبي، المستشارين', working_hours: 'يفتح 8م' },
  { name: 'د. إبتهاج مساك جورج', tags: 'طبيب', address: '5P47+FR8، المستشارين' },
  { name: 'عيادة د. ماري الشايب حلمي — أسنان', phone: '01275634144', tags: 'أسنان', address: '5P58+MVW', working_hours: 'يفتح الاثنين 5م', rating: 5.0, reviews: 9 },
  { name: 'Dr. Rana Sabry', phone: '01129291207', tags: 'طبيب' },
  { name: 'عيادة جمال الطويل', phone: '01006612389', tags: 'طبيب', working_hours: 'يفتح 8م', rating: 5.0, reviews: 3 },
  { name: 'د. خالد أحمد الزمقان', phone: '01092045931', tags: 'جراح تقويم عظام', address: 'قنا، حي غرب', rating: 5.0, reviews: 1 },
  { name: 'عيادة الأستاذ الدكتور حمدي محفوظ — أمراض الكبد والجهاز الهضمي والمناظير', phone: '01018130395', tags: 'كبد,جهاز هضمي,مناظير', address: '5P68+2F7, Ebeid', working_hours: 'يفتح الأربعاء 9:30ص', rating: 5.0, reviews: 3 },

  // === معامل طبية (Medical Labs) ===
  { name: 'معامل الحكمة للتحاليل الطبية - قفط', tags: 'معمل تحاليل,تحاليل طبية', address: 'XRX6+R2P، قفط', working_hours: 'يغلق 11م', rating: 3.8, reviews: 4 },
  { name: 'معمل آمون قنا', phone: '01033611323', tags: 'معمل تحاليل,تحاليل طبية', address: 'البستان', working_hours: 'يغلق 1ص', rating: 4.9, reviews: 60 },
  { name: 'معامل آمون - فرع أبو بكر الصديق', phone: '01003670422', tags: 'معمل تحاليل,تحاليل طبية', address: 'شارع أبو بكر الصديق، بجوار مدرسة السلام', working_hours: 'يغلق 11م', rating: 5.0, reviews: 18 },
  { name: 'معمل ابن سينا - فرع المستشفى العام', phone: '01011954499', tags: 'معمل تحاليل,تحاليل طبية,24 ساعة', address: '5P64+6V3، أمام المستشفى العام', working_hours: '24 ساعة', rating: 4.1, reviews: 39 },
  { name: 'معامل الدكتورة إسراء خضري للتحاليل الطبية', phone: '01021291816', tags: 'معمل تحاليل,تحاليل طبية,24 ساعة', address: 'شارع عزبة حامد، أعلى توكيل نيسان للسيارات', working_hours: '24 ساعة', rating: 5.0, reviews: 5 },
  { name: 'معامل دار الطب للتحاليل الطبية وأبحاث الدم', phone: '01029702989', tags: 'معمل تحاليل,أبحاث دم', address: 'برج الرواد، سيدي عمر', working_hours: 'يغلق 10م', rating: 5.0, reviews: 4 },
  { name: 'معامل الإسراء - فرع قنا أمام المستشفى العام', phone: '01050528838', tags: 'معمل تحاليل', address: 'أمام مستشفى قنا العام، شارع كوبري دندرة', working_hours: 'يغلق 11م' },
  { name: 'معامل دار الطب قنا - فرع 2', phone: '01021291816', tags: 'معمل تحاليل', address: '5P59+GXW', working_hours: 'يغلق 10م', rating: 4.0, reviews: 4 },
  { name: 'معامل المختبر Al Mokhtabar Labs', tags: 'معمل تحاليل,المختبر', address: 'WQ85+JFR، الشيخ أحمد موسى عبد العظيم', working_hours: 'يغلق 11م', rating: 4.5, reviews: 2 },
  { name: 'معامل الفا Alfa Labs', phone: '01204943681', tags: 'معمل تحاليل', address: 'أمام مستشفى صدر، برج البارون (عمارة الأمن الوطني)، معبر الشباب', working_hours: 'يغلق 11م', rating: 4.5, reviews: 11 },
  { name: 'معمل البرج - فرع فندق مكة', phone: '01117773035', tags: 'معمل تحاليل,البرج', address: 'برج فندق مكة، شارع الجميل، الجمهورية', working_hours: 'يغلق 11م', rating: 3.7, reviews: 11 },
  { name: 'معامل بن سينا للتحاليل الطبية وأبحاث الدم', tags: 'معمل تحاليل,أبحاث دم', address: '5P6G+C9G', rating: 5.0, reviews: 1 },
  { name: 'Al Noor Medical Laboratory', phone: '01060104099', tags: 'معمل تحاليل', address: 'شارع كوبري دندرة', working_hours: 'يغلق 12ص', rating: 5.0, reviews: 1 },
  { name: 'معمل السلام للتحاليل الطبية', phone: '01066236199', tags: 'معمل تحاليل,كيمياء', address: 'الجمهورية', working_hours: 'يغلق 12ص', rating: 5.0, reviews: 5 },
  { name: 'معمل المختبر - حارة السلاطين', phone: '0963347366', tags: 'معمل تحاليل,المختبر', address: 'حارة السلاطين', working_hours: 'يغلق 11م', rating: 4.2, reviews: 21 },
  { name: 'ميديكال سنتر - مستلزمات معامل', phone: '01001333823', tags: 'مستلزمات طبية,مستلزمات معامل', address: 'المساكن، أمام بوابة 5 جامعة', working_hours: 'يغلق 9م' },
  { name: 'معامل الحكمة للتحاليل - فرع الجمهورية', phone: '01067116118', tags: 'معمل تحاليل', address: 'الجمهورية', working_hours: 'يغلق 11م', rating: 3.7, reviews: 3 },
  { name: 'معمل الأهرام للتحاليل بقنا', phone: '01203537903', tags: 'معمل تحاليل', address: 'الجمهورية', working_hours: 'يغلق 11م' },
  { name: 'Royal Lab - فرع رقم 1', tags: 'معمل تحاليل,رويال لاب', address: '5P65+8CX، رقم 1', working_hours: 'يغلق 11م', rating: 3.0, reviews: 1 },
  { name: 'معمل القدس للتحاليل الطبية', phone: '01095241000', tags: 'معمل تحاليل,24 ساعة', address: 'WP4F+7XQ', working_hours: '24 ساعة', rating: 4.5, reviews: 2 },
  { name: 'معامل الخضيري - فرع المستشفى العام', phone: '01033011203', tags: 'معمل تحاليل,الخضيري', address: '5P64+4XR، أمام المستشفى العام', working_hours: 'يغلق 11م', rating: 5.0, reviews: 3 },
  { name: 'معامل الحكمة للتحاليل - بجوار محلات أنيس ديمتري', phone: '01067559055', tags: 'معمل تحاليل', address: 'بجوار محلات أنيس ديمتري، الجمهورية', working_hours: 'يغلق 11م' },
  { name: 'معمل الماسة للتحاليل الطبية', phone: '0963349192', tags: 'معمل تحاليل,الماسة', address: '5P55+CPX', working_hours: 'يغلق 1:45ص', rating: 3.2, reviews: 13 },
  { name: 'معامل كلية العلوم - جامعة جنوب الوادي', tags: 'معمل جامعي,كيمياء', address: 'جامعة جنوب الوادي', working_hours: 'يغلق 8م', rating: 4.0, reviews: 3 },
  { name: 'معمل اليسر للتحاليل الطبية', phone: '01009295532', tags: 'معمل تحاليل,كيمياء', address: '60M، قسم قنا', working_hours: 'يغلق 12ص' },
  { name: 'معمل الحرية للتحاليل الطبية', phone: '01201687448', tags: 'معمل تحاليل', address: 'VPXC+9PX', rating: 4.1, reviews: 24 },
  { name: 'معامل الفاروق للتحاليل - د. شيماء مصطفى', phone: '01090170395', tags: 'معمل تحاليل,24 ساعة', address: '5P56+2F5، 26 يوليو', working_hours: '24 ساعة' },
  { name: 'معامل الماسة للتحاليل - فرع 2', phone: '01023993276', tags: 'معمل تحاليل,الماسة,24 ساعة', address: '5PXP+XHH', working_hours: '24 ساعة', rating: 3.7, reviews: 3 },
  { name: 'معامل رويال لاب Royal Lab - شارع المستشفى العام', tags: 'معمل تحاليل,رويال لاب', address: 'شوكلتير، شارع المستشفى العام، بين سوبر ماركت خير زمان والمحل', working_hours: 'يغلق 10:30م', rating: 4.0, reviews: 1 },
  { name: 'معامل الخبير', phone: '01099221487', tags: 'معمل تحاليل,كيمياء', address: '5P78+3H3، الشنهورية', working_hours: 'يغلق 11م', rating: 5.0, reviews: 1 },
  { name: 'معامل رويال لاب - فرع المطافي', phone: '01066133055', tags: 'معمل تحاليل,رويال لاب', address: 'بجوار المطافي، أمام فندق الياسمين، الأقصر', working_hours: 'يغلق 11م', rating: 5.0, reviews: 2 },
  { name: 'معمل المصطفى', tags: 'معمل تحاليل', address: '5P79+QMX، خلف عمر أفندي', rating: 5.0, reviews: 1 },
  { name: 'معامل ميترا فرع قنا', tags: 'معمل تحاليل,ميترا', address: 'عمارة ابن الهيثم، فوق توكيل لوراندو للبدل، شارع كوبري دندرة' },
  { name: 'معمل الخضيري - فرع 23 يوليو', phone: '01005032675', tags: 'معمل تحاليل,الخضيري', address: 'الدور الثاني، برج الروضة، ش 23 يوليو، أمام نادي الزراعيين', working_hours: 'يغلق 11م', rating: 3.0, reviews: 2 },
  { name: 'معمل ابن سينا - فرع نقادة', tags: 'معمل تحاليل,ابن سينا', address: 'WP4F+FFP، الشيخ حسين، نقادة', rating: 4.7, reviews: 3 },
  { name: 'معمل الحياة للأشعة الطبية', tags: 'أشعة,مركز تصوير,رنين مغناطيسي', address: '60M، قسم قنا', rating: 1.7, reviews: 6 },
  { name: 'معمل الحياة للتحاليل', tags: 'معمل تحاليل', address: '5P64+MQW، أعلى صيدلية الصالح ومخبز فتحي عمروس، بجوار المستشفى العام، كوبري دندرة', rating: 3.0, reviews: 2 },
  { name: 'شركة لافندر للمستلزمات الطبية', phone: '01123551655', tags: 'مستلزمات طبية,24 ساعة', address: 'بجوار الشهر العقاري، الكنوز', working_hours: '24 ساعة', rating: 5.0, reviews: 13 },
  { name: 'معمل الأسرة', phone: '01020400862', tags: 'معمل تحاليل', address: '5PFH+PHG، خلف الطب البيطري', working_hours: 'يغلق 12ص' },
  { name: 'مكتب ميديكال للمستلزمات الطبية وأكسسوارات الصيادلة', phone: '01226001329', tags: 'مستلزمات طبية,مستلزمات صيدليات,معامل,أطراف صناعية,24 ساعة', address: 'الجمعية الزراعية', working_hours: '24 ساعة', rating: 5.0, reviews: 1 },
  { name: 'معمل البركة للتحاليل الطبية الكيميائية', phone: '01124719646', tags: 'معمل تحاليل,كيمياء', address: '5P5F+H6Q، شارع الأقصر، برج الساعة، أعلى أسواق النوبي، ميدان بنزيون', rating: 5.0, reviews: 1 },
  { name: 'معامل الخضيري - فرع إضافي المستشفى العام', tags: 'معمل تحاليل,الخضيري', address: '5P64+4XV' },
  { name: 'معامل الماسة للتحاليل - ك6', tags: 'معمل تحاليل,الماسة,كيمياء حيوية', address: '6P2P+5M7، قسم قنا' },
  { name: 'معمل أمان للتحاليل الطبية - دشنا', phone: '01010609791', tags: 'معمل تحاليل', address: 'مدينة دشنا', city: 'دشنا', working_hours: 'يغلق 10م', rating: 4.9, reviews: 14 },
  { name: 'معامل المختبر - 26WR', phone: '01068941027', tags: 'معمل تحاليل,المختبر', address: '26WR+JW6', working_hours: 'يغلق 11م', rating: 4.3, reviews: 7 },
  { name: 'مركز الحياة للأشعة التشخيصية', phone: '01224343444', tags: 'أشعة,تشخيص', address: 'أمام المستشفى العام', working_hours: 'يغلق 12ص', rating: 2.3, reviews: 34 },
];

function normalize(s) {
  return (s || '')
    .replace(/[\u0617-\u061A\u064B-\u0652ـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
    .replace(/^د\s*[\.\/]\s*/, '').replace(/^الدكتور\s*/, '').replace(/^الاستاذ\s*/, '')
    .replace(/^عيادة\s*/, '').replace(/^مركز\s*/, '').replace(/^الأستاذ\s*/, '')
    .replace(/[^\w\u0600-\u06FF]+/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}
function normPhone(p) {
  if (!p) return null;
  return p.toString().replace(/[^0-9]/g, '').replace(/^20/, '0');
}

async function main() {
  await sequelize.authenticate();

  // Get the merged medical category (should be "clinics" renamed to "أطباء ومراكز طبية")
  let cat = await Category.findOne({ where: { slug: 'clinics' } });
  if (!cat) cat = await Category.findOne({ where: { slug: 'doctors' } });
  if (!cat) { console.error('No medical category found'); process.exit(1); }
  console.log(`target category: ${cat.name} (${cat.slug}) — id=${cat.id}`);

  // Build existing lookup
  const existing = await Service.findAll({
    where: { category_id: cat.id },
    attributes: ['id', 'name', 'phone', 'address', 'tags', 'description'],
  });
  const byName = new Map();
  const byPhone = new Map();
  for (const e of existing) {
    byName.set(normalize(e.name), e);
    const p = normPhone(e.phone);
    if (p && p.length >= 10) byPhone.set(p, e);
  }
  console.log(`existing in this category: ${existing.length}`);

  let inserted = 0, enriched = 0, dupe = 0;
  for (const d of data) {
    const nn = normalize(d.name);
    const np = normPhone(d.phone);

    // Find dupe by phone first (exact), then by normalized name substring
    let match = np ? byPhone.get(np) : null;
    if (!match) {
      match = byName.get(nn);
      if (!match) {
        // partial match: existing name contains our normalized name, or vice versa (>=6 chars)
        for (const [k, v] of byName) {
          if (nn.length < 6 || k.length < 6) continue;
          if (k.includes(nn) || nn.includes(k)) { match = v; break; }
        }
      }
    }

    if (match) {
      // Enrich
      const patch = {};
      if (!match.phone && d.phone) patch.phone = d.phone;
      if (!match.address && d.address) patch.address = d.address;
      if (!match.tags && d.tags) patch.tags = d.tags;
      else if (match.tags && d.tags && !match.tags.includes(d.tags.split(',')[0])) patch.tags = (match.tags + ',' + d.tags).slice(0, 255);
      if (!match.description && d.rating) patch.description = `${d.tags?.split(',')[0] || ''} · تقييم ${d.rating} (${d.reviews || 0} مراجعة)`.trim();
      if (Object.keys(patch).length) { await Service.update(patch, { where: { id: match.id } }); enriched++; }
      else dupe++;
      continue;
    }

    // Insert new
    const desc = d.rating
      ? `${(d.tags || '').split(',')[0]} · تقييم ${d.rating} (${d.reviews || 0} مراجعة)`.trim()
      : ((d.tags || '').split(',')[0] || null);
    await Service.create({
      category_id: cat.id,
      name: d.name.slice(0, 160),
      description: desc,
      city: 'قنا',
      address: d.address || null,
      phone: d.phone || null,
      working_hours: d.working_hours || null,
      tags: d.tags || null,
      status: 'approved',
    });
    inserted++;
    // add to maps for subsequent iterations
    byName.set(nn, { id: null, name: d.name, phone: d.phone, address: d.address, tags: d.tags });
    if (np) byPhone.set(np, { id: null });
  }

  console.log(`\n✓ inserted=${inserted}, enriched=${enriched}, duplicate-no-change=${dupe}`);
  console.log(`  category size now: ${await Service.count({ where: { category_id: cat.id } })}`);
  console.log(`  total services: ${await Service.count()}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
