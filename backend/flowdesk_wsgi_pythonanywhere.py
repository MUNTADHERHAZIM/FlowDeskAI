"""
FlowDesk AI - PythonAnywhere WSGI Configuration File
=====================================================
انسخ محتوى هذا الملف والصقه في ملف الـ WSGI في لوحة تحكم PythonAnywhere
(Web Tab -> WSGI configuration file -> /var/www/yourusername_pythonanywhere_com_wsgi.py)
"""

import os
import sys

# 1. مسار مجلد المشروع على PythonAnywhere (استبدل yourusername باسم حسابك)
path = '/home/yourusername/FlowDesk_AI/backend'
if path not in sys.path:
    sys.path.append(path)

# 2. تعيين ملف الإعدادات
os.environ['DJANGO_SETTINGS_MODULE'] = 'flowdesk_core.settings'

# 3. متغيرات البيئة الأساسية للإنتاج
os.environ.setdefault('DEBUG', 'False')
# ضع المفاتيح الخاصة بك هنا إن لم تكن في ملف .env
# os.environ['SECRET_KEY'] = 'your-secret-key-here'
# os.environ['GEMINI_API_KEY'] = 'your-gemini-key'

# 4. تشغيل تطبيق WSGI
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
