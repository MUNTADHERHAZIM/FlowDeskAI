@echo off
chcp 65001 >nul
title FlowDesk AI - WhatsApp Multi-Bot Launcher
echo ========================================================
echo   ⚡ FlowDesk AI - تشغيل الرقمين معاً في نفس الوقت
echo ========================================================
start "" "%~dp0تشغيل_واتساب_الرقم_1.bat"
start "" "%~dp0تشغيل_واتساب_الرقم_2.bat"
echo تم تشغيل الرقمين بنجاح!
echo الرقم الأول: http://localhost:5050
echo الرقم الثاني: http://localhost:5051
timeout /t 5
