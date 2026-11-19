---
name: bajhaw-design-system
description: >-
  دليل ومعايير نظام التصميم، الهوية البصرية، وتقنيات Tailwind CSS v4 في موقع محمد باجحاو
  (Mohammed Bajhaw Portfolio). يُستخدم كمرجع إلزامي عند إنشاء أو تعديل صفحات الواجهة،
  المكونات، أو تعريفات @theme و @utility في client/styles/globals.css.
---

# نظام التصميم والهوية البصرية (Bajhaw Design System — Tailwind CSS v4)

> **الفلسفة البصرية:** تصميم هندسي أكاديمي رصين (Editorial Engineering Aesthetic) مبني حصرياً باستخدام **Tailwind CSS v4** (`@import "tailwindcss";` و `@theme` و `@utility`) بدون أي فئات CSS تقليدية مطولة.

---

## 1. القواعد الصارمة لـ Tailwind CSS v4

1. **الاعتماد الحصري على فئات Tailwind CSS v4 داخل المكونات (JSX):**
   - يُمنع كتابة قواعد CSS مخصصة لكل مكون في `globals.css`.
   - تُكتب جميع التنسيقات، الاستجابات (`sm:`, `md:`, `lg:`)، حالات التحويم (`hover:`, `group-hover:`)، والعناصر الزائفة (`before:`, `after:`) مباشرة عبر فئات Tailwind v4 داخل ملفات `.tsx`.
2. **تحريم الشارات الكبسولية للعناوين والتسميات (No Bordered/Tinted Pill Badges for Headings):**
   - يُمنع بتاتاً وضع العناوين الفرعية أو التسميات التوضيحية (Eyebrows / Section Labels) داخل إطارات كبسولية ببوردر وخلفية خفيفة (`rounded-full border bg-...`).
   - تُكتب التسميات والعناوين الفرعية دائماً كنص حر ونظيف (`mono-eyebrow`) بدون أي إطار أو خلفية تحيط بها.
3. **قانون التحويم الموحد للمنصة (Fixed Frame / Inner-Text-Only Hover Law):**
   - **قاعدة إلزامية في كامل المنصة:** عند التحويم (`hover`) على أي زر، بطاقة، أو رابط، **يُمنع بتاتاً** تكبير أو تحريك الإطار الخارجي للمكون (`hover:scale-*`, `hover:-translate-y-*`, `hover:translate-x-*`).
   - يبقى حجم ومكان المكون الخارجي ثابتاً 100%، ويكبر **النص أو الأيقونة الداخلية فقط** بنعومة وسرعة وسلاسة عالية (`transition-transform duration-180 ease-out-expo group-hover:scale-[1.03]` للبطاقات، و `group-hover:scale-108` للأزرار).
4. **منع الإيموجي قطعياً (Zero Emojis Rule):**
   - يُمنع استخدام أي رموز إيموجي (`🏆`, `👋`, إلخ) في أي نص أو واجهة داخل المنصة، ويُستعاض عنها عند الحاجة بأيقونات متجهة نظيفة من `lucide-react`.
5. **ملف [`client/styles/globals.css`](file:///a:/projects/mohammedbajhaw/client/styles/globals.css) يقتصر فقط على:**
   - `@import "tailwindcss";` واستيراد خطوط Google (`Lexend` و `IBM Plex Mono`).
   - كتلة `@theme` لتعريف متغيرات الألوان، الخطوط، والحركات (`--animate-*`).
   - أدوات `@utility` المختصرة والمشتركة على مستوى التطبيق (`shell`, `btn`, `btn-primary`, `btn-cv`, `mono-eyebrow`).
   - تنسيق عناصر HTML الخام داخل المحتوى الغني (`.rich-content`) المولد عبر `dangerouslySetInnerHTML`.

---

## 2. رموز الهوية في `@theme` (Design Tokens)

| رمز `@theme` | فئة Tailwind المقابلة | القيمة | الاستخدام |
| :--- | :--- | :--- | :--- |
| `--color-paper` | `bg-paper`, `text-paper` | `#f7f8f6` | الخلفية الأساسية الدافئة للصفحات |
| `--color-ink` | `text-ink`, `bg-ink` | `#182526` | لون النصوص والعناوين الأساسية عالي التباين |
| `--color-teal` | `text-teal`, `bg-teal`, `border-teal` | `#176b69` | اللون الهندسي المميز للروابط، الأزرار، والمؤشرات |
| `--color-teal-deep` | `text-teal-deep`, `bg-teal-deep` | `#0c4545` | الدرجة العميقة للإحصائيات والشارات |
| `--color-line` | `border-line`, `bg-line` | `#d8dedb` | لون الحدود والفواصل الشبكية الدقيقة |
| `--color-soft` | `bg-soft`, `text-soft` | `#eef3f1` | خلفية الأقسام التبادلية والبطاقات الجانبية |
| `--font-sans` | `font-sans` | `Lexend, Arial, sans-serif` | الخط الأساسي للنصوص والعناوين |
| `--font-mono` | `font-mono` | `"IBM Plex Mono", monospace` | الخط التقني الأحادي للفهارس، التواريخ، والوسوم |

---

## 3. الأدوات الموحدة وفصل الخلفيات عن الحاوية (`@utility` Classes)

- **قاعدة فصل الخلفية عن الحاوية (Full-Bleed Background vs. Content Container):**
  - جميع الخلفيات (`bg-soft`, التدرجات، الأسطح المنحنية مثل سطح الهيرو `bg-[#efefec]`)، الحدود الفاصلة (`border-b`)، والزخارف الهندسية الخلفية (`<SectionMotif />`) توضع في العنصر الخارجي (`section-bleed`) وتمتد بحرية خارج قيود الحاوية (`w-full`).
  - أما المحتوى الفعلي (النصوص، الشريط العلوي، الشبكات، البطاقات) فيُحمى دائماً داخل حاوية `shell` (`relative z-10`) لضمان محاذاة موحدة وثابتة عبر كل أقسام الموقع.
- **`shell`**: الحاوية المعيارية لحماية المحتوى (`w-full max-w-[1200px] mx-auto px-5 sm:px-8`).
- **`section-bleed`**: الغلاف الخارجي للأقسام والخلفيات (`relative isolate w-full overflow-hidden`).
- **`btn` / `btn-primary` / `btn-cv` (الزر الرسمي الموحد للمنصة):**
  - شكل كبسولة دائرية بالكامل (`rounded-full`)، ارتفاع `h-[50px]`، حشوة أفقية `px-8`، بدون إطار (`border-0`)، وخلفية متدرجة بزاوية 45 درجة بألوان الهوية (`bg-linear-45 from-[#0c4545] via-[#176b69] to-[#268c89] text-white`) مع ظل ناعم (`shadow-[0_10px_25px_rgba(12,69,69,0.32)]`) وتأثير تحويم (`hover:brightness-110 hover:-translate-y-0.5`). يُستخدم في كل أزرار المنصة دون استثناء.
- **`mono-eyebrow`**: التسمية العلوية للأقسام (`text-teal font-mono font-medium text-[11px] tracking-[0.08em] uppercase`).
