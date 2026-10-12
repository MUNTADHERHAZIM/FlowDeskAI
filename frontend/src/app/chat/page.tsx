"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Phone,
  Clock,
  MapPin,
  CheckCheck,
  Calendar,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Headphones,
  X,
  MessageCircle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "client" | "bot" | "human";
  text: string;
  time: string;
}

export default function PublicWebChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      sender: "bot",
      text: "أهلاً بك في العيادة الاستشارية المتقدمة! 👋 أنا المساعد الذكي، كيف يمكنني خدمتك اليوم؟ يمكنك الاستفسار عن الخدمات، الأسعار، أو حجز موعدك فوراً.",
      time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+964");
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const countryList = [
    { code: "+964", label: "العراق (+964)", flag: "🇮🇶" },
    { code: "+966", label: "السعودية (+966)", flag: "🇸🇦" },
    { code: "+971", label: "الإمارات (+971)", flag: "🇦🇪" },
    { code: "+965", label: "الكويت (+965)", flag: "🇰🇼" },
    { code: "+974", label: "قطر (+974)", flag: "🇶🇦" },
    { code: "+20", label: "مصر (+20)", flag: "🇪🇬" },
    { code: "+962", label: "الأردن (+962)", flag: "🇯🇴" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `client-${Date.now()}`,
      sender: "client",
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText("");
    setIsTyping(true);

    try {
      // Send to backend channel webhook if available
      const response = await fetch("/api/v1/channels/webchat/webhook/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": "baghdad-lab",
        },
        body: JSON.stringify({
          sender_id: clientPhone || "guest_web_user",
          sender_name: clientName || "زائر الموقع",
          text: userMsg.text,
        }),
      }).catch(() => null);

      let replyContent = "";
      if (response && response.ok) {
        const data = await response.json();
        replyContent = data.reply || "شكراً لتواصلك، تم استلام رسالتك بنجاح وسنقوم بالرد عليك في أقرب وقت.";
      } else {
        // Intelligent local response fallback
        await new Promise((r) => setTimeout(r, 900));
        const lower = userMsg.text.toLowerCase();
        if (lower.includes("موعد") || lower.includes("حجز") || lower.includes("استشارة")) {
          replyContent = `أهلاً بك ${clientName || "عزيزي"}! يسعدنا حجز موعد لك مع الطبيب الاستشاري. هل تفضل موعداً في الفترة الصباحية (9:00 ص - 1:00 م) أو المسائية (4:00 م - 8:00 م)؟`;
        } else if (lower.includes("سعر") || lower.includes("تكلفة") || lower.includes("باقة")) {
          replyContent = "تبدأ كشفية الاستشارة العامة من 25,000 د.ع، مع إمكانية المتابعة المجانية خلال 10 أيام. هل تود تفاصيل باقة معينة؟";
        } else if (lower.includes("موقع") || lower.includes("عنوان") || lower.includes("ساعات")) {
          replyContent = "موقعنا: شارع المغرب، المجمع الطبي الحديث، الطابق الثاني. أوقات الدوام: من السبت إلى الخميس، من 9:00 صباحاً حتى 8:00 مساءً.";
        } else if (lower.includes("موظف") || lower.includes("إنسان") || lower.includes("شخص")) {
          replyContent = "تم تحويل المحادثة فوراً إلى أحد موظفي خدمة العملاء. سيتواصل معك أحد زملائنا خلال لحظات.";
        } else {
          replyContent = `شكراً لتواصلك معنا عبر المحادثة المباشرة! تم تسجيل استفسارك: "${userMsg.text}". كيف يمكنني مساعدتك بأي تفاصيل أخرى؟`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: replyContent,
          time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "تم استلام رسالتك وسنرد عليك بأسرع وقت ممكن.",
          time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    { label: "📅 حجز موعد استشارة", query: "أود حجز موعد استشارة طبية" },
    { label: "💰 الاستفسار عن الأسعار", query: "ما هي أسعار وتكلفة الكشفية؟" },
    { label: "📍 موقع العيادة وأوقات العمل", query: "أين موقعكم وما هي أوقات العمل الرسمية؟" },
    { label: "👨‍💼 التحدث مع موظف بشري", query: "أريد التحدث مع موظف خدمة العملاء" },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-gray-100 flex flex-col justify-between items-center p-3 sm:p-6 font-sans">
      {/* Top Brand Banner */}
      <div className="w-full max-w-2xl bg-[#0f1628]/90 border border-gray-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col h-[94vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-[#101830] to-[#0c1322] border-b border-gray-800/80 p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0f1628] absolute -bottom-0.5 -right-0.5"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white">خدمة العملاء الذكية</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  متاح الآن
                </span>
              </div>
              <p className="text-xs text-gray-400">الرد الفوري على الاستفسارات وحجز المواعيد على مدار 24/7</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/9647801234567?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D9%88%D8%AD%D8%AC%D8%B2%20%D9%85%D9%88%D8%B9%D8%AF"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all font-bold shadow-sm"
              title="تواصل مباشرة عبر تطبيق واتساب"
            >
              <MessageCircle className="w-4 h-4 fill-emerald-500/30" />
              <span>محادثة واتساب ↗</span>
            </a>

            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-gray-900/60 border border-gray-800 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>محادثة مشفرة</span>
            </div>
          </div>
        </div>

        {/* Client Onboarding / Guest Prompt with Country Code & Cancel Button */}
        {!hasStarted && (
          <div className="bg-indigo-950/40 border-b border-indigo-900/50 p-3 px-4 sm:px-6 text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-indigo-300">
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>لتجربة مخصصة والحفاظ على سجل حجزك:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="اسمك الكريم"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-gray-900/90 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-28 sm:w-32"
              />
              <div className="flex items-center gap-1">
                <select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="bg-gray-900/90 border border-gray-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {countryList.map((c) => (
                    <option key={c.code} value={c.code} className="bg-gray-900 text-white">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="رقم الهاتف"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="bg-gray-900/90 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-28 sm:w-32 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => setHasStarted(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-md shrink-0"
              >
                تأكيد
              </button>
              <button
                type="button"
                onClick={() => setHasStarted(true)}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-2.5 py-1.5 rounded-lg text-xs transition-all shrink-0"
                title="تخطي والمتابعة كضيف"
              >
                تخطي / إلغاء
              </button>
              <button
                type="button"
                onClick={() => setHasStarted(true)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-all shrink-0"
                title="إغلاق هذا الشريط"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0a0f1c]/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${
                msg.sender === "client" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === "client"
                    ? "bg-indigo-600 text-white"
                    : msg.sender === "human"
                    ? "bg-amber-600 text-white"
                    : "bg-gray-800 text-indigo-400 border border-gray-700"
                }`}
              >
                {msg.sender === "client" ? (
                  <User className="w-4 h-4" />
                ) : msg.sender === "human" ? (
                  <Headphones className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-lg ${
                  msg.sender === "client"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-[#141d33] text-gray-200 border border-gray-800/80 rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`mt-1.5 flex items-center gap-1 text-[10px] ${
                    msg.sender === "client" ? "text-indigo-200 justify-end" : "text-gray-400"
                  }`}
                >
                  <span>{msg.time}</span>
                  {msg.sender === "client" && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#141d33] border border-gray-800 rounded-2xl px-4 py-3 text-xs text-gray-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="mr-2 text-[11px]">المساعد يكتب رداً...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Pills */}
        <div className="px-4 py-2 border-t border-gray-800/60 bg-[#0c1222] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickActions.map((qa, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qa.query)}
              className="px-3 py-1.5 rounded-xl bg-gray-900/90 hover:bg-indigo-600/20 border border-gray-800 hover:border-indigo-500/40 text-gray-300 hover:text-indigo-300 text-[11px] font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>{qa.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-[#0e1526] border-t border-gray-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="اكتب استفسارك هنا بكل وضوح..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-gray-900/90 border border-gray-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-all shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
          </button>
        </form>

        {/* Footer Brand */}
        <div className="py-1.5 text-center bg-[#090d16] border-t border-gray-900 text-[10px] text-gray-500 flex items-center justify-center gap-1">
          <span>مدعوم بواسطة</span>
          <span className="font-bold text-indigo-400">FlowDesk AI</span>
          <span>• المنظومة المتكاملة للخدمات الذكية</span>
        </div>
      </div>
    </div>
  );
}
