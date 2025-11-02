# إعداد المتغيرات البيئية (Environment Variables)

## ما هو ملف .env؟

ملف `.env` يحتوي على إعدادات التطبيق التي تتغير بين بيئات مختلفة (Development, Production, etc.)

## كيفية إنشاء ملف .env

### في Windows:

#### الطريقة 1: باستخدام Notepad
1. افتح Notepad
2. اكتب المحتوى التالي:
```env
VITE_API_URL=http://localhost:8000/api/v1/admin
VITE_APP_NAME=Student Welfare Fund Admin Portal
```
3. اذهب لـ File > Save As
4. في "Save as type" اختر "All Files (*.*)"
5. اكتب اسم الملف: `.env` (مع النقطة في البداية)
6. احفظ في مجلد المشروع (نفس المكان الذي فيه `package.json`)

#### الطريقة 2: باستخدام PowerShell
```powershell
cd C:\Users\dell\Desktop\Projects\welfare-fund-portal
New-Item .env -ItemType File
Add-Content .env "VITE_API_URL=http://localhost:8000/api/v1/admin"
Add-Content .env "VITE_APP_NAME=Student Welfare Fund Admin Portal"
```

#### الطريقة 3: باستخدام Command Prompt
```cmd
cd C:\Users\dell\Desktop\Projects\welfare-fund-portal
echo VITE_API_URL=http://localhost:8000/api/v1/admin > .env
echo VITE_APP_NAME=Student Welfare Fund Admin Portal >> .env
```

### في VS Code:
1. اضغط `Ctrl + N` لإنشاء ملف جديد
2. اكتب المحتوى:
```env
VITE_API_URL=http://localhost:8000/api/v1/admin
VITE_APP_NAME=Student Welfare Fund Admin Portal
```
3. اضغط `Ctrl + S` للحفظ
4. اكتب اسم الملف: `.env`
5. تأكد من الحفظ في مجلد المشروع الرئيسي

## محتوى ملف .env

### للتطوير المحلي (Local Development):
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1/admin

# Application Name
VITE_APP_NAME=Student Welfare Fund Admin Portal
```

### إذا كان الخادم على جهاز آخر في الشبكة:
```env
# API Configuration
# غيّر العنوان ليطابق عنوان IP الخادم
VITE_API_URL=http://192.168.1.21:8000/api/v1/admin

# Application Name
VITE_APP_NAME=Student Welfare Fund Admin Portal
```

### للإنتاج (Production):
```env
# API Configuration
VITE_API_URL=https://api.yourwebsite.com/api/v1/admin

# Application Name
VITE_APP_NAME=Student Welfare Fund Admin Portal
```

## كيفية معرفة عنوان IP الخادم

### إذا كان الخادم على نفس الجهاز:
استخدم: `http://localhost:8000/api/v1/admin`

### إذا كان الخادم على جهاز آخر:

#### في Windows (على جهاز الخادم):
```cmd
ipconfig
```
ابحث عن "IPv4 Address" في قسم "Wireless LAN adapter" أو "Ethernet adapter"

#### في Linux/Mac (على جهاز الخادم):
```bash
ip addr show
# أو
ifconfig
```

## التحقق من المتغيرات البيئية

### في Console المتصفح:
افتح Developer Tools (F12) واكتب:
```javascript
console.log(import.meta.env.VITE_API_URL);
```

يجب أن يظهر العنوان الصحيح.

### في التطبيق:
في أي مكان في الكود، يمكنك استخدام:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
console.log('API URL:', apiUrl);
```

## ملاحظات مهمة

### 1. إعادة تشغيل التطبيق
**مهم جداً**: بعد إنشاء أو تعديل ملف `.env`، يجب إعادة تشغيل التطبيق:
```bash
# أوقف التطبيق (Ctrl+C)
# ثم شغله مرة أخرى
npm run dev
```

### 2. أسماء المتغيرات
في Vite، جميع المتغيرات البيئية يجب أن تبدأ بـ `VITE_`

✅ صحيح: `VITE_API_URL`
❌ خطأ: `API_URL`

### 3. عدم إضافة `.env` للـ Git
ملف `.env` يجب أن يكون في `.gitignore` لأنه قد يحتوي على معلومات حساسة.

ملف `.gitignore` يجب أن يحتوي على:
```
.env
.env.local
.env.production
```

### 4. استخدام .env.example
أنشئ ملف `.env.example` بدون قيم حساسة:
```env
VITE_API_URL=http://localhost:8000/api/v1/admin
VITE_APP_NAME=Student Welfare Fund Admin Portal
```

هذا الملف يمكن إضافته للـ Git ليعرف المطورون الآخرون المتغيرات المطلوبة.

## استكشاف الأخطاء

### المتغير يظهر undefined:
1. تأكد من أن اسم المتغير يبدأ بـ `VITE_`
2. تأكد من إعادة تشغيل التطبيق
3. تأكد من حفظ ملف `.env` في المجلد الصحيح

### الملف غير موجود:
تأكد من أن الملف في نفس مستوى `package.json`:
```
welfare-fund-portal/
  ├── .env          ← هنا
  ├── package.json
  ├── src/
  └── ...
```

### القيمة خاطئة:
تحقق من المحتوى:
```bash
# في PowerShell
Get-Content .env

# في CMD
type .env
```

## أمثلة للسيناريوهات المختلفة

### السيناريو 1: تطوير محلي على نفس الجهاز
```env
VITE_API_URL=http://localhost:8000/api/v1/admin
```

### السيناريو 2: تطوير مع خادم على جهاز آخر في الشبكة المحلية
```env
VITE_API_URL=http://192.168.1.100:8000/api/v1/admin
```

### السيناريو 3: استخدام HTTPS في التطوير
```env
VITE_API_URL=https://dev.example.com/api/v1/admin
```

### السيناريو 4: استخدام منفذ مختلف
```env
VITE_API_URL=http://localhost:8080/api/v1/admin
```

## المساعدة

إذا واجهت مشاكل:
1. افتح Console في المتصفح (F12)
2. ابحث عن أخطاء في التحميل
3. تحقق من قيمة `import.meta.env.VITE_API_URL`
4. تأكد من إعادة تشغيل التطبيق بعد التعديل

