import os
import sys

# 1. مسار مجلد المشروع
path = '/home/FlowDeskAI/FlowDeskAI/backend'
if path not in sys.path:
    sys.path.append(path)

# 2. تعيين ملف الإعدادات
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.local'

# 3. متغيرات البيئة الأساسية
os.environ.setdefault('DEBUG', 'True')
os.environ.setdefault('USE_SQLITE', 'True')
os.environ.setdefault('ALLOWED_HOSTS', '*,flowdeskai.pythonanywhere.com,.pythonanywhere.com,localhost,127.0.0.1')

# 4. تشغيل تطبيق WSGI
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
