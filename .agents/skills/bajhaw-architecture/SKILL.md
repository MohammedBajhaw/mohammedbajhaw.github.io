---
name: bajhaw-architecture
description: >-
  دليل هوية وهيكلة الواجهة الأمامية النقية (Pure UI Next.js Frontend) لموقع محمد باجحاو:
  هيكل مجلد client/ المعياري القابل للتوسع (cards, layout, motifs, sections, ui, views, skeletons) بدون تكرار الكود.
---

# هيكلة الواجهة الأمامية النقية لموقع محمد باجحاو (Pure UI Modular Architecture)

> **الهدف الحالي:** بيئة واجهة أمامية خفيفة، معيارية، وقابلة للتوسع (DRY / Zero Duplication) مخصصة حصرياً لتطوير وتعديل **الهوية البصرية، الأنماط، والأنيميشن**، بدون أي منطق باك إند أو اتصالات خارجية.

---

## 1. الهيكل المعماري داخل `client/`

```text
client/
├── app/                                # مسارات وصفحات Next.js فقط (بدون صور أو CSS)
│   ├── layout.tsx                      # التخطيط الجذري (HTML & Global Metadata) — بدون أيقونات أو صورة مشاركة افتراضية
│   ├── global-error.tsx                # واجهة الخطأ العامة
│   ├── not-found.tsx                   # واجهة 404 (غير مفهرسة)
│   ├── robots.ts / sitemap.ts          # ملفات SEO المولّدة
│   ├── (home)/                         # مجموعة مسارات: تحصر loading.tsx بالرئيسية فقط (لا تظهر في الروابط)
│   │   ├── page.tsx                    # الصفحة الرئيسية (/) -> تعرض <HomeView />
│   │   └── loading.tsx                 # <HomePageSkeleton /> (يجب ألا يوضع في app/ مباشرة، وإلا ظهر هيكل الرئيسية قبل كل صفحة)
│   ├── about/                          # /about -> <AboutView />
│   ├── projects/                       # /projects -> <ProjectsArchiveView />
│   │   └── [slug]/                     # دراسة حالة المشروع -> <ProjectDetailView />
│   ├── publications/
│   │   └── [id]/                       # تفاصيل الورقة البحثية -> <PublicationDetailView />
│   ├── services/                       # /services -> <ServicesView />
│   └── contact/                        # /contact -> <ContactView />
│                                       # (لكل مسار فرعي page.tsx و loading.tsx متوازيان)
│
├── styles/
│   └── globals.css                     # نظام التصميم (@theme و @utility) في Tailwind CSS v4
│
├── components/                         # المكونات المعزولة حسب الفئة والمسؤولية
│   ├── cards/
│   │   ├── FeaturedProjectCard.tsx     # بطاقة المشروع (الرئيسية + أرشيف /projects) مع القطع المقعّر في الصورة
│   │   ├── PublicationCard.tsx         # بطاقة الورقة البحثية
│   │   ├── ServiceCard.tsx             # بطاقة الخدمة في /services
│   │   ├── ChannelCard.tsx             # بطاقة قناة التواصل في /contact
│   │   └── DetailPanel.tsx             # لوحة الحقائق الجانبية في صفحات التفاصيل (كل بطاقة معها Skeleton توأم في الملف نفسه)
│   ├── layout/
│   │   ├── PageShell.tsx               # الغلاف الموحد (Navbar + <main> + SiteFooter)
│   │   ├── Navbar.tsx                  # شريط التنقل الذكي (Home / About / Projects / Services + مبدّل لغة شكلي)
│   │   └── SiteFooter.tsx              # التذييل بارتفاع 95dvh على التابلت وما فوق، بالتدرج الشبكي والانحناءين العلويين
│   ├── motifs/
│   │   └── SkillIcon.tsx               # أيقونات الطبقات والمهارات (تدعم النمط الصافي bare)
│   ├── sections/
│   │   ├── contact/ContactForm.tsx     # نموذج التواصل (mailto دون شبكة) + ContactFormSkeleton
│   │   ├── detail/DetailHeader.tsx     # رأس صفحات التفاصيل (منصة المقدمة) + DetailHeaderSkeleton
│   │   └── home/                       # أقسام الصفحة الرئيسية فقط
│   │       ├── HeroSection.tsx         # الهيرو مع القطع المقعّر لزر الـ CV
│   │       ├── HighlightsSection.tsx   # النبذة، الأرقام المتحركة، وكرت الجائزة
│   │       ├── GallerySection.tsx      # معرض الصور التفاعلي بإطار متدرج 2px
│   │       ├── PublicationsSection.tsx # منصة الأبحاث الداكنة بالتدرج الشبكي
│   │       ├── SkillsSection.tsx       # مستعرض طبقات النظام الروبوتي
│   │       └── ProjectsSection.tsx     # قسم المشاريع المختارة فوق المنصة البيضاء
│   ├── ui/                             # العناصر الذرية المشتركة
│   │   ├── Button.tsx                  # الزر الموحد (primary / glass و pill / circle)
│   │   ├── CvMenu.tsx                  # قائمة تحميل السيرة الذاتية (EN / TR)
│   │   ├── JsonLd.tsx                  # البيانات المنظمة SEO
│   │   ├── MediaGallery.tsx            # معرض وسائط المشروع (Lightbox & Zoom) + MediaGallerySkeleton
│   │   ├── OrgBadge.tsx                # شارة المؤسسة/المختبر
│   │   ├── Reveal.tsx                  # ظهور تدريجي عند التمرير (يحترم reduced-motion)
│   │   ├── Skeleton.tsx                # عنصر Skeleton الذري بتأثير Shimmer (light / dark)
│   │   └── SkillTag.tsx                # وسم المهارة الصافي (أيقونة + نص فقط)
│   ├── skeletons/
│   │   ├── PageSkeletons.tsx           # هيكل الرئيسية المركّب فقط (HomePageSkeleton)
│   │   └── index.ts                    # نقطة التصدير الموحدة لكل الهياكل (تعيد تصدير هياكل الكروت والأقسام والـ views)
│   └── views/                          # مجمّعات الصفحات الكاملة (ملف واحد لكل مسار)
│       ├── HomeView.tsx                # تنسيق تتابع الأسطح والانحناءات في الرئيسية
│       ├── AboutView.tsx               # + AboutViewSkeleton
│       ├── ProjectsArchiveView.tsx     # + ProjectsArchiveSkeleton
│       ├── ServicesView.tsx            # + ServicesPageSkeleton
│       ├── ContactView.tsx             # + ContactViewSkeleton
│       ├── ProjectDetailView.tsx       # + ProjectDetailSkeleton
│       └── PublicationDetailView.tsx   # + PublicationDetailSkeleton
│
├── lib/                                # الثوابت، البيانات المحلية، والدوال المساعدة النقية
│   ├── types.ts                        # أنواع السجلات (Profile, Project, Publication...) مع translations الاختيارية
│   ├── services/                       # طبقة جلب البيانات الوحيدة (انظر القسم 4)
│   ├── mock/                           # بيانات وهمية تستهلكها services/source.mock.ts فقط
│   ├── site.ts                         # ثوابت الهوية، NAV_LINKS، LOCALE_OPTIONS، LANGUAGES، formatPhone
│   ├── gallery.ts                      # ترتيب شرائح المعرض ووسوم المشاريع
│   ├── projectInfo.ts                  # استخراج جدول معلومات المشروع
│   ├── richText.ts                     # تنظيف المحتوى النصي المنسق (sanitize-html)
│   └── seo.ts                          # pageMetadata (مستقلة لكل صفحة) و breadcrumbJsonLd
└── public/                             # الأصول الثابتة (موجودة فعلاً فقط)
    ├── cv/                             # ملفات السيرة الذاتية (PDF)
```

> **لا تشِر إلى ملفات غير موجودة في `public/`:** لا توجد حالياً مجلدات `icons/` أو `images/` أو `figures/`، ولا صورة مشاركة (OG) ولا أيقونة موقع. المشروع الذي بلا صورة يعرض بديلاً هندسياً بدل صورة مكسورة (`imageUrl: null` و `project_media: []`).

---

## 2. قواعد التوسع ومنع التكرار (Scalability & DRY Rules)

1. **العزل الصارم حسب الفئة:**
   - أي بطاقة جديدة توضع حصراً في `components/cards/`، وتُعاد استخدامها بدل إنشاء نسخة لكل صفحة (مثال: أرشيف `/projects` يستخدم `FeaturedProjectCard` نفسها).
   - أي قسم جديد لصفحة يوضع في `components/sections/<page>/`.
   - أي عنصر ذري مشترك (زر، وسم، حقل، شارة) يوضع في `components/ui/`.
   - ملفات `components/views/` تجمّع الأقسام وتنسّق الانتقالات بينها، وتحمل هيكل التحميل التوأم الخاص بالصفحة في الملف نفسه.
2. **`loading.tsx` لكل مسار، ولا `loading.tsx` في جذر `app/`:** الرئيسية تأخذ هيكلها من `app/(home)/loading.tsx` حتى لا يتسرب إلى الصفحات الأخرى.
3. **المرجع البصري الإلزامي:** راجع دائماً مهارة **`bajhaw-visual-identity`** قبل بناء أو تعديل أي مكون أو حركة.
4. **بعد نقل أو إعادة تسمية مسارات `app/`:** احذف مجلدات الأنواع المولّدة (`.next/types` و `.next-verify/types`) ثم أعد `pnpm.cmd run check`، لأنها تحتفظ بالمسارات القديمة.
5. **أوامر التشغيل على Windows:** تُنفذ جميع أوامر Node/pnpm من داخل `client/` باستخدام `pnpm.cmd` (مثل `pnpm.cmd run check`).

---

## 3. اللغات والاتجاه (i18n: en / ar / tr) — القاعدة الإلزامية لأي نص جديد

- **المسارات:** كل المسارات داخل `client/app/[lang]/` (الجذر `layout.tsx` داخل `[lang]` ويضع `<html lang dir>`). `client/proxy.ts` يحوّل أي مسار بلا لغة إلى `/{locale}` (الكوكي `bajhaw-locale` ثم `Accept-Language` ثم `en`). `app/[lang]/[...slug]/page.tsx` يستدعي `notFound()` لتظهر صفحة 404 المصمَّمة والمترجمة. `app/sitemap.ts` و`robots.ts` و`global-error.tsx` خارج `[lang]` (الأخير ثلاثي اللغات مضمَّن).
- **الكود:** `lib/i18n/`: `config.ts` (اللغات، `localePath`، `stripLocale`)، `translate.ts` (`createTranslator`، دمج مع الإنجليزية كاحتياط)، `messages.ts` (**نقطة الاستبدال الوحيدة**: اجعل `loadLocale` تجلب القواميس من الباك)، `server.ts` (`getI18n()` لمكوّنات الخادم)، `client.tsx` (`useI18n()` لمكوّنات العميل)، `localize.ts` (طبقة ترجمة المحتوى).
- **القواميس:** `client/messages/en.ts` هو المصدر الأساسي للمفاتيح (يُشتق منه نوع `MessageKey`، فأي مفتاح خاطئ يفشل في `tsc`)، و`ar.ts` و`tr.ts` جزئيان ويسقطان على الإنجليزية. الأرقام داخل النص بـ `{name}` والخط العريض بـ `**x**` (يعرضه `RichText`).
- **المحتوى (مشاريع، أبحاث، مهارات...):** كل سجل قد يحمل `translations: { ar: {...}, tr: {...} }`؛ `getPortfolioSnapshot(locale)` يطبّقها فوق السجل الإنجليزي. `category` للمهارات لا يُترجَم هنا لأنه مفتاح التجميع والأيقونة؛ اسم الطبقة من القاموس.
- **ممنوع** كتابة نص مرئي أو `aria-label` أو `alt` ثابتاً داخل المكوّنات؛ يُضاف مفتاح في `en.ts` ثم يُستدعى `t("...")`. الروابط الداخلية دائماً عبر `href("/path")` من `getI18n()` أو `useI18n()`.
- **مكوّنات الهياكل الخادمية** (`*Skeleton` التي تحمل `aria-label`) `async` وتستخدم `getI18n()`.

---

## 4. طبقة البيانات والخدمات (`lib/services`) — عزل منطق الجلب

- **القاعدة:** لا يستورد أي مكوّن أو صفحة من `lib/mock` أبداً، ولا يقرأ بيانات مباشرة. الصفحات تستدعي `@/lib/services` فقط، والـViews تستقبل بيانات صفحتها كخاصية `data` ولا تجلب شيئاً.
- **المصدر:** `services/source.ts` يعرّف الواجهة `PortfolioSource` ويصدّر `source`. حالياً `source.mock.ts` (الملف الوحيد الذي يستورد `lib/mock`). للانتقال إلى الباك: نفّذ `PortfolioSource` على الباك وبدّل التصدير، ثم احذف `lib/mock` و`source.mock.ts`.
- **الدوال:** كل ملف `*.service.ts` يقوم بالترجمة (`localize`) والترتيب والتخزين المؤقت لكل طلب (`cache` من React): `getProfile`، `getProjects` / `getProjectBySlug` / `getProjectSlugs`، `getPublications` / `getPublicationById` / `getPublicationIds`، `getSkills`، `getServiceAreas`. `pages.service.ts` فيه محمّل لكل صفحة: `getHomeData` (يبني شرائح المعرض أيضاً) و`getAboutData` و`getProjectsPageData` و`getServicesPageData` و`getContactData`.
- **إضافة بيانات جديدة:** نوع في `lib/types.ts` ← طريقة في `PortfolioSource` ← تنفيذها في المصدر الوهمي ← دالة في `services` ← استدعاؤها من الصفحة. `generateStaticParams` والـsitemap يستخدمان `getProjectSlugs` و`getPublicationIds`.
- **البيانات الوهمية** تغطي كل جزء: ملف شخصي، تعليم، خبرات، 61 مهارة، 9 مشاريع (منها وهمية بمحتوى غني وجدول معلومات ومعرض وروابط)، 4 أبحاث (DOI وهمي وتفاصيل HTML لأحدها)، 6 مجالات خدمات، وترجمات عربية وتركية للحقول الرئيسية. الـDOI والمستودعات والأرقام وهمية.

---

## 5. الأداء والكاش والتحقق (قواعد إلزامية)

- **الأوامر:** `pnpm.cmd run verify` (أنواع + ESLint + بناء). ESLint (`eslint.config.mjs`، قواعد `core-web-vitals` + TypeScript) يجب أن يعطي صفراً من الأخطاء. بعد `pnpm build && pnpm start` شغّل `pnpm smoke`: يزحف على كل روابط الـsitemap ويفحص الحالة والروابط الداخلية والصور ومفاتيح الترجمة الظاهرة وJSON-LD و`lang/dir` والكاش والترويسات، ويفشل عند أي خلل.
- **الصور:** كل صورة مرئية عبر `next/image` (`fill` + `sizes` داخل حاوية بنسبة ثابتة، و`priority` للصورة الأولى فقط). الصور المسموحة محلية فقط (`images.localPatterns` في `next.config.ts`)، ولا `remotePatterns` حتى يُضاف مضيف الباك صراحةً. الاستثناء الوحيد `<img>` داخل `MediaLightbox` (حسابات التكبير تحتاج الحجم الأصلي) وصور `rich_content` (HTML من الباك).
- **التحميل الكسول:** لا يمكن لمكوّن خادم تقسيم مكوّن عميل، لذا التقسيم داخل مكوّن عميل: `LazyHomeSections.tsx` (المعرض والمهارات في الرئيسية) و`MediaGallery` الذي يحمّل `MediaLightbox` عند أول نقرة (ويسخّنه عند المرور أو التركيز). أي مكوّن عميل ثقيل أسفل الشاشة أو يُفتح بنقرة يُحمَّل بهذا النمط.
- **الكاش:** الصفحات ثابتة مع `revalidate = 3600` في `app/[lang]/layout.tsx` (ISR: `s-maxage=3600, stale-while-revalidate`). ملفات `public/` غير المجزّأة (figures, cv) بـ `max-age=86400, stale-while-revalidate=604800`، والصور المحسّنة 31 يوماً، وكل شيء تحت `/_next/static` `immutable` تلقائياً. ترويسات الأمان (nosniff، X-Frame-Options، Referrer-Policy، Permissions-Policy، HSTS) في `next.config.ts`. تكرار الجلب داخل الطلب الواحد تمنعه `cache()` في `lib/services`.
- **الخطوط** عبر `next/font` (استضافة ذاتية عند البناء، بلا طلب إلى Google) في `app/[lang]/layout.tsx` ومتغيراتها في `@theme inline`.
- **ممنوع** `setState` متزامناً داخل `useEffect`: استخدم `lib/hooks/useBrowserState.ts` (`usePrefersReducedMotion`, `useScrolledPast` عبر `useSyncExternalStore`) أو اشتقّ القيمة. ممنوع `any`: الأنواع في `lib/types.ts`.

## 6. لوحة التحكم (`/admin`) — استوديو المحتوى

- **المسار:** `client/app/admin/` (تخطيط جذر مستقل، إنجليزي، `noindex`) ويستثنيه `proxy.ts` من إعادة توجيه اللغات. الشاشة الحالية في هاش الرابط (`#projects`).
- **التقسيم (كما في اللوحة القديمة):** `lib/admin/resources.ts` يعرّف كل نوع سجل (نقطة النهاية، الحقول، تحويل النموذج إلى payload)، و`ResourceWorkspace` محرك عام (قائمة + محرر)، و`FieldRenderer` للحقول، و`RichTextEditor` و`Uploader`. إضافة حقل = سطر في `resources.ts`.
- **الباك إند:** `lib/admin/api.ts` هو الموضع الوحيد للشبكة. الخادم يرفض أي خاصية غير معرّفة، لذا لا يُرسَل إلا ما في تعريف الحقول. الترجمات تُحفظ تحت `translations.ar|tr` وتُرسل كاملة في كل حفظ.
- **الأقسام:** نظرة عامة، الملف الشخصي، التعليم، الخبرة، المهارات، المشاريع (مع الوسائط)، الأبحاث، الخدمات (مع الخدمات الداخلية)، الرسائل، سجل النشاط.
- **التشغيل المحلي:** شغّل الخادم على `localhost:4000` (أو عيّن `API_ORIGIN`)، ثم `pnpm dev`. الدخول بحساب المالك المعرَّف في `server/.env`.

## 7. مكوّنات النماذج (`client/components/forms/`) — تُصمَّم مرة وتُستخدم في كل مكان

- **القاعدة:** أي حقل إدخال أو زر نموذج أو رفع ملف يُستورد من `@/components/forms`. ممنوع كتابة `<input>`/`<select>`/`<textarea>` بأنماط محلية في أي شاشة (اللوحة، صفحة التواصل، أي صفحة مستقبلية).
- **الحقول:** `Input` (أيقونة بداية/نهاية، إظهار كلمة السر)، `Textarea` (تمدد تلقائي وعداد)، `Select`، `TagInput` (وسوم)، `Toggle`، `Checkbox`، `SegmentedControl` (بديل التبويبات والاختيار المفرد).
- **الملفات:** `FileUpload` (سحب وإفلات + شريط تقدم لكل ملف + إلغاء/إعادة/إزالة + معاينة + تحقق من النوع والحجم)، `UploadButton` (الرفع نفسه كزر)، `MediaField` (رابط أو رفع مع معاينة). كلها عبر `useUploadQueue` ولا تعرف أي خادم: الصفحة تمرّر دالة `upload(file, { onProgress, signal })` وتستقبل النتيجة في `onUploaded`.
- **التغذية الراجعة:** `FormMessage` (ok/error/info) و`ProgressBar` و`FormButton` (primary/ghost/soft/danger + حالة busy).
- **خيارات الشكل المشتركة:** `tone` (`soft` للأسطح البيضاء، `white` للحقول داخل بطاقة رمادية) و`labelStyle` (`default` أو `eyebrow` لأسلوب الموقع العام الكبير الأحرف). كل مكوّن يرسم التسمية والمساعدة والخطأ بنفسه (`label`/`help`/`error`) ويربطها بـ`aria-describedby` و`aria-invalid`.
- **الإتاحة وRTL:** الأحجام العربية مضبوطة داخلياً (`rtl:`) والحواف منطقية (`start/end`)، فلا حاجة لتعديل في الشاشات.
- **لحقل مخصص:** غلّفه بـ`FormField` ومرّر `id` نفسه، واستخدم `describedBy`.
- **الاستخدام الحالي:** صفحة التواصل العامة (`tone="white"` و`labelStyle="eyebrow"`) ولوحة `/admin` كلها (الدخول، المحرر العام، الوسائط، الخدمات، الرسائل).
