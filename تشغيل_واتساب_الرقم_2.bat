@echo off
chcp 65001 >nul
title FlowDesk AI - WhatsApp Number 2 (Port 5051)
echo ========================================================
echo   ⚡ FlowDesk AI - تشغيل بوت واتساب (الرقم الثاني)
echo ========================================================
cd /d "%~dp0whatsapp_bot"
node index.js --port=5051 --session=number2
pause
