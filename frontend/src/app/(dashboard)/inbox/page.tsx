"use client";

import React, { useState } from "react";
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
  Tag,
  Clock,
  User,
  Zap,
} from "lucide-react";

interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  channel: "whatsapp" | "telegram" | "webchat" | "email";
  status: "open" | "pending" | "closed";
}

const mockConversations: ConversationItem[] = [
  {
    id: "1",
    name: "سارة عبدالله المنصور",
    lastMessage: "هل يمكن تأكيد موعد الاستشارة يوم الثلاثاء القادم الساعة 11:30 ص؟",
    time: "10:45 ص",
    unread: 2,
    channel: "whatsapp",
    status: "open",
  },
  {
    id: "2",
    name: "م. فهد بن عبدالعزيز",
    lastMessage: "شكراً جزيلاً، تم استلام ملف التقرير الطبي بنجاح.",
    time: "09:30 ص",
    unread: 0,
    channel: "telegram",
    status: "open",
  },
  {
    id: "3",
    name: "زائر الموقع #4920",
    lastMessage: "ما هي تكلفة باقة المتابعة الشاملة للعيادات؟",
    time: "أمس",
    unread: 0,
    channel: "webchat",
    status: "pending",
  },
  {
    id: "4",
    name: "شركة الرواد للاستثمار",
    lastMessage: "بخصوص اتفاقية تقديم الخدمات الموقعة مؤخراً...",
    time: "أمس",
    unread: 0,
    channel: "email",
    status: "closed",
  },
];

export default function InboxPage() {
  const [selectedChat, setSelectedChat] = useState<ConversationItem>(mockConversations[0]);
  const [replyText, setReplyText] = useState("");

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

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-gray-800 bg-[#0c111d] shadow-2xl animate-in fade-in duration-200">
      {/* 1. Conversations Sidebar List */}
      <div className="w-80 lg:w-96 border-l border-gray-800 flex flex-col bg-[#0f1523]/70 backdrop-blur-md">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>صندوق الوارد الموحد</span>
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              4 محادثات
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في المحادثات والرسائل..."
              className="w-full bg-gray-900/80 border border-gray-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
          {mockConversations.map((c) => {
            const isSelected = selectedChat.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedChat(c)}
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
          })}
        </div>
      </div>

      {/* 2. Chat Conversation View */}
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
                <span>نشط الآن • تم التحقق من العزل الأمني</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-xl bg-gray-800/60 border border-gray-700 hover:bg-gray-800 text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>جدولة موعد</span>
            </button>
            <button className="w-8 h-8 rounded-xl bg-gray-800/40 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {/* Inbound message */}
          <div className="flex flex-col items-start max-w-lg">
            <div className="p-4 rounded-2xl rounded-tr-none bg-[#131b2e] border border-gray-800 text-xs text-gray-200 leading-relaxed shadow-md">
              مرحباً بكم، أود الاستفسار عن المواعيد المتاحة لدى د. خالد السالم ليوم الثلاثاء القادم في الفترة الصباحية؟
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
              <span>10:42 ص</span>
              <span>•</span>
              <span>عبر واتساب</span>
            </div>
          </div>

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
                "أهلاً سارة، الفترات المتاحة لدى د. خالد السالم يوم الثلاثاء هي: 11:30 ص أو 12:15 م (عيادة 2). هل ترغبين بتأكيد الحجز في إحداهما؟"
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => setReplyText("أهلاً سارة، الفترات المتاحة لدى د. خالد السالم يوم الثلاثاء هي: 11:30 ص أو 12:15 م (عيادة 2). هل ترغبين بتأكيد الحجز في إحداهما؟")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] transition-all"
                >
                  استخدام الرد
                </button>
                <span className="text-[10px] text-gray-500">تم فحص التوافر اللحظي ذرياً لمنع التعارض</span>
              </div>
            </div>
          </div>

          {/* Outbound response */}
          <div className="flex flex-col items-end max-w-lg mr-auto">
            <div className="p-4 rounded-2xl rounded-tl-none bg-indigo-600 text-white text-xs leading-relaxed shadow-lg shadow-indigo-600/20">
              أهلاً سارة، تم التحقق من جدول الطبيب، والفترة الشاغرة هي 11:30 صباحاً.
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
              <span>10:44 ص</span>
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-gray-800 bg-[#0e1422]/60 backdrop-blur-md">
          <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-800 rounded-2xl p-2 focus-within:border-indigo-500/60 transition-all">
            <button className="w-8 h-8 rounded-xl text-gray-400 hover:text-white flex items-center justify-center transition-all">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="اكتب ردك هنا أو استخدم اختصارات الأتمتة..."
              className="flex-1 bg-transparent border-none text-xs text-gray-200 placeholder-gray-500 focus:outline-none"
            />
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 hover:opacity-95 shadow-md shadow-indigo-600/30">
              <span>إرسال</span>
              <Send className="w-3 h-3 rotate-180" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Contact Context Sidebar */}
      <div className="w-72 border-r border-gray-800 hidden xl:flex flex-col p-6 bg-[#0f1523]/70 backdrop-blur-md">
        <div className="text-center pb-6 border-b border-gray-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 mx-auto flex items-center justify-center text-white text-xl font-bold mb-3 shadow-lg shadow-indigo-600/25">
            {selectedChat.name[0]}
          </div>
          <h2 className="text-sm font-bold text-white">{selectedChat.name}</h2>
          <span className="text-[11px] text-gray-400">عميل نشط منذ 2026</span>
        </div>

        <div className="py-5 space-y-4 text-xs">
          <div>
            <span className="text-gray-500 text-[11px] font-semibold">رقم الجوال</span>
            <div className="text-gray-200 font-mono mt-0.5">+966 50 123 4567</div>
          </div>
          <div>
            <span className="text-gray-500 text-[11px] font-semibold">البريد الإلكتروني</span>
            <div className="text-gray-200 font-mono mt-0.5">sara.mansour@example.com</div>
          </div>
          <div>
            <span className="text-gray-500 text-[11px] font-semibold">الوسوم (Tags)</span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold border border-indigo-500/20">عيادة الأسنان</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">عميل VIP</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-800">
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
            <span>التذاكر المفتوحة:</span>
            <span className="font-bold text-gray-200">1 تذكرة</span>
          </div>
        </div>
      </div>
    </div>
  );
}
