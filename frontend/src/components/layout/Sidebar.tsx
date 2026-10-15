"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  Users,
  Workflow,
  Bot,
  Share2,
  Settings,
  Sparkles,
  Zap,
  Phone,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { title: "لوحة التحكم العامة", href: "/", icon: LayoutDashboard },
  { title: "صندوق الوارد الموحد", href: "/inbox", icon: Inbox, badge: "3" },
  { title: "التقويم والمواعيد", href: "/calendar", icon: Calendar },
  { title: "إدارة العملاء (CRM)", href: "/contacts", icon: Users },
  { title: "محرّك الأتمتة المرئي", href: "/workflows", icon: Workflow, badge: "جديد" },
  { title: "الذكاء الاصطناعي والمعرفة", href: "/knowledge", icon: Bot },
  { title: "التكاملات والقنوات", href: "/integrations", icon: Share2 },
  { title: "إعدادات المؤسسة", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isStarting, setIsStarting] = React.useState(false);
  const [startMsg, setStartMsg] = React.useState<string | null>(null);

  const handleQuickStartAll = async () => {
    setIsStarting(true);
    setStartMsg(null);
    try {
      const res = await fetch("/api/v1/channels/whatsapp/control/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start_all" }),
      });
      if (res.ok) {
        setStartMsg("✅ تم تشغيل الرقمين بنجاح!");
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsStarting(false);
      // Open both numbers in tabs
      setTimeout(() => {
        window.open("http://localhost:5050", "_blank");
        window.open("http://localhost:5051", "_blank");
      }, 800);
      setTimeout(() => setStartMsg(null), 4000);
    }
  };

  return (
    <aside className="w-64 bg-[#0d121f] border-l border-gray-800/80 flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800/80 justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              FlowDesk <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 text-xs font-semibold px-1 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">AI</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          الوحدات الأساسية
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600/20 to-indigo-500/10 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? "text-indigo-400" : "text-gray-400 group-hover:text-gray-200"
                  }`}
                />
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badge === "جديد"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "bg-indigo-500/20 text-indigo-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* WhatsApp Bot Control Widget in Sidebar */}
      <div className="px-3 pb-1">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-gray-900/90 to-[#0e1726] border border-emerald-500/30 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white">بوتات واتساب</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
              نشط
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <a
              href="http://localhost:5050"
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
              title="فتح بوابة الرقم الأول"
            >
              <span>📱 الرقم 1 (5050)</span>
            </a>
            <a
              href="http://localhost:5051"
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
              title="فتح بوابة الرقم الثاني"
            >
              <span>📱 الرقم 2 (5051)</span>
            </a>
          </div>

          <button
            type="button"
            onClick={handleQuickStartAll}
            disabled={isStarting}
            className="w-full py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Zap className="w-3 h-3" />
            <span>{isStarting ? "⏳ جاري بدء البوتات..." : "⚡ تشغيل الرقمين بضغطة زر"}</span>
          </button>
          {startMsg && (
            <div className="text-[10px] text-emerald-400 text-center font-bold animate-pulse">
              {startMsg}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Card & Developer Attribution */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-gray-800/40 to-indigo-950/20 border border-indigo-500/20 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>محرك الذكاء والـ MVP</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
          المنصة متصلة بـ 5 قنوات (WhatsApp, Telegram, Web, Email, Iraq SMS).
        </p>
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-1.5 rounded-full w-4/5"></div>
        </div>

        {/* Developer Attribution */}
        <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between text-[10px]">
          <span className="text-gray-400">المطور:</span>
          <span className="font-bold text-cyan-300">منتظر حازم | البصرة 🇮🇶</span>
        </div>
      </div>
    </aside>
  );
}
