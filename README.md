# ⚡ FlowDesk AI (منصة فلو ديسك للذكاء الاصطناعي)

منصة سحابية متقدمة متعددة المؤسسات (**Multi-Tenant SaaS**) تجمع بين الاتصالات الموحدة متعددة القنوات (**Omnichannel Inbox**)، إدارة المواعيد ومحرك حجز الموارد الذري لمنع التعارض (**PostgreSQL Atomic Guard Scheduling**)، محرك تدفقات العمل والأتمتة المرئي الشبيه بـ n8n (**Visual Workflow Canvas**)، والذكاء الاصطناعي المؤسسي المقيد بقواعد المعرفة (**RAG Knowledge Base**) مع تفريغ الرسائل الصوتية اللحظي (**Whisper STT**).

---

## ✨ أبرز الميزات والوظائف المكتملة (Core Features)

### 1. 🔒 عزل تام للبيانات وتعدد المؤسسات (Multi-Tenancy & Data Isolation)
* **عزل كامل على مستوى قاعدة البيانات:** كل مستأجر (`Tenant`) يمتلك مساحة عمل معزولة ومشفرة بقيد مؤسسي صارم عبر `TenantMiddleware` والـ Foreign Keys.
* **تسجيل فوري للمؤسسات (`/register`):** يمكن لأي عيادة، مكتب محاماة، أو شركة إنشاء مساحة عمل جديدة في ثوانٍ مع الحصول على رمز مصادقة JWT فوري.
* **عزل الواجهة الأمامية:** لا تظهر أي بيانات تجريبية أو أسماء عملاء لمؤسسات أخرى في الحسابات الجديدة؛ كل مستخدم يبدأ بلوحة تحكم نظيفة وخاصة به 100%.

### 2. 💬 صندوق الوارد الموحد (Omnichannel Inbox)
* استقبال رسائل **واتساب (WhatsApp)**، **تيليجرام (Telegram)**، **محادثات الموقع (Live WebChat)**، و**البريد الإلكتروني** في شاشة واحدة موحدة.
* **تحويل التحكم للبشري (Human Takeover):** إيقاف الرد الآلي للبوت بضغطة زر عند رغبة الموظف في استلام المحادثة لمنع مقاطعة العميل.
* **تفريغ البصمات الصوتية (Whisper STT):** تحويل الرسائل الصوتية والـ Voice Notes إلى نصوص عربية/عراقية مفهومة فور وصولها والرد عليها.

### 3. 🤖 مساعد الذكاء الاصطناعي وقاعدة المعرفة (AI & RAG Engine)
* نموذج ذكي جاهز للرد التلقائي مدعوم بـ **Google Gemini 1.5 Flash** ومحرك قواعد داخلية احتياطية فائقة الدقة.
* **قاعدة المعرفة المؤسسية (`/knowledge`):** فهرسة مستندات المؤسسة وسياساتها وأسعارها ليجيب المساعد بدقة 100% دون تأليف.

### 4. 📅 محرك المواعيد الذري (Atomic Scheduling Engine)
* حجز المواعيد بدون أي تعارض للموارد (أطباء، غرف فحص، أجهزة) عبر أقفال المعاملات الذرية (`select_for_update`).
* تأكيد وحجز المواعيد تلقائياً من خلال محادثات الواتساب وتيليجرام أو يدوياً عبر لوحة التحكم.

### 5. 👥 إدارة العملاء وسجل الاتصال الموحد (CRM)
* إنشاء وتحديث ملفات العملاء تلقائياً بمجرد مراسلتهم للمنصة.
* ربط هويات العميل المتعددة (رقم الجوال، معرف تيليجرام، البريد الإلكتروني) في ملف موحد شامل لجميع المواعيد والوسوم.

### 6. 🔌 قنوات الاتصال والتكامل التفاعلي (`/integrations`)
* معالج تفاعلي خطوة بخطوة (3 خطوات) لربط:
  * **واتساب للأعمال (WhatsApp Cloud API / QR Webhook)**.
  * **تيليجرام (Telegram Bot API)** مع زر اختبار لحظي.
  * **ودجت محادثة الموقع (Live Web Chat)** مع شاشة محاكاة وتجربة مباشرة.
  * **فيسبوك ماسنجر وإنستغرام DMs**.

---

## 🏗️ المعمارية التقنية (Architecture Stack)

| الطبقة | التقنية المستخدمة | الوظيفة |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS | واجهة زجاجية داكنة فائقة الجودة، دعم كامل للغة العربية (RTL) |
| **Backend** | Python 3.10+ مع Django 5 و Django REST Framework | معمارية Modular Monolith عالية الأداء والأمان |
| **Authentication** | SimpleJWT (Access + Refresh Tokens) | مصادقة آمنة مع دعم التبديل السلس بين المؤسسات |
| **Multi-Tenancy** | Django `TenantMiddleware` + PostgreSQL Foreign Keys | عزل تام لقواعد البيانات وسجلات التدقيق |
| **Database** | PostgreSQL (مع دعم SQLite للبيئة المحلية) | المعاملات الذرية وفهارس البحث السريع |
| **Async Tasks** | Celery + Redis | المهام المجدولة، إرسال الرسائل، وتنبيهات المواعيد |
| **AI / STT** | Google Gemini 1.5 + Whisper (Groq / OpenAI) | الردود الذكية وتفريغ الرسائل الصوتية |

---

## 📁 هيكل المستودع (Project Structure)

```
flowdesk-ai/
├── backend/
│   ├── config/              # إعدادات Django، Celery، و ASGI/WSGI
│   ├── apps/
│   │   ├── identity/        # الحسابات، تسجيل الدخول/التسجيل الجديد (JWT)
│   │   ├── tenants/         # المؤسسات، العضويات، والوسيط لعزل البيانات
│   │   ├── billing/         # الخطط والاشتراكات وسجلات الاستهلاك
│   │   ├── contacts/        # العملاء وملفات الاتصال (CRM)
│   │   ├── inbox/           # صندوق الوارد الموحد والرسائل
│   │   ├── channels/        # اتصالات القنوات ومستقبل الـ Webhooks
│   │   ├── scheduling/      # محرك المواعيد الذري ومنع التعارض
│   │   ├── workflows/       # تعريف التدفقات ومسارات العمل
│   │   ├── workflow_runtime/# محرك تشغيل العقد والأتمتة
│   │   ├── ai/              # قاعدة المعرفة (RAG) ونماذج الذكاء الاصطناعي
│   │   ├── notifications/   # الإشعارات اللحظية والتذكيرات
│   │   └── audit/           # سجل التدقيق الأمني
│   ├── tests/               # اختبارات النواة والعزل والأمان
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      # صفحات الدخول (/login) والتسجيل الجديد (/register)
│   │   │   ├── (dashboard)/ # لوحة التحكم، الصندوق، التقويم، العملاء، التكاملات
│   │   │   └── chat/        # ودجت محادثة الموقع المباشرة
│   │   ├── components/      # مكونات الواجهة (Header, Sidebar, Modals)
│   │   └── lib/             # عميل الـ API وسياق المصادقة وعزل البيانات
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # تشغيل المنصة بالكامل بضغطة زر
├── .env.example
└── README.md
```

---

## 🚀 البدء السريع والتشغيل المحلي (Quickstart)

### المتطلبات الأساسية:
* **Node.js**: الإصدار 18 أو أحدث.
* **Python**: الإصدار 3.10 أو أحدث.
* **Git**.

---

### خطوات التشغيل المحلي المباشر:

#### 1. تهيئة وتشغيل الخادم الخلفي (Backend):
```bash
# إنشاء وتفعيل البيئة الافتراضية
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # على Windows

# تثبيت الحزم البرمجية
pip install -r requirements.txt

# تطبيق الترحيلات
python manage.py migrate

# (اختياري) توليد بيانات تجريبية لعرض العيادة
python manage.py seed_demo_data

# تشغيل خادم Django
python manage.py runserver 0.0.0.0:8000
```
* **واجهة الـ API**: [http://127.0.0.1:8000/api/v1](http://127.0.0.1:8000/api/v1)

---

#### 2. تشغيل الواجهة الأمامية (Frontend):
في نافذة طرفية (Terminal) أخرى:
```bash
cd frontend
npm install
npm run dev
```
* **رابط المنصة في المتصفح**: [http://localhost:3000](http://localhost:3000)

---

## 🔑 الحسابات والمصادقة (Authentication)

### 1. إنشاء حساب مؤسسة جديدة فوراً:
* افتح الرابط: [http://localhost:3000/register](http://localhost:3000/register)
* أدخل اسمك، اسم عيادتك/مؤسستك، بريدك، وكلمة المرور.
* ستدخل مباشرة إلى مساحة عمل معزولة ونظيفة 100% خاصة بمؤسستك.

### 2. تسجيل الدخول للحسابات القائمة:
* افتح الرابط: [http://localhost:3000/login](http://localhost:3000/login)
* أدخل بريدك الإلكتروني وكلمة المرور المسجلة.

---

## 🧪 فحص واختبار النظام (Running Tests)

### اختبارات الخادم الخلفي والعزل والأمان:
```bash
.\backend\.venv\Scripts\pytest.exe backend
```
* ✅ فحص إنشاء الحساب وتوليد المؤسسة التلقائية.
* ✅ فحص عزل البيانات ومنع تداخل المستأجرين (Tenant Isolation Test).
* ✅ فحص محرك المواعيد الذري ومنع التعارض المزدوج (Atomic Conflict Prevention).

### فحص بناء الواجهة الأمامية:
```bash
cd frontend
npx tsc --noEmit
```

---

## 🌐 متغيرات البيئة الأساسية (`.env`)

```ini
# إعدادات الأمان
SECRET_KEY=your-django-super-secret-key
DEBUG=True
ALLOWED_HOSTS=*

# قاعدة البيانات (افتراضياً SQLite للتطوير أو PostgreSQL للإنتاج)
# DATABASE_URL=postgres://user:password@localhost:5432/flowdesk_db

# الذكاء الاصطناعي والتفريغ الصوتي
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_for_whisper
OPENAI_API_KEY=your_openai_key_optional

# قنوات الاتصال
WHATSAPP_ACCESS_TOKEN=your_meta_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

---

## 📄 الترخيص (License)
جميع الحقوق محفوظة لمنصة **FlowDesk AI** © 2026.
