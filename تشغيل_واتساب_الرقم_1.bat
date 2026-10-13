@echo off
chcp 65001 >nul
title FlowDesk AI - WhatsApp Number 1 (Port 5050)
echo ========================================================
echo   ⚡ FlowDesk AI - تشغيل بوت واتساب (الرقم الأول)
echo ========================================================
cd /d "%~dp0whatsapp_bot"
node index.js --port=5050 --session=default
pause
