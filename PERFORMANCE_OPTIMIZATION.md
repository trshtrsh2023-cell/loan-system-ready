# ⚡ دليل تحسين الأداء

## قياس الأداء الحالي

### 1. Vercel Analytics

```
Vercel Dashboard → Analytics
↓
شُف الـ metrics:
- First Input Delay (FID)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
```

### 2. Lighthouse (Google)

```bash
# في DevTools:
1. اضغط F12
2. اذهب إلى Lighthouse
3. اضغط "Generate report"
```

---

## تحسينات سريعة

### 1. تفعيل Compression

في `next.config.js`:
```javascript
module.exports = {
  compress: true,
  poweredByHeader: false,
}
```

### 2. تحسين الصور

في `app/globals.css`:
```css
img {
  max-width: 100%;
  height: auto;
}
```

### 3. Cache Headers

في API routes:
```typescript
res.setHeader(
  'Cache-Control',
  'public, s-maxage=3600, stale-while-revalidate=86400'
)
```

---

## تحسينات Supabase

### 1. Connection Pooling

```
Supabase → Settings → Pooling
Mode: Transaction
Pool size: 15
```

### 2. Indexes

```sql
-- في Supabase SQL Editor:
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_bank_settings_key ON bank_settings(bank_key);
```

### 3. Query Optimization

قبل:
```typescript
const users = await db.from('users').select('*')
```

بعد (يختار الأعمدة المطلوبة فقط):
```typescript
const users = await db
  .from('users')
  .select('id, username, status, created_at')
```

---

## تحسينات الواجهة الأمامية

### 1. Dynamic Imports

```typescript
// قبل:
import Admin from '@/app/admin/page'

// بعد (lazy loading):
const Admin = dynamic(() => import('@/app/admin/page'), {
  loading: () => <div>جاري التحميل...</div>
})
```

### 2. Code Splitting

Next.js يفعله تلقائياً! لكن تأكد من:
```bash
npm run build
# شُف .next/static لحجم الـ bundles
```

### 3. Image Optimization

```typescript
import Image from 'next/image'

// بدل <img>
<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  priority
/>
```

---

## تحسينات الـ Database

### 1. Connection Pooling

```
Supabase Dashboard:
→ Settings
→ Pooling
→ Enable
→ Pool size: 15-20
```

### 2. Row Level Security (RLS)

```sql
-- تفعيل RLS:
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy:
CREATE POLICY "Users can see own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

### 3. Query Caching

```typescript
// مثال: Cache استعلام البنوك
const getBanks = async () => {
  const cacheKey = 'banks_list'
  
  // تحقق من الـ cache
  const cached = await redis.get(cacheKey)
  if (cached) return cached
  
  // إذا لا → اطلب من DB
  const banks = await db.from('bank_settings').select('*')
  
  // احفظ في cache لـ 1 ساعة
  await redis.setex(cacheKey, 3600, JSON.stringify(banks))
  
  return banks
}
```

---

## تحسينات الشبكة

### 1. CDN

Vercel يستخدم Cloudflare CDN تلقائياً!

### 2. HTTP/2 Push

في `next.config.js`:
```javascript
module.exports = {
  experimental: {
    optimizePackageImports: ['@/components']
  }
}
```

### 3. Gzip Compression

```bash
# التحقق:
curl -I https://your-domain.com
# شُف: Content-Encoding: gzip
```

---

## Monitoring والتنبيهات

### 1. Vercel Analytics

```
Settings → Analytics
↓
شغّل Web Analytics
```

### 2. Supabase Logs

```
Supabase Dashboard → Logs
↓
شُف:
- Slow queries
- Errors
- Database usage
```

### 3. Real User Monitoring (RUM)

```javascript
// في app/layout.tsx
if (process.env.NODE_ENV === 'production') {
  // أضف analytics script
}
```

---

## Load Testing

### استخدام Apache Bench

```bash
# اختبر 1000 طلب
ab -n 1000 -c 10 https://your-domain.com

# النتائج:
# Requests per second: X
# Time per request: Y ms
```

### استخدام Artillery

```bash
npm install -g artillery

# أنشئ config
cat > load-test.yml << 'YAML'
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Calculator'
    flow:
      - get:
          url: '/api/banks'
YAML

artillery run load-test.yml
```

---

## قائمة تحسين الأداء

- [ ] فعّل Vercel Analytics
- [ ] اضغط Cache Headers
- [ ] أضف Database Indexes
- [ ] فعّل Connection Pooling
- [ ] استخدم Dynamic Imports
- [ ] اختبر مع Lighthouse
- [ ] مراقبة Slow Queries
- [ ] استخدم CDN للـ Static Assets

---

## النتيجة المتوقعة

| المتوازن | قبل | بعد |
|---------|-----|-----|
| FCP | 2s | 0.8s |
| LCP | 4s | 1.5s |
| CLS | 0.2 | 0.05 |
| TTI | 5s | 2s |

