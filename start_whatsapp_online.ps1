# FlowDesk AI - WhatsApp Online Bot Launcher
$ErrorActionPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  ⚡ FlowDesk AI - تشغيل بوت الواتساب مع رابط أونلاين مجاني" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$botDir = Join-Path $scriptDir "whatsapp_bot"
$logFile = Join-Path $env:TEMP "cloudflared_wa.log"
if (Test-Path $logFile) { Remove-Item $logFile -Force }

# 1. Kill any existing port 5050 processes
$oldProcesses = Get-NetTCPConnection -LocalPort 5050 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $oldProcesses) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}
Stop-Process -Name "cloudflared" -Force -ErrorAction SilentlyContinue

Write-Host "⏳ 1. جاري تشغيل محرك الواتساب الذكي..." -ForegroundColor Yellow
$nodeProcess = Start-Process -FilePath "node" -ArgumentList "index.js --port=5050 --session=default" -WorkingDirectory $botDir -PassThru

Start-Sleep -Seconds 2

Write-Host "⏳ 2. جاري إنشاء نفق Cloudflare المشفر المجاني..." -ForegroundColor Yellow
$cloudflaredExe = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
if (-not (Test-Path $cloudflaredExe)) {
    $cloudflaredExe = "cloudflared"
}

$cfProcess = Start-Process -FilePath $cloudflaredExe -ArgumentList "tunnel --url http://localhost:5050" -RedirectStandardError $logFile -PassThru

# 3. Detect generated Public URL
$url = $null
for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
        if ($content -match '(https://[a-zA-Z0-9-]+\.trycloudflare\.com)') {
            $url = $matches[1]
            break
        }
    }
}

if ($url) {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host " 🎉 تم تشغيل بوت الواتساب بنجاح وهو متصل بالإنترنت الآن!" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host " 📱 رابط التحكم المباشر (يمكنك فتحه من هاتفك أو اللابتوب):" -ForegroundColor Yellow
    Write-Host " 🔗 $url" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " 💻 أو محلياً على هذا الجهاز:" -ForegroundColor Gray
    Write-Host "    http://localhost:5050" -ForegroundColor Gray
    Write-Host ""
    Write-Host " ---------------------------------------------------------------" -ForegroundColor Gray
    Write-Host " 🟢 البوت يعمل الآن ويستقبل الرسائل والصور والمكالمات تلقائياً." -ForegroundColor Green
    Write-Host " ⚠️ تنبيه: اترك هذه النافذة مفتوحة حتى يستمر الرد دون توقف." -ForegroundColor Magenta
    Write-Host "================================================================" -ForegroundColor Green
    
    Start-Process $url
} else {
    Write-Host "✅ البوت يعمل محلياً على: http://localhost:5050" -ForegroundColor Green
    Start-Process "http://localhost:5050"
}

# Keep the window running and clean up on exit
try {
    while ($true) {
        Start-Sleep -Seconds 2
        if ($nodeProcess.HasExited) {
            Write-Host "⚠️ تم إيقاف عملية البوت." -ForegroundColor Red
            break
        }
    }
} finally {
    Stop-Process -Id $nodeProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $cfProcess.Id -Force -ErrorAction SilentlyContinue
}
