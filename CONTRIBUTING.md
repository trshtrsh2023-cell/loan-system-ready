# 🤝 دليل المساهمة

شكراً لك على اهتمامك بالمساهمة في نظام حاسبة القروض البنكية! 🎉

---

## 🎯 قبل البدء

### اقرأ هذه الملفات أولاً:

```
README.md              ← الدليل الأساسي
FEATURE_ROADMAP.md    ← الميزات المخطط لها
CODE_OF_CONDUCT.md    ← قواعد السلوك (إن وجد)
```

### تأكد من:

```
[ ] لديك Node.js 18+
[ ] لديك حساب GitHub
[ ] لديك Git مثبت
[ ] قرأت LICENSE
```

---

## 🔍 العثور على مهمة تناسبك

### 1. ابحث في GitHub Issues:

```
Issues → التصفية حسب:
- good first issue (للمبتدئين)
- help wanted (يحتاج مساعدة)
- your language (اللغة التي تفضلها)
```

### 2. اختر من Feature Roadmap:

```
FEATURE_ROADMAP.md
↓
اختر feature من أولويات الإصدار التالي
```

### 3. أبلغ عن bug:

```
واجهت مشكلة؟
→ افتح Issue جديد
→ اشرح المشكلة بوضوح
→ أضف خطوات إعادة الإنتاج
```

---

## 💻 إعداد بيئة التطوير

### 1. Fork الـ Repository

```bash
# في GitHub
Press "Fork" button
```

### 2. Clone المشروع

```bash
git clone https://github.com/YOUR_USERNAME/loan-system.git
cd loan-system
```

### 3. أضف Upstream

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/loan-system.git
git fetch upstream
```

### 4. أنشئ Branch جديد

```bash
# لـ feature جديد:
git checkout -b feature/feature-name

# لـ bugfix:
git checkout -b fix/bug-name

# لـ documentation:
git checkout -b docs/doc-name
```

### 5. ثبّت المكتبات

```bash
npm install
```

### 6. إعداد البيئة

```bash
cp .env.local.example .env.local
# ملأ بيانات Supabase
```

### 7. شغّل المشروع

```bash
npm run dev
# http://localhost:3000
```

---

## 📝 كتابة الكود

### معايير الكود:

```typescript
// ✅ صحيح: واضح ومقروء
const calculateLoan = (salary: number, multiplier: number): number => {
  return Math.floor(salary * multiplier)
}

// ❌ خاطئ: غامض وغير واضح
const calc = (s: any, m: any) => s * m
```

### الاتفاقيات:

```
Variables:
✅ const userName = 'أحمد'     (camelCase)
❌ const user_name = 'أحمد'     (snake_case)

Functions:
✅ const getUserData = () => {}
❌ const get_user_data = () => {}

Classes:
✅ class UserManager {}
❌ class userManager {}

Files:
✅ components/UserProfile.tsx
❌ components/userProfile.tsx
```

### Comments:

```typescript
// ✅ تعليق مفيد
// يقلل المعامل إذا كان المتبقي أقل من 60 شهر
const effectiveMultiplier = monthsToRetirement < 60 
  ? multiplier * (monthsToRetirement / 60) 
  : multiplier

// ❌ تعليق غير مفيد
// الضرب
const x = a * b
```

---

## 🧪 الاختبارات

### اكتب اختبارات للميزات الجديدة:

```typescript
// __tests__/calculations.test.ts
import { calculateLoan } from '@/lib/calculations'

describe('calculateLoan', () => {
  it('should calculate basic loan', () => {
    const result = calculateLoan({
      salary: 10000,
      multiplier: 18
    })
    expect(result).toBe(180000)
  })

  it('should reduce multiplier near retirement', () => {
    const result = calculateLoan({
      salary: 10000,
      multiplier: 18,
      monthsToRetirement: 30
    })
    expect(result).toBeLessThan(180000)
  })
})
```

### شغّل الاختبارات:

```bash
npm run test          # تشغيل كل الاختبارات
npm run test:watch   # في وضع المراقبة
npm run test:coverage # Coverage report
```

---

## 📚 التوثيق

### حدّث التوثيق عند إضافة ميزة:

```markdown
# التوثيق الجديد

## الميزة الجديدة

وصف واضح للميزة...

### مثال:

```code
// كود مثال
```
```

### أنواع التوثيق:

```
README.md              ← تحديثات عامة
API_DOCUMENTATION.md   ← endpoints جديدة
CALCULATIONS_GUIDE.md  ← معادلات جديدة
```

---

## 🔧 Commit Messages

### صيغة Commit:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### الأمثلة:

```bash
# ✅ صحيح
git commit -m "feat(calculator): add support for dynamic multiplier"
git commit -m "fix(auth): fix JWT token expiry bug"
git commit -m "docs(setup): update installation steps"

# ❌ خاطئ
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "asdfgh"
```

### الأنواع:

```
feat:     ميزة جديدة
fix:      تصحيح bug
docs:     تحديث توثيق
style:    تنسيق الكود
refactor: إعادة تنظيم
perf:     تحسين الأداء
test:     اختبارات
chore:    تحديثات البناء
```

---

## 🔄 Pull Request

### قبل الإرسال:

```bash
# تحديث من upstream
git fetch upstream
git rebase upstream/main

# بناء واختبار محلي
npm run build
npm run test
npm run lint

# التحقق من الأخطاء
npm run type-check
```

### فتح PR:

```
1. Push إلى fork الخاص بك
   git push origin feature/feature-name

2. في GitHub:
   اضغط "Compare & pull request"

3. املأ نموذج PR:
   - وصف واضح
   - ربط الـ issue (fixes #123)
   - قائمة التغييرات
```

### نموذج PR:

```markdown
## الوصف
وصف واضح للتغييرات...

## نوع التغيير
- [ ] ميزة جديدة
- [ ] تصحيح bug
- [ ] تحديث توثيق
- [ ] تحسين أداء

## الربط
Fixes #(issue number)

## الاختبار
- [ ] اختبرت محلياً
- [ ] أضفت اختبارات
- [ ] لا توجد breaking changes

## التوثيق
- [ ] حدثت README.md
- [ ] حدثت الـ API docs
- [ ] اضفت comments للكود
```

---

## 👀 Code Review

### نصائح للحصول على الموافقة السريعة:

```
✅ الكود نظيف وسهل الفهم
✅ الاختبارات شاملة
✅ التوثيق محدّث
✅ الـ commit messages واضح
✅ لا توجد conflicts
✅ performance محسّنة
✅ أمان معالج بشكل صحيح
```

### الرد على الملاحظات:

```
❌ غير صحيح:
"أنت مخطئ"

✅ صحيح:
"أفهم وجهة نظرك. دعني أعدل كذا..."
```

---

## 🐛 الإبلاغ عن Bugs

### نموذج Bug Report:

```markdown
## الوصف
وصف واضح للمشكلة...

## خطوات إعادة الإنتاج
1. اذهب إلى ...
2. اضغط على ...
3. لاحظ ...

## السلوك المتوقع
...

## السلوك الفعلي
...

## البيئة
- OS: Windows/Mac/Linux
- Browser: Chrome/Safari
- Version: 1.0.0

## Screenshots
(إن أمكن)
```

---

## 📋 قائمة التحقق قبل الإرسال

```
[ ] اقرأت CONTRIBUTING.md بالكامل
[ ] اتبعت معايير الكود
[ ] أضفت اختبارات
[ ] محدثت التوثيق
[ ] لا توجد console errors
[ ] الـ build ناجح
[ ] commits واضحة
[ ] لا توجد conflicts
[ ] اختبرت على متصفحات مختلفة
[ ] التغييرات صغيرة ومركزة
```

---

## 🎓 التعلم

### موارد مفيدة:

```
Git:
- https://git-scm.com/book
- https://github.com/git-tips/tips

TypeScript:
- https://www.typescriptlang.org/docs/

Next.js:
- https://nextjs.org/docs

Supabase:
- https://supabase.io/docs
```

---

## 💬 الاتصال

### كيفية التواصل:

```
GitHub Issues  → للأسئلة التقنية
GitHub Discussions → للأفكار العامة
Email → للأمور الحساسة
```

---

## 🏆 شكر وتقدير

### كل مساهم يحصل على:

```
✨ الاعتراف في contributors
✨ Badge في GitHub
✨ شهادة مساهمة
✨ Priority في Feature Requests
```

---

## ⚖️ الترخيص

بالمساهمة، توافق على أن تكون مساهمتك تحت:

```
MIT License
```

---

**شكراً لمساهمتك! نحن نقدّر كل تحسين! 🙏**

