@echo off
chcp 65001 >nul
title FlowDesk AI - تشغيل النظام بالكامل
color 0A

echo ================================================================
echo   🚀 FlowDesk AI - جاري تشغيل النظام بالكامل بنقرة واحدة...
echo ================================================================
echo.

set "ROOT_DIR=%~dp0"

echo ⏳ 1. جاري تشغيل سيرفر بايثون (Django Backend)...
start "FlowDesk - Django Backend (Port 8000)" /min cmd /c "cd /d "%ROOT_DIR%backend" && .\.venv\Scripts\python.exe manage.py runserver"

timeout /t 2 >nul

echo ⏳ 2. جاري تشغيل واتساب الرقم الأول (Port 5050)...
start "FlowDesk - WhatsApp Bot 1 (Port 5050)" /min cmd /c "cd /d "%ROOT_DIR%whatsapp_bot" && node index.js --port=5050 --session=default"

timeout /t 1 >nul

echo ⏳ 3. جاري تشغيل واتساب الرقم الثاني (Port 5051)...
start "FlowDesk - WhatsApp Bot 2 (Port 5051)" /min cmd /c "cd /d "%ROOT_DIR%whatsapp_bot" && node index.js --port=5051 --session=number2"

timeout /t 2 >nul

echo.
echo ================================================================
echo   ✅ تم تشغيل كل الخدمات بنجاح في الخلفية!
echo   🌐 الرقم الأول:  http://localhost:5050
echo   🌐 الرقم الثاني: http://localhost:5051
echo   🌐 الباك إند:    http://127.0.0.1:8000
echo ================================================================
echo.

echo 🌐 جاري فتح لوحة التحكم في المتصفح...
start http://localhost:5050
start http://localhost:5051

echo يمكنك تصغير هذه النافذة. لإيقاف كل السيرفرات اضغط على ملف (إيقاف_النظام.bat).
timeout /t 5 >nul
