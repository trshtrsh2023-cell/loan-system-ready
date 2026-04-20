# 🔒 قائمة أمان شاملة

## ✅ قبل الإطلاق

### متغيرات البيئة

- [ ] `JWT_SECRET` (min 32 حرف عشوائي)
- [ ] `ADMIN_INIT_SECRET` (قيمة قوية)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (محفوظ آمن)
- [ ] لا توجد أسرار في `.env.local` المرفوع

```bash
# التحقق:
grep -E "SECRET|PASSWORD|KEY" .env.local
# يجب تكون قيم قوية
```

### كلمات المرور

- [ ] كلمة مرور المدير الأول (16+ حرف)
- [ ] لا توجد كلمات مرور افتراضية
- [ ] تفعيل 2FA على جميع الحسابات

```bash
# مثال كلمة مرور قوية:
# Tr0p!c@lFruit#2024$SecurePass
```

### Supabase Configuration

- [ ] Row Level Security (RLS) مفعّل
- [ ] جميع الجداول لها policies
- [ ] CORS محدد لـ domain الخاص بك فقط

```sql
-- في Supabase SQL Editor:
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public';

-- تحقق أن جميع الجداول لها RLS:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Vercel Configuration

- [ ] تفعيل 2FA على حساب Vercel
- [ ] Preview Deployments محمية بـ password
- [ ] Allowed domains محدد

```
Vercel → Project Settings → Preview Deployments
↓
عدّل "Preview Deployment Protection"
```

---

## ✅ أثناء العملية

### API Security

- [ ] جميع الـ sensitive endpoints محمية بـ auth
- [ ] Rate limiting على الـ endpoints
- [ ] CORS صحيح

```typescript
// في API route:
if (!user || user.role !== 'admin') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Database Security

- [ ] لا توجد passwords في الـ logs
- [ ] حذف الـ sensitive data بشكل آمن
- [ ] Backups منتظمة

```sql
-- مثال: حذف آمن
DELETE FROM users WHERE id = 'xxx' 
RETURNING id; -- تأكد من الحذف
```

### Secrets Management

- [ ] لا تكشف الـ keys في console
- [ ] استخدم environment variables فقط
- [ ] rotate keys بشكل دوري

```bash
# ❌ خطير:
console.log(process.env.JWT_SECRET)

# ✅ آمن:
const secret = process.env.JWT_SECRET!
// استخدمه بدون print
```

---

## ✅ OWASP Top 10

### 1. Injection

```typescript
// ❌ خطير:
const query = `SELECT * FROM users WHERE username = '${username}'`

// ✅ آمن:
const { data } = await db
  .from('users')
  .select('*')
  .eq('username', username)
```

### 2. Broken Authentication

```typescript
// ✅ استخدم JWT مع httpOnly
res.cookies.set('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 // 7 days
})
```

### 3. Sensitive Data Exposure

- [ ] لا تُرسل كلمات مرور في الـ response
- [ ] استخدم HTTPS فقط
- [ ] Encrypt حقول حساسة

```typescript
// ❌ خطير:
return { user: { username, password_hash } }

// ✅ آمن:
return { user: { username, id } }
```

### 4. XML External Entities (XXE)

لا ينطبق (لا نستخدم XML)

### 5. Broken Access Control

```typescript
// ✅ تحقق من الـ permissions:
if (user.role !== 'admin') return unauthorized()
if (user.id !== ownerId) return forbidden()
```

### 6. Security Misconfiguration

- [ ] تحديث المكتبات منتظماً
- [ ] تعطيل Features غير المستخدمة
- [ ] استخدم أحدث الإصدارات

```bash
npm audit
npm update
npm audit fix
```

### 7. Cross-Site Scripting (XSS)

```typescript
// ✅ React يعزل XSS تلقائياً
// لكن احذر من dangerouslySetInnerHTML
<div>{userInput}</div> // آمن

// ❌ خطير:
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 8. Insecure Deserialization

```typescript
// ✅ validate JSON:
const data = JSON.parse(input)
// استخدم zod أو validation library

// ❌ خطير:
eval(userInput)
```

### 9. Using Components with Known Vulnerabilities

```bash
npm audit
# اصلح جميع vulnerabilities
npm audit fix --force
```

### 10. Insufficient Logging & Monitoring

```typescript
// ✅ سجّل العمليات الحساسة:
console.log(`User ${userId} approved ${requestId}`)
// أو استخدم external logging service
```

---

## ✅ Checklist أمان شهري

### الأسبوع الأول:

- [ ] تحديث المكتبات
- [ ] `npm audit fix`
- [ ] مراجعة الـ logs للأخطاء الغريبة

### الأسبوع الثاني:

- [ ] backup قاعدة البيانات
- [ ] اختبر عملية الـ restore
- [ ] مراجعة الـ access logs

### الأسبوع الثالث:

- [ ] تحديث جميع كلمات المرور الإدارية
- [ ] تحقق من الـ failed login attempts
- [ ] مراجعة user permissions

### الأسبوع الرابع:

- [ ] اختبر security scan أدوات
- [ ] راجع encryption settings
- [ ] خطة للتهديدات المحتملة

---

## 🚨 استجابة الحوادث

### إذا تعرضت للاختراق:

```
1. ISOLATE: قطّع الوصول فوراً
2. ASSESS: حدد ما تم الوصول إليه
3. ERADICATE: أزل التهديد
4. RECOVER: استرجع النظام
5. DOCUMENT: سجّل كل شيء
```

### خطوات سريعة:

```bash
# 1. غيّر جميع الـ secrets
# 2. أعد deploy
# 3. فعّل 2FA لجميع الحسابات
# 4. مراجعة الـ audit logs
# 5. تواصل مع المستخدمين إن لزم
```

---

## 📝 نماذج الأمان

### Authentication Token

```typescript
// JWT يجب يتضمن:
{
  sub: 'user-id',        // subject
  iat: 1234567890,       // issued at
  exp: 1234567890 + 7d,  // expiry
  role: 'admin',         // role
  // لا تضف: password, sensitive data
}
```

### Password Storage

```bash
# استخدم bcryptjs دائماً:
bcrypt.hash(password, 10)  // ✅ آمن
bcrypt.compare(input, hash) // ✅ تحقق
```

### Rate Limiting

```typescript
// مثال: 100 طلب / ساعة
const rateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100 // limit each IP to 100 requests per windowMs
}
```

---

## 🔗 الموارد الأمنية

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/basic-features/security)
- [Supabase Security](https://supabase.io/docs/guides/security)

---

## 📋 قائمة التفتيش النهائية

```
قبل الإطلاق:
[ ] JWT_SECRET قوي (32+ حرف)
[ ] ADMIN_INIT_SECRET غير معروف
[ ] RLS مفعّل على جميع الجداول
[ ] CORS محدد
[ ] 2FA على جميع الحسابات
[ ] HTTPS فقط
[ ] لا أسرار في الكود
[ ] Backups يعملون

الإنتاج:
[ ] Monitoring مفعّل
[ ] Alerts مضبوطة
[ ] Logs محفوظة
[ ] Updates منتظمة
[ ] Security audits دوري
```

---

**الأمان أولاً! 🔒**

