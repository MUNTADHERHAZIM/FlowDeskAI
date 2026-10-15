@echo off
chcp 65001 >nul
title FlowDesk AI - إيقاف النظام
color 0C

echo ================================================================
echo   🛑 جاري إيقاف جميع خدمات FlowDesk AI...
echo ================================================================
echo.

echo ⏳ جاري إيقاف سيرفر بايثون وعمليات الواتساب...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5050') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5051') do taskkill /F /PID %%a 2>nul
taskkill /F /IM cloudflared.exe 2>nul

echo.
echo ================================================================
echo   ✅ تم إيقاف جميع الخدمات وإغلاق المنافذ بنجاح!
echo ================================================================
timeout /t 3 >nul
