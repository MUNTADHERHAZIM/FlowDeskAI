"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import {
  MessageSquare,
  Calendar,
  Zap,
  Bot,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  ChevronLeft,
  Mail,
  Send,
  Phone,
  Workflow,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, activeTenant } = useAuth();
  const isDemo = activeTenant?.id === "demo-tenant-101" || activeTenant?.slug === "basra-medical-center";

  const kpis = isDemo
    ? [
        {
          title: "المحادثات النشطة الموحدة",
          value: "142",
          subtext: "+24% عن الأسبوع الماضي",
          icon: MessageSquare,
          color: "from-blue-600 to-indigo-600",
          border: "border-blue-500/20",
        },
        {
          title: "مواعيد اليوم المؤكدة",
          value: "28",
          subtext: "خالية من التعارضات (0 تعارض)",
          icon: Calendar,
          color: "from-emerald-600 to-teal-600",
          border: "border-emerald-500/20",
        },
        {
          title: "عمليات الأتمتة المكتملة",
          value: "1,894",
          subtext: "معدل نجاح 99.7%",
          icon: Zap,
          color: "from-amber-600 to-orange-600",
          border: "border-amber-500/20",
        },
        {
          title: "ردود الذكاء الاصطناعي (RAG)",
          value: "840",
          subtext: "بدقة مدعمة بمستندات المؤسسة",
          icon: Bot,
          color: "from-purple-600 to-pink-600",
          border: "border-purple-500/20",
        },
      ]
    : [
        {
          title: "المحادثات النشطة الموحدة",
          value: "0",
          subtext: "بانتظار ربط قنوات الاتصال",
          icon: MessageSquare,
          color: "from-blue-600 to-indigo-600",
          border: "border-blue-500/20",
        },
        {
          title: "مواعيد اليوم المؤكدة",
          value: "0",
          subtext: "0 تعارض (Atomic Guard)",
          icon: Calendar,
          color: "from-emerald-600 to-teal-600",
          border: "border-emerald-500/20",
        },
        {
          title: "عمليات الأتمتة المكتملة",
          value: "0",
          subtext: "جاهز لتشغيل المسارات",
          icon: Zap,
          color: "from-amber-600 to-orange-600",
          border: "border-amber-500/20",
        },
        {
          title: "ردود الذكاء الاصطناعي (RAG)",
          value: "0",
          subtext: "مساحة عمل خاصة ومعزولة",
          icon: Bot,
          color: "from-purple-600 to-pink-600",
          border: "border-purple-500/20",
        },
      ];

  const channels = isDemo
    ? [
        { name: "واتساب للأعمال (WhatsApp Cloud API)", count: "68 محادثة", status: "متصل ونشط", icon: Phone, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { name: "تطبيق تيليجرام (Telegram Bot)", count: "42 محادثة", status: "متصل ونشط", icon: Send, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
        { name: "محادثات الموقع (Web Chat Live)", count: "21 محادثة", status: "متصل ونشط", icon: MessageSquare, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
        { name: "البريد الإلكتروني (Support Email)", count: "11 محادثة", status: "متصل ونشط", icon: Mail, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
      ]
    : [
        { name: "واتساب للأعمال (WhatsApp Cloud API)", count: "0 محادثة", status: "جاهز للربط", icon: Phone, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
        { name: "تطبيق تيليجرام (Telegram Bot)", count: "0 محادثة", status: "جاهز للربط", icon: Send, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
        { name: "محادثات الموقع (Web Chat Live)", count: "0 محادثة", status: "جاهز للتضمين", icon: MessageSquare, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
        { name: "البريد الإلكتروني (Support Email)", count: "0 محادثة", status: "جاهز للإعداد", icon: Mail, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
      ];

  const upcomingAppointments = isDemo
    ? [
        { client: "سارة عبدالله المنصور", service: "استشارة طبية أولية", time: "11:30 ص", resource: "د. خالد السالم", room: "عيادة 2" },
        { client: "م. فهد بن عبدالعزيز", service: "متابعة دورية", time: "12:15 م", resource: "د. ريم الشمري", room: "عيادة 1" },
        { client: "نورة محمد القحطاني", service: "فحص وتشخيص متخصص", time: "01:00 م", resource: "د. خالد السالم", room: "عيادة 2" },
      ]
    : [];

  const recentEvents = isDemo
    ? [
        { title: "تم تأكيد حجز موعد تلقائياً", channel: "WhatsApp", time: "منذ دقيقتين", state: "نجاح الأتمتة" },
        { title: "استخراج حقول تذكرة عبر الذكاء الاصطناعي", channel: "Telegram", time: "منذ 6 دقائق", state: "RAG Engine" },
        { title: "عميل جديد انضم عبر محادثات الموقع", channel: "WebChat", time: "منذ 14 دقيقة", state: "جديد" },
      ]
    : [
        { title: "تم إنشاء مساحة عمل معزولة ومحمية", channel: "FlowDesk Core", time: "الآن", state: "عزل تام 100%" },
        { title: "قاعدة بيانات PostgreSQL متعددة المستأجرين", channel: "Multi-Tenancy", time: "الآن", state: "نشط ومحمي" },
      ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-[#12192b] via-[#101726] to-[#0c1220] border border-indigo-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>مساحة العمل النشطة: {activeTenant?.name || "المؤسسة الأساسية"}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              أهلاً بك، {user?.first_name || "المستخدم"}! منصة FlowDesk AI جاهزة.
            </h1>
            <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">
              جميع القنوات، محرك المواعيد الذري لمنع التعارضات، وتدفقات الأتمتة تعمل تحت عزل تام للبيانات.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workflows"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-sm hover:opacity-95 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4" />
              <span>إنشاء أتمتة جديدة</span>
            </Link>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700 text-gray-200 text-sm font-semibold transition-all"
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>حجز موعد</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-[#0f1523]/80 border ${kpi.border} backdrop-blur-md hover:border-indigo-500/40 transition-all hover:-translate-y-1 shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-gray-400">{kpi.title}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{kpi.value}</div>
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{kpi.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured n8n-like Visual Workflow Banner */}
      <div className="relative rounded-2xl p-6 bg-gradient-to-r from-indigo-950/60 via-[#131c33] to-[#0c1322] border border-indigo-500/30 overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>محرّك مسارات العمل المرئي الشبيه بـ n8n (Visual Node Engine)</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">جديد ومفعّل</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">
              قم ببناء واختبار تدفقات الذكاء الاصطناعي والحجز الآلي عبر لوحة العقد التفاعلية
            </h2>
            <p className="text-gray-300 text-xs leading-relaxed">
              محفزات الويب هوك (WhatsApp Webhook)، استخراج النوايا عبر الذكاء الاصطناعي (AI RAG Intent)، قفل التوافر الذري في PostgreSQL، وإرسال الرسائل الفورية مع وضع التجربة والمحاكاة المباشرة (Dry Run) ومفتش فحص العقد (Node Inspector).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/workflows"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Workflow className="w-4 h-4" />
              <span>فتح استوديو الورك فلو (n8n Canvas)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Grid: Channels & Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Omnichannel Status Card */}
        <div className="lg:col-span-1 rounded-2xl bg-[#0f1523]/80 border border-gray-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>قنوات الاتصال الموحدة</span>
              </h2>
              <Link href="/integrations" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                <span>إدارة</span>
                <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {channels.map((ch, idx) => {
                const Icon = ch.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-gray-900/50 border border-gray-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${ch.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-200">{ch.name}</div>
                        <div className="text-[11px] text-gray-400">{ch.count}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {ch.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between">
            <span>الصوت والبريد الصوتي:</span>
            <span className="text-amber-400 font-medium">قيد التفريغ النصي والتوثيق</span>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0f1523]/80 border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>مواعيد اليوم ومحرك الموارد الذري</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">يضمن النظام عدم حدوث تعارض للموارد (أطباء، غرف، أجهزة)</p>
            </div>
            <Link href="/calendar" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              <span>عرض الكل</span>
              <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 pb-2">
                  <th className="py-2.5 font-semibold">العميل</th>
                  <th className="py-2.5 font-semibold">الخدمة</th>
                  <th className="py-2.5 font-semibold">الموعد</th>
                  <th className="py-2.5 font-semibold">الموظف / المورد</th>
                  <th className="py-2.5 font-semibold">القاعة</th>
                  <th className="py-2.5 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {upcomingAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                      لا توجد مواعيد مجدولة اليوم في مساحة عملك — يمكنك حجز موعد جديد من صفحة التقويم.
                    </td>
                  </tr>
                ) : (
                  upcomingAppointments.map((app, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30 transition-all">
                      <td className="py-3 font-bold text-gray-200">{app.client}</td>
                      <td className="py-3 text-gray-300">{app.service}</td>
                      <td className="py-3 font-semibold text-emerald-400">{app.time}</td>
                      <td className="py-3 text-gray-300">{app.resource}</td>
                      <td className="py-3 text-gray-400">{app.room}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مؤكد</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300">منع التعارض الذري (Atomic Double-Booking Prevention)</div>
                <div className="text-[11px] text-gray-400">جميع الاستعلامات مفحوصة عبر قيود قاعدة البيانات PostgreSQL</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">نشط 100%</span>
          </div>
        </div>
      </div>

      {/* Bottom Live Activity Feed */}
      <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>سجل الأحداث والنشاط اللحظي للمنصة</span>
          </h2>
          <span className="text-xs text-gray-400 font-mono">Live WebSocket Feed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentEvents.map((evt, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/80 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 animate-ping"></div>
              <div>
                <div className="text-xs font-bold text-gray-200">{evt.title}</div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
                  <span className="text-indigo-400 font-medium">{evt.channel}</span>
                  <span>•</span>
                  <span>{evt.time}</span>
                  <span>•</span>
                  <span className="text-gray-400">{evt.state}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
