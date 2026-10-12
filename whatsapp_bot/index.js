import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import NodeCache from 'node-cache';
import pino from 'pino';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import express from 'express';
import http from 'http';
import fs from 'fs';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SETTINGS_FILE = './bot_settings.json';
let botSettings = {
  businessName: 'FlowDesk AI',
  dialect: 'iraqi',
  tone: 'friendly',
  greetingMessage: 'أهلاً وسهلاً بحضرتك! يسعدنا خدمتك عبر المساعد الذكي لـ FlowDesk AI. كيف يمكننا مساعدتك اليوم بخصوص الاستفسارات والمواعيد؟',
  knowledgeBase: 'ساعات العمل الرسمية: يومياً من الساعة 9:00 صباحاً وحتى 10:00 مساءً طوال أيام الأسبوع.\nالخدمات: استشارات طبية وتقنية، حجز مواعيد، وخدمة عملاء فورية.\nالأسعار: كشف الاستشارة 35,000 دينار عراقي.\nالموقع: فرعنا الرئيسي متاح لاستقبالكم طوال أيام الأسبوع.'
};

if (fs.existsSync(SETTINGS_FILE)) {
  try {
    botSettings = { ...botSettings, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) };
  } catch (e) {}
}

function saveBotSettings(newSettings) {
  botSettings = { ...botSettings, ...newSettings };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(botSettings, null, 2), 'utf8');
  } catch (e) {}
}

let currentQR = null;
let currentQRDataUrl = null;
let connectionStatus = 'initializing';
let connectedUser = null;
let messageLogs = [];
let activeSocket = null;

const msgRetryCounterCache = new NodeCache();

// Sleek Web Dashboard for QR Scan & Live Monitoring
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlowDesk AI - ملقط وربط واتساب الحي</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #0b0f19; color: #f3f4f6; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #131b2e; border: 1px solid #1f293d; border-radius: 20px; padding: 32px; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .badge-connecting { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .badge-connected { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #ffffff; }
    p.desc { font-size: 14px; color: #9ca3af; margin-bottom: 24px; line-height: 1.6; }
    .qr-container { background: #ffffff; padding: 18px; border-radius: 16px; display: inline-block; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
    .qr-container img { width: 250px; height: 250px; display: block; }
    .steps { text-align: right; background: #0c1220; border: 1px solid #1a233a; border-radius: 14px; padding: 18px; margin-bottom: 24px; font-size: 13px; color: #d1d5db; line-height: 1.8; }
    .steps ol { padding-right: 20px; }
    .steps li { margin-bottom: 6px; }
    .success-box { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .success-icon { font-size: 42px; margin-bottom: 8px; }
    .logs-card { margin-top: 24px; text-align: right; width: 100%; max-width: 580px; background: #131b2e; border: 1px solid #1f293d; border-radius: 16px; padding: 20px; }
    .logs-title { font-size: 14px; font-weight: 600; color: #9ca3af; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .log-item { background: #0c1220; border-radius: 10px; padding: 12px; margin-bottom: 10px; border-right: 3px solid #10b981; }
    .log-meta { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
    .log-incoming { font-size: 13px; color: #e5e7eb; margin-bottom: 6px; }
    .log-reply { font-size: 13px; color: #34d399; font-weight: 500; }
    .settings-card { margin-top: 24px; text-align: right; width: 100%; max-width: 580px; background: #131b2e; border: 1px solid #1f293d; border-radius: 16px; padding: 22px; }
    .form-group { margin-bottom: 14px; text-align: right; }
    .form-label { display: block; font-size: 13px; font-weight: 600; color: #93c5fd; margin-bottom: 6px; }
    .form-select, .form-input, .form-textarea { width: 100%; background: #0c1220; border: 1px solid #1f293d; border-radius: 10px; padding: 10px 14px; color: #f3f4f6; font-size: 13px; outline: none; transition: all 0.2s; font-family: inherit; }
    .form-select:focus, .form-input:focus, .form-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
    .btn-save { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; border: none; padding: 11px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: 14px; width: 100%; margin-top: 6px; transition: all 0.2s; }
    .btn-save:hover { background: #1d4ed8; filter: brightness(1.1); }
  </style>
  <script>
    let currentStatus = "${connectionStatus}";
    let currentQR = "${currentQR}";
    let lastLogsCount = ${messageLogs.length};

    // Smooth polling: NEVER reload entire page on QR rotation or typing!
    setInterval(async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();

        // 1. Only reload if connection status itself transitioned (e.g. from qr_ready to connected)
        if (data.status !== currentStatus) {
          location.reload();
          return;
        }

        // 2. Smoothly update QR code in-place WITHOUT page refresh!
        if (data.status === 'qr_ready' && data.qr && data.qr !== currentQR && data.qrDataUrl) {
          currentQR = data.qr;
          const qrImg = document.getElementById('qrImage');
          if (qrImg) qrImg.src = data.qrDataUrl;
        }

        // 3. Smoothly update logs if changed, without reloading the page or losing user inputs
        if (data.logsCount !== lastLogsCount && data.logs) {
          lastLogsCount = data.logsCount;
          const logsContainer = document.getElementById('logsContainer');
          if (logsContainer) {
            logsContainer.innerHTML = data.logs.map(function(l) {
              return '<div class="log-item">' +
                '<div class="log-meta">' + l.sender + ' • ' + l.time + '</div>' +
                '<div class="log-incoming">📥 رسالة العميل: <strong>' + l.incoming + '</strong></div>' +
                '<div class="log-reply">🤖 رد المساعد: ' + l.reply + '</div>' +
              '</div>';
            }).join('');
          }
        }
      } catch(e) {}
    }, 2500);

    // Auto-save debounced sync so changes are NEVER lost
    let autoSaveTimer = null;
    function triggerAutoSave() {
      clearTimeout(autoSaveTimer);
      const statusBadge = document.getElementById('saveStatusBadge');
      if (statusBadge) {
        statusBadge.style.color = '#fbbf24';
        statusBadge.innerHTML = '⏳ جاري الحفظ...';
      }
      autoSaveTimer = setTimeout(async () => {
        const body = {
          businessName: document.getElementById('businessName').value.trim(),
          dialect: document.getElementById('dialect').value,
          tone: document.getElementById('tone').value,
          greetingMessage: document.getElementById('greetingMessage').value.trim(),
          knowledgeBase: document.getElementById('knowledgeBase').value.trim(),
        };
        try {
          const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (res.ok) {
            Object.keys(body).forEach(k => localStorage.setItem('flowdesk_bot_' + k, body[k]));
            if (statusBadge) {
              statusBadge.style.color = '#34d399';
              statusBadge.innerHTML = '🟢 تم الحفظ تلقائياً';
            }
          }
        } catch(e) {
          if (statusBadge) {
            statusBadge.style.color = '#f87171';
            statusBadge.innerHTML = '⚠️ خطأ بالاتصال';
          }
        }
      }, 1000);
    }

    window.addEventListener('DOMContentLoaded', () => {
      const fields = ['businessName', 'dialect', 'tone', 'greetingMessage', 'knowledgeBase'];
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', triggerAutoSave);
          el.addEventListener('change', triggerAutoSave);
        }
      });
    });

    async function handleDisconnect(btn) {
      if (!confirm('هل تريد بالتأكيد فصل الرقم الحالي وإعادة الاقتران برقم جديد؟')) return;
      btn.disabled = true;
      btn.innerHTML = '⏳ جاري قطع الاتصال وتوليد رمز QR جديد...';
      try {
        await fetch('/api/logout', { method: 'POST' });
        setTimeout(() => { location.reload(); }, 1500);
      } catch (err) {
        alert('حدث خطأ أثناء قطع الاتصال');
        btn.disabled = false;
        btn.innerHTML = '🔄 قطع الاتصال والاقتران برقم آخر';
      }
    }

    async function handleSaveSettings(e) {
      if (e) e.preventDefault();
      clearTimeout(autoSaveTimer);
      const btn = document.getElementById('saveBtn');
      const msg = document.getElementById('saveMsg');
      const statusBadge = document.getElementById('saveStatusBadge');
      btn.disabled = true;
      btn.innerHTML = '⏳ جاري حفظ التعديلات في السيرفر...';

      const body = {
        businessName: document.getElementById('businessName').value.trim(),
        dialect: document.getElementById('dialect').value,
        tone: document.getElementById('tone').value,
        greetingMessage: document.getElementById('greetingMessage').value.trim(),
        knowledgeBase: document.getElementById('knowledgeBase').value.trim(),
      };

      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          Object.keys(body).forEach(k => {
            localStorage.setItem('flowdesk_bot_' + k, body[k]);
          });
          if (statusBadge) {
            statusBadge.style.color = '#34d399';
            statusBadge.innerHTML = '🟢 تم الحفظ بنجاح';
          }
          msg.style.display = 'block';
          btn.innerHTML = '✅ تم الحفظ وتطبيقها على البوت بنجاح!';
          setTimeout(() => {
            msg.style.display = 'none';
            btn.disabled = false;
            btn.innerHTML = '💾 حفظ التعديلات وتطبيقها فوراً على الردود';
          }, 3000);
        } else {
          throw new Error('HTTP error');
        }
      } catch (err) {
        alert('حدث خطأ أثناء حفظ الإعدادات في السيرفر، يرجى المحاولة ثانية.');
        btn.disabled = false;
        btn.innerHTML = '💾 حفظ التعديلات وتطبيقها فوراً على الردود';
      }
    }
  </script>
</head>
<body>
  <div class="card">
    ${connectionStatus === 'connected' ? `
      <div class="badge badge-connected">🟢 متصل بنجاح ونشط الآن</div>
      <div class="success-box">
        <div class="success-icon">🎉</div>
        <h2 style="font-size: 18px; margin-bottom: 6px; color: #34d399;">واتسابك مربوط وجاهز للرد!</h2>
        <p style="font-size: 14px; color: #9ca3af;">الرقم المتصل: <strong style="color: #fff;">${connectedUser || 'رقمك الشخصي'}</strong></p>
        <p style="font-size: 13px; color: #6ee7b7; margin-top: 8px;">أي شخص يرسل لك رسالة الآن، سيرد عليه الذكاء الاصطناعي بناءً على اللهجة والمعلومات المحددة أدناه.</p>
        
        <div style="margin-top: 18px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px;">
          <button onclick="handleDisconnect(this)" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5; padding: 10px 22px; border-radius: 12px; font-weight: 600; cursor: pointer; font-size: 13px; transition: all 0.2s;">
            🔄 قطع الاتصال والاقتران برقم آخر
          </button>
        </div>
      </div>
    ` : `
      <div class="badge badge-connecting">⏳ بانتظار مسح رمز QR</div>
      <h1>ربط واتساب بالذكاء الاصطناعي</h1>
      <p class="desc">امسح رمز QR أدناه من تطبيق واتساب في هاتفك لبدء الرد الآلي على عملائك وأصدقائك فوراً.</p>
      
      <div class="qr-container">
        ${currentQRDataUrl ? `<img id="qrImage" src="${currentQRDataUrl}" alt="WhatsApp QR Code" />` : '<p style="color:#000; padding: 100px 20px;">جاري توليد الرمز...</p>'}
      </div>

      <div class="steps">
        <div style="font-weight: 700; margin-bottom: 6px; color: #60a5fa;">طريقة المسح من هاتفك (30 ثانية):</div>
        <ol>
          <li>افتح تطبيق <strong>واتساب</strong> في هاتفك المحمول.</li>
          <li>اضغط على <strong>القائمة (⋮)</strong> في أندرويد أو <strong>الإعدادات</strong> في آيفون.</li>
          <li>اختر <strong>الأجهزة المرتبطة (Linked Devices)</strong>.</li>
          <li>اضغط <strong>ربط جهاز (Link a Device)</strong> ووجّه الكاميرا نحو هذا الرمز.</li>
        </ol>
      </div>
    `}
  </div>

  <div class="settings-card">
    <div class="logs-title">
      <span>🧠 تخصيص شخصية وقاعدة معرفة الذكاء الاصطناعي</span>
      <span id="saveStatusBadge" style="font-size: 11px; color: #34d399; font-weight: 600;">🟢 محفوظ</span>
    </div>
    
    <form id="settingsForm" onsubmit="handleSaveSettings(event)">
      <div class="form-group">
        <label class="form-label">اسم النشاط أو المؤسسة:</label>
        <input type="text" id="businessName" class="form-input" value="${botSettings.businessName || ''}" placeholder="مثال: عيادة د. أحمد / متجر الفخامة" required />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">لهجة الرد (Dialect):</label>
          <select id="dialect" class="form-select">
            <option value="iraqi" ${botSettings.dialect === 'iraqi' ? 'selected' : ''}>🇮🇶 اللهجة العراقية (أهلاً بيك، تدلل)</option>
            <option value="gulf" ${botSettings.dialect === 'gulf' ? 'selected' : ''}>🇸🇦 اللهجة الخليجية (يا هلا، أبشر)</option>
            <option value="formal" ${botSettings.dialect === 'formal' ? 'selected' : ''}>🏛️ العربية الفصحى (أهلاً وسهلاً بحضرتكم)</option>
            <option value="egyptian" ${botSettings.dialect === 'egyptian' ? 'selected' : ''}>🇪🇬 اللهجة المصرية (أهلاً بحضرتك يا فندم)</option>
            <option value="shami" ${botSettings.dialect === 'shami' ? 'selected' : ''}>🇱🇧 اللهجة الشامية (أهلاً وسهلاً، تكرم عينك)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">نبرة الرد (Tone):</label>
          <select id="tone" class="form-select">
            <option value="friendly" ${botSettings.tone === 'friendly' ? 'selected' : ''}>😊 ودود ولطيف ومرحب</option>
            <option value="professional" ${botSettings.tone === 'professional' ? 'selected' : ''}>👔 رسمي ومهني واحترافي</option>
            <option value="sales" ${botSettings.tone === 'sales' ? 'selected' : ''}>🚀 تسويقي ومحفز للمبيعات</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">رسالة الترحيب الأولى (Greeting Message):</label>
        <input type="text" id="greetingMessage" class="form-input" value="${botSettings.greetingMessage || ''}" placeholder="الرسالة التي يتم الرد بها عند إلقاء السلام أو التحية" required />
      </div>

      <div class="form-group">
        <label class="form-label">مربع معلومات النشاط / قاعدة المعرفة (Knowledge Base):</label>
        <textarea id="knowledgeBase" class="form-textarea" rows="4" placeholder="اكتب هنا كل ما ترغب أن يعرفه الذكاء الاصطناعي: أوقات الدوام، العناوين، الأسعار، الخدمات، سياسة الحجز...">${botSettings.knowledgeBase || ''}</textarea>
      </div>

      <button type="submit" id="saveBtn" class="btn-save">💾 حفظ التعديلات وتطبيقها فوراً على الردود</button>
      <div id="saveMsg" style="font-size: 13px; color: #34d399; margin-top: 10px; text-align: center; display: none; font-weight: 600;">✅ تم حفظ التعديلات وتحديث شخصية الذكاء الاصطناعي بنجاح!</div>
    </form>
  </div>

  <div class="logs-card">
    <div class="logs-title">
      <span>سجل المحادثات والردود الحية (${messageLogs.length})</span>
      <span style="font-size: 11px; color: #10b981;">تحديث تلقائي</span>
    </div>
    <div id="logsContainer">
      ${messageLogs.length === 0 ? '<p style="font-size: 13px; color: #6b7280; text-align: center; padding: 16px;">لم تصل رسائل بعد. جرب إرسال رسالة من هاتف آخر إلى رقمك لتشاهد الرد المباشر هنا.</p>' : ''}
      ${messageLogs.slice(0, 10).map(l => `
        <div class="log-item">
          <div class="log-meta">${l.sender} • ${l.time}</div>
          <div class="log-incoming">📥 رسالة العميل: <strong>${l.incoming}</strong></div>
          <div class="log-reply">🤖 رد المساعد: ${l.reply}</div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: connectionStatus,
    user: connectedUser,
    qr: currentQR,
    logsCount: messageLogs.length,
    settings: botSettings,
  });
});

app.post('/api/settings', (req, res) => {
  const { businessName, dialect, tone, greetingMessage, knowledgeBase } = req.body;
  saveBotSettings({
    businessName: businessName || botSettings.businessName,
    dialect: dialect || botSettings.dialect,
    tone: tone || botSettings.tone,
    greetingMessage: greetingMessage || botSettings.greetingMessage,
    knowledgeBase: knowledgeBase !== undefined ? knowledgeBase : botSettings.knowledgeBase,
  });
  console.log(`✅ تم تحديث إعدادات الذكاء الاصطناعي: لهجة [${botSettings.dialect}]، نبرة [${botSettings.tone}]`);
  res.json({ ok: true, settings: botSettings });
});

app.post('/api/logout', async (req, res) => {
  console.log('🔄 استلام طلب قطع الاتصال وإعادة الاقتران...');
  try {
    if (activeSocket) {
      try {
        await activeSocket.logout();
      } catch (e) {}
      try {
        activeSocket.end();
      } catch (e) {}
      activeSocket = null;
    }
  } catch (e) {}

  try {
    if (fs.existsSync('./auth_info_baileys')) {
      fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
    }
  } catch (e) {
    console.error('خطأ عند حذف مجلد الجلسة:', e.message);
  }

  connectionStatus = 'initializing';
  connectedUser = null;
  currentQR = null;
  currentQRDataUrl = null;

  setTimeout(connectToWhatsApp, 1500);
  res.json({ ok: true, message: 'Session cleared, new QR generating' });
});

// Dialect and Knowledge-Aware Intelligent AI Response Generator
function generateSmartReply(incomingText, senderNumber) {
  const text = incomingText.trim().toLowerCase();
  const { businessName, dialect, tone, greetingMessage, knowledgeBase } = botSettings;

  // 1. Check for Greeting
  const greetingWords = ['مرحبا', 'مرحباً', 'سلام', 'السلام', 'الو', 'صباح الخير', 'مساء الخير', 'هلا', 'هلو', 'شلونك', 'شخبارك', 'هاي', 'hey', 'hello', 'hi'];
  const isGreetingOnly = greetingWords.some(w => text.startsWith(w) || text === w);

  if (isGreetingOnly && text.length < 30) {
    if (greetingMessage && greetingMessage.trim()) return greetingMessage.trim();
    if (dialect === 'iraqi') return `أهلاً وسهلاً بيك عيني! يسعدنا خدمتك عبر المساعد الذكي لـ ${businessName}. تدلل، شلون نكدر نساعدك اليوم؟`;
    if (dialect === 'gulf') return `يا هلا ومسهلا فيك طال عمرك! يسعدنا خدمتك عبر المساعد الذكي لـ ${businessName}. أبشر، كيف نقدر نخدمك اليوم؟`;
    if (dialect === 'egyptian') return `أهلاً بحضرتك يا فندم! منورنا في ${businessName}. تحت أمرك، إزاي نقدر نساعدك النهارده؟`;
    if (dialect === 'shami') return `أهلاً وسهلاً بحضرتك! تكرم عينك، كيف فينا نساعدك اليوم بـ ${businessName}؟`;
    return `أهلاً وسهلاً بحضرتك! يسعدنا خدمتكم عبر المساعد الذكي لـ ${businessName}. كيف يمكننا مساعدتكم اليوم؟`;
  }

  const kbLines = (knowledgeBase || '').split('\n').map(l => l.trim()).filter(Boolean);

  // 2. Booking / Appointments
  if (text.includes('موعد') || text.includes('حجز') || text.includes('احجز')) {
    const bookingLine = kbLines.find(l => l.includes('موعد') || l.includes('حجز')) || '';
    if (dialect === 'iraqi') {
      return `أهلاً بيك عيني! يسعدنا نثبتلك موعدك عبر المساعد الذكي لـ ${businessName}.${bookingLine ? '\n\n📌 ' + bookingLine : ''}\n\nتحب نثبتلك موعد اليوم لو باجر، وبأي وقت يناسبك؟ تدلل.`;
    }
    if (dialect === 'gulf') {
      return `يا هلا فيك طال عمرك! أبشر يسعدنا حجز موعدك لدى ${businessName}.${bookingLine ? '\n\n📌 ' + bookingLine : ''}\n\nتفضل بإرسال اليوم والوقت المناسب لحضرتك لتأكيد الحجز فوراً.`;
    }
    return `أهلاً وسهلاً بحضرتك! يسعدنا خدمتكم وحجز موعدكم لدى ${businessName}.${bookingLine ? '\n\n📌 ' + bookingLine : ''}\n\nيرجى إرسال اليوم والوقت المفضل لديك لتأكيد الحجز فوراً.`;
  }

  // 3. Working Hours / Timing
  if (text.includes('دوام') || text.includes('ساعات') || text.includes('اوقات') || text.includes('متى') || text.includes('وقت')) {
    const hoursLine = kbLines.find(l => l.includes('دوام') || l.includes('ساعات') || l.includes('اوقات') || l.includes('العمل')) || 'مواعيد العمل يومياً من الساعة 9:00 صباحاً وحتى 10:00 مساءً طوال أيام الأسبوع.';
    if (dialect === 'iraqi') {
      return `أهلاً عيني! ${hoursLine}\nأي وكت تحب تشرفنا أو تحجز موعد أهلاً وسهلاً بيك وتدلل.`;
    }
    if (dialect === 'gulf') {
      return `يا هلا ومرحبا طال عمرك! ${hoursLine}\nنسعد بزيارتك أو حجز موعدك بأي وقت.`;
    }
    return `أهلاً بحضرتك! ${hoursLine}\nهل تود الاستفسار عن خدمة معينة أو حجز موعد؟`;
  }

  // 4. Prices / Cost
  if (text.includes('سعر') || text.includes('اسعار') || text.includes('تكلفة') || text.includes('بكم') || text.includes('بيش')) {
    const priceLine = kbLines.find(l => l.includes('سعر') || l.includes('اسعار') || l.includes('كشف') || l.includes('دينار') || l.includes('ريال') || l.includes('دولار')) || '';
    if (dialect === 'iraqi') {
      return `أهلاً عيني! بخصوص الأسعار:${priceLine ? '\n\n💰 ' + priceLine : '\nتعتمد الأسعار على نوع الخدمة بدقة.'}\nتفضل وضح الخدمة المطلوبة وتدلل نجاوبك فوراً.`;
    }
    if (dialect === 'gulf') {
      return `يا هلا طال عمرك! بخصوص الأسعار:${priceLine ? '\n\n💰 ' + priceLine : '\nتختلف الأسعار باختلاف الخدمة المطلوبة.'}\nتفضل بتوضيح طلبك وأبشر باللي يسرك.`;
    }
    return `أهلاً بحضرتك! تفاصيل الأسعار:${priceLine ? '\n\n💰 ' + priceLine : '\nتعتمد الأسعار على نوع الخدمة المحددة.'}\nتفضل بتوضيح نوع الخدمة المطلوبة وسنزودك بالتفاصيل فوراً.`;
  }

  // 5. Location / Address
  if (text.includes('مكان') || text.includes('موقع') || text.includes('عنوان') || text.includes('وين') || text.includes('وينكم')) {
    const locLine = kbLines.find(l => l.includes('مكان') || l.includes('موقع') || l.includes('عنوان') || l.includes('فرع')) || 'فرعنا الرئيسي متاح لاستقبالكم طوال أيام الأسبوع.';
    if (dialect === 'iraqi') {
      return `أهلاً بيك عيني! ${locLine}\nتحب نثبتلك موعد زيارة حضورية؟ تدلل.`;
    }
    return `أهلاً وسهلاً بحضرتك! ${locLine}\nهل تود حجز زيارة حضورية؟`;
  }

  // 6. Human Escalation / Complaint
  if (text.includes('موظف') || text.includes('انسان') || text.includes('شخص') || text.includes('شكوى')) {
    if (dialect === 'iraqi') {
      return `صار عيني وتدلل، تم إشعار الإدارة فوراً وراح يجاوبك موظف الدعم بأسرع وكت. شكراً لصبرك!`;
    }
    return `تم إشعار فريق خدمة العملاء فوراً بطلبك للتحدث مع موظف، وسيقوم أحد الزملاء بمتابعة محادثتك مباشرة في أقرب وقت. شكراً لصبرك!`;
  }

  // 7. General Fallback
  if (dialect === 'iraqi') {
    return `أهلاً وسهلاً بيك عيني! استلمت رسالتك ("${incomingText}"). أنا المساعد الذكي لـ ${businessName}.\n\nشلون نكدر نساعدك اليوم بخصوص الاستفسارات أو حجز المواعيد؟ تدلل.`;
  }
  if (dialect === 'gulf') {
    return `يا هلا ومسهلا فيك طال عمرك! استلمت رسالتك ("${incomingText}"). أنا المساعد الذكي لـ ${businessName}.\n\nكيف نقدر نخدمك اليوم بخصوص المواعيد أو الاستفسارات؟ أبشر.`;
  }
  return `مرحباً بك! أنا المساعد الذكي لـ ${businessName}. استلمت رسالتك ("${incomingText}")، كيف يمكنني مساعدتك اليوم بخصوص الاستفسارات أو حجز المواعيد؟`;
}

async function transcribeAudio(buffer) {
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const isGroq = apiKey.startsWith("gsk_") || Boolean(process.env.GROQ_API_KEY);
    const endpoint = isGroq 
      ? "https://api.groq.com/openai/v1/audio/transcriptions"
      : "https://api.openai.com/v1/audio/transcriptions";
    const model = isGroq ? "whisper-large-v3" : "whisper-1";

    const formData = new FormData();
    const audioBlob = new Blob([buffer], { type: "audio/ogg" });
    formData.append("file", audioBlob, "voice.ogg");
    formData.append("model", model);
    formData.append("language", "ar");

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}` },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      return data.text ? data.text.trim() : null;
    }
  } catch (err) {
    console.warn("فشل تفريغ الصوت عبر الـ API:", err.message);
  }
  return null;
}

// Start WhatsApp Baileys Connection
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      return undefined;
    },
    syncFullHistory: false,
    browser: ['FlowDesk AI', 'Chrome', '1.0.0']
  });

  activeSocket = sock;

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = qr;
      connectionStatus = 'qr_ready';
      currentQRDataUrl = await QRCode.toDataURL(qr);
      console.log('\n======================================================');
      console.log('📌 تم إنشاء رمز QR جديد لربط واتساب!');
      console.log(`🌐 افتح الرابط في المتصفح لمسح الرمز: http://localhost:${PORT}`);
      console.log('======================================================\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      console.log('⚠️ تم إغلاق الاتصال، رمز الحالة:', statusCode, 'تسجيل خروج:', isLoggedOut);
      connectionStatus = 'disconnected';
      currentQR = null;
      currentQRDataUrl = null;
      connectedUser = null;

      if (isLoggedOut) {
        console.log('🗑️ تم تسجيل الخروج من الجهاز، جاري تنظيف الجلسة وتوليد رمز QR جديد...');
        try {
          if (fs.existsSync('./auth_info_baileys')) {
            fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
          }
        } catch (e) {}
        setTimeout(connectToWhatsApp, 2000);
      } else {
        setTimeout(connectToWhatsApp, 3000);
      }
    } else if (connection === 'open') {
      connectionStatus = 'connected';
      currentQR = null;
      currentQRDataUrl = null;
      connectedUser = sock.user?.id ? sock.user.id.split(':')[0] : 'رقمك المتصل';
      console.log('\n🎉 ====================================================');
      console.log(`✅ تم ربط واتساب بنجاح برقم: +${connectedUser}`);
      console.log('🤖 المساعد الذكي جاهز الآن للرد على الرسائل والتسجيلات الصوتية تلقائياً!');
      console.log(`🌐 يمكنك متابعة الرسائل الحية على: http://localhost:${PORT}`);
      console.log('======================================================\n');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Incoming Messages Handler (Text + Voice Notes)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    for (const msg of messages) {
      if (msg.key.fromMe) continue;

      const remoteJid = msg.key.remoteJid;
      if (!remoteJid || remoteJid.endsWith('@g.us') || remoteJid === 'status@broadcast') continue;

      const senderNumber = remoteJid.split('@')[0];
      const isAudio = Boolean(msg.message?.audioMessage);
      const audioDuration = msg.message?.audioMessage?.seconds || 0;

      let text = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || '';

      if (isAudio) {
        console.log(`\n🎙️ [تسجيل صوتي وارد] من (+${senderNumber})، المدة: ${audioDuration} ثانية...`);
        try {
          const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger: pino({ level: 'silent' }) });
          const transcribed = await transcribeAudio(buffer);
          if (transcribed) {
            console.log(`📝 [تم تفريغ الصوت بنجاح]: "${transcribed}"`);
            text = transcribed;
          }
        } catch (err) {
          console.warn('تعذر تحميل البصمة الصوتية:', err.message);
        }
      }

      if (!text && !isAudio) continue;

      let reply = "";
      const BACKEND_URL = process.env.BACKEND_URL || "https://flowdeskai.pythonanywhere.com";

      if (isAudio && !text) {
        // Voice note without transcription key
        reply = `🎙️ أهلاً وسهلاً بحضرتك! استلمت تسجيلك الصوتي (${audioDuration} ثانية) بنجاح.

يسعدنا خدمتك عبر المساعد الذكي لـ FlowDesk AI. مواعيدنا متاحة يومياً من الساعة 9:00 ص إلى 10:00 م. هل ترغب في حجز موعد اليوم، أو توضيح استفسارك لنساعدك فوراً؟`;
      } else {
        // Normal text or transcribed voice note
        try {
          const response = await fetch(`${BACKEND_URL}/api/v1/channels/webchat/webhook/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender_id: senderNumber,
              sender_name: `واتساب (+${senderNumber})`,
              text: text,
              is_audio: isAudio,
              channel: "whatsapp",
            }),
          });
          if (response.ok) {
            const resData = await response.json();
            if (resData.reply) {
              reply = resData.reply;
            }
          }
        } catch (e) {}

        if (!reply) {
          reply = generateSmartReply(text, senderNumber);
        }

        if (isAudio && text) {
          reply = `🎙️ [تم الاستماع إلى بصمتك الصوتية: "${text}"]\n\n${reply}`;
        }
      }

      try {
        await sock.sendMessage(remoteJid, { text: reply }, { quoted: msg });
        console.log(`📤 [تم الرد الذكي على ${isAudio ? 'التسجيل الصوتي' : 'الرسالة'}] (+${senderNumber}):\n"${reply}"\n`);

        messageLogs.unshift({
          sender: `+${senderNumber}`,
          incoming: isAudio ? (text ? `🎙️ "${text}"` : `🎙️ [تسجيل صوتي ${audioDuration} ثانية]`) : text,
          reply: reply,
          time: new Date().toLocaleTimeString('ar-IQ')
        });
      } catch (err) {
        console.error('❌ خطأ أثناء إرسال الرد:', err.message);
      }
    }
  });
}

// Start HTTP server & WhatsApp connector
server.listen(PORT, () => {
  console.log(`🚀 خادم بوابة واتساب يعمل على: http://localhost:${PORT}`);
  connectToWhatsApp();
});
