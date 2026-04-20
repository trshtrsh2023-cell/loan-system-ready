# 🚀 دليل النشر الشامل

## نشر على Vercel (الطريقة الأسهل)

---

## المرحلة 1️⃣: التحضير المحلي

### 1. تحقق من أن كل شيء يعمل محلياً

```bash
npm run dev
# اختبر http://localhost:3000

npm run build
# يجب ينجح بدون أخطاء
```

### 2. تأكد من عدم وجود ملفات حساسة

```bash
# لا تنسى .env.local (سحري!)
ls -la .env.local
# ✅ يجب موجود

# تحقق من .gitignore
cat .gitignore | grep -E "env|node_modules"
# ✅ يجب يتضمنها
```

### 3. الـ Git

```bash
git status
# تأكد من عدم وجود ملفات غير معنونة يجب تجاهلها

git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## المرحلة 2️⃣: إعداد Vercel

### 1. إنشاء حساب Vercel

- اذهب إلى [vercel.com](https://vercel.com)
- اضغط "Sign Up"
- استخدم GitHub account (الأسهل)

### 2. ربط Repo

```
Vercel Dashboard → Add New → Project
↓
اختر GitHub account
↓
اختر repository: loan-system
↓
اضغط "Import"
```

### 3. إعدادات المشروع

```
Framework: Next.js (auto-detected)
Root Directory: ./ (default)
Build Command: npm run build (auto)
Output Directory: .next (auto)
Environment Variables: (في الخطوة التالية)
```

---

## المرحلة 3️⃣: متغيرات البيئة

### في Vercel Dashboard:

```
Project Settings → Environment Variables
↓
أضف هذه المتغيرات:
```

| المتغير | القيمة |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` |
| `JWT_SECRET` | `your-very-long-secure-secret` |
| `ADMIN_INIT_SECRET` | `your-admin-secret` |

⚠️ **تحذير:** لا تشاركها مع أحد!

### خطوات إضافة المتغيرات:

1. اضغط "Add New"
2. اكتب اسم المتغير
3. الصق القيمة
4. اختر "Production" و "Preview"
5. اضغط "Save"

---

## المرحلة 4️⃣: النشر

### الخيار 1: Auto Deploy (الأفضل)

بعد إضافة المتغيرات:
```
Deployments → Redeploy
```

سينشر تلقائياً!

### الخيار 2: Manual Deploy

```bash
# في Terminal
git push origin main
# سينشر تلقائياً عند push
```

---

## المرحلة 5️⃣: إنشاء المدير الأول

بعد النشر الناجح:

```bash
# الحصول على الرابط
https://your-project.vercel.app

# إنشاء المدير
curl -X POST https://your-project.vercel.app/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "admin-setup-secret",
    "username": "admin",
    "password": "your-secure-password"
  }'
```

---

## المرحلة 6️⃣: التحقق

### ✅ اختبرات مهمة:

1. **الصفحة الرئيسية:**
   ```
   https://your-project.vercel.app
   يجب تشوف صفحة التسجيل
   ```

2. **تسجيل الدخول:**
   ```
   دخول بـ admin / your-secure-password
   يجب توديك إلى /admin
   ```

3. **الحاسبة:**
   ```
   سجل عميل تجريبي
   وافق عليه من lوحة التحكم
   دخول العميل للحاسبة
   جرّب حساب قرض
   ```

4. **الإعدادات:**
   ```
   غيّر معامل الضرب من 18 إلى 20
   اختبر من حساب عميل (يجب يتغير)
   ```

---

## 🔗 Domain (اختياري)

### ربط Domain خاص بك

**في Vercel:**
```
Project Settings → Domains
↓
أضف domain الخاص بك
↓
تابع التعليمات
```

**في DNS Provider (GoDaddy, Namecheap, إلخ):**
```
أضف CNAME pointing إلى: your-project.vercel.app
```

---

## 📊 المراقبة والتحليل

### Vercel Analytics

```
Settings → Analytics
↓
تفعيل Web Analytics
↓
اعرض الأداء والزيارات
```

### Supabase Logs

```
Supabase Dashboard → Logs
↓
شُف Database queries
↓
استكشف المشاكل
```

---

## 🔒 الأمان في Production

### ✅ Checklist أمان:

- [ ] غيّر `JWT_SECRET` من الافتراضي
- [ ] غيّر `ADMIN_INIT_SECRET`
- [ ] استخدم HTTPS فقط (Vercel يفعله تلقائياً)
- [ ] فعّل 2FA على Vercel و Supabase
- [ ] احمِ البيانات الحساسة
- [ ] سجّل الأنشطة المهمة
- [ ] تحديثات منتظمة للـ dependencies

### تحديث المكتبات:

```bash
npm outdated
npm update
npm audit fix
git push origin main
```

---

## 🚨 استكشاف الأخطاء

### الخطأ: "Build failed"

**الحل:**
```bash
# 1. شُف الـ logs في Vercel
# 2. جرّب Build محلياً
npm run build

# 3. إذا فشل محلياً:
npm install --save-dev typescript
npm run build
```

---

### الخطأ: "Database connection error"

**الحل:**
```
1. تحقق من SUPABASE_SERVICE_ROLE_KEY
2. تحقق من CORS في Supabase
3. Supabase → Settings → API
4. أضف your-domain.vercel.app
```

---

### الخطأ: "Unauthorized 401"

**الحل:**
```
1. تحقق من JWT_SECRET
2. تأكد من نفس القيمة محلياً و Production
3. امسح الـ cookies وسجل الدخول مرة أخرى
```

---

## 📈 التوسع والأداء

### إذا كانت الأداء بطيئة:

1. **استخدم Database Connection Pool:**
   - Supabase → Settings → Pooling
   - Mode: Transaction
   - Pool size: 15

2. **أضف Cache:**
   ```typescript
   // في API routes
   res.setHeader('Cache-Control', 'public, s-maxage=3600')
   ```

3. **اختبر الأداء:**
   - Vercel Analytics
   - Google Lighthouse
   - WebPageTest

---

## 🔄 Continuous Integration/Deployment (CI/CD)

### GitHub Actions (اختياري)

أنشئ `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm run lint
```

---

## 📋 Deployment Checklist

```
قبل النشر:
[ ] جميع الاختبارات تمر محلياً
[ ] لا توجد console errors
[ ] .env.local ملأ صحيح
[ ] git push نجح
[ ] لا توجد ملفات حساسة في repo

أثناء النشر:
[ ] جميع متغيرات Vercel موجودة
[ ] Build نجح
[ ] Deploy أكتمل

بعد النشر:
[ ] اختبر http://example.com
[ ] سجل دخول تعمل
[ ] الحاسبة تعمل
[ ] لوحة التحكم تعمل
[ ] لا توجد errors في console
[ ] الأداء مقبول

الصيانة:
[ ] فعّل monitoring
[ ] حدّد backup schedule
[ ] خطة للـ updates
```

---

## 📞 الدعم

### إذا واجهت مشكلة:

1. **اقرأ:**
   - TROUBLESHOOTING.md
   - Vercel Docs
   - Supabase Docs

2. **جرّب:**
   - Redeploy من Vercel
   - Rebuild locally
   - امسح الـ cache

3. **اطلب مساعدة:**
   - Vercel Support
   - Supabase Community
   - GitHub Issues

---

## ✅ النتيجة النهائية

```
🎉 Congratulations! 🎉

موقعك موجود على:
https://your-domain.vercel.app

مرتبط بـ:
- Supabase (قاعدة البيانات)
- Vercel (الاستضافة)
- GitHub (الكود)

جاهز للعملاء الحقيقيين! 🚀
```

---

**استمتع بالنشر! 🎊**

