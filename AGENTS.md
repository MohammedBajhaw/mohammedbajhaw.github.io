# دليل الوكيل لمشروع محمد باجحاو (AGENTS.md)

هذا المستودع يضم المنصة الكاملة لمعرض الأعمال الهندسي لمحمد باجحاو (**Mohammed Bajhaw Engineering Portfolio**)، وتتكون من:
- **[`client/`](file:///a:/projects/mohammedbajhaw/client):** تطبيق الواجهة الأمامية (Next.js 16 + React 19 + Tailwind CSS v4) ولوحة التحكم (`/admin`).
- **[`server/`](file:///a:/projects/mohammedbajhaw/server):** واجهة برمجة التطبيقات الخلفية (NestJS 11 + Express 5 + MongoDB / Mongoose).

## 1. القواعد الأساسية لهيكل ومعمارية المشروع
- **تشغيل الأوامر:**
  - أوامر الواجهة (`pnpm dev`, `pnpm build`, `pnpm check`, `pnpm lint`) تُنفَّذ من داخل [`client/`](file:///a:/projects/mohammedbajhaw/client).
  - أوامر الخادم (`pnpm dev`, `pnpm build`, `pnpm check`, `pnpm test`) تُنفَّذ من داخل [`server/`](file:///a:/projects/mohammedbajhaw/server).
- **الاتصال بالبيانات (Full-Stack Integration):**
  - يقرأ الموقع العام بياناته مباشرة من خادم `server/` عبر [`client/lib/services/source.api.ts`](file:///a:/projects/mohammedbajhaw/client/lib/services/source.api.ts) و [`client/lib/services/source.ts`](file:///a:/projects/mohammedbajhaw/client/lib/services/source.ts) بدون أي بيانات وهمية (`mock`).
  - تتصل لوحة التحكم `/admin` بالباك إند عبر مسارات `/api/*` و `/uploads/*` المُعاد توجيهها في [`client/next.config.ts`](file:///a:/projects/mohammedbajhaw/client/next.config.ts) للحفاظ على كوكيز الجلسة من نفس الأصل (`first-party HttpOnly`).
- **الأمان وجودة الشيفرة:**
  - التزام تام بـ **Zero `any`** و **Zero unsafe TypeScript bypasses** في `server/` و `client/`.
  - خط دفاع أول في المتصفح ([`client/lib/security/sanitize.ts`](file:///a:/projects/mohammedbajhaw/client/lib/security/sanitize.ts)) + تعقيم عميق في الخادم ([`server/src/common/middleware/security-sanitize.middleware.ts`](file:///a:/projects/mohammedbajhaw/server/src/common/middleware/security-sanitize.middleware.ts)) + `mongoose sanitizeFilter` + فحص التوقيع الثنائي للملفات (`Magic Bytes`).
  - حماية لوحة التحكم للمالك الواحد فقط (`AdminAuthGuard`) مع توثيق كل العمليات في `AuditModule` ونظام أخطاء موحد (`AllExceptionsFilter`).

## 2. مهارات الوكيل الخاصة بالمشروع (`.agents/skills/`)
1. **`bajhaw-visual-identity`** ([`.agents/skills/bajhaw-visual-identity/SKILL.md`](file:///a:/projects/mohammedbajhaw/.agents/skills/bajhaw-visual-identity/SKILL.md)):
   - الدستور البصري والشروط التصميمية الصارمة غير القابلة للتخطي (الألوان، التدرج الشبكي، الانحناءات `56/88/110px`، البطاقات بدون بوردر، قانون الهوفر، وضوابط الأنيميشن).
2. **`bajhaw-architecture`** ([`.agents/skills/bajhaw-architecture/SKILL.md`](file:///a:/projects/mohammedbajhaw/.agents/skills/bajhaw-architecture/SKILL.md)):
   - هيكل مجلد `client/` المعياري (`cards`, `layout`, `motifs`, `sections`, `ui`, `views`).
3. **`bajhaw-design-system`** ([`.agents/skills/bajhaw-design-system/SKILL.md`](file:///a:/projects/mohammedbajhaw/.agents/skills/bajhaw-design-system/SKILL.md)):
   - مرجع تقنيات Tailwind CSS v4 وتعريفات `@theme` و `@utility` في [`client/styles/globals.css`](file:///a:/projects/mohammedbajhaw/client/styles/globals.css).
4. **`bajhaw-sitemap-data`** ([`.agents/skills/bajhaw-sitemap-data/SKILL.md`](file:///a:/projects/mohammedbajhaw/.agents/skills/bajhaw-sitemap-data/SKILL.md)):
   - خريطة صفحات الواجهة (`/`, `/projects`, `/projects/[slug]`, `/publications/[id]`, `/services`, `/about`, `/contact`, `/admin`).
