# 🚀 دليل الإعداد والنشر الكامل

## المرحلة 1️⃣: التحضير المحلي (على حاسوبك)

### أ) نسخ المشروع وتثبيت المكتبات

```bash
# انسخ المشروع (إذا لم تنسخه بعد)
git clone <رابط-المشروع>
cd loan-system

# ثبّت المكتبات
npm install
```

### ب) إعداد ملف البيئة

```bash
# انسخ ملف المثال
cp .env.local.example .env.local

# افتح .env.local وملأ البيانات:
```

**في .env.local (ملء البيانات):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
JWT_SECRET=your-very-long-super-secure-random-string-at-least-32-characters-!@#$%^&
ADMIN_INIT_SECRET=admin-setup-secret-change-this
```

> **أين تحصل على بيانات Supabase؟**
> 1. انتقل إلى [supabase.com](https://supabase.com)
> 2. أنشئ account وproject جديد
> 3. اذهب إلى Settings → API
> 4. انسخ URL وجميع المفاتيح

---

## المرحلة 2️⃣: إعداد قاعدة البيانات

### أ) فتح SQL Editor في Supabase

1. في Supabase Dashboard
2. اذهب إلى SQL Editor (الجانب الأيسر)
3. اضغط "New Query"

### ب) تشغيل الـ Schema

1. افتح ملف: `supabase/schema.sql`
2. انسخ **جميع الكود**
3. الصقه في SQL Editor
4. اضغط "Run" ▶️

✅ الآن لديك جداول: users, bank_settings, calculations

### ج) التحقق

```sql
-- شغّل هذا للتحقق:
SELECT count(*) FROM bank_settings;
-- يجب يطلع: 8 (ثماني بنوك)
```

---

## المرحلة 3️⃣: التشغيل المحلي

```bash
# من مجلد loan-system
npm run dev

# اذهب إلى http://localhost:3000
```

ستشوف صفحة التسجيل! 🎉

---

## المرحلة 4️⃣: إنشاء حساب المدير

### الطريقة الأولى: cURL (سهل)

```bash
# شغّل هذا في Terminal
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "admin-setup-secret",
    "username": "admin",
    "password": "admin123"
  }'
```

الرد يجب يكون: `{"ok":true,"message":"تم إنشاء حساب المدير بنجاح"}`

### الطريقة الثانية: Insomnia/Postman

1. افتح Insomnia أو Postman
2. اختر **POST**
3. الرابط: `http://localhost:3000/api/admin/init`
4. Headers: `Content-Type: application/json`
5. Body (JSON):
```json
{
  "secret": "admin-setup-secret",
  "username": "admin",
  "password": "admin123"
}
```
6. اضغط Send

✅ الآن يمكنك دخول الموقع بـ `admin` / `admin123`

---

## المرحلة 5️⃣: اختبار النظام محلياً

### أ) الدخول كمدير

1. اذهب إلى `http://localhost:3000`
2. ادخل:
   - اسم المستخدم: `admin`
   - كلمة المرور: `admin123`
3. اضغط "دخول"

يجب تنقلك تلقائياً إلى `/admin` ✅

### ب) تسجيل عميل تجريبي

1. اذهب إلى الصفحة الرئيسية `/`
2. اختر "حساب جديد"
3. ملأ البيانات (اسم مستخدم: test123، كلمة مرور: test123)
4. ستحصل على رقم طلب

### ج) الموافقة من لوحة التحكم

1. ادخل كمدير
2. اذهب إلى قسم المستخدمين
3. ابحث عن test123
4. اضغط "موافقة" ✅

### د) دخول العميل للحاسبة

1. اخرج من حساب المدير (خروج)
2. ادخل بـ test123 / test123
3. يجب ينقلك مباشرة إلى `/calculator` ✅

---

## المرحلة 6️⃣: تخصيص البنوك والمعادلات

### أ) دخول إعدادات البنوك

1. كمدير: اذهب إلى `/admin/settings`
2. ستشوف جميع البنوك السعودية

### ب) تغيير معامل الضرب (مثالاً)

1. البنك الأهلي
2. اضغط "تعديل"
3. غيّر `معامل الضرب` من 18 إلى 20
4. اضغط "حفظ" ✅

الآن جميع حسابات الأهلي ستستخدم x20 بدل x18!

### ج) المتغيرات الأساسية:

| المتغير | الافتراضي | الشرح |
|--------|----------|------|
| معامل الضرب | 18 | راتب × معامل = القرض (لو باقي <= 5 سنين يتناقص) |
| نسبة الأرباح السنوية | 2.5% | فائدة القرض السنوية |
| نسبة الاستقطاع | 33% | 33% من الراتب للقسط شهري (للتحقق) |
| مدة التمويل القصوى | 60 | شهر (5 سنوات) |
| دعم سكني (منخفض) | 150,000 ر.س | للعاملين بـ <10k راتب |
| دعم سكني (مرتفع) | 100,000 ر.س | للعاملين بـ >=10k راتب |

---

## المرحلة 7️⃣: النشر على Vercel 🌍

### أ) إعداد GitHub

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/loan-system.git
git branch -M main
git push -u origin main
```

### ب) الربط بـ Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط "New Project"
3. اختر repo الخاص بك من GitHub
4. اختر Next.js framework (تلقائياً)
5. اضغط "Deploy"

### ج) إضافة متغيرات البيئة على Vercel

1. في Vercel Project Settings
2. اذهب إلى "Environment Variables"
3. أضف:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET` (نفس القيمة المحلية)
   - `ADMIN_INIT_SECRET` (نفس القيمة)

4. اضغط "Save"

### د) إعادة Deploy

بعد الإضافة:
1. اذهب إلى Deployments
2. اضغط آخر deployment
3. اضغط "Redeploy"

### هـ) إنشاء حساب المدير على Vercel

```bash
curl -X POST https://your-domain.vercel.app/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "admin-setup-secret",
    "username": "admin",
    "password": "your-secure-password"
  }'
```

✅ موقعك جاهز على الإنترنت! 🎉

---

## المرحلة 8️⃣: الصيانة والتحديثات

### تحديث معامل الضرب مثلاً

1. ادخل `/admin/settings`
2. عدّل القيمة
3. اضغط "حفظ"
4. ✅ التحديث فوري لجميع العملاء!

### إضافة بنك جديد

1. انتقل إلى Supabase SQL Editor
2. اشغّل:
```sql
INSERT INTO bank_settings (bank_key, name, personal_multiplier, annual_rate, enabled)
VALUES ('newbank', 'البنك الجديد', 18, 2.5, true);
```

---

## الأسئلة الشائعة ❓

**س: كيف أغيّر راتب التقاعد للعسكري؟**
> يُحسب تلقائياً من الصيغة: `راتب × (سنين_الخدمة + سنين_المتبقي) ÷ 420`
> للتعديل: اذهب للـ Supabase وعدّل قيمة الرتبة في query اليد. (متقدم)

**س: العميل يقول القسط غير صحيح؟**
> تحقق من:
> 1. هل أدخل الراتب الصافي صحيح؟
> 2. هل البنك مفعّل وسعره الصحيح؟
> 3. هل سنه أقل من سن التقاعد؟

**س: كيف أحذف مستخدم؟**
> في Supabase: SQL Editor
> ```sql
> DELETE FROM users WHERE username = 'username';
> ```

**س: نسيت كلمة مرور المدير؟**
> في Supabase، شغّل:
> ```sql
> SELECT id, username FROM users WHERE role = 'admin';
> -- احذفه وأنشئ جديد بـ /api/admin/init
> DELETE FROM users WHERE role = 'admin';
> ```

**س: الموقع بطيء؟**
> - تحقق من اتصال Supabase
> - تأكد من عدم وجود أخطاء في Browser Console
> - استخدم Network tab في DevTools

---

## الملخص السريع 📝

```bash
# 1. الإعداد
npm install

# 2. البيئة
cp .env.local.example .env.local
# ملأ البيانات

# 3. قاعدة البيانات
# شغّل schema.sql على Supabase

# 4. المحلي
npm run dev

# 5. المدير
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{"secret": "admin-setup-secret", "username": "admin", "password": "admin123"}'

# 6. اختبر!
# http://localhost:3000 → admin/admin123

# 7. النشر
# ادفع GitHub → ربط Vercel → أضف البيئة → Redeploy
```

---

**استمتع بالنظام!** 🎉

أي استفسار؟ افتح GitHub Issue أو تواصل معي! 💬

