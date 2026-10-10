"use client";

import React, { useState } from "react";
import {
  Bot,
  Plus,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  ShieldAlert,
} from "lucide-react";

interface KnowledgeDoc {
  id: string;
  title: string;
  sourceType: string;
  chunksCount: number;
  updatedAt: string;
  isActive: boolean;
}

const mockDocs: KnowledgeDoc[] = [
  { id: "1", title: "دليل خدمات العيادة وأوقات العمل الرسمية 2026", sourceType: "مستند نصي", chunksCount: 18, updatedAt: "اليوم", isActive: true },
  { id: "2", title: "لائحة أسعار الاستشارات وباقات المتابعة الطبية", sourceType: "ملف PDF", chunksCount: 32, updatedAt: "أمس", isActive: true },
  { id: "3", title: "سياسة إلغاء وإعادة جدولة المواعيد", sourceType: "رابط موقع", chunksCount: 8, updatedAt: "منذ أسبوع", isActive: true },
];

export default function KnowledgePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-purple-400" />
            <span>قاعدة المعرفة والذكاء الاصطناعي (RAG Engine)</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            إدارة الوثائق ومصادر المعلومات المعتمدة للردود الذكية المقيدة، لمنع اختلاق الإجابات وضمان دقتها.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 hover:opacity-95 transition-all">
          <Plus className="w-4 h-4" />
          <span>إضافة مستند معرفي</span>
        </button>
      </div>

      {/* RAG Policy Guard Banner */}
      <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-300">سياسة الردود الذكية المقيدة (Strict Grounding Policy)</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              لا يُسمح للنموذج بتأليف أي إجابة من تلقاء نفسه، ويقتصر حصرياً على الحقائق الواردة في مستندات المؤسسة أعلاه.
            </div>
          </div>
        </div>
        <div className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 w-fit">
          مفعلة 100%
        </div>
      </div>

      {/* Documents List */}
      <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white">المستندات المعرفية النشطة</span>
          <span className="text-xs text-gray-400">3 مصادر مفهرسة</span>
        </div>

        <div className="divide-y divide-gray-800/60">
          {mockDocs.map((doc) => (
            <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-gray-800/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-200">{doc.title}</div>
                  <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                    <span>{doc.sourceType}</span>
                    <span>•</span>
                    <span>{doc.chunksCount} مقطع معرفي (Chunks)</span>
                    <span>•</span>
                    <span>حُدث {doc.updatedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>مفعل</span>
                </span>
                <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                  عرض المقاطع
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
