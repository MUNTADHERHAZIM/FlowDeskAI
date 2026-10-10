# ⚡ FlowDesk AI (منصة فلو ديسك للذكاء الاصطناعي)

منصة سحابية متقدمة متعددة المؤسسات (**Multi-Tenant SaaS**) تجمع بين الاتصالات متعددة القنوات (**Omnichannel Inbox**)، إدارة المواعيد وحجز الموارد الذري (**Atomic Scheduling Engine**)، محرك أتمتة مرئي خاص بالمنصة (**Visual Workflow Engine**)، والذكاء الاصطناعي المقيد بالمعرفة المؤسسية (**RAG**).

---

## 🏗️ المعمارية التقنية (Architecture Stack)

- **الواجهة الأمامية (Frontend)**: Next.js 14 (App Router) + TypeScript + Tailwind CSS مع دعم كامل للغة العربية واتجاه RTL وتصميم زجاجي داكن وعصري.
- **الخادم الأساسي (Backend)**: Python 3.10+ مع Django 5 و Django REST Framework وفق نمط **Modular Monolith**.
- **المصادقة وتعدد المؤسسات**: JWT (SimpleJWT) + `TenantMiddleware` لعزل تام لبيانات الشركات والمؤسسات.
- **قاعدة البيانات**: PostgreSQL (مع دعم SQLite الفوري للبيئات المحلية الخفيفة).
- **المهام غير المتزامنة**: Celery + Redis لمعالجة المهام الخلفية، الرسائل، والتذكيرات المجدولة.
- **النشر والحاويات**: Docker & Docker Compose جاهز للتشغيل المحلي والإنتاجي.

---

## 📁 هيكل المستودع (Project Structure)

```
flowdesk-ai/
├── backend/
│   ├── config/              # إعدادات Django، Celery، و ASGI/WSGI
│   ├── apps/
│   │   ├── identity/        # المستخدمون، الحسابات، والمصادقة (JWT)
│   │   ├── tenants/         # المؤسسات، العضويات، والوسيط لعزل البيانات
│   │   ├── billing/         # الاشتراكات وسجلات الاستهلاك
│   │   ├── contacts/        # العملاء، الهويات الخارجية، والموافقات
│   │   ├── inbox/           # صندوق الوارد، الرسائل، التذاكر، والمرفقات
│   │   ├── channels/        # اتصالات القنوات (واتساب، تيليجرام، إيميل، ويب)
│   │   ├── scheduling/      # الخدمات، الموارد، ومحرك المواعيد الذري
│   │   ├── workflows/       # تعريف التدفقات وإصداراتها الثابتة
│   │   ├── workflow_runtime/# سجلات التشغيل وتنفيذ العقد ومنع التكرار
│   │   ├── ai/              # قاعدة المعرفة (RAG) وسجلات النموذج اللغوي
│   │   ├── notifications/   # التذكيرات المجدولة والإشعارات اللحظية
│   │   └── audit/           # سجل التدقيق الأمني
│   ├── tests/               # اختبارات النواة والعزل والأمان
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # صفحات Next.js (لوحة التحكم، الصندوق، التقويم، الأتمتة)
│   │   ├── components/      # مكونات واجهة المستخدم (Sidebar, Header, Layout)
│   │   └── lib/             # عميل الـ API وسياق المصادقة وتبديل المؤسسات
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # تشغيل المنصة بالكامل بضغطة زر
├── .env.example
└── README.md
```

---

## 🚀 البدء السريع (Quickstart)

### الخيار 1: التشغيل عبر Docker Compose (الأسرع والموصى به)

```bash
# 1. نسخ ملف البيئة
cp .env.example .env

# 2. تشغيل كافة الخدمات (PostgreSQL, Redis, Backend, Celery, Frontend)
docker-compose up --build
```
- لوحة التحكم: [http://localhost:3000](http://localhost:3000)
- واجهة الـ API: [http://localhost:8000/api/v1](http://localhost:8000/api/v1)

---

### الخيار 2: التشغيل المحلي المباشر (Bare-Metal Development)

#### 1. تهيئة الباك إند (Backend):
```bash
# تفعيل البيئة الافتراضية
.\backend\.venv\Scripts\activate

# تشغيل الترحيلات
python backend/manage.py migrate

# تغذية قاعدة البيانات بالبيانات التجريبية
python backend/manage.py seed_demo_data

# تشغيل خادم التطوير
python backend/manage.py runserver 8000
```

#### 2. تشغيل الواجهة الأمامية (Frontend):
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 تشغيل الاختبارات المؤتمتة (Running Tests)

### اختبارات الخادم والعزل والأمان:
```bash
.\backend\.venv\Scripts\pytest.exe backend
```
- ✅ فحص إنشاء الحساب وتوليد المؤسسة التلقائية.
- ✅ فحص عزل البيانات ومنع المؤسسات من التداخل (Tenant Isolation Test).
- ✅ فحص محرك المواعيد الذري ومنع التعارض المزدوج (Atomic Conflict Prevention).

### فحص بناء الواجهة الأمامية (Frontend Build Check):
```bash
cd frontend
npm run build
```

---

## 🔒 حساب الدخول التجريبي الافتراضي (Demo Seed Credentials)

- **البريد الإلكتروني**: `admin@flowdesk.ai`
- **كلمة المرور**: `AdminPass123!`
- **المؤسسات التجريبية الجاهزة**:
  1. `عيادة النخبة الطبية` (Elite Clinic) - مالك (Owner)
  2. `مجموعة العدالة القانونية` (Justice Law Group) - مدير (Admin)
