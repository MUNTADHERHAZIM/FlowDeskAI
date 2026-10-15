@echo off
chcp 65001 >nul
title FlowDesk AI - WhatsApp Online Bot (Cloudflare Tunnel)
echo ========================================================
echo   ⚡ FlowDesk AI - تشغيل بوت واتساب مع رابط أونلاين
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start_whatsapp_online.ps1"
echo.
echo اضغط أي زر لإيقاف البوت عند الانتهاء...
pause >nul
