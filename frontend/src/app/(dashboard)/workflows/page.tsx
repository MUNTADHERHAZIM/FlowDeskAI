"use client";

import React, { useState } from "react";
import {
  Workflow,
  Plus,
  Play,
  Zap,
  CheckCircle2,
  Clock,
  Settings,
  Bot,
  GitBranch,
  Layers,
  ArrowRight,
  Shield,
  FileCode,
} from "lucide-react";

interface WorkflowItem {
  id: string;
  name: string;
  trigger: string;
  version: string;
  status: "active" | "draft" | "paused";
  runsCount: number;
  successRate: string;
  nodesCount: number;
}

const mockWorkflows: WorkflowItem[] = [
  {
    id: "wf-1",
    name: "أتمتة حجز المواعيد عبر واتساب والذكاء الاصطناعي",
    trigger: "وصول رسالة (WhatsApp / Web)",
    version: "v2.1 (منشورة)",
    status: "active",
    runsCount: 1420,
    successRate: "99.8%",
    nodesCount: 6,
  },
  {
    id: "wf-2",
    name: "إرسال تذكير مسبق قبل الموعد بـ 24 ساعة",
    trigger: "جدولة زمنية (Cron Trigger)",
    version: "v1.0 (منشورة)",
    status: "active",
    runsCount: 380,
    successRate: "100%",
    nodesCount: 4,
  },
  {
    id: "wf-3",
    name: "تصنيف التذاكر وتصعيد الطلبات الحساسة",
    trigger: "إنشاء تذكرة جديدة",
    version: "v1.4 (مسودة)",
    status: "draft",
    runsCount: 94,
    successRate: "97.5%",
    nodesCount: 5,
  },
];

export default function WorkflowsPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(mockWorkflows[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Workflow className="w-6 h-6 text-indigo-400" />
            <span>محرّك الأتمتة المرئي (Visual Workflow Engine)</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            بناء وتشغيل تدفقات عمل ذكية بسحب وإفلات العقد دون الحاجة لكتابة كود برمجي، مع حماية تامة ضد التكرار.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all">
          <Plus className="w-4 h-4" />
          <span>إنشاء تدفق جديد</span>
        </button>
      </div>

      {/* Visual Workflow Canvas Interactive Preview */}
      <div className="rounded-3xl bg-[#0b101c] border border-gray-800 p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{selectedWorkflow?.name}</h2>
              <span className="text-[11px] text-gray-400">النسخة المنشورة: {selectedWorkflow?.version} • عقد التدفق: {selectedWorkflow?.nodesCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 hover:bg-indigo-600/30 transition-all">
              <Play className="w-3 h-3 text-cyan-400" />
              <span>اختبار التدفق (Dry Run)</span>
            </button>
          </div>
        </div>

        {/* Node Graph Mockup */}
        <div className="py-8 px-4 overflow-x-auto">
          <div className="flex items-center justify-start min-w-[750px] gap-4">
            {/* 1. Trigger Node */}
            <div className="w-56 p-4 rounded-2xl bg-gradient-to-b from-[#162035] to-[#11192b] border border-indigo-500/40 shadow-xl relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">المشغل (Trigger)</span>
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-xs font-bold text-white mb-1">وصول رسالة واتساب</div>
              <p className="text-[11px] text-gray-400">Webhook استلام رسالة عميل</p>
              <div className="mt-3 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>جاهز للاستماع</span>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-600 shrink-0 rotate-180" />

            {/* 2. AI Node */}
            <div className="w-56 p-4 rounded-2xl bg-gradient-to-b from-[#1b1c35] to-[#13152c] border border-purple-500/40 shadow-xl relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">ذكاء اصطناعي (AI)</span>
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xs font-bold text-white mb-1">استخراج نية الحجز</div>
              <p className="text-[11px] text-gray-400">RAG + استخراج الخدمة والوقت</p>
              <div className="mt-3 text-[10px] text-purple-300 font-semibold">استعلام نموذج المقيد</div>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-600 shrink-0 rotate-180" />

            {/* 3. Logic Node */}
            <div className="w-56 p-4 rounded-2xl bg-gradient-to-b from-[#1f2824] to-[#121c17] border border-emerald-500/40 shadow-xl relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">شرط وتحقق (Logic)</span>
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xs font-bold text-white mb-1">فحص التوافر الذري</div>
              <p className="text-[11px] text-gray-400">استدعاء SchedulingService</p>
              <div className="mt-3 text-[10px] text-emerald-300 font-semibold">هل الفترة شاغرة؟</div>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-600 shrink-0 rotate-180" />

            {/* 4. Action Node */}
            <div className="w-56 p-4 rounded-2xl bg-gradient-to-b from-[#2d1b22] to-[#1d1217] border border-rose-500/40 shadow-xl relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">إجراء (Action)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-xs font-bold text-white mb-1">تأكيد الموعد وإشعار</div>
              <p className="text-[11px] text-gray-400">إنشاء السجل + إرسال واتساب</p>
              <div className="mt-3 text-[10px] text-rose-300 font-semibold">مع مفتاح Idempotency</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>نظام الحماية: منع تنفيذ أكواد بايثون اعتباطية • مهلة تنفيذ العقدة: 30 ثانية</span>
          </div>
          <span className="font-mono text-[11px] text-gray-500">Engine: Celery + Redis Task Queue</span>
        </div>
      </div>

      {/* Workflows List Table */}
      <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white">قائمة تدفقات العمل المنشورة</span>
          <span className="text-xs text-gray-400">3 تدفقات في هذه المؤسسة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-4 font-semibold">اسم التدفق</th>
                <th className="p-4 font-semibold">المشغل (Trigger)</th>
                <th className="p-4 font-semibold">النسخة</th>
                <th className="p-4 font-semibold">مرات التشغيل</th>
                <th className="p-4 font-semibold">نسبة النجاح</th>
                <th className="p-4 font-semibold">الحالة</th>
                <th className="p-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {mockWorkflows.map((wf) => (
                <tr
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf)}
                  className="hover:bg-gray-800/30 transition-all cursor-pointer"
                >
                  <td className="p-4 font-bold text-gray-200">{wf.name}</td>
                  <td className="p-4 text-gray-300">{wf.trigger}</td>
                  <td className="p-4 text-gray-400 font-mono">{wf.version}</td>
                  <td className="p-4 font-semibold text-gray-300">{wf.runsCount.toLocaleString()}</td>
                  <td className="p-4 font-bold text-emerald-400">{wf.successRate}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      wf.status === "active"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}>
                      {wf.status === "active" ? "نشط" : "مسودة"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                      فتح المحرر
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
