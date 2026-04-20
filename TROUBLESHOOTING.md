# 🔧 دليل استكشاف الأخطاء والمشاكل

## المشاكل الشائعة والحلول

---

## ❌ مشاكل البدء والتثبيت

### المشكلة: `npm install` يفشل

**الأعراض:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve dependencies
```

**الحل:**
```bash
# حاول مع --legacy-peer-deps
npm install --legacy-peer-deps

# أو حذف package-lock.json وأعد المحاولة
rm package-lock.json
npm install
```

---

### المشكلة: "Cannot find module '@supabase/supabase-js'"

**السبب:** المكتبات لم تُثبّت بشكل صحيح

**الحل:**
```bash
# حذف node_modules والـ lock file
rm -rf node_modules package-lock.json

# إعادة التثبيت
npm install
```

---

### المشكلة: `npm run dev` يرمي خطأ

**الأعراض:**
```
error - Error: ENOENT: no such file or directory
```

**الحل:**
```bash
# تأكد من وجود .env.local
cp .env.local.example .env.local

# ملأ البيانات فيه
# ثم جرّب مرة أخرى
npm run dev
```

---

## ❌ مشاكل الاتصال بـ Supabase

### المشكلة: "Error: Failed to fetch Supabase"

**الأعراض:**
```
XHR failed. Status: CORS error or Failed to fetch
```

**الحلول:**
1. **تحقق من URL:**
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   # يجب يطلع: https://xxxx.supabase.co
   ```

2. **تحقق من الـ Keys:**
   - اذهب إلى Supabase Dashboard
   - Settings → API
   - انسخ المفاتيح بدقة

3. **تحقق من CORS:**
   - في Supabase: Settings → API → CORS
   - أضف localhost:3000

---

### المشكلة: جداول قاعدة البيانات غير موجودة

**الأعراض:**
```
relation "public.users" does not exist
```

**الحل:**
1. في Supabase Dashboard
2. SQL Editor
3. نسخ schema.sql كاملاً
4. الصق وشغّل

```sql
-- تحقق:
SELECT COUNT(*) FROM bank_settings;
-- يجب يطلع: 8
```

---

## ❌ مشاكل المصادقة (Auth)

### المشكلة: "jwt malformed"

**السبب:** JWT_SECRET قصير أو خاطئ

**الحل:**
```bash
# في .env.local
# JWT_SECRET يجب يكون طويلاً (min 32 حرف)
JWT_SECRET=your-very-long-super-secure-random-secret-min-32-characters-!@#$%^&

# ثم:
npm run dev
```

---

### المشكلة: لا يمكن تسجيل الدخول

**الأعراض:**
```
اسم المستخدم أو كلمة المرور غير صحيحة
```

**الحلول:**
1. **تأكد من إنشاء المدير:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/init \
     -H "Content-Type: application/json" \
     -d '{
       "secret": "admin-setup-secret",
       "username": "admin",
       "password": "admin123"
     }'
   ```

2. **تحقق من قاعدة البيانات:**
   ```sql
   SELECT username, role FROM users LIMIT 5;
   ```

3. **امسح الـ cookies:**
   - DevTools → Application → Cookies
   - احذف جميع cookies
   - أعد التحميل

---

### المشكلة: "Undefined auth token"

**السبب:** Cookie لم يُحفظ بشكل صحيح

**الحل:**
```bash
# تأكد من secure=false محلياً
# في lib/auth.ts سيكون secure عند production فقط

# إذا لم تعمل:
# 1. امسح الـ cookies
# 2. أعد تحميل الصفحة
# 3. سجل الدخول مرة أخرى
```

---

## ❌ مشاكل الحاسبة والحسابات

### المشكلة: "القسط الشهري صفر أو خاطئ"

**الأعراض:**
```
installment = 0 أو قيمة غير معقولة
```

**الحلول:**
1. **تحقق من صيغة الحساب:**
   - شغّل في browser console:
   ```javascript
   // اختبر الحسابات يداً
   const salary = 10000
   const multiplier = 18
   const loan = salary * multiplier // 180,000
   ```

2. **تحقق من النسبة:**
   ```javascript
   const annualRate = 2.5
   const monthlyRate = annualRate / 100 / 12
   console.log(monthlyRate) // يجب يكون 0.002083
   ```

3. **تحقق من الفترة:**
   ```javascript
   const monthsToRetirement = 120 // (مثال)
   console.log(monthsToRetirement) // يجب > 0
   ```

---

### المشكلة: النتيجة كبيرة جداً أو صغيرة جداً

**السبب:** معامل الضرب خاطئ

**الحل:**
1. في `/admin/settings`
2. تحقق من معامل الضرب (يجب 18)
3. إذا خاطئ: عدّله
4. الحاسبة ستحتاج تحديث الصفحة

---

### المشكلة: دعم السكني لا يضاف

**الأعراض:**
```
sakaniAmount = 0 حتى لو اخترت "نعم"
```

**الحل:**
1. تحقق من threshold في إعدادات البنك
2. تأكد أن الراتب < 10,000 أو >= حسب القاعدة
3. جرّب مع راتب 5,000 (يجب يضيف 150k)

```javascript
// اختبر يداً:
const salary = 5000
const threshold = 10000
const support = salary < threshold ? 150000 : 100000
console.log(support) // يجب 150000
```

---

## ❌ مشاكل لوحة التحكم

### المشكلة: "غير مصرح - 401"

**السبب:** المستخدم ليس مدير

**الحل:**
1. **تحقق من الـ role:**
   ```sql
   SELECT username, role FROM users WHERE username = 'admin';
   ```

2. **إذا كان user بدل admin:**
   ```sql
   UPDATE users SET role = 'admin' WHERE username = 'admin';
   ```

---

### المشكلة: لا ترى المستخدمين في لوحة التحكم

**الأعراض:**
```
قائمة المستخدمين فارغة
```

**الحل:**
1. **تحقق من قاعدة البيانات:**
   ```sql
   SELECT COUNT(*) FROM users;
   ```

2. **إذا كان الرقم 0:**
   - لم يسجل أحد بعد
   - سجل مستخدم تجريبي

3. **إذا كان الرقم > 1:**
   - قد يكون فلتر النسخة
   - اختر "الكل" من فوق

---

### المشكلة: تعديل الإعدادات لا ينعكس

**الأعراض:**
```
غيّرت x18 إلى x20 لكن الحاسبة ما تتغير
```

**الحل:**
1. **أعد تحميل الصفحة:**
   ```javascript
   location.reload()
   ```

2. **امسح الـ cache:**
   - DevTools → Network → Disable cache
   - أعد التحميل

3. **تحقق من قاعدة البيانات:**
   ```sql
   SELECT personal_multiplier FROM bank_settings 
   WHERE bank_key = 'ahli';
   ```

---

## ❌ مشاكل الأداء والسرعة

### المشكلة: الموقع بطيء جداً

**الحلول:**
1. **تحقق من اتصال Supabase:**
   ```bash
   curl https://xxxx.supabase.co/health
   # يجب يرد 200 OK
   ```

2. **تحقق من DevTools:**
   - Network tab → هل طلبات Supabase بطيئة؟
   - Database queries كبيرة؟

3. **في Production:**
   - استخدم Vercel Analytics
   - تحقق من Server Response Time

---

### المشكلة: "Database query timeout"

**السبب:** query معقد أو جداول كبيرة

**الحل:**
```sql
-- أضف index على الأعمدة المهمة:
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_bank_settings_key ON bank_settings(bank_key);
```

---

## ❌ مشاكل النشر (Vercel)

### المشكلة: Deploy فشل

**الأعراض:**
```
Build failed - Error during build
```

**الحلول:**
1. **تحقق من Build Logs:**
   - Vercel Dashboard → Deployments
   - اضغط على deployment الفاشل
   - اقرأ الأخطاء

2. **تحقق من متغيرات البيئة:**
   - Settings → Environment Variables
   - تأكد من جميع المتغيرات موجودة

3. **تحقق من package.json:**
   ```bash
   npm run build
   # شغّل محلياً أولاً
   ```

---

### المشكلة: "Cannot find module" في Production

**السبب:** الملفات لم تُرفع صحيح

**الحل:**
```bash
# تأكد من .gitignore
cat .gitignore | grep node_modules
# يجب يتضمنها

# ثم:
git add .
git commit -m "fix: add missing files"
git push
```

---

### المشكلة: Supabase لا تعمل في Production

**السبب:** مختلف URL أو Key

**الحل:**
1. **تأكد من المتغيرات:**
   - محلياً: .env.local
   - Production: Vercel Environment Variables

2. **تحقق من CORS:**
   - Supabase → Settings → API → CORS
   - أضف your-domain.vercel.app

---

## ✅ قائمة التحقق (Checklist)

قبل الإطلاق:

- [ ] `npm install` نجح
- [ ] `.env.local` ملأ صحيح
- [ ] `schema.sql` تم تشغيله
- [ ] `/api/admin/init` نجحت
- [ ] `npm run dev` يعمل
- [ ] يمكن تسجيل الدخول
- [ ] الحاسبة تحسب صحيح
- [ ] لوحة التحكم تعمل
- [ ] تعديلات الإعدادات تنعكس

---

## 📞 عندما تعجز عن الحل

### 1. تحقق من الأساسيات
```bash
# هل Node مثبت؟
node --version

# هل npm يعمل؟
npm --version

# هل المشروع موجود؟
ls -la package.json
```

### 2. اقرأ الأخطاء بدقة
- الأخطاء غالباً توضح السبب الدقيق
- Google أول 50 حرف من الخطأ

### 3. جرّب الحلول التقليدية
```bash
# امسح الـ cache
rm -rf .next node_modules

# أعد التثبيت
npm install

# أعد البناء
npm run build

# تشغيل نظيف
npm run dev
```

### 4. اطلب مساعدة
- اقرأ README.md مرة أخرى
- تصفح SETUP_GUIDE.md
- جرّب على جهاز مختلف

---

## 💡 نصائح للتصحيح

```bash
# شُف الأخطاء بسهولة:
NODE_ENV=development npm run dev 2>&1 | tee debug.log

# اختبر API endpoint:
curl -X GET http://localhost:3000/api/banks

# اختبر قاعدة البيانات:
# في Supabase SQL Editor:
SELECT * FROM users LIMIT 1;
```

---

**تذكر: معظم المشاكل بسيطة وحلها سهل! 🎉**

