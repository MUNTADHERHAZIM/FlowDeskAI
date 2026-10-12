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

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5050;

let currentQR = null;
let currentQRDataUrl = null;
let connectionStatus = 'initializing';
let connectedUser = null;
let messageLogs = [];

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
  </style>
  <script>
    let status = "${connectionStatus}";
    setInterval(async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.status !== status || (data.status === 'qr_ready' && data.qr !== "${currentQR}") || data.logsCount !== ${messageLogs.length}) {
          location.reload();
        }
      } catch(e) {}
    }, 2500);
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
        <p style="font-size: 13px; color: #6ee7b7; margin-top: 8px;">أي شخص يرسل لك رسالة الآن، سيرد عليه الذكاء الاصطناعي نيابة عنك فوراً.</p>
      </div>
    ` : `
      <div class="badge badge-connecting">⏳ بانتظار مسح رمز QR</div>
      <h1>ربط واتساب بالذكاء الاصطناعي</h1>
      <p class="desc">امسح رمز QR أدناه من تطبيق واتساب في هاتفك لبدء الرد الآلي على عملائك وأصدقائك فوراً.</p>
      
      <div class="qr-container">
        ${currentQRDataUrl ? `<img src="${currentQRDataUrl}" alt="WhatsApp QR Code" />` : '<p style="color:#000; padding: 100px 20px;">جاري توليد الرمز...</p>'}
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

  <div class="logs-card">
    <div class="logs-title">
      <span>سجل المحادثات والردود الحية (${messageLogs.length})</span>
      <span style="font-size: 11px; color: #10b981;">تحديث تلقائي</span>
    </div>
    ${messageLogs.length === 0 ? '<p style="font-size: 13px; color: #6b7280; text-align: center; padding: 16px;">لم تصل رسائل بعد. جرب إرسال رسالة من هاتف آخر إلى رقمك لتشاهد الرد المباشر هنا.</p>' : ''}
    ${messageLogs.slice(0, 10).map(l => `
      <div class="log-item">
        <div class="log-meta">${l.sender} • ${l.time}</div>
        <div class="log-incoming">📥 رسالة العميل: <strong>${l.incoming}</strong></div>
        <div class="log-reply">🤖 رد المساعد: ${l.reply}</div>
      </div>
    `).join('')}
  </div>
</body>
</html>`);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: connectionStatus,
    user: connectedUser,
    qr: currentQR,
    logsCount: messageLogs.length
  });
});

// Intelligent AI Response Generator
function generateSmartReply(incomingText, senderNumber) {
  const text = incomingText.trim().toLowerCase();

  if (text.includes('موعد') || text.includes('حجز') || text.includes('احجز')) {
    return `أهلاً وسهلاً بحضرتك! يسعدنا خدمتك عبر المساعد الذكي لـ FlowDesk AI. مواعيدنا متاحة يومياً من الساعة 9:00 صباحاً وحتى 10:00 مساءً. يرجى إرسال اليوم والوقت المفضل لديك لتأكيد الحجز فوراً.`;
  }
  
  if (text.includes('دوام') || text.includes('ساعات') || text.includes('اوقات') || text.includes('متى')) {
    return `أهلاً بك! ساعات العمل الرسمية يومياً من الساعة 9:00 صباحاً وحتى 10:00 مساءً طوال أيام الأسبوع. هل تود الاستفسار عن خدمة معينة أو حجز موعد؟`;
  }

  if (text.includes('سعر') || text.includes('اسعار') || text.includes('تكلفة') || text.includes('بكم')) {
    return `أهلاً بحضرتك! أسعار الخدمات والاستشارات تعتمد على نوع الطلب المحدد. تفضل بتوضيح نوع الخدمة أو طلبك وسنقوم بتزويدك بالتفاصيل الدقيقة فوراً.`;
  }

  if (text.includes('مكان') || text.includes('موقع') || text.includes('عنوان') || text.includes('وين')) {
    return `أهلاً وسهلاً! فرعنا الرئيسي مفتوح لاستقبالكم، كما نوفر خدمات الدعم والمحادثات الإلكترونية عبر المنصة على مدار الساعة. هل تود حجز زيارة حضورية؟`;
  }

  if (text.includes('موظف') || text.includes('انسان') || text.includes('شخص') || text.includes('شكوى')) {
    return `تم إشعار الإدارة فوراً بطلبك للتحدث مع موظف، وسيقوم أحد الزملاء بمتابعة محادثتك مباشرة من هاتفي في أقرب وقت. شكراً لصبرك!`;
  }

  return `مرحباً بك! أنا المساعد الذكي الآلي لـ FlowDesk AI المربوط بهذا الرقم. استلمت رسالتك ("${incomingText}")، كيف يمكنني مساعدتك اليوم بخصوص الاستفسارات أو حجز المواعيد؟`;
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
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('⚠️ تم إغلاق الاتصال، رمز الحالة:', statusCode, 'إعادة المحاولة:', shouldReconnect);
      connectionStatus = 'disconnected';
      currentQR = null;
      currentQRDataUrl = null;
      if (shouldReconnect) {
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
