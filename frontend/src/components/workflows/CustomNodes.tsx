"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  Zap,
  Bot,
  GitBranch,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Database,
  ArrowRight,
  Loader2,
  Check,
  Radio,
  Smartphone,
  Play,
  Copy,
  Trash2,
  EyeOff,
  Code2,
  Send,
  Sparkles,
  Layers,
  AlertCircle,
  HelpCircle,
  Plus,
} from "lucide-react";

// Central dispatcher for node quick actions
const dispatchNodeAction = (
  e: React.MouseEvent,
  action: "run" | "duplicate" | "mute" | "delete" | "suggest-next",
  nodeId: string
) => {
  e.stopPropagation();
  e.preventDefault();
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("flow-node-action", {
        detail: { action, nodeId },
      })
    );
  }
};

// Common Node Container with n8n header and actions
interface BaseNodeWrapperProps {
  id: string;
  categoryName: string;
  categoryColor: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  status: string;
  executionTime?: string;
  nodeKey: string;
  selected?: boolean;
  isMuted?: boolean;
  children?: React.ReactNode;
}

const BaseNodeCard = ({
  id,
  categoryName,
  categoryColor,
  icon,
  label,
  description,
  status,
  executionTime = "0ms",
  nodeKey,
  selected,
  isMuted = false,
  children,
}: BaseNodeWrapperProps) => {
  return (
    <div
      className={`group w-72 rounded-2xl bg-[#0e1424] border transition-all duration-200 shadow-2xl select-none relative overflow-hidden backdrop-blur-xl ${
        isMuted
          ? "opacity-55 grayscale border-dashed border-gray-600 ring-0"
          : status === "running"
          ? "border-amber-400 ring-4 ring-amber-500/30 scale-[1.02] shadow-amber-500/20"
          : status === "success"
          ? "border-emerald-400/80 ring-2 ring-emerald-500/30 shadow-emerald-500/10"
          : status === "error"
          ? "border-rose-500 ring-4 ring-rose-500/30 shadow-rose-500/20"
          : selected
          ? "border-indigo-400 ring-2 ring-indigo-500/30 shadow-indigo-500/20"
          : "border-gray-800/80 hover:border-gray-600/80 hover:shadow-gray-900/50"
      }`}
    >
      {/* Top Category Accent Line */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${categoryColor}`} />

      {/* Floating Hover Quick Actions Bar (n8n Style) */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#162035]/95 border border-gray-700/80 rounded-lg p-0.5 shadow-xl z-30">
        <button
          onClick={(e) => dispatchNodeAction(e, "run", id)}
          title="تشغيل هذه الخطوة منفردة (Run Step)"
          className="p-1.5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-300 rounded transition-colors"
        >
          <Play className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => dispatchNodeAction(e, "duplicate", id)}
          title="نسخ العقدة (Duplicate)"
          className="p-1.5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-300 rounded transition-colors"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => dispatchNodeAction(e, "mute", id)}
          title={isMuted ? "تفعيل العقدة (Unmute)" : "تعطيل مؤقت (Mute)"}
          className={`p-1.5 rounded transition-colors ${
            isMuted
              ? "bg-amber-500/30 text-amber-300"
              : "hover:bg-amber-500/20 text-gray-400 hover:text-amber-300"
          }`}
        >
          <EyeOff className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => dispatchNodeAction(e, "suggest-next", id)}
          title="اقتراح وإضافة الخطوة التالية (Suggest Next Step)"
          className="p-1.5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => dispatchNodeAction(e, "delete", id)}
          title="حذف العقدة (Delete)"
          className="p-1.5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Quick Add Floating Connector Button on Output Port */}
      <button
        onClick={(e) => dispatchNodeAction(e, "suggest-next", id)}
        title="اقتراح وربط العقدة التالية (+)"
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 z-30"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      <div className="p-4">
        {/* Node Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-900/80 border border-gray-700/60 flex items-center justify-center shrink-0 shadow-inner">
              {icon}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md bg-gray-800/80 text-gray-300 border border-gray-700/50">
                {categoryName}
              </span>
              {isMuted && (
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  معطّل
                </span>
              )}
            </div>
          </div>

          {/* Execution Time Tag */}
          <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-gray-400 bg-gray-900/70 px-2 py-0.5 rounded-md border border-gray-800">
            {status === "running" ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                <span>running</span>
              </span>
            ) : status === "success" ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                <span>{executionTime}</span>
              </span>
            ) : status === "error" ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>failed</span>
              </span>
            ) : (
              <span>idle</span>
            )}
          </div>
        </div>

        {/* Node Titles */}
        <div className="mb-2">
          <div className="text-xs font-bold text-white mb-0.5 leading-snug tracking-tight">{label}</div>
          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{description}</p>
        </div>

        {/* Custom Body / Injected Info */}
        {children}

        {/* Footer info bar */}
        <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between text-[10px]">
          <span className="text-gray-500 font-mono text-[9px] truncate max-w-[140px]">key: {nodeKey}</span>
          <span className="text-indigo-400/80 text-[10px] font-semibold hover:text-indigo-300 transition-colors">
            انقر للضبط ⚙
          </span>
        </div>
      </div>
    </div>
  );
};

// 1. Trigger Node (e.g. WhatsApp, Cron, Webhook)
export const TriggerNode = memo(({ id, data, selected }: NodeProps) => {
  const status = data.status || "idle";

  return (
    <div className="relative">
      <BaseNodeCard
        id={id}
        categoryName="مشغّل (Trigger)"
        categoryColor="from-amber-500 to-orange-500"
        icon={<Zap className="w-4 h-4 text-amber-400" />}
        label={data.label || "وصول رسالة واتساب"}
        description={data.description || "استقبال رسائل واردة عبر Meta Cloud Webhook"}
        status={status}
        executionTime={data.executionTime || "12ms"}
        nodeKey={data.nodeKey || "trg_1"}
        selected={selected}
        isMuted={data.isMuted}
      >
        <div className="mt-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center justify-between text-[10px]">
          <span className="text-amber-300 font-medium">الحدث: On Inbound Msg</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            مستمع نشط
          </span>
        </div>
      </BaseNodeCard>

      <Handle
        type="target"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-[#0e1424] !-right-2 hover:!scale-125 transition-transform shadow-lg shadow-amber-500/50"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-[#0e1424] !-left-2 hover:!scale-125 transition-transform shadow-lg shadow-amber-500/50"
      />
    </div>
  );
});
TriggerNode.displayName = "TriggerNode";

// 2. AI & RAG Node (e.g. Gemini 1.5, GPT-4o, Intent Extractor)
export const AINode = memo(({ id, data, selected }: NodeProps) => {
  const status = data.status || "idle";

  return (
    <div className="relative">
      <BaseNodeCard
        id={id}
        categoryName="ذكاء اصطناعي (AI & RAG)"
        categoryColor="from-purple-500 via-fuchsia-500 to-pink-500"
        icon={<Bot className="w-4 h-4 text-purple-400" />}
        label={data.label || "استخراج نية الحجز والمعرفة"}
        description={data.description || "مطابقة قاعدة المعرفة واستخراج التاريخ والخدمة"}
        status={status}
        executionTime={data.executionTime || "280ms"}
        nodeKey={data.nodeKey || "ai_1"}
        selected={selected}
        isMuted={data.isMuted}
      >
        <div className="mt-2 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 flex items-center justify-between text-[10px]">
          <span className="text-purple-300 font-mono font-medium">{data.config?.model || "Gemini 1.5 Pro"}</span>
          <span className="text-fuchsia-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            RAG Grounded
          </span>
        </div>
      </BaseNodeCard>

      <Handle
        type="target"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-[#0e1424] !-right-2 hover:!scale-125 transition-transform shadow-lg shadow-purple-500/50"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-purple-400 !border-2 !border-[#0e1424] !-left-2 hover:!scale-125 transition-transform shadow-lg shadow-purple-500/50"
      />
    </div>
  );
});
AINode.displayName = "AINode";

// 3. Logic & Condition Node (IF / ELSE Condition with 2 Branch Outputs)
export const LogicNode = memo(({ id, data, selected }: NodeProps) => {
  const status = data.status || "idle";

  return (
    <div className="relative">
      <BaseNodeCard
        id={id}
        categoryName="منطق وتحقق (Logic / IF)"
        categoryColor="from-emerald-500 to-teal-500"
        icon={<GitBranch className="w-4 h-4 text-emerald-400" />}
        label={data.label || "فحص التوافر ومنع التعارض"}
        description={data.description || "التحقق من خلو الموعد الذري في PostgreSQL"}
        status={status}
        executionTime={data.executionTime || "16ms"}
        nodeKey={data.nodeKey || "lgc_1"}
        selected={selected}
        isMuted={data.isMuted}
      >
        <div className="mt-2 space-y-1.5 text-[10px]">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <span className="text-emerald-300 font-semibold">المسار 1: متاح (True)</span>
            <span className="text-emerald-400 font-bold">✓ قفل ذري</span>
          </div>
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
            <span className="text-rose-300 font-semibold">المسار 2: محجوز (False)</span>
            <span className="text-rose-400 font-bold">✕ اقتراح بديل</span>
          </div>
        </div>
      </BaseNodeCard>

      <Handle
        type="target"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-[#0e1424] !-right-2 hover:!scale-125 transition-transform shadow-lg shadow-emerald-500/50"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="true"
        style={{ top: "42%" }}
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-[#0e1424] !-left-2 hover:!scale-125 transition-transform shadow-lg shadow-emerald-500/50"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="false"
        style={{ top: "72%" }}
        className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-[#0e1424] !-left-2 hover:!scale-125 transition-transform shadow-lg shadow-rose-500/50"
      />
    </div>
  );
});
LogicNode.displayName = "LogicNode";

// 4. Action Node (e.g. WhatsApp Send, Telegram Send, Iraq SMS)
export const ActionNode = memo(({ id, data, selected }: NodeProps) => {
  const status = data.status || "idle";

  return (
    <div className="relative">
      <BaseNodeCard
        id={id}
        categoryName="إجراء نهائي (Action)"
        categoryColor="from-rose-500 to-red-600"
        icon={<CheckCircle2 className="w-4 h-4 text-rose-400" />}
        label={data.label || "تأكيد وإرسال واتساب"}
        description={data.description || "إنشاء السجل في قاعدة البيانات وإشعار العميل"}
        status={status}
        executionTime={data.executionTime || "64ms"}
        nodeKey={data.nodeKey || "act_1"}
        selected={selected}
        isMuted={data.isMuted}
      >
        <div className="mt-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/20 flex items-center justify-between text-[10px]">
          <span className="text-rose-300 font-medium">الوجهة: WhatsApp API</span>
          <span className="text-emerald-400 font-semibold">Idempotent</span>
        </div>
      </BaseNodeCard>

      <Handle
        type="target"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-[#0e1424] !-right-2 hover:!scale-125 transition-transform shadow-lg shadow-rose-500/50"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-rose-400 !border-2 !border-[#0e1424] !-left-2 hover:!scale-125 transition-transform shadow-lg shadow-rose-500/50"
      />
    </div>
  );
});
ActionNode.displayName = "ActionNode";

// 5. Database Node (e.g. PostgreSQL Query, Calendar Slot Insert)
export const DatabaseNode = memo(({ id, data, selected }: NodeProps) => {
  const status = data.status || "idle";

  return (
    <div className="relative">
      <BaseNodeCard
        id={id}
        categoryName="قاعدة بيانات (Database)"
        categoryColor="from-cyan-500 to-blue-600"
        icon={<Database className="w-4 h-4 text-cyan-400" />}
        label={data.label || "استعلام PostgreSQL الذري"}
        description={data.description || "قفل التوافر والتحقق من قيود المفاتيح"}
        status={status}
        executionTime={data.executionTime || "8ms"}
        nodeKey={data.nodeKey || "db_1"}
        selected={selected}
        isMuted={data.isMuted}
      >
        <div className="mt-2 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between text-[10px]">
          <span className="text-cyan-300 font-mono font-medium">SELECT FOR UPDATE</span>
          <span className="text-cyan-400 font-semibold">Zero-Overlap</span>
        </div>
      </BaseNodeCard>

      <Handle
        type="target"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-[#0e1424] !-right-2 hover:!scale-125 transition-transform shadow-lg shadow-cyan-500/50"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-[#0e1424] !-left-2 hover:!scale-125 transition-transform shadow-lg shadow-cyan-500/50"
      />
    </div>
  );
});
DatabaseNode.displayName = "DatabaseNode";

// 6. Code & Script Node (e.g. JavaScript Function, Transform)
export const CodeNode = memo(({ id, data, selected }: NodeProps) => {
  const status = data.status || "idle";

  return (
    <div className="relative">
      <BaseNodeCard
        id={id}
        categoryName="دالة برمجية (Code Node)"
        categoryColor="from-amber-400 to-yellow-500"
        icon={<Code2 className="w-4 h-4 text-yellow-400" />}
        label={data.label || "تحويل البيانات (JavaScript)"}
        description={data.description || "معالجة مصفوفات الـ JSON وتنسيق النصوص"}
        status={status}
        executionTime={data.executionTime || "4ms"}
        nodeKey={data.nodeKey || "code_1"}
        selected={selected}
        isMuted={data.isMuted}
      >
        <div className="mt-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20 flex items-center justify-between text-[10px]">
          <span className="text-yellow-300 font-mono">return items.map(...)</span>
          <span className="text-yellow-400 font-mono font-bold">ES2024</span>
        </div>
      </BaseNodeCard>

      <Handle
        type="target"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-yellow-400 !border-2 !border-[#0e1424] !-right-2 hover:!scale-125 transition-transform shadow-lg shadow-yellow-500/50"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-yellow-400 !border-2 !border-[#0e1424] !-left-2 hover:!scale-125 transition-transform shadow-lg shadow-yellow-500/50"
      />
    </div>
  );
});
CodeNode.displayName = "CodeNode";

// 7. Flow Final Result & Output Node (عقدة عرض النتائج النهائية والمخرجات)
export const OutputNode = memo(({ id, data, selected }: NodeProps) => {
  const status = data.status || "idle";

  return (
    <div className="relative">
      <BaseNodeCard
        id={id}
        categoryName="النتيجة النهائية (Flow Result)"
        categoryColor="from-emerald-500 to-teal-600"
        icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        label={data.label || "عرض النتيجة النهائية للمسار"}
        description={data.description || "تجميع المخرجات، استجابة الـ API، وعرض بطاقة النجاح"}
        status={status}
        executionTime={data.executionTime || "1ms"}
        nodeKey={data.nodeKey || "out_1"}
        selected={selected}
        isMuted={data.isMuted}
      >
        <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-emerald-300 font-bold">الحالة النهائية:</span>
            <span className="text-emerald-400 font-mono font-semibold">200 OK (مكتمل)</span>
          </div>
          <div className="text-[9px] text-gray-300 font-mono truncate bg-gray-900/60 px-1.5 py-0.5 rounded border border-gray-800">
            {data.config?.payloadSummary || '{ "status": "CONFIRMED", "slot": "16:30" }'}
          </div>
        </div>
      </BaseNodeCard>

      <Handle
        type="target"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-[#0e1424] !-right-2 hover:!scale-125 transition-transform shadow-lg shadow-emerald-500/50"
      />
    </div>
  );
});
OutputNode.displayName = "OutputNode";
