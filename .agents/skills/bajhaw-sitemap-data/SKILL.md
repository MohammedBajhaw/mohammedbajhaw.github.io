---
name: bajhaw-sitemap-data
description: >-
  دليل خريطة صفحات الواجهة (Sitemap)، قوالب العرض (components/views/)، وبيانات العرض
  المحلية الثابتة في client/lib/portfolio.ts لموقع محمد باجحاو.
---

# خريطة صفحات الواجهة وبيانات العرض (UI Sitemap & Views)

---

## 1. ربط مسارات `client/app/[lang]/` بقوالب العرض في `client/components/views/`

> كل المسارات أدناه تسبقها لغة: `/en` و`/ar` و`/tr` (مثال: `/ar/projects/<slug>`). ملفات المسارات في الجدول مكتوبة نسبةً إلى `app/[lang]/`.

تقتصر ملفات `app/**/page.tsx` على إعداد بيانات الصفحة (`Metadata` عبر `pageMetadata` و `JsonLd`) وتمرير البيانات إلى قالب العرض. كل صفحة تعرّف عنوانها ووصفها و canonical ومسار التنقل (Breadcrumb) بشكل مستقل.

| المسار | ملف المسار (`app/`) | قالب العرض (`components/views/`) | المحتوى والمكونات |
| :--- | :--- | :--- | :--- |
| `/` | `app/(home)/page.tsx` | `HomeView.tsx` | `PageShell`، `Hero`، `HomeHighlightsSection`، `HomeGallery`، `HomePublicationsSection`، `HomeSkillsSection`، `HomeProjectsSection` |
| `/about` | `app/about/page.tsx` | `AboutView.tsx` | `00` النبذة والصورة، `01` الخبرات، `02` التعليم والجوائز، `03` اللغات، `04` منهجية العمل |
| `/projects` | `app/projects/page.tsx` | `ProjectsArchiveView.tsx` | مقدمة على منصة `#f2f6f5` + شبكة `FeaturedProjectCard` على الأبيض |
| `/projects/[slug]` | `app/projects/[slug]/page.tsx` | `ProjectDetailView.tsx` | `PageShell`، `MediaGallery` |
| `/publications/[id]` | `app/publications/[id]/page.tsx` | `PublicationDetailView.tsx` | `PageShell` (+ وسوم `citation_*` للباحث العلمي) |
| `/services` | `app/services/page.tsx` | `ServicesView.tsx` | مقدمة على المنصة + مجالات الخدمات (رأس ثابت + بطاقات `ServiceCard`) |
| `/contact` | `app/contact/page.tsx` | `ContactView.tsx` | مقدمة على المنصة + بطاقات القنوات المباشرة + `ContactForm` (يجهّز رسالة ويفتحها في تطبيق البريد عبر `mailto:` دون أي طلب شبكة). كل أزرار "Contact me" و"Discuss a project" تشير إلى هذا المسار |

- **التنقل (`NAV_LINKS` في `lib/site.ts`):** Home، About، Projects، Services.
- **أقسام الرئيسية (بالترتيب):** الهيرو، النبذة والأرقام (`#about`)، المعرض، `02 / RESEARCH & PUBLICATIONS` (`#publications`)، `03 / TECHNICAL CAPABILITIES` (`#skills`)، `04 / PROJECT ARCHIVE`. أقسام التعليم والخبرة واللغات انتقلت إلى `/about`.
- **هياكل التحميل:** `app/(home)/loading.tsx` للرئيسية، ولكل مسار آخر `loading.tsx` خاص به يستورد هيكله من `components/skeletons/index.ts`.
- **ملفات SEO:** `app/sitemap.ts` و `app/robots.ts` (الدومين من `SITE_URL` في `lib/site.ts`).

---

## 2. مصدر بيانات العرض (`client/lib/services`)

كل البيانات تمر عبر [`client/lib/services`](file:///a:/projects/mohammedbajhaw/client/lib/services) (دوال جلب مترجمة ومرتبة) فوق مصدر يُستبدل لاحقاً بالباك؛ الحالي وهمي في `lib/mock`. لكل صفحة محمّل خاص: الرئيسية `getHomeData`، من نحن `getAboutData`، المشاريع `getProjectsPageData`، الخدمات `getServicesPageData`، التواصل `getContactData`، وتفاصيل المشروع والبحث `getProjectBySlug` و`getPublicationById`. الأنواع في `lib/types.ts` وكل سجل قد يحمل `translations: { ar, tr }`.

ثوابت الهوية والتواصل واللغات في [`client/lib/site.ts`](file:///a:/projects/mohammedbajhaw/client/lib/site.ts). مبدّل اللغة في `Navbar` روابط فعلية إلى `/en` و`/ar` و`/tr`.
