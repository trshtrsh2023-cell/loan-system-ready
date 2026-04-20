# نظام حاسبة القروض البنكية 🏦

تطبيق ويب احترافي لحساب التمويل الشخصي من البنوك السعودية مع لوحة تحكم شاملة.

## المميزات ✨

- ✅ **حاسبة ذكية** - حساب فوري للقرض بناءً على الراتب والعمر والوظيفة
- ✅ **دعم جميع البنوك السعودية** - الأهلي، الراجحي، الإنماء، البلاد، الرياض، الجزيرة، والفرنسي
- ✅ **نظام تسجيل وموافقات** - العملاء يسجلون والمسؤول يوافق
- ✅ **لوحة تحكم متقدمة** - تحكم كامل في النسب والمعادلات من البنك الأهلي (مثال: معامل الضرب x18)
- ✅ **دعم برنامج سكني** - حساب الدعم تلقائياً
- ✅ **حسابات دقيقة للتقاعد** - يحسب سن التقاعد حسب الوظيفة والرتبة
- ✅ **واجهة عربية RTL احترافية**
- ✅ **آمن** - كلمات مرور مشفرة، JWT tokens، HTTPS فقط

## المتطلبات 📋

- Node.js 18+ 
- حساب Supabase (مجاني)
- Vercel للنشر (اختياري)

## الخطوات السريعة 🚀

### 1. إنشاء قاعدة بيانات Supabase

1. انتقل إلى [supabase.com](https://supabase.com)
2. أنشئ project جديد
3. انسخ `supabase/schema.sql` كاملاً وشغّله في SQL Editor
4. انسخ مفاتيحك من Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. إعداد المشروع محلياً

```bash
# نسخ المشروع
git clone <repo-url>
cd loan-system

# تثبيت المكتبات
npm install

# إنشاء ملف البيئة
cp .env.local.example .env.local

# ملء المتغيرات في .env.local
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
# JWT_SECRET=your-very-long-random-secret-min-32-chars (اجعله طويلاً!)
# ADMIN_INIT_SECRET=admin-setup-secret

# تشغيل محلياً
npm run dev
```

الموقع سيكون على `http://localhost:3000`

### 3. إنشاء حساب المدير

```bash
# في نافذة جديدة، استدعِ هذا الـ endpoint مرة واحدة فقط:
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "admin-setup-secret",
    "username": "admin",
    "password": "your-secure-password"
  }'
```

الآن يمكنك تسجيل الدخول بـ `admin` والدخول للوحة التحكم.

## هيكل النظام 📁

```
┌─────────────────────┐
│  العملاء (مستخدمون)  │ ← تسجيل ← الصفحة الرئيسية
│  (Pending)          │         (page.tsx)
└──────────┬──────────┘
           │ موافقة المدير
           ↓
    ┌─────────────┐
    │  حاسبة القرض │ ← (محمي: يحتاج موافقة)
    │(calculator) │
    └─────────────┘
           ▲
           │
    ┌──────┴──────────┐
    │   لوحة التحكم    │
    │  (Admin Panel)  │
    │  - المستخدمون    │
    │  - الإعدادات     │
    └─────────────────┘
        (حماية: admin فقط)
```

## الصفحات الرئيسية 📄

| الصفحة | URL | الوصول |
|-------|-----|--------|
| تسجيل دخول/تسجيل | `/` | الكل |
| حاسبة القرض | `/calculator` | عملاء مفعّلون فقط |
| قيد الانتظار | `/pending` | عملاء في انتظار الموافقة |
| لوحة التحكم | `/admin` | المدير فقط |
| إعدادات البنوك | `/admin/settings` | المدير فقط |

## كيفية الاستخدام 👥

### للعملاء:
1. افتح الموقع واختر "حساب جديد"
2. أدخل بيانات وحصل على رقم طلب
3. انتظر موافقة المسؤول
4. بعد الموافقة، دخّل الحاسبة أدخل بيانات راتبك

### للمسؤول:
1. دخّل بحساب المدير (`admin`)
2. في لوحة التحكم:
   - **قسم المستخدمون**: وافق على الطلبات أو ارفضها
   - **قسم الإعدادات**: غيّر معامل الضرب (x18)، النسب، الدعم السكني لكل بنك

مثال: إذا قررت البنك تغيير المعامل من x18 إلى x20، دخّل الإعدادات وغيّره، والحاسبة ستحدّث فوراً!

## المعادلات والحسابات 🧮

### حساب مبلغ القرض:

```
1. صافي الراتب = الأساسي + السكن + البدلات
2. معامل الضرب الفعال = معامل_البنك × (أشهر_متبقية_للتقاعد ÷ 60)
   - إذا >= 60 شهر: استخدم المعامل الكامل
   - إذا < 60 شهر: قلل المعامل تناسبياً
3. مبلغ التمويل = صافي الراتب × معامل_الضرب_الفعال
4. دعم سكني = 150k (راتب < 10k) أو 100k (راتب >= 10k)
5. إجمالي التمويل = مبلغ التمويل + دعم سكني
6. القسط الشهري = باستخدام صيغة PMT مع سعر الأرباح
```

### سن التقاعد:
- **مدني (حكومي/خاص):** 60 سنة
- **عسكري:** حسب الرتبة (44-62 سنة)

## متغيرات البيئة 🔑

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Security
JWT_SECRET=very-long-random-string-at-least-32-characters
ADMIN_INIT_SECRET=secret-to-initialize-first-admin

# في الإنتاج
NODE_ENV=production
```

## النشر على Vercel 🌍

```bash
# 1. ادفع المشروع إلى GitHub
git push

# 2. على Vercel:
# - اربط repo الخاص بك
# - أضف متغيرات البيئة في Project Settings > Environment Variables
# - اضغط Deploy

# 3. بعد النشر:
curl -X POST https://your-domain.vercel.app/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-secret", "username": "admin", "password": "..."}'
```

## الأمان 🔒

- ✅ كلمات مرور مشفرة بـ bcryptjs
- ✅ JWT tokens للجلسات
- ✅ HTTPS فقط في الإنتاج (httpOnly cookies)
- ✅ Middleware للحماية من الوصول غير المصرح
- ✅ Service Role Key للعمليات الحساسة

## API Endpoints 📡

```
POST   /api/auth/register          - تسجيل مستخدم جديد
POST   /api/auth/login             - تسجيل الدخول
POST   /api/auth/logout            - تسجيل الخروج

GET    /api/banks                  - قائمة البنوك المفعّلة

GET    /api/admin/users            - قائمة المستخدمين (مدير فقط)
PATCH  /api/admin/users/[id]       - تحديث حالة المستخدم

GET    /api/admin/settings         - إعدادات البنوك
PATCH  /api/admin/settings/[bank]  - تحديث إعدادات بنك معيّن

POST   /api/admin/init             - إنشاء حساب المدير الأول
```

## الدعم والمساعدة 💬

- **مشاكل في Supabase:** تأكد من ملف schema.sql
- **خطأ JWT:** تأكد من `JWT_SECRET` طويل وآمن
- **الحاسبة لا تحسب صحيح:** تحقق من إعدادات البنك في لوحة التحكم
- **العملاء لا يرون الحاسبة:** تأكد من موافقتك عليهم أولاً

## الترخيص 📜

MIT License - استخدم بحرية!

---

**نصيحة ذهبية:** 💡
احتفظ بـ seed data في قاعدة البيانات (البنوك + الإعدادات الافتراضية) حتى تتمكن من إعادة تشغيل النظام بسهولة!

Happy deploying! 🚀
