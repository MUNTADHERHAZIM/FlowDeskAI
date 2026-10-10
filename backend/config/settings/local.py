import os
from .base import *

DEBUG = True

# Database
# Connect to PostgreSQL if configured, otherwise fallback to SQLite for immediate local dev/testing
use_sqlite = os.getenv("USE_SQLITE", "False").lower() in ("true", "1", "yes")

if not use_sqlite and os.getenv("POSTGRES_DB"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB", "flowdesk_db"),
            "USER": os.getenv("POSTGRES_USER", "flowdesk_user"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", "flowdesk_secret_password_2026"),
            "HOST": os.getenv("POSTGRES_HOST", "localhost"),
            "PORT": os.getenv("POSTGRES_PORT", "5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
