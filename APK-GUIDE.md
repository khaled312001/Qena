# قناوي — دليل النشر على الويب + APK

هذا الدليل يوضّح كيفية:
1. توليد الأيقونات بصيغة PNG (مطلوبة لمتجر Google Play و PWA Android).
2. تحويل الموقع إلى تطبيق APK حقيقي عبر PWABuilder (TWA — Trusted Web Activity).
3. ربط الدومين الجديد **qinawy.com** بالاستضافة على Hostinger.

---

## 1) توليد أيقونات PNG من ملفات SVG

الأيقونات المصدرية SVG تم إنشاؤها بالفعل داخل `frontend/public/`:

| الملف | الاستخدام |
| --- | --- |
| `favicon.svg` | أيقونة المتصفح (تبويب الصفحة) |
| `logo.svg` | الشعار الرئيسي (512×512 مصدر) |
| `icon-maskable.svg` | نسخة Android **Maskable** (تحوي هامش آمن ~20%) |
| `apple-touch-icon.svg` | أيقونة iOS عند الإضافة للشاشة الرئيسية |
| `wordmark.svg` | اللوجو الأفقي (شعار + اسم "قناوي") للطباعة والسوشيال |

لتوليد ملفات PNG المطلوبة لـ `manifest.webmanifest` وللـ APK:

```bash
cd frontend
npm install            # يثبّت sharp (مضاف للـ devDependencies)
npm run gen-icons
```

سيتم إنشاء الملفات داخل `frontend/public/icons/`:

```
icon-192.png
icon-512.png
icon-maskable-192.png
icon-maskable-512.png
apple-touch-icon-180.png
favicon-16.png
favicon-32.png
```

هذه هي الأيقونات المشار إليها داخل `manifest.webmanifest`، ولا داعي لتعديل شيء بعد توليدها.

> **ملاحظة**: ملف `manifest.webmanifest` يحتوي بالفعل على SVG كبديل (fallback)، لذا حتى لو لم تولّد PNG فسيعمل التثبيت كـ PWA — لكن Google Play يتطلب PNG 512×512، لذا من الأفضل توليدها قبل نشر APK.

---

## 2) تحويل الموقع إلى APK (الطريقة الموصى بها: PWABuilder)

PWABuilder هي أداة مفتوحة المصدر من Microsoft تلفّ الـ PWA داخل تطبيق Android حقيقي (Trusted Web Activity) يمكن نشره على Google Play.

### المتطلبات (أنجزناها بالفعل في الكود)

- [x] `manifest.webmanifest` صالح مع `name`, `short_name`, `start_url`, `display: standalone`, أيقونات بمقاسات 192 و 512 بكسل.
- [x] Service Worker مسجّل (`/sw.js`) للتشغيل بدون إنترنت (الحد الأدنى).
- [x] وسوم Meta لـ `theme-color`, `apple-touch-icon`, `viewport` بصيغة `viewport-fit=cover`.
- [x] الموقع يعمل عبر HTTPS (Hostinger يوفّر ذلك تلقائياً).

### خطوات البناء

1. ادخل على: <https://www.pwabuilder.com>
2. أدخل رابط الموقع: `https://qinawy.com` (أو مؤقتاً `https://qena.barmagly.tech`).
3. اضغط **Start** ثم انتظر التحليل. يجب أن تحصل على علامة ✅ للـ Manifest و Service Worker.
4. اختر **Package for Stores → Android**.
5. املأ الحقول:
   - **Package ID**: `com.barmagly.qinawy`
   - **App name**: `قناوي`
   - **Launcher name**: `قناوي`
   - **Version**: `1.0.0`
   - **Signing key**: اختر "Generate new" أول مرة — احفظ المفتاح (`signing.keystore` + كلمة المرور) في مكان آمن لاستخدامه في التحديثات.
6. اضغط **Generate**. ستحصل على ملف `.zip` يحتوي:
   - `app-release-signed.apk` — جاهز للتثبيت مباشرة على أي هاتف Android (اختبار).
   - `app-release-bundle.aab` — لرفعه على Google Play Console.
   - `assetlinks.json` — ضَعه في `https://qinawy.com/.well-known/assetlinks.json` ليربط التطبيق بالدومين ويخفي شريط المتصفح من داخل APK.

### نشر ملف `assetlinks.json` على الاستضافة

بعد فك ضغط الحزمة، ضع الملف في:

```
public_html/qena/.well-known/assetlinks.json
```

(على Hostinger عبر File Manager أو FTP).

### النشر على Google Play

1. أنشئ حساب Google Play Developer (25$ مرة واحدة).
2. أنشئ تطبيقاً جديداً → ارفع ملف **AAB**.
3. املأ بيانات المتجر (الأيقونة، اللقطات، الوصف بالعربية).
4. **الوصف المقترح**: 
   > قناوي — دليل شامل ومجاني لسكان محافظة قنا. يضم مستشفيات، صيدليات، فنادق، مطاعم، بنوك، أرقام طوارئ، ومعالم سياحية مع إحداثيات دقيقة على الخريطة. مبادرة خيرية من شركة برمجلي.

### بديل سريع بدون PWABuilder — Bubblewrap CLI

إن فضّلت سطر الأوامر:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://qinawy.com/manifest.webmanifest
bubblewrap build
```

---

## 3) ربط الدومين الجديد `qinawy.com`

### DNS (عند مسجّل الدومين)

أضف سجلَّي `A` يشيران إلى IP سيرفر Hostinger الخاص بك (من لوحة تحكم Hostinger → Hosting → Details → "Server IPv4"):

```
Type  Name   Value                TTL
A     @      <Hostinger IPv4>    14400
A     www    <Hostinger IPv4>    14400
```

### Hostinger

1. hPanel → **Domains** → **Add existing domain**.
2. أدخل `qinawy.com`.
3. اربطه بمجلد التطبيق نفسه: `public_html/qena` (نفس Passenger app).
4. فعّل **SSL** مجاناً (Let's Encrypt).
5. فعّل **Force HTTPS**.

### تعديلات في الكود بعد ربط الدومين

بعد أن يعمل `qinawy.com`، عدّل:

- `backend/.env`:
  ```ini
  SITE_URL=https://qinawy.com
  CORS_ORIGIN=https://qinawy.com
  ```
- (اختياري) `deploy/deploy.sh`: حدّث رسالة النشر.
- (اختياري) `README.md`: استبدِل كل `qena.barmagly.tech` بـ `qinawy.com`.

---

## 4) اختبار الهاتف بدون نشر على Google Play

- وصّل الهاتف بالـ USB وفعّل **Developer Options → USB Debugging**.
- ثبّت APK مباشرة:
  ```bash
  adb install app-release-signed.apk
  ```
- أو انسخ الـ APK للهاتف عبر Bluetooth/WhatsApp وثبّته بعد تفعيل **Install from unknown sources**.

---

## 5) خلاصة الأوامر

```bash
# 1) توليد الأيقونات
cd frontend && npm install && npm run gen-icons

# 2) بناء الموقع
npm run build

# 3) نشر على Hostinger
cd ../deploy && bash deploy.sh

# 4) ثم ادخل pwabuilder.com وأدخل https://qinawy.com
```

---

## معلومات برمجلي

- **الشركة**: شركة برمجلي (Barmagly)
- **الموقع**: <https://barmagly.tech>
- **المؤسسون**: م. أحمد كمال · م. خالد أحمد
- **الهاتف**: `01010254819`
- **البريد**: `barmaglyy@gmail.com`
- **Package ID المقترح**: `com.barmagly.qinawy`

© قناوي · qinawy.com · مبادرة خيرية من شركة برمجلي.
