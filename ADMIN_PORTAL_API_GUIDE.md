# 📋 دليل APIs المشروع - Admin Portal

## 🎯 نظرة عامة على المشروع

**اسم المشروع:** Student Welfare Fund Backend  
**التقنية:** Laravel 12 + PHP 8.2+  
**قاعدة البيانات:** MySQL  
**المصادقة:** Laravel Sanctum  
**الصلاحيات:** Spatie Laravel Permission  

---

## 🏗️ هيكل البيانات الرئيسي

### 📊 الجداول الأساسية:

| الجدول | الوصف | الحقول المهمة |
|--------|--------|----------------|
| `users` | المستخدمون | `id`, `name`, `phone`, `email`, `password`, `settings` |
| `categories` | فئات البرامج | `id`, `name`, `status`, `deleted_at` |
| `programs` | البرامج الخيرية | `id`, `category_id`, `title`, `description`, `status` |
| `campaigns` | الحملات | `id`, `title`, `description`, `goal_amount`, `status` |
| `donations` | التبرعات | `id`, `donation_id`, `program_id`, `campaign_id`, `amount`, `donor_name`, `status`, `user_id` |
| `student_registrations` | طلبات الطلاب | `id`, `registration_id`, `user_id`, `program_id`, `personal_json`, `academic_json`, `financial_json`, `status` |
| `audit_logs` | سجل العمليات | `id`, `user_id`, `action`, `model_type`, `model_id`, `changes` |

---

## 🔐 APIs المصادقة

### بدون مصادقة:
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "اسم المستخدم",
  "phone": "12345678",
  "email": "user@example.com",
  "password": "password123"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "12345678",
  "password": "password123"
}
```

### مع مصادقة (Bearer Token):
```http
GET /api/auth/me
Authorization: Bearer {token}
```

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## 📱 APIs عامة (بدون مصادقة)

### 📂 الفئات والبرامج:
```http
GET /api/v1/categories
GET /api/v1/programs
GET /api/v1/programs/support
GET /api/v1/programs/{id}
```

### 🎯 الحملات:
```http
GET /api/v1/campaigns
GET /api/v1/campaigns/urgent
GET /api/v1/campaigns/featured
GET /api/v1/campaigns/{id}
```

### 💰 التبرعات العامة:
```http
POST /api/v1/donations/anonymous
POST /api/v1/donations/anonymous-with-payment
POST /api/v1/donations/with-payment
GET /api/v1/donations/quick-amounts
GET /api/v1/donations/{id}
```

### 💳 الدفع:
```http
POST /api/v1/payments/create
POST /api/v1/payments/confirm
GET /api/v1/payments/status/{sessionId}
```

---

## 👤 APIs المستخدم (مع مصادقة)

### 💰 تبرعات المستخدم:
```http
GET /api/v1/me/donations
GET /api/v1/me/donations/{id}
```

### 🎓 طلبات الطلاب:
```http
POST /api/students/registration
GET /api/students/registration/my-registration
GET /api/students/registration/{id}
PUT /api/students/registration/{id}
POST /api/students/registration/{id}/documents
```

---

## 👨‍💼 APIs الإدارة (Admin)

### 📂 إدارة الفئات:
```http
GET /api/v1/admin/categories
POST /api/v1/admin/categories
GET /api/v1/admin/categories/{id}
PUT /api/v1/admin/categories/{id}
DELETE /api/v1/admin/categories/{id}
```

**مثال إنشاء فئة:**
```http
POST /api/v1/admin/categories
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "name": "فئة جديدة",
  "status": "active"
}
```

### 🎯 إدارة البرامج:
```http
GET /api/v1/admin/programs
POST /api/v1/admin/programs
GET /api/v1/admin/programs/{id}
PUT /api/v1/admin/programs/{id}
DELETE /api/v1/admin/programs/{id}
```

**مثال إنشاء برنامج:**
```http
POST /api/v1/admin/programs
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "category_id": 1,
  "title": "برنامج جديد",
  "description": "وصف البرنامج",
  "goal_amount": 10000,
  "status": "active",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

### 💰 إدارة التبرعات:
```http
GET /api/v1/admin/donations?status=paid&type=quick&per_page=20
```

### 📋 إدارة الطلبات:
```http
GET /api/v1/admin/applications
PATCH /api/v1/admin/applications/{id}/status
```

---

## 📊 نماذج البيانات (Data Models)

### 👤 User:
```json
{
  "id": 1,
  "name": "اسم المستخدم",
  "phone": "12345678",
  "email": "user@example.com",
  "settings": {},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 📂 Category:
```json
{
  "id": 1,
  "name": "الفئة",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 🎯 Program:
```json
{
  "id": 1,
  "category_id": 1,
  "title": "عنوان البرنامج",
  "description": "وصف البرنامج",
  "status": "active",
  "goal_amount": 10000,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 💰 Donation:
```json
{
  "id": 1,
  "donation_id": "DN_uuid-string",
  "program_id": 1,
  "campaign_id": 1,
  "amount": 100.00,
  "donor_name": "اسم المتبرع",
  "type": "quick",
  "status": "paid",
  "user_id": 1,
  "note": "ملاحظة التبرع",
  "paid_at": "2024-01-01T00:00:00Z",
  "payment_session_id": "session_123",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 🎓 StudentRegistration:
```json
{
  "id": 1,
  "registration_id": "REG_uuid-string",
  "user_id": 1,
  "program_id": 1,
  "personal_json": {
    "name": "الاسم",
    "phone": "12345678",
    "email": "email@example.com"
  },
  "academic_json": {
    "university": "الجامعة",
    "major": "التخصص",
    "gpa": "3.5"
  },
  "financial_json": {
    "income": 1000,
    "expenses": 800
  },
  "status": "under_review",
  "reject_reason": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 🔧 إعدادات البيئة (.env)

```env
# إعدادات التطبيق
APP_NAME="Student Welfare Fund"
APP_ENV=production
APP_KEY=base64:your-app-key
APP_DEBUG=false
APP_URL=http://localhost:8000

# قاعدة البيانات
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_welfare_fund
DB_USERNAME=root
DB_PASSWORD=

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# طوابير العمل
QUEUE_CONNECTION=redis

# إعدادات الدفع (Thawani)
THAWANI_SECRET_KEY=sk_test_xxxxxxxx
THAWANI_PUBLISHABLE_KEY=pk_test_xxxxxxxx
THAWANI_BASE_URL=https://uatcheckout.thawani.om/api/v1
```

---

## 🎨 واجهات Admin Portal المقترحة

### 1. 📊 لوحة التحكم الرئيسية
- **إحصائيات عامة:** عدد التبرعات، المبلغ المجمع، عدد الطلبات
- **رسوم بيانية:** تبرعات شهرية، أكثر البرامج تبرعاً
- **تنبيهات:** طلبات جديدة، تبرعات معلقة

### 2. 📂 إدارة الفئات
- **قائمة الفئات:** عرض، تعديل، حذف
- **إضافة فئة جديدة:** نموذج إنشاء
- **حالة الفئات:** نشط/غير نشط

### 3. 🎯 إدارة البرامج
- **قائمة البرامج:** مع فلترة حسب الفئة
- **تفاصيل البرنامج:** معلومات شاملة
- **تعديل البرنامج:** نموذج تحديث
- **حالة البرامج:** مسودة/نشط/معلق/مؤرشف

### 4. 💰 إدارة التبرعات
- **قائمة التبرعات:** مع فلترة حسب الحالة والنوع
- **تفاصيل التبرع:** معلومات المتبرع والمبلغ
- **تحديث حالة التبرع:** معالجة التبرعات المعلقة
- **تصدير البيانات:** Excel/PDF

### 5. 🎓 إدارة طلبات الطلاب
- **قائمة الطلبات:** مع فلترة حسب الحالة
- **مراجعة الطلبات:** عرض البيانات الشخصية والأكاديمية
- **تحديث حالة الطلب:** قبول/رفض/قيد المراجعة
- **رفع المستندات:** إدارة الملفات المرفوعة

### 6. 👥 إدارة المستخدمين
- **قائمة المستخدمين:** عرض المستخدمين المسجلين
- **تفاصيل المستخدم:** معلومات الحساب والصلاحيات
- **إدارة الصلاحيات:** تعيين أدوار المستخدمين

### 7. 📈 التقارير والإحصائيات
- **تقارير التبرعات:** يومية/شهرية/سنوية
- **تقارير الطلبات:** حسب البرنامج والحالة
- **إحصائيات الأداء:** أكثر البرامج نجاحاً
- **تصدير التقارير:** PDF/Excel

---

## 🚀 بدء العمل على Admin Portal

### 1. إعداد المشروع الجديد:
```bash
# إنشاء مشروع React/Next.js جديد
npx create-next-app@latest admin-portal --typescript --tailwind

# أو Vue.js
npm create vue@latest admin-portal
```

### 2. تثبيت المكتبات المطلوبة:
```bash
# React/Next.js
npm install axios @tanstack/react-query @headlessui/react @heroicons/react
npm install react-hook-form @hookform/resolvers zod

# Vue.js
npm install axios @vueuse/core @headlessui/vue @heroicons/vue
npm install @vee-validate/yup yup
```

### 3. إعداد Axios:
```javascript
// api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة token للمصادقة
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 4. صفحات أساسية مطلوبة:
- `/login` - تسجيل دخول المدير
- `/dashboard` - لوحة التحكم الرئيسية
- `/categories` - إدارة الفئات
- `/programs` - إدارة البرامج
- `/donations` - إدارة التبرعات
- `/applications` - إدارة الطلبات
- `/users` - إدارة المستخدمين
- `/reports` - التقارير والإحصائيات

---

## 📝 ملاحظات مهمة

### 🔐 الأمان:
- جميع APIs الإدارية تتطلب مصادقة
- استخدام Bearer Token في header
- تطبيق صلاحيات الأدوار (Admin/Reviewer/User)

### 📊 Pagination:
- جميع APIs تدعم التصفح (`page`, `per_page`)
- الحد الأقصى للعناصر في الصفحة: 100

### 🔍 البحث والفلترة:
- دعم البحث في النصوص
- فلترة حسب الحالة والتاريخ
- ترتيب حسب التاريخ/المبلغ

### 📱 الاستجابة:
- تصميم متجاوب لجميع الشاشات
- دعم الأجهزة المحمولة والأجهزة اللوحية

---

## 🎯 الخطوات التالية

1. **إنشاء مشروع Admin Portal** باستخدام React/Vue
2. **إعداد نظام المصادقة** مع Laravel Backend
3. **بناء صفحات الإدارة الأساسية**
4. **ربط APIs مع الواجهة**
5. **إضافة الميزات المتقدمة** (التقارير، التصدير)

---

*تم إنشاء هذا الدليل لمساعدتك في بناء Admin Portal منفصل ومتكامل مع Backend الحالي. جميع APIs جاهزة ومختبرة! 🚀*
