# دليل قنا · Qena Guide

موقع خيري مجاني يجمع كل الخدمات والأرقام الهامة لسكان محافظة قنا والضواحي في مكان واحد.
مقدم من **[شركة برمجلي](https://barmagly.tech/)** — م. أحمد كمال · م. خالد أحمد — `01010254819`.

الموقع: <https://qena.barmagly.tech>

## البنية

```
qena-app/
├── backend/       # Node.js + Express + Sequelize + MySQL
├── frontend/      # React + Vite + Tailwind (RTL عربي)
├── deploy/        # Passenger server.js + .htaccess + deploy.sh
└── database/      # SQL dumps (احتياطي)
```

## المزايا
- دليل شامل لأهم الخدمات في قنا: مستشفيات، صيدليات، فنادق، مطاعم، كافيهات، محلات، بنوك، مواصلات، خدمات حكومية، تعليم، محطات وقود.
- صفحة أرقام طوارئ وخدمات عامة (122، 123، 180، ...).
- إضافة خدمة أو تصحيح بيانات من المستخدمين (بعد مراجعة الإدارة).
- خرائط Leaflet (OpenStreetMap) لعرض المواقع.
- لوحة إدارة كاملة (CRUD، موافقة/رفض، تمييز).
- تصميم عربي احترافي بالكامل، متجاوب مع الموبايل، انيميشن Framer Motion.

## التشغيل محلياً

```bash
# Backend
cd backend
cp .env.example .env   # عدل بيانات الداتابيز
npm install
npm run seed           # زرع الأقسام والخدمات الأولية
npm run createAdmin    # إنشاء حساب الأدمن
npm run dev

# Frontend (في نافذة أخرى)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## النشر على Hostinger (Passenger Node.js)

### البنية على السيرفر:
- `/home/u492425110/qena-app/` — الكود المصدري (clone من GitHub)
- `/home/u492425110/domains/barmagly.tech/qena-nodejs/` — Passenger entry (`server.js`)
- `/home/u492425110/domains/barmagly.tech/public_html/qena/` — React build + `.htaccess`
- `/home/u492425110/domains/barmagly.tech/public_html/qena/api/.htaccess` — يوجه `/api/*` لـ Passenger

### إعداد Subdomain في hPanel:
- Subdomain: `qena.barmagly.tech` → document root: `public_html/qena`
- تفعيل SSL من hPanel.

### Database:
- MySQL من hPanel → إنشاء:
  - Database: `u492425110_qena`
  - User: `u492425110_qena`
  - صلاحيات كاملة

### أول نشر:
```bash
ssh -p 65002 u492425110@82.198.227.175

# clone source
cd /home/u492425110
git clone https://github.com/<org>/<repo>.git qena-app
cd qena-app

# create .env
cp backend/.env.example backend/.env
nano backend/.env   # عدل الأسرار

# build & deploy
bash deploy/deploy.sh

# seed + admin
cd backend
/opt/alt/alt-nodejs22/root/bin/npm run seed
/opt/alt/alt-nodejs22/root/bin/npm run createAdmin
```

### التحديثات التالية:
```bash
ssh -p 65002 u492425110@82.198.227.175
cd /home/u492425110/qena-app && bash deploy/deploy.sh
```

## البيئة (backend/.env)

```
NODE_ENV=production
PORT=5010
DB_HOST=srv2070.hstgr.io
DB_PORT=3306
DB_NAME=u492425110_qena
DB_USER=u492425110_qena
DB_PASSWORD=********
JWT_SECRET=<long random string>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong>
```

---
© جميع الحقوق محفوظة لمطوري المشروع · مقدمة من [برمجلي](https://barmagly.tech/)
