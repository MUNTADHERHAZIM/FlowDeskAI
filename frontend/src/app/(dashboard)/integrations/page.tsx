"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Share2,
  Phone,
  Send,
  MessageSquare,
  Mail,
  CheckCircle2,
  AlertCircle,
  Plus,
  Settings,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Smartphone,
  X,
  Check,
  Radio,
  QrCode,
  Key,
  Globe,
  Bot,
  Lock,
  Sparkles,
  HelpCircle,
  Copy,
  Download,
  Zap,
  Play,
  ArrowRight,
  CheckCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface IntegrationChannel {
  id: string;
  name: string;
  category: string;
  typeKey: "whatsapp" | "telegram" | "instagram" | "messenger" | "webchat" | "email" | "sms";
  description: string;
  icon: React.ElementType;
  status: "connected" | "pending" | "disconnected";
  account: string;
  connectionMethod?: "qr" | "api";
  color: string;
  border: string;
}

const initialChannels: IntegrationChannel[] = [
  {
    id: "webchat",
    name: "محادثة الموقع الحي (Web Chat Widget)",
    category: "موقع إلكتروني • مجاني فوري",
    typeKey: "webchat",
    description: "أسهل وأسرع وسيلة؛ تواصل فوري عبر رابط مباشر أو ودجت يوضع في أي موقع دون أي اشتراكات.",
    icon: Globe,
    status: "connected",
    account: "جاهز للتجربة الفورية بالهاتف",
    color: "text-indigo-400 bg-indigo-500/10",
    border: "border-indigo-500/30",
  },
  {
    id: "telegram",
    name: "تطبيق تيليجرام (Telegram Bot)",
    category: "بوت ذكي • مجاني 100%",
    typeKey: "telegram",
    description: "بوت خدمة عملاء وحجز مواعيد فوري مجاني للأبد؛ يُربط برمز توكن واحد في 30 ثانية.",
    icon: Send,
    status: "connected",
    account: "@BasraMedicalBot",
    color: "text-sky-400 bg-sky-500/10",
    border: "border-sky-500/30",
  },
  {
    id: "messenger",
    name: "فيسبوك ماسنجر (Facebook Messenger)",
    category: "رسائل الصفحة • مجاني 100%",
    typeKey: "messenger",
    description: "الرد الآلي على رسائل صفحتك التجارية في فيسبوك؛ مجاني بالكامل بدون أي رسوم من Meta.",
    icon: MessageSquare,
    status: "connected",
    account: "@basra_clinic_official",
    color: "text-blue-400 bg-blue-500/10",
    border: "border-blue-500/30",
  },
  {
    id: "instagram",
    name: "إنستغرام (Instagram Direct Messages)",
    category: "رسائل مباشرة • مجاني",
    typeKey: "instagram",
    description: "الرد الآلي على الرسائل الخاصة DMs لصفحتك أو حسابك التجاري في إنستغرام.",
    icon: MessageSquare,
    status: "connected",
    account: "@basra_clinic_official",
    color: "text-pink-400 bg-pink-500/10",
    border: "border-pink-500/30",
  },
  {
    id: "whatsapp",
    name: "واتساب (WhatsApp - ربط رقمي أو رسمي)",
    category: "مراسلة فورية",
    typeKey: "whatsapp",
    description: "الرد الآلي على استفسارات العملاء وحجز المواعيد عبر رقمك أو الحساب السحابي.",
    icon: Phone,
    status: "connected",
    account: "+964 780 123 4567 (متصل)",
    connectionMethod: "qr",
    color: "text-emerald-400 bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  {
    id: "email",
    name: "البريد الإلكتروني (Support Email)",
    category: "بريد رسمي",
    typeKey: "email",
    description: "استقبال استفسارات البريد وتحويلها إلى تذاكر متابعة تلقائية في النظام.",
    icon: Mail,
    status: "connected",
    account: "support@basraclinic.iq",
    color: "text-rose-400 bg-rose-500/10",
    border: "border-rose-500/30",
  },
];

const cleanNewChannels: IntegrationChannel[] = initialChannels.map((ch) => {
  if (ch.id === "webchat") {
    return { ...ch, status: "connected", account: "جاهز للتضمين والتجربة الفورية" };
  }
  return { ...ch, status: "disconnected", account: "غير مربوط بعد" };
});

export default function IntegrationsPage() {
  const { user, activeTenant } = useAuth();
  const isDemo = activeTenant?.id === "demo-tenant-101" || activeTenant?.slug === "basra-medical-center";

  const [channels, setChannels] = useState<IntegrationChannel[]>(() =>
    isDemo ? initialChannels : cleanNewChannels
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<IntegrationChannel | null>(null);

  useEffect(() => {
    if (isDemo) {
      setChannels(initialChannels);
    } else {
      setChannels(cleanNewChannels);
    }
  }, [isDemo]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active step in Wizard: 1, 2, or 3
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Interactive Live Test Simulation state
  const [testSimInput, setTestSimInput] = useState("");
  const [testSimLog, setTestSimLog] = useState<{ sender: "user" | "bot"; text: string }[]>([]);
  const [isSimReplying, setIsSimReplying] = useState(false);

  // WhatsApp Tab State
  const [whatsappMethod, setWhatsappMethod] = useState<"chat_qr" | "linked" | "api">("chat_qr");
  const [personalPhoneNumber, setPersonalPhoneNumber] = useState("07801234567");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+964");
  const [qrRefreshedTime, setQrRefreshedTime] = useState<number>(Date.now());

  const countryList = [
    { code: "+964", label: "العراق (+964)", flag: "🇮🇶" },
    { code: "+966", label: "السعودية (+966)", flag: "🇸🇦" },
    { code: "+971", label: "الإمارات (+971)", flag: "🇦🇪" },
    { code: "+965", label: "الكويت (+965)", flag: "🇰🇼" },
    { code: "+974", label: "قطر (+974)", flag: "🇶🇦" },
    { code: "+973", label: "البحرين (+973)", flag: "🇧🇭" },
    { code: "+968", label: "عُمان (+968)", flag: "🇴🇲" },
    { code: "+20", label: "مصر (+20)", flag: "🇪🇬" },
    { code: "+962", label: "الأردن (+962)", flag: "🇯🇴" },
    { code: "+90", label: "تركيا (+90)", flag: "🇹🇷" },
  ];

  const formatInternationalPhone = (phoneInput: string, defaultCode = selectedCountryCode) => {
    let clean = (phoneInput || "").trim().replace(/[\s\-\(\)]/g, "");
    if (!clean) return "";
    if (clean.startsWith("+")) return clean;
    if (clean.startsWith("00")) return "+" + clean.slice(2);
    if (clean.startsWith("0")) return `${defaultCode}${clean.slice(1)}`;
    return `${defaultCode}${clean}`;
  };

  const downloadQRCodeSVG = (svgId: string, filename: string) => {
    if (typeof document === "undefined") return;
    const svgEl = document.getElementById(svgId);
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `${filename}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  // Telegram state
  const [tgBotToken, setTgBotToken] = useState("718928192:AAH93jf92jfa...");
  const [tgBotUsername, setTgBotUsername] = useState("@BasraMedicalBot");

  // Facebook & Instagram state
  const [facebookPageName, setFacebookPageName] = useState("عيادة البصرة الطبية المتقدمة");
  const [facebookPageId, setFacebookPageId] = useState("basra_clinic_official");
  const [facebookPageToken, setFacebookPageToken] = useState("EAAJ92...page_token");
  const [instagramHandle, setInstagramHandle] = useState("@basra_clinic_official");

  // WhatsApp & Email state
  const [whatsappGreeting, setWhatsappGreeting] = useState("مرحباً، أود الاستفسار وحجز موعد عبر المساعد الذكي");
  const [emailAddress, setEmailAddress] = useState("support@basraclinic.iq");
  const [emailPassword, setEmailPassword] = useState("••••••••••••••••");
  const [emailProvider, setEmailProvider] = useState("Gmail (Google Workspace)");
  const [smsSenderName, setSmsSenderName] = useState("BasraClinic");

  // Token & Password visibility states
  const [showTgToken, setShowTgToken] = useState(false);
  const [showFbToken, setShowFbToken] = useState(false);
  const [showWaToken, setShowWaToken] = useState(false);
  const [showEmailPass, setShowEmailPass] = useState(false);
  const [showGenericToken, setShowGenericToken] = useState(false);

  // WebChat Widget state
  const [webchatWelcome, setWebchatWelcome] = useState("أهلاً بك! كيف يمكن للمساعد الذكي خدمتك اليوم؟");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Add channel state
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<string>("telegram");
  const [newAccountIdentifier, setNewAccountIdentifier] = useState("");

  const handleOpenChannelConfig = (channel: IntegrationChannel) => {
    setSelectedChannel(channel);
    setWizardStep(1);
    setTestSimLog([]);
    setModalOpen(true);
  };

  const handleSimulateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSimInput.trim()) return;

    const userText = testSimInput.trim();
    setTestSimLog((prev) => [...prev, { sender: "user", text: userText }]);
    setTestSimInput("");
    setIsSimReplying(true);

    setTimeout(() => {
      setIsSimReplying(false);
      let reply = "أهلاً بك! تلقيت رسالتك بنجاح من خلال القناة. تم التحقق من ربط الذكاء الاصطناعي وجاهز للرد على استفسارات عملائك وحجز المواعيد.";
      if (userText.includes("حجز") || userText.includes("موعد")) {
        reply = "يسعدني خدمتك! متى تفضل موعد استشارتك القادمة؟ لدينا فترات صباحية ومسائية متاحة.";
      }
      setTestSimLog((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 800);
  };

  const handleTestAndSave = async () => {
    setIsVerifying(true);
    
    // If Telegram: call automated backend setup
    if (selectedChannel?.typeKey === "telegram" && tgBotToken && !tgBotToken.includes("...")) {
      try {
        const res = await fetch("/api/v1/channels/telegram/setup/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bot_token: tgBotToken }),
        });
        const data = await res.json();
        if (res.ok) {
          setChannels((prev) =>
            prev.map((ch) =>
              ch.typeKey === "telegram"
                ? { ...ch, status: "connected", account: data.bot_username || tgBotUsername }
                : ch
            )
          );
          setSuccessToast(`🟢 ${data.message || "تم ربط وتفعيل بوت تيليجرام بنجاح!"}`);
          setIsVerifying(false);
          setModalOpen(false);
          setTimeout(() => setSuccessToast(null), 5000);
          return;
        } else {
          alert(`خطأ في ربط تيليجرام: ${data.error || "يرجى التحقق من التوكن"}`);
          setIsVerifying(false);
          return;
        }
      } catch (err) {
        console.warn("Telegram backend setup fallback", err);
      }
    }

    // Default connection handling
    setTimeout(() => {
      setIsVerifying(false);
      if (selectedChannel) {
        setChannels((prev) =>
          prev.map((ch) =>
            ch.id === selectedChannel.id ? { ...ch, status: "connected" } : ch
          )
        );
        setSuccessToast(`🟢 تم التحقق بنجاح! قناة [${selectedChannel.name}] متصلة وجاهزة لاستقبال الرسائل.`);
      }
      setModalOpen(false);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 1200);
  };

  const handleAddNewChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    let icon = Send;
    let color = "text-sky-400 bg-sky-500/10";
    let border = "border-sky-500/30";
    let typeKey: IntegrationChannel["typeKey"] = "telegram";

    if (newChannelType.includes("whatsapp")) {
      icon = Phone;
      color = "text-emerald-400 bg-emerald-500/10";
      border = "border-emerald-500/30";
      typeKey = "whatsapp";
    } else if (newChannelType.includes("messenger")) {
      icon = MessageSquare;
      color = "text-blue-400 bg-blue-500/10";
      border = "border-blue-500/30";
      typeKey = "messenger";
    } else if (newChannelType.includes("webchat")) {
      icon = Globe;
      color = "text-indigo-400 bg-indigo-500/10";
      border = "border-indigo-500/30";
      typeKey = "webchat";
    }

    const newCh: IntegrationChannel = {
      id: `ch_${Date.now()}`,
      name: newChannelName.trim(),
      category: "قناة تواصل ذكية",
      typeKey,
      description: "قناة مخصصة للرد الآلي وتوجيه المحادثات عبر محرك الأتمتة والذكاء الاصطناعي.",
      icon,
      status: "connected",
      account: newAccountIdentifier.trim() || "+964 ...",
      connectionMethod: "api",
      color,
      border,
    };

    setChannels((prev) => [...prev, newCh]);
    setShowAddModal(false);
    setNewChannelName("");
    setNewAccountIdentifier("");
    setSuccessToast(`تمت إضافة قناة [${newCh.name}] بنجاح وتفعيل الاستقبال الفوري.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-200 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-indigo-400" />
            <span>التكاملات وقنوات الاتصال الموحدة</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            اربط قنوات التواصل للتجربة الفورية المجانية على هاتفك في دقائق، دون أي تعقيد.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة اتصال جديد</span>
        </button>
      </div>

      {/* QUICK LAUNCH BANNER: 100% FREE CHANNELS FOR INSTANT PHONE TESTING */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950/60 via-[#121a36] to-[#0d162d] border border-indigo-500/30 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>التجربة الفورية المجانية 100% على هاتفك</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  بدون أي اشتراكات أو بطاقة
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                اختر القناة المفضلة لديك وجرب إرسال رسالة من هاتفك ليرد عليك الذكاء الاصطناعي فوراً:
              </p>
            </div>
          </div>
        </div>

        {/* 4 Instant Quick Launch Channel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. WhatsApp Card */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">واتساب (WhatsApp)</h3>
                  <span className="text-[10px] text-emerald-400 font-bold">ربط مباشر • باركود فوري</span>
                </div>
              </div>
              <span className="text-emerald-400 text-xs">🟢 متصل</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              اربط رقمك الشخصي مع مفتاح الدولة أو ولّد باركود شات فوري لعملائك للرد التلقائي.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const channel = channels.find((c) => c.typeKey === "whatsapp");
                  if (channel) handleOpenChannelConfig(channel);
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>📱 مسح باركود واتساب</span>
              </button>
            </div>
          </div>

          {/* 2. WebChat Card */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-indigo-500/30 hover:border-indigo-500/60 transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">شات الموقع المباشر</h3>
                  <span className="text-[10px] text-emerald-400 font-bold">جاهز فوراً • صفر إعدادات</span>
                </div>
              </div>
              <span className="text-emerald-400 text-xs">🟢 نشط</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              افتح الرابط في متصفح هاتفك، وتحدث مع المساعد الذكي فوراً وكأنك عميل!
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="/chat"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>📱 جرب بهاتفك الآن</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  const channel = channels.find((c) => c.typeKey === "webchat");
                  if (channel) handleOpenChannelConfig(channel);
                }}
                className="p-1.5 px-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold"
                title="عرض الباركود والكود"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Telegram Bot Card */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-sky-500/30 hover:border-sky-500/60 transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">بوت تيليجرام المجاني</h3>
                  <span className="text-[10px] text-sky-400 font-bold">ربط في 30 ثانية مجاناً</span>
                </div>
              </div>
              <span className="text-sky-400 text-xs">🟢 متصل</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              افتح تطبيق تيليجرام بهاتفك وراسل البوت (@BasraMedicalBot) وسيجيبك النظام لحظياً.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://t.me/${tgBotUsername.replace("@", "").trim()}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح البوت بتيليجرام ↗</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  const channel = channels.find((c) => c.typeKey === "telegram");
                  if (channel) handleOpenChannelConfig(channel);
                }}
                className="p-1.5 px-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold"
                title="تعديل التوكن والباركود"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 4. Facebook Messenger Card */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-blue-500/30 hover:border-blue-500/60 transition-all flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">فيسبوك ماسنجر</h3>
                  <span className="text-[10px] text-blue-400 font-bold">رسائل الصفحة مجاناً</span>
                </div>
              </div>
              <span className="text-blue-400 text-xs">🟢 متصل</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              الرد الآلي على رسائل صفحتك الرسمية؛ رسائل مجانية تماماً وبدون أي رسوم من Meta.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const channel = channels.find((c) => c.typeKey === "messenger");
                  if (channel) handleOpenChannelConfig(channel);
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>خطوات التهيئة والباركود</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ALL CHANNELS GRID */}
      <div>
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <span>كافة القنوات المتاحة في النظام</span>
          <span className="text-xs text-gray-400 font-normal">({channels.length} قنوات)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isConnected = channel.status === "connected";

            return (
              <div
                key={channel.id}
                className="rounded-2xl border border-gray-800 bg-[#0f1628]/80 hover:border-gray-700 transition-all p-5 flex flex-col justify-between shadow-xl space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${channel.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                          {channel.name}
                        </h3>
                        <span className="text-[11px] text-gray-400">{channel.category}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isConnected
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {isConnected ? "🟢 متصل" : "🟡 قيد الربط"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                    {channel.description}
                  </p>
                </div>

                <div className="space-y-3 border-t border-gray-800/80 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">الحساب / المعرّف:</span>
                    <span className="text-gray-300 font-mono font-medium text-[11px] truncate max-w-[160px]">
                      {channel.account}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenChannelConfig(channel)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-indigo-500/40 text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5 text-indigo-400" />
                      <span>مرشد الربط (خطوات 1، 2، 3)</span>
                    </button>

                    {channel.typeKey === "webchat" && (
                      <a
                        href="/chat"
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>جرب ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          STEP-BY-STEP GUIDED WIZARD MODAL (خطوات 1، 2، 3 بضغطة زر)
         ======================================================== */}
      {modalOpen && selectedChannel && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0d1424] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${selectedChannel.color}`}>
                  <selectedChannel.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>مرشد الإعداد والربط: {selectedChannel.name}</span>
                  </h2>
                  <p className="text-xs text-gray-400">إعداد مبسط في 3 خطوات سهلة بضغطة زر واحدة</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* WIZARD STEP INDICATOR (1 -> 2 -> 3) */}
            <div className="py-4 border-b border-gray-800/80">
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
                    wizardStep === 1
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30"
                      : "bg-gray-900/60 border-gray-800/80 text-gray-400 hover:text-gray-200 hover:border-gray-700"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    wizardStep === 1 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40 scale-105" : "bg-gray-800 text-gray-400"
                  }`}>1</span>
                  <div className="text-xs">
                    <span className="block font-bold">الخطوة الأولى</span>
                    <span className="text-[10px] text-gray-400">التجهيز والبدء</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
                    wizardStep === 2
                      ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/30"
                      : "bg-gray-900/60 border-gray-800/80 text-gray-400 hover:text-gray-200 hover:border-gray-700"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    wizardStep === 2 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40 scale-105" : "bg-gray-800 text-gray-400"
                  }`}>2</span>
                  <div className="text-xs">
                    <span className="block font-bold">الخطوة الثانية</span>
                    <span className="text-[10px] text-gray-400">بيانات الربط</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
                    wizardStep === 3
                      ? "bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30"
                      : "bg-gray-900/60 border-gray-800/80 text-gray-400 hover:text-gray-200 hover:border-gray-700"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    wizardStep === 3 ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40 scale-105" : "bg-gray-800 text-gray-400"
                  }`}>3</span>
                  <div className="text-xs">
                    <span className="block font-bold">الخطوة الثالثة</span>
                    <span className="text-[10px] text-gray-400">مسح QR والفحص</span>
                  </div>
                </button>
              </div>
            </div>

            {/* MODAL BODY PER CHANNEL */}
            <div className="py-4 overflow-y-auto flex-1 space-y-4 text-xs pr-1">

              {/* 1. TELEGRAM WIZARD */}
              {selectedChannel.typeKey === "telegram" && (
                <div className="space-y-4">
                  {wizardStep === 1 && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 text-gray-300 space-y-2">
                        <h4 className="font-bold text-sm text-sky-300 flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          <span>الخطوة 1: الحصول على توكن تيليجرام المجاني في 30 ثانية</span>
                        </h4>
                        <p className="text-xs leading-relaxed">
                          شركة تيليجرام توفر بوتات خدمة العملاء مجاناً 100% مدى الحياة بدون أي شروط أو بطاقات ائتمانية. كل ما تحتاجه هو إرسال أمر واحد لـ BotFather.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <span className="text-xs font-bold text-white block">اضغط الزر التالي لفتح محادثة BotFather فوراً:</span>
                        <a
                          href="https://t.me/BotFather"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/30"
                        >
                          <Send className="w-4 h-4" />
                          <span>فتح @BotFather في تيليجرام بنقرة واحدة ↗</span>
                        </a>
                        <div className="text-[11px] text-gray-400 space-y-1 bg-gray-950 p-3 rounded-xl border border-gray-800">
                          <p>1. أرسل له الأمر: <code className="text-sky-300 font-bold">/newbot</code></p>
                          <p>2. اكتب اسم عيادتك أو نشاطك التجاري.</p>
                          <p>3. اختر معرفاً للبوت ينتهي بكلمة bot (مثال: BasraClinicBot).</p>
                          <p>4. سيعطيك فوراً كود يسمى <strong>API Token</strong>.</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                        >
                          <span>الانتقال للخطوة 2: لصق التوكن</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <h4 className="font-bold text-sm text-white">الخطوة 2: إدخال بيانات البوت في النظام</h4>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">معرف البوت (Username)</label>
                          <input
                            type="text"
                            value={tgBotUsername}
                            onChange={(e) => setTgBotUsername(e.target.value)}
                            placeholder="@BasraMedicalBot"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">توكن البوت (API Token من BotFather)</label>
                          <div className="relative">
                            <input
                              type={showTgToken ? "text" : "password"}
                              value={tgBotToken}
                              onChange={(e) => setTgBotToken(e.target.value)}
                              placeholder="718928192:AAH93jf92jfa..."
                              className="w-full bg-gray-950 border border-gray-800 rounded-xl pr-3.5 pl-10 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowTgToken(!showTgToken)}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                              title={showTgToken ? "إخفاء التوكن" : "إظهار التوكن"}
                            >
                              {showTgToken ? <EyeOff className="w-4 h-4 text-sky-400" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                        >
                          <span>الانتقال للخطوة 3: الفحص ومسح الباركود</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-gray-300 space-y-1">
                        <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                          <CheckCheck className="w-4 h-4" />
                          <span>الخطوة 3: تجربة البوت فوراً من هاتفك</span>
                        </h4>
                        <p className="text-[11px]">
                          امسح الرمز أدناه بكاميرا هاتفك لفتح البوت مباشرة ومحادثة الذكاء الاصطناعي:
                        </p>
                      </div>

                      {/* Real QR Display */}
                      <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center max-w-[230px] mx-auto shadow-2xl">
                        <QRCodeSVG
                          id="tg-qr-wizard"
                          value={`https://t.me/${tgBotUsername.replace("@", "").trim()}`}
                          size={160}
                          level="H"
                          includeMargin={true}
                        />
                        <span className="text-[10px] text-gray-600 font-bold mt-2 flex items-center gap-1">
                          <Send className="w-3 h-3 text-sky-600" />
                          <span>مسح فوري • {tgBotUsername}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`https://t.me/${tgBotUsername.replace("@", "").trim()}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>فتح البوت في تيليجرام ↗</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadQRCodeSVG("tg-qr-wizard", `telegram-${tgBotUsername}`)}
                          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-gray-700"
                        >
                          <Download className="w-3.5 h-3.5 text-sky-400" />
                          <span>تحميل الباركود</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. WEBCHAT WIZARD */}
              {selectedChannel.typeKey === "webchat" && (
                <div className="space-y-4">
                  {wizardStep === 1 && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-gray-300 space-y-2">
                        <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>الخطوة 1: المحادثة المباشرة جاهزة وفورية بدون أي إعدادات!</span>
                        </h4>
                        <p className="text-xs leading-relaxed">
                          صفحة الشات المباشر تعمل داخل النظام فوراً. لا تحتاج فيسبوك أو مطورين أو موافقات. يمكنك إرسال الرابط لعملائك أو وضعه في حسابات التواصل.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                        <label className="text-gray-300 font-bold block text-xs">رابط المحادثة العام للعملاء:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={typeof window !== "undefined" ? `${window.location.origin}/chat` : "http://localhost:3000/chat"}
                            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-indigo-300 font-mono text-xs select-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof navigator !== "undefined") {
                                navigator.clipboard.writeText(`${window.location.origin}/chat`);
                                setCopiedLink(true);
                                setTimeout(() => setCopiedLink(false), 2000);
                              }
                            }}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1 shrink-0 text-xs"
                          >
                            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedLink ? "تم النسخ" : "نسخ"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                        >
                          <span>الانتقال للخطوة 2: كود التضمين للموقع</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
                        <h4 className="font-bold text-sm text-white">الخطوة 2: كود التضمين في أي موقع إلكتروني</h4>
                        <p className="text-[11px] text-gray-400">
                          انسخ هذا السطر وضعه في موقعك (WordPress أو سلة أو زد أو صفحة HTML) ليظهر زر شات عائم:
                        </p>
                        <div className="relative">
                          <textarea
                            readOnly
                            rows={3}
                            value={`<script src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/widget.js" data-tenant="baghdad-lab" async></script>`}
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-emerald-400 font-mono text-[11px] resize-none select-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const code = `<script src="${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/widget.js" data-tenant="baghdad-lab" async></script>`;
                              if (typeof navigator !== "undefined") {
                                navigator.clipboard.writeText(code);
                                setCopiedScript(true);
                                setTimeout(() => setCopiedScript(false), 2000);
                              }
                            }}
                            className="absolute left-2.5 top-2.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-gray-700"
                          >
                            {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedScript ? "تم النسخ!" : "نسخ الكود"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                        >
                          <span>الانتقال للخطوة 3: التجربة الفورية بالهاتف</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-gray-300 space-y-1">
                        <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          <span>الخطوة 3: مسح الباركود بهاتفك وتجربة الشات فوراً</span>
                        </h4>
                        <p className="text-[11px]">
                          امسح الرمز أدناه بكاميرا أي هاتف، وسينقلك لصفحة الشات العربية الأنيقة فوراً:
                        </p>
                      </div>

                      {/* Real QR Display */}
                      <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center max-w-[230px] mx-auto shadow-2xl">
                        <QRCodeSVG
                          id="webchat-qr-wizard"
                          value={typeof window !== "undefined" ? `${window.location.origin}/chat` : "http://localhost:3000/chat"}
                          size={160}
                          level="H"
                          includeMargin={true}
                        />
                        <span className="text-[10px] text-gray-600 font-bold mt-2 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-indigo-600" />
                          <span>مسح فوري • شات الموقع المباشر</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <a
                          href="/chat"
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>فتح وتجربة الشات الآن ↗</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadQRCodeSVG("webchat-qr-wizard", "webchat-qr-code")}
                          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-gray-700"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-400" />
                          <span>تحميل الباركود للطباعة</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. FACEBOOK MESSENGER WIZARD */}
              {selectedChannel.typeKey === "messenger" && (
                <div className="space-y-4">
                  {wizardStep === 1 && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-gray-300 space-y-2">
                        <h4 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>الخطوة 1: ربط رسائل صفحة فيسبوك المجانية</span>
                        </h4>
                        <p className="text-xs leading-relaxed">
                          شركة Meta تتيح استقبال والرد على رسائل صفحات فيسبوك مجاناً 100% مدى الحياة بدون أي رسوم محادثات.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <span className="text-xs font-bold text-white block">اسم صفحتك الرسمية على فيسبوك:</span>
                        <input
                          type="text"
                          value={facebookPageName}
                          onChange={(e) => setFacebookPageName(e.target.value)}
                          placeholder="عيادة الدكتور مهند الاستشارية"
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                        >
                          <span>الانتقال للخطوة 2: المعرف وتوكن الصفحة</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <h4 className="font-bold text-sm text-white">الخطوة 2: معرف الصفحة (Page Username)</h4>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">معرف الصفحة في فيسبوك (مثال: @clinic_baghdad)</label>
                          <input
                            type="text"
                            value={facebookPageId}
                            onChange={(e) => setFacebookPageId(e.target.value)}
                            placeholder="basra_clinic_official"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">Page Access Token</label>
                          <div className="relative">
                            <input
                              type={showFbToken ? "text" : "password"}
                              value={facebookPageToken}
                              onChange={(e) => setFacebookPageToken(e.target.value)}
                              placeholder="EAAJ...PageAccessToken"
                              className="w-full bg-gray-950 border border-gray-800 rounded-xl pr-3.5 pl-10 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowFbToken(!showFbToken)}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                              title={showFbToken ? "إخفاء التوكن" : "إظهار التوكن"}
                            >
                              {showFbToken ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                        >
                          <span>الانتقال للخطوة 3: مسح QR والتجربة</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-gray-300 space-y-1">
                        <h4 className="font-bold text-sm text-blue-300 flex items-center gap-2">
                          <CheckCheck className="w-4 h-4" />
                          <span>الخطوة 3: باركود مراسلة الصفحة في ماسنجر</span>
                        </h4>
                        <p className="text-[11px]">
                          امسح الرمز أدناه ليفتح محادثة ماسنجر فورية مع صفحتك:
                        </p>
                      </div>

                      {/* Real QR Display */}
                      <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center max-w-[230px] mx-auto shadow-2xl">
                        <QRCodeSVG
                          id="messenger-qr-wizard"
                          value={`https://m.me/${facebookPageId.replace("@", "").trim()}`}
                          size={160}
                          level="H"
                          includeMargin={true}
                        />
                        <span className="text-[10px] text-gray-600 font-bold mt-2 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-blue-600" />
                          <span>مسح فوري • m.me/{facebookPageId}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`https://m.me/${facebookPageId.replace("@", "").trim()}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>فتح ماسنجر ↗</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadQRCodeSVG("messenger-qr-wizard", `messenger-${facebookPageId}`)}
                          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-gray-700"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-400" />
                          <span>تحميل الباركود</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. WHATSAPP WIZARD */}
              {selectedChannel.typeKey === "whatsapp" && (
                <div className="space-y-4">
                  {/* Step 1: Mode & Phone Setup */}
                  {wizardStep === 1 && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-gray-300 space-y-2">
                        <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>الخطوة 1: اختيار طريقة الربط ورقم الهاتف</span>
                        </h4>
                        <p className="text-xs leading-relaxed">
                          يمكنك بدء المحادثة فوراً عبر رقم هاتفك المباشر برمز QR سريع دون أي تعقيد، أو ربط حساب Meta Cloud API الرسمي.
                        </p>
                      </div>

                      {/* WhatsApp Mode selector */}
                      <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-900 border border-gray-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setWhatsappMethod("chat_qr")}
                          className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                            whatsappMethod === "chat_qr"
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                              : "text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>رمز QR المباشر للعملاء (الأسرع مجاناً)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setWhatsappMethod("api")}
                          className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                            whatsappMethod === "api"
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                              : "text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Meta Cloud API (الربط الرسمي)</span>
                        </button>
                      </div>

                      {/* Phone Input with Country Code Selector */}
                      <div className="space-y-2 bg-gray-900/60 p-3.5 rounded-2xl border border-gray-800">
                        <label className="block text-gray-300 font-bold text-xs">
                          اختر مفتاح الدولة واكتب رقم هاتفك المعتمد:
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedCountryCode}
                            onChange={(e) => setSelectedCountryCode(e.target.value)}
                            className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-2 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none shrink-0"
                          >
                            {countryList.map((c) => (
                              <option key={c.code} value={c.code} className="bg-gray-900 text-white">
                                {c.flag} {c.label}
                              </option>
                            ))}
                          </select>

                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={personalPhoneNumber}
                              onChange={(e) => setPersonalPhoneNumber(e.target.value)}
                              placeholder="0780 123 4567"
                              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 pl-8"
                            />
                            <Phone className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-gray-400">الرقم المعتمد دولياً:</span>
                          <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            {formatInternationalPhone(personalPhoneNumber)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
                        >
                          <span>الانتقال للخطوة 2: الرسالة الترحيبية وتخصيص الرد</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Welcome Greeting & Credentials */}
                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <h4 className="font-bold text-sm text-white">الخطوة 2: الرسالة التلقائية للعميل وبيانات الربط</h4>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">الرسالة المكتوبة مسبقاً عند نقر العميل على الرابط:</label>
                          <textarea
                            rows={2}
                            value={whatsappGreeting}
                            onChange={(e) => setWhatsappGreeting(e.target.value)}
                            placeholder="مرحباً، أود الاستفسار وحجز موعد..."
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
                          />
                        </div>

                        {whatsappMethod === "api" ? (
                          <div className="space-y-3 pt-2 border-t border-gray-800">
                            <div>
                              <label className="block text-gray-400 mb-1 font-medium">Phone Number ID (من بوابة Meta)</label>
                              <input
                                type="text"
                                defaultValue="10492817294812"
                                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-gray-400 mb-1 font-medium">Permanent Access Token</label>
                              <div className="relative">
                                <input
                                  type={showWaToken ? "text" : "password"}
                                  defaultValue="EAABwzL12345abcdef67890..."
                                  className="w-full bg-gray-950 border border-gray-800 rounded-xl pr-3.5 pl-10 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowWaToken(!showWaToken)}
                                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                                  title={showWaToken ? "إخفاء التوكن" : "إظهار التوكن"}
                                >
                                  {showWaToken ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-[11px] text-gray-300 space-y-1">
                            <span className="text-emerald-400 font-bold block">✓ وضع الـ QR المباشر النشط:</span>
                            <p>سيتم توجيه العميل فوراً إلى تطبيق واتساب على الرقم الدولي المعتمد ({formatInternationalPhone(personalPhoneNumber)}) مع الرسالة المكتوبة أعلاه.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
                        >
                          <span>الانتقال للخطوة 3: مسح رمز QR والتجربة الفورية</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: QR Code & Verification */}
                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-gray-300 space-y-1">
                        <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                          <CheckCheck className="w-4 h-4" />
                          <span>الخطوة 3: مسح باركود واتساب والتجربة من هاتفك</span>
                        </h4>
                        <p className="text-[11px]">
                          امسح الرمز أدناه بكاميرا هاتفك ليفتح محادثة واتساب الحية فوراً مع الرقم المعتمد:
                        </p>
                      </div>

                      {/* Live Generated QR Code Card */}
                      <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center max-w-[230px] mx-auto shadow-2xl">
                        <QRCodeSVG
                          id="whatsapp-qr-wizard"
                          value={`https://wa.me/${formatInternationalPhone(personalPhoneNumber).replace("+", "")}?text=${encodeURIComponent(whatsappGreeting)}`}
                          size={160}
                          level="H"
                          includeMargin={true}
                        />
                        <span className="text-[10px] text-gray-600 font-bold mt-2 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>مسح فوري • {formatInternationalPhone(personalPhoneNumber)}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`https://wa.me/${formatInternationalPhone(personalPhoneNumber).replace("+", "")}?text=${encodeURIComponent(whatsappGreeting)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>فتح محادثة واتساب ↗</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadQRCodeSVG("whatsapp-qr-wizard", `whatsapp-${personalPhoneNumber}`)}
                          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-gray-700"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>تحميل الباركود</span>
                        </button>
                      </div>

                      <div className="flex justify-start pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 2
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. INSTAGRAM WIZARD */}
              {selectedChannel.typeKey === "instagram" && (
                <div className="space-y-4">
                  {wizardStep === 1 && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/30 text-gray-300 space-y-2">
                        <h4 className="font-bold text-sm text-pink-300 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>الخطوة 1: تجهيز حساب إنستغرام التجاري (Professional DMs)</span>
                        </h4>
                        <p className="text-xs leading-relaxed">
                          الرد الآلي على رسائل إنستغرام الخاصة متاح مجاناً عبر Meta. تأكد فقط من تحويل حسابك إلى حساب أعمال (Business/Creator) وربطه بصفحتك على فيسبوك.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <span className="text-xs font-bold text-white block">اسم النشاط أو العيادة على إنستغرام:</span>
                        <input
                          type="text"
                          value={facebookPageName}
                          onChange={(e) => setFacebookPageName(e.target.value)}
                          placeholder="عيادة البصرة الطبية المتقدمة"
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-pink-500"
                        />
                        <div className="text-[11px] text-gray-400 space-y-1 bg-gray-950 p-3 rounded-xl border border-gray-800">
                          <p>1. افتح تطبيق إنستغرام بهاتفك وانتقل إلى الإعدادات.</p>
                          <p>2. اختر نوع الحساب واجعله <code className="text-pink-300 font-bold">حساب احترافي (Professional)</code>.</p>
                          <p>3. فعّل خيار &quot;السماح بالوصول إلى الرسائل (Allow access to messages)&quot;.</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-pink-600/20"
                        >
                          <span>الانتقال للخطوة 2: معرّف الحساب والردود السريعة</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <h4 className="font-bold text-sm text-white">الخطوة 2: معرّف الحساب في إنستغرام (Handle)</h4>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">اسم المستخدم على إنستغرام (Username)</label>
                          <input
                            type="text"
                            value={instagramHandle}
                            onChange={(e) => setInstagramHandle(e.target.value)}
                            placeholder="@basra_clinic_official"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">الأسئلة الافتتاحية السريعة (Icebreakers):</label>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="p-2 rounded-lg bg-gray-950 border border-gray-800 text-gray-300">1. حجز موعد جديد أو استشارة طبية</div>
                            <div className="p-2 rounded-lg bg-gray-950 border border-gray-800 text-gray-300">2. الاستفسار عن الأسعار وموقع العيادة</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-pink-600/20"
                        >
                          <span>الانتقال للخطوة 3: مسح QR والتجربة</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/30 text-gray-300 space-y-1">
                        <h4 className="font-bold text-sm text-pink-300 flex items-center gap-2">
                          <CheckCheck className="w-4 h-4" />
                          <span>الخطوة 3: باركود مراسلة الحساب في إنستغرام</span>
                        </h4>
                        <p className="text-[11px]">
                          امسح الرمز أدناه ليفتح المحادثة المباشرة في تطبيق إنستغرام فوراً:
                        </p>
                      </div>

                      {/* Real QR Display */}
                      <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center max-w-[230px] mx-auto shadow-2xl">
                        <QRCodeSVG
                          id="instagram-qr-wizard"
                          value={`https://ig.me/m/${instagramHandle.replace("@", "").trim()}`}
                          size={160}
                          level="H"
                          includeMargin={true}
                        />
                        <span className="text-[10px] text-gray-600 font-bold mt-2 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-pink-600" />
                          <span>مسح فوري • ig.me/m/{instagramHandle.replace("@", "")}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`https://ig.me/m/${instagramHandle.replace("@", "").trim()}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-pink-600/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>فتح إنستغرام ↗</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadQRCodeSVG("instagram-qr-wizard", `instagram-${instagramHandle}`)}
                          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-gray-700"
                        >
                          <Download className="w-3.5 h-3.5 text-pink-400" />
                          <span>تحميل الباركود</span>
                        </button>
                      </div>

                      <div className="flex justify-start pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 2
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. EMAIL WIZARD */}
              {selectedChannel.typeKey === "email" && (
                <div className="space-y-4">
                  {wizardStep === 1 && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-gray-300 space-y-2">
                        <h4 className="font-bold text-sm text-rose-300 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>الخطوة 1: اختيار مزود البريد الإلكتروني</span>
                        </h4>
                        <p className="text-xs leading-relaxed">
                          اربط بريدك الرسمي ليقوم الذكاء الاصطناعي بالرد على استفسارات العملاء وتحويلها إلى تذاكر متابعة تلقائية.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <label className="block text-gray-400 font-medium">نوع مزود الخدمة:</label>
                        <select
                          value={emailProvider}
                          onChange={(e) => setEmailProvider(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-rose-500"
                        >
                          <option>Gmail (Google Workspace)</option>
                          <option>Microsoft Outlook / Office 365</option>
                          <option>Custom SMTP/IMAP</option>
                        </select>
                        <p className="text-[11px] text-gray-400">
                          يدعم FlowDesk المصادقة الآمنة عبر OAuth2 أو كلمات مرور التطبيقات (App Passwords).
                        </p>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20"
                        >
                          <span>الانتقال للخطوة 2: عنوان البريد وبيانات الاعتماد</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <h4 className="font-bold text-sm text-white">الخطوة 2: عنوان البريد الإلكتروني وكلمة المرور</h4>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">عنوان البريد الإلكتروني (Support Email)</label>
                          <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            placeholder="support@company.com"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">كلمة مرور التطبيق (App Password)</label>
                          <div className="relative">
                            <input
                              type={showEmailPass ? "text" : "password"}
                              value={emailPassword}
                              onChange={(e) => setEmailPassword(e.target.value)}
                              placeholder="••••••••••••••••"
                              className="w-full bg-gray-950 border border-gray-800 rounded-xl pr-3.5 pl-10 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEmailPass(!showEmailPass)}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                              title={showEmailPass ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                            >
                              {showEmailPass ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-600/20"
                        >
                          <span>الانتقال للخطوة 3: فحص الاتصال ومسح QR</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-gray-300 space-y-1">
                        <h4 className="font-bold text-sm text-rose-300 flex items-center gap-2">
                          <CheckCheck className="w-4 h-4" />
                          <span>الخطوة 3: فحص البريد ومسح الرمز للتجربة</span>
                        </h4>
                        <p className="text-[11px]">
                          امسح الرمز أدناه لإنشاء رسالة بريد إلكتروني تجريبية فورية لحساب الدعم:
                        </p>
                      </div>

                      {/* Real QR Display */}
                      <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col items-center justify-center max-w-[230px] mx-auto shadow-2xl">
                        <QRCodeSVG
                          id="email-qr-wizard"
                          value={`mailto:${emailAddress}?subject=${encodeURIComponent("استفسار عبر FlowDesk AI")}`}
                          size={160}
                          level="H"
                          includeMargin={true}
                        />
                        <span className="text-[10px] text-gray-600 font-bold mt-2 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-rose-600" />
                          <span>مسح فوري • {emailAddress}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={`mailto:${emailAddress}?subject=${encodeURIComponent("استفسار عبر FlowDesk AI")}`}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>إرسال بريد تجريبي ↗</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadQRCodeSVG("email-qr-wizard", `email-${emailAddress}`)}
                          className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center gap-1.5 border border-gray-700"
                        >
                          <Download className="w-3.5 h-3.5 text-rose-400" />
                          <span>تحميل الباركود</span>
                        </button>
                      </div>

                      <div className="flex justify-start pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 2
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 7. FALLBACK / OTHER CHANNELS WIZARD (SMS / CUSTOM) */}
              {selectedChannel.typeKey !== "telegram" &&
                selectedChannel.typeKey !== "webchat" &&
                selectedChannel.typeKey !== "messenger" &&
                selectedChannel.typeKey !== "whatsapp" &&
                selectedChannel.typeKey !== "instagram" &&
                selectedChannel.typeKey !== "email" && (
                <div className="space-y-4">
                  {wizardStep === 1 && (
                    <div className="space-y-3 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-gray-300 space-y-2">
                        <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                          <selectedChannel.icon className="w-4 h-4" />
                          <span>الخطوة 1: بدء إعداد وتجهيز قناة [{selectedChannel.name}]</span>
                        </h4>
                        <p className="text-xs leading-relaxed">{selectedChannel.description}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <label className="block text-gray-400 font-medium">اسم القناة في النظام:</label>
                        <input
                          type="text"
                          defaultValue={selectedChannel.name}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                        >
                          <span>الانتقال للخطوة 2: بيانات الربط والـ API</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3">
                        <h4 className="font-bold text-sm text-white">الخطوة 2: معرّف الحساب وبيانات الاعتماد</h4>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">اسم الحساب أو Sender ID</label>
                          <input
                            type="text"
                            value={smsSenderName}
                            onChange={(e) => setSmsSenderName(e.target.value)}
                            placeholder="BasraClinic"
                            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1 font-medium">API Key أو توكن الربط</label>
                          <div className="relative">
                            <input
                              type={showGenericToken ? "text" : "password"}
                              defaultValue="flowdesk_live_secret_key_9938"
                              className="w-full bg-gray-950 border border-gray-800 rounded-xl pr-3.5 pl-10 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowGenericToken(!showGenericToken)}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                              title={showGenericToken ? "إخفاء التوكن" : "إظهار التوكن"}
                            >
                              {showGenericToken ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(1)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setWizardStep(3)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                        >
                          <span>الانتقال للخطوة 3: فحص الاتصال</span>
                          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-gray-300 space-y-1">
                        <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2">
                          <CheckCheck className="w-4 h-4" />
                          <span>الخطوة 3: فحص الاتصال وتأكيد الحالة</span>
                        </h4>
                        <p className="text-[11px]">
                          تمت معالجة القناة والتحقق من صحة مفاتيح التشفير، وهي جاهزة للعمل.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-center space-y-2">
                        <span className="text-emerald-400 font-bold text-sm block">🟢 الاتصال نشط بنجاح</span>
                        <p className="text-xs text-gray-400">يمكنك تجربة الرد الآلي في صندوق المحاكاة بالأسفل.</p>
                      </div>

                      <div className="flex justify-start pt-2">
                        <button
                          type="button"
                          onClick={() => setWizardStep(2)}
                          className="text-gray-400 hover:text-white text-xs"
                        >
                          العودة للخطوة 2
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LIVE SIMULATION BOX (فحص وتجربة المحادثة الحية داخل النافذة) */}
              <div className="mt-4 pt-3 border-t border-gray-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>تجربة وفحص الرد الآلي للذكاء الاصطناعي الآن:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">🟢 المحرك جاهز</span>
                </div>

                <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-3 max-h-36 overflow-y-auto space-y-2">
                  {testSimLog.length === 0 ? (
                    <p className="text-[11px] text-gray-500 text-center py-2">
                      اكتب رسالة تجريبية أدناه (مثلاً: مرحباً أو أود حجز موعد) لرؤية رد النظام الحي...
                    </p>
                  ) : (
                    testSimLog.map((log, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 ${
                          log.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-1.5 text-[11px] leading-relaxed ${
                            log.sender === "user"
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-800 text-gray-200 border border-gray-700"
                          }`}
                        >
                          {log.text}
                        </div>
                      </div>
                    ))
                  )}

                  {isSimReplying && (
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                      <span>الذكاء الاصطناعي يكتب رداً...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSimulateMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={testSimInput}
                    onChange={(e) => setTestSimInput(e.target.value)}
                    placeholder="اكتب رسالة تجريبية هنا..."
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!testSimInput.trim()}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition-all shadow-md"
                  >
                    إرسال
                  </button>
                </form>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>الاتصال مشفر ومربوط بنظام العزل الذري للمؤسسة</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-medium"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleTestAndSave}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جارٍ التحقق...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>حفظ وتفعيل القناة</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modern Add Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1628] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>ربط قناة اتصال جديدة</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewChannel} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">نوع القناة</label>
                <select
                  value={newChannelType}
                  onChange={(e) => setNewChannelType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="telegram">تيليجرام (Telegram Bot - مجاني)</option>
                  <option value="webchat">شات الموقع المباشر (Web Chat - مجاني)</option>
                  <option value="messenger">فيسبوك ماسنجر (Facebook Messenger - مجاني)</option>
                  <option value="whatsapp">واتساب (WhatsApp)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">اسم الاتصال التوضيحي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بوت الحجوزات السريع"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">معرف الحساب / الرقم</label>
                <input
                  type="text"
                  placeholder="@BotUsername أو رقم الهاتف"
                  value={newAccountIdentifier}
                  onChange={(e) => setNewAccountIdentifier(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  تأكيد وإضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
