# 🛠️ دليل الصيانة والنسخ الاحتياطية

## جدول الصيانة

### يومي

```bash
# 1. تفقد الـ Logs
Supabase Dashboard → Logs
# شُف: Errors, Warnings, Slow queries

# 2. مراقبة الأداء
Vercel Dashboard → Analytics
# شُف: LCP, FID, response times

# 3. تفقد Failed Logins
SELECT * FROM logs WHERE event = 'login_failed'
LIMIT 100;
```

### أسبوعي

```bash
# 1. Backup قاعدة البيانات (تلقائي من Supabase)
# لكن تحقق:
Supabase Dashboard → Backups

# 2. تحديث المكتبات
npm outdated
npm update

# 3. تفقد الـ Usage
Vercel → Usage & Billing
Supabase → Billing → Usage
```

### شهري

```bash
# 1. تدقيق أمني
npm audit

# 2. تحديث كلمات المرور الإدارية
# غيّر كلمة المرور من /admin

# 3. استعراض الـ Permissions
SELECT username, role, status FROM users;

# 4. نسخة احتياطية يدوية
# اسفل في قسم Backups
```

---

## النسخ الاحتياطية

### Supabase Automatic Backups

✅ **Supabase يعمل backups تلقائية:**

```
Pro Plan:
- Daily backups (7 days)
- 1 backup per hour (7 days)

Free Plan:
- Weekly backups
```

### Manual Backup

```bash
# 1. في Supabase Dashboard
# Settings → Backups
# اضغط "Create backup"

# 2. تحميل الـ Backup
# اضغط على backup
# اضغط "Download"

# 3. احفظ في مكان آمن
# Google Drive, Dropbox, etc
```

### Backup Schedule

```
يوم | التفاصيل
----|----------
الأحد | Backup كامل
الأربعاء | Backup كامل
الجمعة | Backup كامل
```

---

## استعادة (Restore) البيانات

### إذا حدثت مشكلة:

```
1. حدد وقت المشكلة
2. اذهب إلى Backups
3. اختر backup قبل الوقت
4. اضغط "Restore"
5. تأكد من العملية
```

### خطوات Restore:

```bash
# 1. في Supabase Dashboard
Backups → اختر backup
↓
اضغط "Restore"
↓
تأكد من التحذيرات
↓
اضغط "Restore database"
```

⚠️ **تحذير:** جميع البيانات بعد وقت الـ Backup ستُحذف!

---

## المراقبة والتنبيهات

### Vercel Alerts

```
Project Settings → Alerts
↓
أضف Alerts لـ:
- Build failures
- High latency
- Errors
```

### Supabase Alerts

```
Supabase → Settings → Notifications
↓
فعّل:
- Database size warnings
- Replication lag alerts
- Failed API requests
```

### Log Monitoring

```bash
# في Supabase:
Logs → اختر Filter
↓
شُف:
- 5xx Errors
- Slow queries (>1s)
- Unauthorized attempts
```

---

## صيانة قاعدة البيانات

### تنظيف البيانات

```sql
-- احذف الحسابات المرفوضة قديمة (> 3 أشهر)
DELETE FROM users 
WHERE status = 'rejected' 
AND created_at < NOW() - INTERVAL '3 months';

-- احذف الجلسات المنتهية
DELETE FROM sessions 
WHERE expires_at < NOW();

-- احذف الـ logs القديمة
DELETE FROM logs 
WHERE created_at < NOW() - INTERVAL '6 months';
```

### تحسين الأداء

```sql
-- تحليل الـ Database
ANALYZE;

-- إعادة الـ Indexes
REINDEX INDEX idx_users_status;

-- تحديث الـ Statistics
VACUUM ANALYZE;
```

### التحقق من الصحة

```sql
-- تفقد الـ Foreign Keys
SELECT constraint_name, table_name 
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY';

-- تفقد الـ Duplicates
SELECT username, COUNT(*) 
FROM users 
GROUP BY username 
HAVING COUNT(*) > 1;
```

---

## تحديثات المكتبات

### فحص التحديثات

```bash
npm outdated
```

يُظهر:
```
Package     Current Wanted Latest
next        14.0.0  14.0.0 14.2.0
supabase-js  2.30.0  2.30.0  2.39.0
```

### تحديث آمن

```bash
# 1. اختبر محلياً
npm update
npm run build
npm run dev
# اختبر جميع الـ features

# 2. تحديث في الـ repo
git add package*.json
git commit -m "chore: update dependencies"
git push

# 3. Vercel سيعيد Build تلقائياً
```

### تحديث خطير

```bash
# للـ Major updates فقط:
npm install next@latest
npm install supabase@latest

# اختبر بدقة!
npm run build
npm run dev
```

---

## سجل التغييرات

احتفظ بـ `CHANGELOG.md`:

```markdown
# Changelog

## [1.1.0] - 2024-05-15
### Added
- معامل الضرب الديناميكي

### Fixed
- مشكلة الحساب للراتب السالب

### Changed
- تحسين الأداء

---

## [1.0.0] - 2024-04-19
### Initial Release
- النسخة الأولى من النظام
```

---

## رقابة الأداء

### Metrics المهمة

| Metric | الحد الأمثل | التحذير |
|--------|-----------|---------|
| FCP | < 1.8s | > 3s |
| LCP | < 2.5s | > 4s |
| CLS | < 0.1 | > 0.25 |
| TTI | < 3.8s | > 5s |
| Response Time | < 200ms | > 500ms |

### مراجعة أسبوعية

```
Week 1:
[ ] FCP average: X ms
[ ] LCP average: X ms
[ ] Error rate: X%
[ ] Database response: X ms

Week 2:
[ ] نفس الفحص
[ ] مقارنة مع الأسبوع السابق
[ ] خطة التحسينات
```

---

## استكشاف المشاكل العامة

### مشكلة: Database عطلان

```sql
-- تحقق من الحالة:
SELECT NOW();

-- تحقق من الـ Connections:
SELECT count(*) FROM pg_stat_activity;

-- أعد تشغيل Connection:
-- في Supabase Settings
```

### مشكلة: Deploy فاشل

```bash
# 1. شُف الـ logs:
Vercel → Deployments → اختر Deploy

# 2. حاول إعادة Deploy:
Vercel → Redeploy

# 3. تحقق من البناء محلياً:
npm run build
```

### مشكلة: Performance بطيء

```bash
# 1. فعّل Caching
# 2. أضف Database Indexes
# 3. استخدم Connection Pooling
# 4. قلل حجم الـ bundle
```

---

## خطة الطوارئ

### إذا واجهت عطل:

```
الخطوة 1: تقييم (5 دقائق)
- ما المشكلة بالضبط؟
- كم عدد المستخدمين المتأثرين؟
- هل النسخ الاحتياطية موجودة؟

الخطوة 2: إبلاغ (معلومات)
- أخبر المستخدمين بالحالة
- اعطِ توقع للإصلاح

الخطوة 3: إصلاح
- اعطّل العميل (paused)
- استعد من backup
- اختبر الاستعادة

الخطوة 4: تعافي
- أعد تفعيل
- تحقق من جميع الـ features
- رسالة شكر للمستخدمين

الخطوة 5: تقرير
- حلل السبب الجذري
- خطة منع المشاكل
```

---

## قائمة فحص شهرية

```
[ ] Backups موجودة وتعمل
[ ] Dependencies محدّثة
[ ] Security audit اكتمل
[ ] Performance metrics طبيعية
[ ] الـ Logs نظيفة من الأخطاء
[ ] User permissions صحيحة
[ ] Database health جيد
[ ] Monitoring alerts فعّالة
[ ] Documentation محدّثة
[ ] استعادة البيانات اُختبرت
```

---

## استدعاء الدعم

إذا احتجت إلى مساعدة:

### Vercel Support
```
https://vercel.com/support
```

### Supabase Support
```
https://supabase.io/support
Discord: https://discord.gg/supabase
```

### GitHub
```
Issue tracker للمشاكل والـ features
```

---

**الصيانة الدورية = أداء أفضل! 🛠️**

