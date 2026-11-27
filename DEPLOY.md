# النشر على سيرفر VPS واحد (Docker)

كل شيء يعمل على سيرفر واحد: **Caddy** (مدخل وحيد + HTTPS تلقائي) ← **الواجهة** و**الخادم (API)** ← **MongoDB**، مع تخزين الملفات المرفوعة على volume. المنفذان 80 و443 فقط مفتوحان للخارج؛ القاعدة والخادم والواجهة داخل شبكة خاصة.

## المتطلبات
- سيرفر Linux عليه Docker و Docker Compose.
- نطاق (domain) يشير سجل DNS من نوع A له إلى عنوان السيرفر (لازم قبل التشغيل ليصدر شهادة HTTPS).
- فتح المنفذين 80 و443 في جدار الحماية.

## الخطوات
```bash
git clone https://github.com/MohammedBajhaw/mohammedbajhaw.github.io.git site
cd site
cp .env.docker.example .env
nano .env            # عدّل: SITE_ADDRESS و PUBLIC_URL و JWT_SECRET و ADMIN_EMAIL وكلمة المرور
docker compose up -d --build
```

- الموقع: `https://نطاقك` ولوحة التحكم: `https://نطاقك/admin`.
- ولّد سراً قوياً للجلسة: `openssl rand -hex 32` (ضعه في `JWT_SECRET`).
- كلمة مرور الأدمن: الأفضل hash من نوع bcrypt في `ADMIN_PASSWORD_HASH` بدل `ADMIN_PASSWORD`.
- مفتاح مزوّد الترجمة (OpenAI أو Gemini) يُضاف من لوحة التحكم ← Platform ← Translation.

## التشغيل اليومي
| المهمة | الأمر |
| :--- | :--- |
| حالة الخدمات | `docker compose ps` |
| السجلات | `docker compose logs -f server` (أو `web` أو `caddy`) |
| تحديث بعد سحب كود جديد | `git pull && docker compose up -d --build` |
| إيقاف | `docker compose down` (البيانات تبقى) |

## البيانات والنسخ الاحتياطي
البيانات على volumes باسم المشروع `bajhaw`: `mongo-data` (القاعدة) و`uploads` (الصور والملفات) و`caddy-data` (شهادات HTTPS). **لا تستخدم `docker compose down -v`** لأنه يحذفها.

```bash
# نسخة من القاعدة
docker compose exec -T mongo mongodump --archive --gzip > backup-$(date +%F).gz
# نسخة من الملفات المرفوعة
docker run --rm -v bajhaw_uploads:/data -v "$PWD":/out alpine tar czf /out/uploads-$(date +%F).tgz -C /data .
```

## تجربة محلية بدون نطاق
في `.env`: `SITE_ADDRESS=http://localhost` و`PUBLIC_URL=http://localhost:8088` و`HTTP_PORT=8088` ثم شغّل الأمر نفسه وافتح `http://localhost:8088`.

## سيرفر بدون عنوان IP عام (Cloudflare Tunnel)
إن كان السيرفر خلف NAT أو شبكة منزلية فلا يمكن لـ Caddy إصدار شهادة HTTPS مباشرة. استخدم نفقاً صادراً من Cloudflare بدل فتح المنافذ:
1. في `.env`: `SITE_ADDRESS=http://نطاقك` و`PUBLIC_URL=https://نطاقك` (Cloudflare تنهي HTTPS عند حافتها).
2. أنشئ نفقاً في Cloudflare Zero Trust وأضف Public Hostname بنوع `HTTP` وعنوان `caddy:80`.
3. شغّل موصّل `cloudflared` على شبكة Docker نفسها بالتوكن (ضعه في `.env` ولا ترفعه إلى Git).

## ملاحظات
- قاعدة البيانات تبدأ فارغة: أنشئ المحتوى من لوحة التحكم.
- الموقع العام يقرأ بياناته من الخادم عند كل طلب، فتظهر تعديلات اللوحة فوراً.
