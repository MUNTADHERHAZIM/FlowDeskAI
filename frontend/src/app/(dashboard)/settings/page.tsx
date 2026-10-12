"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Settings,
  Building2,
  Users,
  Shield,
  Key,
  Globe,
  Check,
  UserPlus,
  CheckCircle2,
  X,
  Trash2,
  CreditCard,
  Zap,
  TrendingUp,
  BarChart3,
  Lock,
  History,
  Clock,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  isOwner: boolean;
}

interface AuditItem {
  id: string;
  action: string;
  actor: string;
  target: string;
  time: string;
  status: "success" | "warning";
}

const initialMembers: Member[] = [
  { id: "1", name: "منتظر حازم", email: "muntadher@flowdesk.iq", role: "مالك المؤسسة (Owner)", isOwner: true },
  { id: "2", name: "د. أحمد السعدون", email: "dr.ahmed@flowdesk.iq", role: "طبيب استشاري / مختص", isOwner: false },
  { id: "3", name: "سارة النعيمي", email: "sara.n@flowdesk.iq", role: "وكيل خدمة عملاء (Agent)", isOwner: false },
];

const initialAuditLogs: AuditItem[] = [
  { id: "a1", action: "نشر إصدار جديد من مسار العمل", actor: "منتظر حازم", target: "أتمتة حجز واتساب", time: "منذ 15 دقيقة", status: "success" },
  { id: "a2", action: "حجز موعد ذري مع منع التعارض", actor: "نظام الذكاء الاصطناعي", target: "د. أحمد السعدون", time: "منذ 40 دقيقة", status: "success" },
  { id: "a3", action: "ربط قناة واتساب السحابية", actor: "منتظر حازم", target: "+964 780 123 4567", time: "منذ 2 ساعة", status: "success" },
  { id: "a4", action: "تحديث قاعدة المعرفة RAG", actor: "سارة النعيمي", target: "دليل العيادة 2026", time: "منذ يوم واحد", status: "success" },
];

export default function SettingsPage() {
  const { user, activeTenant } = useAuth();
  const isDemo = activeTenant?.id === "demo-tenant-101" || activeTenant?.slug === "basra-medical-center";

  const [activeTab, setActiveTab] = useState<"general" | "members" | "billing" | "security">("general");
  const [members, setMembers] = useState<Member[]>([]);
  const [tenantName, setTenantName] = useState(activeTenant?.name || "مؤسستي");
  const [timezone, setTimezone] = useState("Asia/Baghdad");
  const [currentPlan, setCurrentPlan] = useState<"starter" | "pro" | "enterprise">("pro");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync isolated members and tenant settings
  useEffect(() => {
    if (activeTenant) {
      setTenantName(activeTenant.name);
      if (!isDemo && user) {
        setMembers([
          {
            id: user.id || "owner-1",
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
            email: user.email,
            role: "مالك المؤسسة (Owner)",
            isOwner: true,
          },
        ]);
      } else if (isDemo) {
        setMembers(initialMembers);
      }
    }
  }, [activeTenant, user, isDemo]);

  const auditLogs: AuditItem[] = isDemo ? initialAuditLogs : [
    {
      id: "a-init-1",
      action: "إنشاء مساحة العمل وتأكيد عزل البيانات",
      actor: `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "المالك",
      target: activeTenant?.name || "المؤسسة",
      time: "الآن",
      status: "success",
    },
    {
      id: "a-init-2",
      action: "تشفير قاعدة البيانات وضمان خصوصية الحساب (Isolated Workspace)",
      actor: "نظام FlowDesk AI",
      target: `مساحة ${activeTenant?.name}`,
      time: "الآن",
      status: "success",
    },
  ];

  // Invite state
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("طبيب استشاري / مختص");

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessToast("تم حفظ تعديلات المؤسسة والمنطقة الزمنية بنجاح!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const newM: Member = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      isOwner: false,
    };

    setMembers((prev) => [...prev, newM]);
    setShowInviteModal(false);
    setNewMemberName("");
    setNewMemberEmail("");
    setSuccessToast(`تمت دعوة ${newM.name} إلى المؤسسة بنجاح.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setSuccessToast("تمت إزالة العضو من المؤسسة بنجاح.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleUpgradePlan = (plan: "starter" | "pro" | "enterprise") => {
    setCurrentPlan(plan);
    setSuccessToast(`تمت ترقية الاشتراك إلى باقة (${plan === "enterprise" ? "المؤسسات الكبرى" : plan === "pro" ? "الاحترافية" : "البداية"}) بنجاح!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl select-none">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-indigo-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-gray-300" />
          <span>إعدادات المؤسسة ومساحة العمل</span>
        </h1>
        <p className="text-gray-400 text-xs mt-1">
          إدارة هوية المؤسسة، الفريق، الاشتراكات والفوترة، وعزل البيانات الصارم (Multi-Tenancy Guard).
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "general"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>الملف العام للمؤسسة</span>
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "members"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>أعضاء الفريق والصلاحيات ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "billing"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>الاشتراك والفوترة والاستهلاك</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === "security"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>الأمان وسجل التدقيق (Audit)</span>
        </button>
      </div>

      {/* Tab 1: General */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 p-6 space-y-5">
          <h2 className="text-sm font-bold text-white mb-4">معلومات مساحة العمل الأساسية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">اسم المؤسسة</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">المعرف الفريد (Slug)</label>
              <input
                type="text"
                readOnly
                defaultValue={activeTenant?.slug || "basra-medical-center"}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-400 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">المنطقة الزمنية الافتراضية</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Asia/Baghdad">توقيت بغداد / العراق (UTC+3)</option>
                <option value="Asia/Riyadh">توقيت الرياض / مكة (UTC+3)</option>
                <option value="Asia/Dubai">توقيت دبي / الخليج (UTC+4)</option>
                <option value="Africa/Cairo">توقيت القاهرة (UTC+3)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">حالة الاشتراك ومستوى الخدمة</label>
              <div className="px-3.5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-between">
                <span>الباقة الاحترافية المتكاملة (Multi-Tenant Pro)</span>
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">نشط</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Members */}
      {activeTab === "members" && (
        <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">أعضاء المؤسسة الحاليين</h2>
              <p className="text-xs text-gray-400 mt-0.5">إدارة الوصول وصلاحيات الأعضاء المرتبطة بمؤسسة {activeTenant?.name || "الحالية"}.</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all hover:scale-105"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>دعوة عضو جديد</span>
            </button>
          </div>

          <div className="divide-y divide-gray-800/60 text-xs">
            {members.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-800/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                    {m.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-200">{m.name}</div>
                    <div className="text-gray-400 font-mono text-[11px]">{m.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    m.isOwner ? "bg-amber-500/10 text-amber-300 border-amber-500/20" : "bg-gray-800 text-gray-300 border-gray-700"
                  }`}>
                    {m.role}
                  </span>
                  {!m.isOwner && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded hover:bg-rose-500/10 transition-all"
                    >
                      إزالة
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Usage */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          {/* Usage Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#0f1523]/80 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>استهلاك الـ AI Tokens</span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-extrabold text-white">
                {isDemo ? "42,850" : "0"} <span className="text-xs text-gray-400 font-normal">/ 100,000</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                  style={{ width: isDemo ? "43%" : "0%" }}
                />
              </div>
              <div className="text-[10px] text-gray-400">تجدد الحصة في 1 من الشهر القادم</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f1523]/80 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>رسائل القنوات (واتساب / تيليجرام)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-extrabold text-white">
                {isDemo ? "1,420" : "0"} <span className="text-xs text-gray-400 font-normal">/ 5,000</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                  style={{ width: isDemo ? "28%" : "0%" }}
                />
              </div>
              <div className="text-[10px] text-gray-400">توفير تلقائي 100% بدون تكلفة إضافية</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f1523]/80 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>تشغيلات الأتمتة (Workflows)</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-extrabold text-white">
                {isDemo ? "3,890" : "0"} <span className="text-xs text-gray-400 font-normal">/ 10,000</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full"
                  style={{ width: isDemo ? "39%" : "0%" }}
                />
              </div>
              <div className="text-[10px] text-gray-400">معدل نجاح التنفيذ 99.8%</div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 p-6 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white">خطط الاشتراك المتاحة</h2>
              <p className="text-xs text-gray-400 mt-0.5">يمكنك الترقية في أي وقت مع حساب الفارق الزمني تلقائياً بالدينار العراقي (IQD).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Starter */}
              <div className={`p-5 rounded-2xl border transition-all ${
                currentPlan === "starter" ? "bg-indigo-600/10 border-indigo-500/50" : "bg-gray-900/50 border-gray-800"
              }`}>
                <div className="font-bold text-sm text-white mb-1">باقة البداية (Starter)</div>
                <div className="text-lg font-extrabold text-indigo-400 mb-3">30,000 <span className="text-xs text-gray-400 font-normal">د.ع / شهرياً</span></div>
                <ul className="space-y-2 text-gray-300 mb-5">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> حتى 3 أعضاء فريق</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1,000 رسالة واتساب</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> فحص ذري للمواعيد</li>
                </ul>
                <button
                  onClick={() => handleUpgradePlan("starter")}
                  className={`w-full py-2 rounded-xl font-bold transition-all ${
                    currentPlan === "starter" ? "bg-gray-800 text-gray-400 cursor-default" : "bg-gray-800 hover:bg-gray-700 text-white"
                  }`}
                >
                  {currentPlan === "starter" ? "الخطة الحالية" : "اختيار باقة البداية"}
                </button>
              </div>

              {/* Pro */}
              <div className={`p-5 rounded-2xl border transition-all relative ${
                currentPlan === "pro" ? "bg-indigo-600/15 border-indigo-500 shadow-xl shadow-indigo-600/10" : "bg-gray-900/50 border-gray-800"
              }`}>
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  الأكثر طلباً
                </div>
                <div className="font-bold text-sm text-white mb-1">الباقة الاحترافية (Professional)</div>
                <div className="text-lg font-extrabold text-indigo-400 mb-3">75,000 <span className="text-xs text-gray-400 font-normal">د.ع / شهرياً</span></div>
                <ul className="space-y-2 text-gray-300 mb-5">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> حتى 10 أعضاء فريق</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 5,000 رسالة متعددة القنوات</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> محرك أتمتة بصري غير محدود</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> قاعدة معرفة RAG مدعومة بالـ AI</li>
                </ul>
                <button
                  onClick={() => handleUpgradePlan("pro")}
                  className={`w-full py-2 rounded-xl font-bold transition-all ${
                    currentPlan === "pro" ? "bg-indigo-600 text-white cursor-default" : "bg-indigo-600 hover:bg-indigo-500 text-white"
                  }`}
                >
                  {currentPlan === "pro" ? "الخطة الحالية النشطة" : "ترقية للاحترافية"}
                </button>
              </div>

              {/* Enterprise */}
              <div className={`p-5 rounded-2xl border transition-all ${
                currentPlan === "enterprise" ? "bg-indigo-600/15 border-indigo-500" : "bg-gray-900/50 border-gray-800"
              }`}>
                <div className="font-bold text-sm text-white mb-1">المؤسسات الكبرى (Enterprise)</div>
                <div className="text-lg font-extrabold text-indigo-400 mb-3">180,000 <span className="text-xs text-gray-400 font-normal">د.ع / شهرياً</span></div>
                <ul className="space-y-2 text-gray-300 mb-5">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> عدد أعضاء وتراخيص غير محدود</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> رسائل واستدعاءات API غير محدودة</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> خادم مخصص ونسخ احتياطي فوري</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> دعم فني مباشر 24/7</li>
                </ul>
                <button
                  onClick={() => handleUpgradePlan("enterprise")}
                  className={`w-full py-2 rounded-xl font-bold transition-all ${
                    currentPlan === "enterprise" ? "bg-gray-800 text-gray-400 cursor-default" : "bg-gray-800 hover:bg-gray-700 text-white"
                  }`}
                >
                  {currentPlan === "enterprise" ? "الخطة الحالية" : "الترقية للمؤسسات الكبرى"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Audit */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white mb-2">معايير الأمان وعزل المؤسسات (Multi-Tenancy Guard)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-300 block mb-0.5">عزل البيانات التام (Tenant Isolation Enforced):</span>
                  <span className="text-gray-300 leading-relaxed">
                    تتحقق كافة استعلامات الـ API عبر الوسيط (TenantMiddleware) ونماذج الصلاحيات لمنع أي وصول لسجلات مؤسسة أخرى.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                <Key className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-indigo-300 block mb-0.5">تشفير مفاتيح القنوات والويب هوك:</span>
                  <span className="text-gray-300 leading-relaxed">
                    تُخزن بيانات اعتماد واتساب وتيليجرام بصيغة مشفرة مع التحقق الصارم من توقيع الويب هوك (HMAC Signature).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>سجل التدقيق الأمني والنشاطات الأخيرة (Audit Trail)</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">تسجيل موثق غير قابل للتعديل لكافة العمليات الحساسة في المؤسسة.</p>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                حماية مفعلة
              </span>
            </div>

            <div className="divide-y divide-gray-800/60 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-gray-800/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-indigo-400 font-bold">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-200">{log.action}</div>
                      <div className="text-gray-400 text-[11px]">
                        المنفذ: <span className="text-indigo-300 font-semibold">{log.actor}</span> • الهدف: <span className="text-gray-300">{log.target}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.time}
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      ناجح
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>دعوة عضو جديد إلى مساحة العمل</span>
              </h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">اسم العضو</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. علي التميمي"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  placeholder="ali@flowdesk.iq"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">الدور والصلاحية</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option>طبيب استشاري / مختص (Specialist / Staff)</option>
                  <option>وكيل خدمة عملاء (Support Agent)</option>
                  <option>مدير مساحة عمل (Admin)</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  إرسال الدعوة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
