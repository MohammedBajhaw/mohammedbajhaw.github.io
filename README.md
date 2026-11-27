# Mohammed Bajhaw — Engineering Portfolio Platform

منصة متكاملة لمعرض الأعمال الهندسي والأبحاث لمحمد باجحاو (**Mohammed Bajhaw**)، مبنية بـ **Next.js 16** للواجهة الأمامية ولوحة التحكم، و **NestJS 11 + MongoDB** للخادم الخلفي، مع دعم كامل لثلاث لغات (**English, العربية, Türkçe**).

---

## 1. هيكل المشروع

```text
mohammedbajhaw/
├── client/          # Next.js 16 (App Router, React 19, Tailwind CSS v4)
│   ├── app/         # المسارات العامة ([lang]/*) ولوحة التحكم (/admin)
│   ├── components/  # مكونات الهوية البصرية، النماذج، وأقسام لوحة التحكم
│   ├── lib/         # خدمات الـ API، الترجمة (i18n)، وأدوات الأمان في المتصفح
│   └── styles/      # نظام التصميم في globals.css
├── server/          # NestJS 11 (Express 5 + MongoDB / Mongoose)
│   ├── src/
│   │   ├── audit/        # سجل التدقيق الشامل للعمليات والأخطاء
│   │   ├── auth/         # مصادقة المالك الواحد (JWT + HttpOnly Cookie + Token Revocation)
│   │   ├── backup/       # النسخ الاحتياطي JSON وقت النقر (تنزيل محلي / Google Drive / Webhook)
│   │   ├── common/       # الحماية، تعقيم المدخلات، فلاتر الأخطاء الموحدة، والتحقق من البيئة
│   │   ├── health/       # فحص جاهزية الخادم واتصال MongoDB
│   │   ├── profile/      # الهوية، المهارات، الخبرات، التعليم، ورسائل التواصل
│   │   ├── projects/     # إدارة المشاريع والوسائط
│   │   ├── publications/ # إدارة الأبحاث والمنشورات
│   │   ├── services/     # إدارة مجالات الخدمات الهندسية
│   │   ├── settings/     # إعدادات المنصة العامة ووضع الصيانة
│   │   ├── translation/  # خدمة الترجمة التلقائية عبر LLM خارجي مع فحص الاتصال
│   │   └── uploads/      # رفع الصور والفيديوهات والمستندات مع فحص التوقيع الثنائي (Magic Bytes)
│   └── test/        # اختبارات الوحدة (Unit) والتكامل (Integration)
├── AGENTS.md        # دليل المعمارية والمهارات للوكلاء والمطورين
├── DEPLOY.md        # النشر على سيرفر VPS واحد بـ Docker (Caddy + Next.js + NestJS + MongoDB)
├── docker-compose.yml
└── deploy/Caddyfile
```

---

## 2. الشروط الهندسية والأمنية المعتمدة
- **جودة الشيفرة الصارمة:** Zero `any` وبدون أي تجاوزات نوعية في TypeScript مع فحص ESLint الصارم.
- **حماية متعددة الطبقات (Defense in Depth):**
  - **خط دفاع أول في المتصفح (`client/lib/security/sanitize.ts`):** فلترة XSS، وسوم السكربت، روابط `javascript:`، مفاتيح الحقن، وفحص امتداد وحجم الملفات قبل الإرسال.
  - **خط دفاع ثانٍ في الخادم:** تعقيم كل مدخلات `body/query/params` (`SecuritySanitizeMiddleware`)، وتفعيل `mongoose sanitizeFilter`، و `ValidationPipe` الصارم (`whitelist`, `forbidNonWhitelisted`).
  - **حماية الرفع:** فحص التوقيع الثنائي الفعلي للملف (**Magic Bytes**) للصور والفيديو والمستندات بحد أقصى `50 MB` للملف، وحذف الملفات المزورة فوراً.
  - **حماية الشبكة والـ API:** `helmet`، `compression`، تحديد معدل الطلبات (`ThrottlerGuard`)، حماية روابط الموفرين والنسخ الاحتياطي ضد SSRF، وتوحيد استجابات الأخطاء (`AllExceptionsFilter`).
- **تعدد اللغات الذكي:** التخزين باللغة الإنجليزية في الجذر لإدارة لوحة التحكم مع ترجمات جاهزة في `translations.ar` و `translations.tr` للعرض الفوري دون أي استدعاءات LLM وقت تصفح الزائر.

---

## 3. التشغيل المحلي

### المتطلبات
- **Node.js 22+** و **pnpm 10+**
- **MongoDB** يعمل محلياً أو رابط MongoDB Atlas

### إعداد وتشغيل الخادم (`server/`)
```bash
cd server
pnpm install
cp .env.example .env   # ثم عدّل القيم (MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD)
pnpm run check         # فحص TypeScript + ESLint
pnpm run build         # بناء الخادم
pnpm run start:prod    # أو pnpm run dev للتطوير
```

### إعداد وتشغيل الواجهة (`client/`)
```bash
cd client
pnpm install
pnpm run check         # فحص TypeScript
pnpm run lint          # فحص ESLint
pnpm run dev           # التشغيل على http://localhost:3000
```

### اختبارات الخادم (`server/`)
```bash
cd server
pnpm run test:unit         # اختبارات الوحدة
pnpm run test:integration  # اختبارات التكامل (يتطلب تشغيل الخادم)
pnpm test                  # تشغيل كافة الاختبارات
```

---

## 4. ملاحظات ما قبل النشر للإنتاج (Production)
1. ضبط `NODE_ENV=production` في `server/.env`.
2. استخدام `ADMIN_PASSWORD_HASH` (تجزئة `bcrypt`) بدلاً من كلمة المرور النصية، وتوليد `JWT_SECRET` عشوائي لا يقل عن 32 حرفاً.
3. ضبط `CORS_ORIGIN` على الدومين الرسمي للموقع (يُمنع `*` مع الكوكيز في الإنتاج).
4. عدم رفع ملفات `.env` أو `server/uploads/` أو مخرجات البناء (`.next`, `dist`, `dist-test`)؛ فهي مستبعدة بالفعل في `.gitignore`.

---

## 5. النشر عبر Docker (VPS)
يتضمن المستودع إعدادات جاهزة لتشغيل المنصة كاملة (`Caddy` + `Next.js` + `NestJS` + `MongoDB`) عبر `docker-compose.yml` وملف البيئة `.env.docker.example`:

- راجع دليل النشر والنسخ الاحتياطي الكامل في [DEPLOY.md](DEPLOY.md).
- للتشغيل السريع: `cp .env.docker.example .env` ثم عدّل القيم ثم `docker compose up -d --build`.
- لا تستخدم `docker compose down -v` لأنه يحذف قاعدة البيانات والملفات المرفوعة.
