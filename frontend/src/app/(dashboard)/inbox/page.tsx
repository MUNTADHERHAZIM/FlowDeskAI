"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  Phone,
  Send,
  MessageSquare,
  Mail,
  CheckCheck,
  Sparkles,
  Paperclip,
  MoreVertical,
  Calendar,
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Bot,
  Mic,
  Volume2,
  UserCheck,
  Radio,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  sender: "client" | "agent" | "ai";
  text: string;
  time: string;
  channel?: string;
}

interface ConversationItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastMessage: string;
  time: string;
  unread: number;
  channel: "whatsapp" | "telegram" | "webchat" | "email";
  status: "open" | "pending" | "closed";
  tags: string[];
}

const initialConversations: ConversationItem[] = [
  {
    id: "1",
    name: "سارة عبدالحسين المنصوري",
    phone: "+964 780 123 4567",
    email: "sara.m@example.com",
    lastMessage: "هل يمكن تأكيد موعد الاستشارة يوم الثلاثاء القادم الساعة 11:30 ص؟",
    time: "10:45 ص",
    unread: 2,
    channel: "whatsapp",
    status: "open",
    tags: ["استشارة باطنية", "عميل VIP"],
  },
  {
    id: "2",
    name: "م. علي حيدر التميمي",
    phone: "+964 781 987 6543",
    email: "ali.t@example.com",
    lastMessage: "شكراً جزيلاً، تم استلام ملف التقرير الطبي بنجاح.",
    time: "09:30 ص",
    unread: 0,
    channel: "telegram",
    status: "open",
    tags: ["استشارة"],
  },
  {
    id: "3",
    name: "زائر الموقع #4920",
    phone: "+964 770 333 2211",
    email: "visitor4920@webchat.iq",
    lastMessage: "ما هي تكلفة باقة المتابعة الشاملة للعيادات؟",
    time: "أمس",
    unread: 0,
    channel: "webchat",
    status: "pending",
    tags: ["متابعة"],
  },
  {
    id: "4",
    name: "شركة الرواد للاستثمار",
    phone: "+964 771 444 7788",
    email: "info@alrowad.iq",
    lastMessage: "بخصوص اتفاقية تقديم الخدمات الموقعة مؤخراً...",
    time: "أمس",
    unread: 0,
    channel: "email",
    status: "closed",
    tags: ["عقد مؤسسي"],
  },
];

const initialMessagesMap: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      sender: "client",
      text: "مرحباً بكم، أود الاستفسار عن المواعيد المتاحة لدى د. خالد السالم ليوم الثلاثاء القادم في الفترة الصباحية؟",
      time: "10:42 ص",
      channel: "واتساب",
    },
    {
      id: "m_voice",
      sender: "client",
      text: "🎙️ [تسجيل صوتي مفرغ بـ Whisper]: السلام عليكم دكتور، أود الاستفسار عن كشف باجر العصر مع د. خالد هل متوفر حجز؟",
      time: "10:43 ص",
      channel: "واتساب (بصمة صوتية)",
    },
    {
      id: "m2",
      sender: "agent",
      text: "أهلاً سارة، تم التحقق من جدول الطبيب، والفترة الشاغرة هي 11:30 صباحاً.",
      time: "10:44 ص",
    },
  ],
  "2": [
    {
      id: "m20",
      sender: "client",
      text: "شكراً جزيلاً، تم استلام ملف التقرير الطبي بنجاح عبر تيليجرام.",
      time: "09:30 ص",
      channel: "تيليجرام",
    },
    {
      id: "m21",
      sender: "agent",
      text: "عفواً أخي فهد، نحن في خدمتكم دائماً وتمنياتنا بالصحة والعافية.",
      time: "09:32 ص",
    },
  ],
  "3": [
    {
      id: "m30",
      sender: "client",
      text: "ما هي تكلفة باقة المتابعة الشاملة للعيادات؟",
      time: "أمس",
      channel: "محادثة الموقع",
    },
  ],
  "4": [
    {
      id: "m40",
      sender: "client",
      text: "بخصوص اتفاقية تقديم الخدمات الموقعة مؤخراً، نرجو تأكيد موعد بدء السريان.",
      time: "أمس",
      channel: "بريد إلكتروني",
    },
  ],
};

export default function InboxPage() {
  const { user, activeTenant } = useAuth();
  const isDemo = activeTenant?.id === "demo-tenant-101" || activeTenant?.slug === "basra-medical-center";

  const [conversations, setConversations] = useState<ConversationItem[]>(() =>
    isDemo ? initialConversations : []
  );
  const [selectedChat, setSelectedChat] = useState<ConversationItem | null>(() =>
    isDemo ? initialConversations[0] : null
  );
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() =>
    isDemo ? initialMessagesMap : {}
  );
  const [replyText, setReplyText] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccessToast, setBookingSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setConversations(initialConversations);
      setSelectedChat(initialConversations[0]);
      setMessagesMap(initialMessagesMap);
    } else {
      setConversations([]);
      setSelectedChat(null);
      setMessagesMap({});
    }
  }, [isDemo]);

  // Quick booking state
  const [bookingDoctor, setBookingDoctor] = useState("د. خالد السالم (استشاري)");
  const [bookingTime, setBookingTime] = useState("11:30 ص");
  // Bot Pause & Human Takeover State
  const [botPausedMap, setBotPausedMap] = useState<Record<string, boolean>>({
    "1": false,
    "2": true, // Taken over by human
    "3": false,
    "4": true,
  });
  const isBotPaused = selectedChat ? !!botPausedMap[selectedChat.id] : false;

  const handleToggleBotTakeover = () => {
    if (!selectedChat) return;
    setBotPausedMap((prev) => {
      const nextState = !prev[selectedChat.id];
      setBookingSuccessToast(
        nextState
          ? "👨‍💼 تم استلام المحادثة بواسطة الموظف البشري وإيقاف ردود الذكاء الاصطناعي مؤقتاً."
          : "🤖 تمت إعادة تفعيل الرد الآلي للذكاء الاصطناعي لهذه المحادثة بنجاح."
      );
      setTimeout(() => setBookingSuccessToast(null), 3500);
      return { ...prev, [selectedChat.id]: nextState };
    });
  };

  const currentMessages = selectedChat ? messagesMap[selectedChat.id] || [] : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !replyText.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: "agent",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg],
    }));

    // Update conversation lastMessage
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id ? { ...c, lastMessage: replyText.trim(), unread: 0 } : c
      )
    );

    // Automatic Human Takeover
    if (!botPausedMap[selectedChat.id]) {
      setBotPausedMap((prev) => ({ ...prev, [selectedChat.id]: true }));
      setBookingSuccessToast("👨‍💼 تم إرسال ردك، وتم إيقاف الذكاء الاصطناعي مؤقتاً لتجنب مقاطعتك للعميل.");
      setTimeout(() => setBookingSuccessToast(null), 3500);
    }

    setReplyText("");
  };

  const handleUseAISuggestion = (suggestionText: string) => {
    setReplyText(suggestionText);
  };

  const handleBookAppointmentFromChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat) return;
    setShowBookingModal(false);
    setBookingSuccessToast(`تم تثبيت الموعد ذرياً لـ ${selectedChat.name} في التقويم بنجاح!`);
    setTimeout(() => setBookingSuccessToast(null), 4000);
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"><Phone className="w-2.5 h-2.5" /> واتساب</span>;
      case "telegram":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20"><Send className="w-2.5 h-2.5" /> تيليجرام</span>;
      case "webchat":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20"><MessageSquare className="w-2.5 h-2.5" /> محادثة الموقع</span>;
      case "email":
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20"><Mail className="w-2.5 h-2.5" /> بريد إلكتروني</span>;
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesChannel = channelFilter === "all" || c.channel === channelFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    return matchesChannel && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-gray-800 bg-[#0c111d] shadow-2xl animate-in fade-in duration-200 select-none relative">
      {/* Toast Notification */}
      {bookingSuccessToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 p-3 px-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-150 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{bookingSuccessToast}</span>
        </div>
      )}

      {/* 1. Conversations Sidebar List */}
      <div className="w-80 lg:w-96 border-l border-gray-800 flex flex-col bg-[#0f1523]/70 backdrop-blur-md">
        {/* Search & Header */}
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>صندوق الوارد الموحد</span>
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              {filteredConversations.length} محادثات
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في المحادثات والرسائل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Channel Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <button
              onClick={() => setChannelFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                channelFilter === "all" ? "bg-indigo-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setChannelFilter("whatsapp")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                channelFilter === "whatsapp" ? "bg-emerald-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              واتساب
            </button>
            <button
              onClick={() => setChannelFilter("telegram")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                channelFilter === "telegram" ? "bg-sky-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              تيليجرام
            </button>
            <button
              onClick={() => setChannelFilter("webchat")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                channelFilter === "webchat" ? "bg-indigo-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white"
              }`}
            >
              الموقع
            </button>
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 leading-relaxed">
              {conversations.length === 0 ? "لا توجد محادثات واردة حتى الآن في مساحة عملك" : "لا توجد محادثات مطابقة للبحث"}
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = selectedChat?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedChat(c);
                    setConversations((prev) =>
                      prev.map((item) => (item.id === c.id ? { ...item, unread: 0 } : item))
                    );
                  }}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? "bg-indigo-600/15 border-r-4 border-r-indigo-500" : "hover:bg-gray-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-100">{c.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 mb-2 leading-relaxed">
                    {c.lastMessage}
                  </p>
                  <div className="flex items-center justify-between">
                    {getChannelBadge(c.channel)}
                    {c.unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Chat Conversation View */}
      {!selectedChat ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#090d16]/90">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 shadow-xl shadow-indigo-500/10">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-base font-bold text-white mb-2">
            صندوق الوارد الموحد لمؤسسة {activeTenant?.name || "مساحة عملك"}
          </h2>
          <p className="text-xs text-gray-400 max-w-md leading-relaxed mb-6">
            🔒 مساحة العمل هذه خاصة ومحمية بعزل تام لحسابك. لم تصل أي محادثات واردة حتى الآن. اربط قنواتك (واتساب، تيليجرام، أو محادثة الموقع) للبدء في استقبال رسائل العملاء ومساعدتهم بالذكاء الاصطناعي.
          </p>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 hover:scale-105"
          >
            <Zap className="w-4 h-4" />
            <span>إعداد وربط قنوات الاتصال الآن</span>
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-[#090d16]/90 justify-between min-w-0">
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-gray-800 flex items-center justify-between bg-[#0e1422]/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {selectedChat.name[0]}
              </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{selectedChat.name}</span>
                {getChannelBadge(selectedChat.channel)}
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>نشط الآن • متصل بنجاح</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Human Takeover Toggle Button */}
            <button
              onClick={handleToggleBotTakeover}
              title={isBotPaused ? "إعادة تشغيل الذكاء الاصطناعي" : "استلام المحادثة وإيقاف البوت"}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                isBotPaused
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                  : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20"
              }`}
            >
              {isBotPaused ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="hidden sm:inline">👨‍💼 استلام موظف (الرد الآلي معلق)</span>
                  <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">تشغيل البوت</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">🤖 الذكاء الاصطناعي نشط</span>
                  <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-200">استلام يدوي</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowBookingModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gray-800/80 border border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">جدولة موعد فوري</span>
            </button>
          </div>
        </div>

        {/* Human Takeover Notice Banner */}
        {isBotPaused && (
          <div className="px-6 py-2 bg-amber-950/30 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2 font-medium">
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>أنت تستلم هذه المحادثة يدوياً الآن. تم إيقاف المساعد الذكي مؤقتاً لعدم مقاطعتك.</span>
            </div>
            <button
              onClick={handleToggleBotTakeover}
              className="text-[11px] underline font-bold hover:text-white"
            >
              إعادة تفعيل البوت
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "client" ? "items-start max-w-lg" : "items-end max-w-lg mr-auto"}`}
            >
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed shadow-md ${
                  msg.sender === "client"
                    ? "rounded-tr-none bg-[#131b2e] border border-gray-800 text-gray-200"
                    : "rounded-tl-none bg-indigo-600 text-white shadow-indigo-600/20"
                }`}
              >
                {msg.text.includes("تسجيل صوتي") ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-950/40 border border-purple-500/30">
                      <div className="w-7 h-7 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300">
                        <Volume2 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 font-mono text-[10px] text-purple-200 flex items-center justify-between">
                        <span>بصمة صوتية واردة (0:12 ثانية)</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Whisper STT</span>
                      </div>
                    </div>
                    <div className="text-gray-200 leading-relaxed">{msg.text}</div>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                <span>{msg.time}</span>
                {msg.channel && (
                  <>
                    <span>•</span>
                    <span>عبر {msg.channel}</span>
                  </>
                )}
                {msg.sender === "agent" && <CheckCheck className="w-3.5 h-3.5 text-cyan-400 ml-1" />}
              </div>
            </div>
          ))}

          {/* AI Automated suggestion / response */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-start gap-3 max-w-xl mx-auto my-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <span>اقتراح محرك الذكاء الاصطناعي (RAG Verified):</span>
              </div>
              <p className="text-gray-300 mt-1 leading-relaxed">
                "أهلاً {selectedChat.name}، الفترات المتاحة لدى د. خالد السالم يوم الثلاثاء هي: 11:30 ص أو 12:15 م (عيادة 2). هل ترغبين بتأكيد الحجز في إحداهما؟"
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() =>
                    handleUseAISuggestion(
                      `أهلاً ${selectedChat.name}، الفترات المتاحة لدى د. خالد السالم يوم الثلاثاء هي: 11:30 ص أو 12:15 م (عيادة 2). هل ترغب بتأكيد الحجز؟`
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition-all"
                >
                  استخدام الرد
                </button>
                <span className="text-[10px] text-gray-500">تم فحص التوافر اللحظي ذرياً لمنع التعارض</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-[#0e1422]/60 backdrop-blur-md">
          <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-800 rounded-2xl p-2 focus-within:border-indigo-500/60 transition-all">
            <button type="button" className="w-8 h-8 rounded-xl text-gray-400 hover:text-white flex items-center justify-center transition-all">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="اكتب ردك هنا ثم اضغط Enter للإرسال..."
              className="flex-1 bg-transparent border-none text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>إرسال</span>
              <Send className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </form>
      </div>
      )}

      {/* 3. Contact Context Sidebar */}
      {selectedChat && (
        <div className="w-72 border-r border-gray-800 hidden xl:flex flex-col p-6 bg-[#0f1523]/70 backdrop-blur-md">
          <div className="text-center pb-6 border-b border-gray-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 mx-auto flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg shadow-indigo-600/25">
              {selectedChat.name[0]}
            </div>
            <h2 className="text-sm font-bold text-white">{selectedChat.name}</h2>
            <span className="text-[11px] text-gray-400">عميل نشط • مؤسسة معتمدة</span>
          </div>

          <div className="py-5 space-y-4 text-xs">
            <div>
              <span className="text-gray-500 text-[11px] font-semibold">رقم الجوال</span>
              <div className="text-gray-200 font-mono mt-0.5">{selectedChat.phone}</div>
            </div>
            <div>
              <span className="text-gray-500 text-[11px] font-semibold">البريد الإلكتروني</span>
              <div className="text-gray-200 font-mono mt-0.5 truncate">{selectedChat.email}</div>
            </div>
            <div>
              <span className="text-gray-500 text-[11px] font-semibold">الوسوم (Tags)</span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {selectedChat.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold border border-indigo-500/20"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-800">
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>حجز موعد ذري للعميل</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Booking Modal */}
      {showBookingModal && selectedChat && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>حجز موعد فوري لـ: {selectedChat.name}</span>
              </h2>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookAppointmentFromChat} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">اسم العميل</label>
                <input
                  type="text"
                  readOnly
                  value={selectedChat.name}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-gray-300 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">الطبيب / المختص</label>
                <select
                  value={bookingDoctor}
                  onChange={(e) => setBookingDoctor(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>د. خالد السالم (استشاري)</option>
                  <option>د. ريم الشمري (أخصائية)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">الفترة الزمنية</label>
                <input
                  type="text"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>سيتم إرسال رسالة تأكيد فورية إلى واتساب العميل عند الحجز.</span>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  تأكيد الحجز الذري
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

