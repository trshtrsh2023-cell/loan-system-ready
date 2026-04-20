# 📡 توثيق API الكامل

## نظرة عامة

النظام يوفر 9 API endpoints لإدارة المستخدمين والحسابات والإعدادات.

---

## 🔐 المصادقة

جميع الطلبات يجب أن تتضمن:
- **Header:** `Content-Type: application/json`
- **Cookie:** `auth_token` (للطلبات المحمية)

### نموذج الرد (Response)

النجاح:
```json
{
  "ok": true,
  "data": { ... }
}
```

الفشل:
```json
{
  "error": "رسالة الخطأ",
  "status": 400
}
```

---

## 1️⃣ المصادقة (Auth Endpoints)

### POST /api/auth/register

**وصف:** تسجيل مستخدم جديد

**الطلب:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ahmed123",
    "password": "password123",
    "full_name": "أحمد محمد",
    "phone": "0501234567"
  }'
```

**الرد (النجاح - 201):**
```json
{
  "request_id": "REQ-ABCD1234-XYZ"
}
```

**الرد (الفشل - 400):**
```json
{
  "error": "اسم المستخدم مستخدم مسبقاً",
  "status": 400
}
```

**المتطلبات:**
- `username` (3+ أحرف، فريد)
- `password` (6+ أحرف)
- `full_name` (اختياري)
- `phone` (اختياري)

---

### POST /api/auth/login

**وصف:** تسجيل دخول

**الطلب:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**الرد (النجاح - 200):**
```json
{
  "role": "admin",
  "status": "approved"
}
```

يتم حفظ `auth_token` تلقائياً في cookies.

**الرد (الفشل - 401):**
```json
{
  "error": "اسم المستخدم أو كلمة المرور غير صحيحة"
}
```

---

### POST /api/auth/logout

**وصف:** تسجيل خروج

**الطلب:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json"
```

**الرد (200):**
```json
{
  "ok": true
}
```

يتم حذف `auth_token` من cookies.

---

## 2️⃣ البنوك (Public Endpoints)

### GET /api/banks

**وصف:** قائمة البنوك المفعّلة (بدون حماية)

**الطلب:**
```bash
curl http://localhost:3000/api/banks
```

**الرد (200):**
```json
{
  "banks": [
    {
      "bank_key": "ahli",
      "name": "البنك الأهلي",
      "personal_multiplier": 18,
      "deduction_rate": 0.33,
      "annual_rate": 2.5,
      "max_period_months": 60,
      "sakani_low_threshold": 10000,
      "sakani_low_support": 150000,
      "sakani_high_support": 100000,
      "enabled": true
    },
    ...
  ]
}
```

---

## 3️⃣ إدارة المستخدمين (Admin Endpoints)

### GET /api/admin/users

**الحماية:** Admin فقط

**وصف:** قائمة جميع المستخدمين

**الطلب:**
```bash
curl http://localhost:3000/api/admin/users \
  -H "Cookie: auth_token=..."
```

**الرد (200):**
```json
{
  "users": [
    {
      "id": "uuid-123",
      "username": "ahmed123",
      "full_name": "أحمد محمد",
      "phone": "0501234567",
      "request_id": "REQ-ABCD-XYZ",
      "status": "pending",
      "bank_choice": null,
      "created_at": "2024-04-19T10:30:00Z",
      "approved_at": null
    },
    ...
  ]
}
```

**Query Parameters (اختياري):**
- `status` - "pending" | "approved" | "rejected"
- `limit` - عدد النتائج (default: 100)
- `offset` - الإزاحة (default: 0)

---

### PATCH /api/admin/users/{id}

**الحماية:** Admin فقط

**وصف:** تحديث حالة المستخدم (موافقة/رفض)

**الطلب:**
```bash
curl -X PATCH http://localhost:3000/api/admin/users/uuid-123 \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=..." \
  -d '{
    "status": "approved"
  }'
```

**الرد (200):**
```json
{
  "user": {
    "id": "uuid-123",
    "status": "approved",
    "approved_at": "2024-04-19T10:45:00Z",
    ...
  }
}
```

**المعاملات:**
- `status`: "approved" | "rejected" | "pending"

---

## 4️⃣ إعدادات البنوك (Admin Endpoints)

### GET /api/admin/settings

**الحماية:** Admin فقط

**وصف:** قائمة إعدادات جميع البنوك

**الطلب:**
```bash
curl http://localhost:3000/api/admin/settings \
  -H "Cookie: auth_token=..."
```

**الرد (200):**
```json
{
  "banks": [
    {
      "id": "uuid-456",
      "bank_key": "ahli",
      "name": "البنك الأهلي",
      "personal_multiplier": 18,
      "deduction_rate": 0.33,
      "annual_rate": 2.5,
      "max_period_months": 60,
      "sakani_low_threshold": 10000,
      "sakani_low_support": 150000,
      "sakani_high_support": 100000,
      "enabled": true,
      "updated_at": "2024-04-19T10:00:00Z"
    },
    ...
  ]
}
```

---

### PATCH /api/admin/settings/{bank_key}

**الحماية:** Admin فقط

**وصف:** تحديث إعدادات بنك محدد

**الطلب:**
```bash
curl -X PATCH http://localhost:3000/api/admin/settings/ahli \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=..." \
  -d '{
    "personal_multiplier": 20,
    "annual_rate": 2.7,
    "sakani_low_support": 200000,
    "enabled": true
  }'
```

**الرد (200):**
```json
{
  "bank": {
    "bank_key": "ahli",
    "personal_multiplier": 20,
    "annual_rate": 2.7,
    "sakani_low_support": 200000,
    "enabled": true,
    "updated_at": "2024-04-19T11:00:00Z"
  }
}
```

**الحقول القابلة للتحديث:**
- `personal_multiplier` (عدد)
- `deduction_rate` (عشري)
- `annual_rate` (عشري)
- `max_period_months` (عدد)
- `sakani_low_threshold` (عدد)
- `sakani_low_support` (عدد)
- `sakani_high_support` (عدد)
- `enabled` (boolean)

---

## 5️⃣ إدارة النظام (Admin Endpoints)

### POST /api/admin/init

**الحماية:** بدون (run once فقط)

**وصف:** إنشاء حساب المدير الأول

**الطلب:**
```bash
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "admin-setup-secret",
    "username": "admin",
    "password": "admin123"
  }'
```

**الرد (200):**
```json
{
  "ok": true,
  "message": "تم إنشاء حساب المدير بنجاح"
}
```

**الرد (الفشل - 403):**
```json
{
  "error": "غير مصرح",
  "status": 403
}
```

⚠️ **تحذير:** يمكن تشغيلها مرة واحدة فقط!

---

## 🧪 أمثلة عملية

### مثال 1: تسجيل عميل وموافقة عليه

```bash
# 1. تسجيل عميل
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ali123",
    "password": "password123",
    "full_name": "علي أحمد"
  }'

# النتيجة:
# {"request_id": "REQ-ABC123"}

# 2. دخول كمدير
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 3. قائمة المستخدمين
curl http://localhost:3000/api/admin/users

# 4. موافقة على ali123
curl -X PATCH http://localhost:3000/api/admin/users/uuid-ali \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# 5. ali123 يمكنه دخول الحاسبة الآن
```

---

### مثال 2: تغيير معامل الضرب

```bash
# 1. دخول كمدير
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }' \
  -c - | grep auth_token | awk '{print $7}')

# 2. تغيير معامل الأهلي من 18 إلى 20
curl -X PATCH http://localhost:3000/api/admin/settings/ahli \
  -H "Content-Type: application/json" \
  -b "auth_token=$TOKEN" \
  -d '{
    "personal_multiplier": 20
  }'

# النتيجة:
# {"bank": {"personal_multiplier": 20, ...}}
```

---

## ⚙️ Postman Collection

### اختبر API باستخدام Postman

```json
{
  "info": {
    "name": "Loan Calculator API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\"username\": \"test\", \"password\": \"test123\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"username\": \"admin\", \"password\": \"admin123\"}"
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🔒 الأخطاء الشائعة والحلول

| الخطأ | السبب | الحل |
|-------|-------|------|
| 401 Unauthorized | لا token أو token منتهي | سجل الدخول مرة أخرى |
| 403 Forbidden | ليس مدير | استخدم حساب admin |
| 400 Bad Request | بيانات خاطئة | تحقق من JSON |
| 404 Not Found | الـ endpoint خاطئ | تحقق من الرابط |
| 500 Server Error | خطأ في السيرفر | اعرض logs |

---

## 📊 النماذج (Schemas)

### User
```typescript
{
  id: string (UUID)
  username: string
  password_hash: string
  request_id: string
  status: "pending" | "approved" | "rejected"
  role: "user" | "admin"
  full_name?: string
  phone?: string
  bank_choice?: string
  created_at: timestamp
  approved_at?: timestamp
}
```

### BankSettings
```typescript
{
  id: string (UUID)
  bank_key: string
  name: string
  personal_multiplier: number
  deduction_rate: number (0-1)
  annual_rate: number (%)
  max_period_months: number
  sakani_low_threshold: number
  sakani_low_support: number
  sakani_high_support: number
  enabled: boolean
  updated_at: timestamp
}
```

---

**للمزيد:** اقرأ README.md و SETUP_GUIDE.md

