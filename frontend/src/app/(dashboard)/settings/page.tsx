"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function SettingsPage() {
  const { user, activeTenant } = useAuth();
  const [activeTab, setActiveTab] = useState<"general" | "members" | "security">("general");

  const members = [
    { name: "عبدالرحمن الغامدي", email: "admin@flowdesk.ai", role: "مالك المؤسسة (Owner)", isOwner: true },
    { name: "د. خالد السالم", email: "dr.khaled@flowdesk.ai", role: "عضو / مختص", isOwner: false },
    { name: "سارة النعيمي", email: "sara.n@flowdesk.ai", role: "وكيل خدمة عملاء (Agent)", isOwner: false },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-gray-300" />
          <span>إعدادات المؤسسة ومساحة العمل</span>
        </h1>
        <p className="text-gray-400 text-xs mt-1">
          إدارة هوية المؤسسة، أعضاء الفريق، الصلاحيات، وإعدادات عزل البيانات المشتركة.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "general"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>الملف العام للمؤسسة</span>
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "members"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>أعضاء الفريق والأدوار</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "security"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>الأمان وعزل المؤسسات</span>
        </button>
      </div>

      {/* Tab 1: General */}
      {activeTab === "general" && (
        <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 p-6 space-y-5">
          <h2 className="text-sm font-bold text-white mb-4">معلومات مساحة العمل</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">اسم المؤسسة</label>
              <input
                type="text"
                defaultValue={activeTenant?.name || "عيادة النخبة الطبية"}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">المعرف الفريد (Slug)</label>
              <input
                type="text"
                readOnly
                defaultValue={activeTenant?.slug || "elite-clinic"}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-gray-400 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">المنطقة الزمنية الافتراضية</label>
              <select className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500">
                <option value="Asia/Riyadh">توقيت الرياض / مكة المكرمة (UTC+3)</option>
                <option value="Asia/Dubai">توقيت دبي / أبوظبي (UTC+4)</option>
                <option value="Africa/Cairo">توقيت القاهرة (UTC+3)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">حالة الاشتراك</label>
              <div className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-between">
                <span>الباقة الاحترافية (Multi-Tenant Pro)</span>
                <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full">نشطة</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30">
              حفظ التعديلات
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Members */}
      {activeTab === "members" && (
        <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">أعضاء المؤسسة الحاليين</h2>
              <p className="text-xs text-gray-400 mt-0.5">يمكنك إضافة موظفين وتحديد صلاحياتهم بدقة.</p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500">
              <UserPlus className="w-3.5 h-3.5" />
              <span>دعوة عضو جديد</span>
            </button>
          </div>

          <div className="divide-y divide-gray-800/60 text-xs">
            {members.map((m, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-800/20 transition-all">
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
                    <button className="text-rose-400 hover:text-rose-300 font-medium">
                      إزالة
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security & Tenant Isolation */}
      {activeTab === "security" && (
        <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white mb-2">معايير الأمان وعزل المؤسسات (Multi-Tenancy Guard)</h2>

          <div className="space-y-3">
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
      )}
    </div>
  );
}
