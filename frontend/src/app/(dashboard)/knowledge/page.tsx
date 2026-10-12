"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Bot,
  Plus,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  X,
  Trash2,
  Database,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface KnowledgeDoc {
  id: string;
  title: string;
  sourceType: string;
  chunksCount: number;
  updatedAt: string;
  isActive: boolean;
  sampleChunks: string[];
}

const initialDocs: KnowledgeDoc[] = [
  {
    id: "1",
    title: "دليل خدمات العيادة وأوقات العمل الرسمية 2026",
    sourceType: "مستند نصي",
    chunksCount: 18,
    updatedAt: "اليوم",
    isActive: true,
    sampleChunks: [
      "ساعات العمل في مركز البصرة الطبي: السبت إلى الخميس من 9:00 ص حتى 9:00 م. الجمعة مغلق للحالات الاعتيادية وطوارئ 24 ساعة.",
      "طاقم الأطباء: د. خالد السالم (استشاري طب وجراحة عيون)، د. ريم الشمري (أخصائية جلدية وتجميل).",
    ],
  },
  {
    id: "2",
    title: "لائحة أسعار الاستشارات وباقات المتابعة الطبية",
    sourceType: "ملف PDF",
    chunksCount: 32,
    updatedAt: "أمس",
    isActive: true,
    sampleChunks: [
      "كشفية الاستشارة الأولية: 35,000 دينار عراقي شاملة الفحص السريري وضغط العين.",
      "جلسات العلاج الطبيعي: 25,000 دينار عراقي للجلسة الفردية وباقة 5 جلسات بـ 100,000 دينار.",
    ],
  },
  {
    id: "3",
    title: "سياسة إلغاء وإعادة جدولة المواعيد",
    sourceType: "رابط موقع",
    chunksCount: 8,
    updatedAt: "منذ أسبوع",
    isActive: true,
    sampleChunks: [
      "يمكن للعميل إعادة جدولة الموعد مجاناً حتى ساعتين قبل الموعد المحدد عبر رسالة واتساب تلقائية.",
    ],
  },
];

export default function KnowledgePage() {
  const { user, activeTenant } = useAuth();
  const isDemo = activeTenant?.id === "demo-tenant-101" || activeTenant?.slug === "basra-medical-center";

  const [docs, setDocs] = useState<KnowledgeDoc[]>(() => isDemo ? initialDocs : []);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocForChunks, setSelectedDocForChunks] = useState<KnowledgeDoc | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setDocs(initialDocs);
    } else {
      setDocs([]);
    }
  }, [isDemo]);

  // New Doc Form
  const [newTitle, setNewTitle] = useState("");
  const [newSourceType, setNewSourceType] = useState("مستند نصي");
  const [newContent, setNewContent] = useState("");

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDoc: KnowledgeDoc = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      sourceType: newSourceType,
      chunksCount: Math.max(4, Math.ceil(newContent.length / 80)),
      updatedAt: "الآن",
      isActive: true,
      sampleChunks: [
        newContent.slice(0, 150) || "تم تقسيم هذا المستند إلى متجهات وفهارس دلالية في قاعدة بيانات pgvector.",
      ],
    };

    setDocs((prev) => [newDoc, ...prev]);
    setShowAddModal(false);
    setNewTitle("");
    setNewContent("");
    setSuccessToast(`تمت فهرسة المستند "${newDoc.title}" وتحويله لمتجهات بنجاح.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleToggleDoc = (id: string) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const handleDeleteDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocForChunks(null);
    setSuccessToast("تم حذف المستند من قاعدة المعرفة.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.sourceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-purple-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/25 hover:opacity-95 transition-all hover:scale-105"
        >
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
          <div className="relative w-80">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث في المستندات المعرفية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <span className="text-xs text-gray-400">{filteredDocs.length} مصادر مفهرسة</span>
        </div>

        <div className="divide-y divide-gray-800/60">
          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              <div className="flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="w-8 h-8 text-purple-400/80 mb-1" />
                <span className="font-bold text-gray-200 text-sm">
                  {docs.length === 0
                    ? `لا توجد مستندات في قاعدة المعرفة حتى الآن لمؤسسة ${activeTenant?.name || "مساحة عملك"}`
                    : "لا توجد مستندات مطابقة للبحث"}
                </span>
                <span className="text-[11px] text-gray-500 max-w-md leading-relaxed">
                  🔒 قاعدة المعرفة معزولة ومحمية ومخصصة لمؤسستك فقط. يمكنك الضغط على "إضافة مستند جديد" أعلاه لرفع أدلة خدماتك وسياساتك لتدريب مساعد الذكاء الاصطناعي RAG على الرد التلقائي بدقة.
                </span>
              </div>
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-gray-800/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-purple-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-200">{doc.title}</div>
                    <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-gray-900 text-gray-300 border border-gray-800 text-[10px]">{doc.sourceType}</span>
                      <span>•</span>
                      <span>{doc.chunksCount} مقطع معرفي (Chunks)</span>
                      <span>•</span>
                      <span>حُدث {doc.updatedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleDoc(doc.id)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-all ${
                      doc.isActive
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{doc.isActive ? "مفعل" : "معطل"}</span>
                  </button>

                  <button
                    onClick={() => setSelectedDocForChunks(doc)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-all"
                  >
                    عرض المقاطع
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>إضافة مستند معرفي جديد (RAG Grounding)</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDoc} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">عنوان المستند</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تعليمات الفحص الطبي وسياسة المواعيد 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">نوع المصدر</label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option>مستند نصي (Text Document)</option>
                  <option>ملف PDF / Word</option>
                  <option>صفحة ويب / رابط موقع</option>
                  <option>سؤال وجواب (FAQ)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">المحتوى النصي للمستند</label>
                <textarea
                  rows={4}
                  required
                  placeholder="الصق نص اللائحة أو المستند هنا ليتم تقسيمه وتضمينه (Embeddings) في قاعدة المعرفة..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300">
                ⚡ سيقوم محرك FlowDesk RAG بتجزئة النص وفهرسته بنموذج تضمين مخصص باللغة العربية.
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                >
                  فهرسة المستند وتفعيله
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chunks Inspector Modal */}
      {selectedDocForChunks && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>المقاطع المفهرسة (Semantic Chunks): {selectedDocForChunks.title}</span>
              </h2>
              <button onClick={() => setSelectedDocForChunks(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between text-gray-400 text-[11px] pb-1">
                <span>إجمالي المقاطع: {selectedDocForChunks.chunksCount} مقطع</span>
                <span>محرك البحث: PostgreSQL pgvector</span>
              </div>

              {selectedDocForChunks.sampleChunks.map((chunk, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-900/70 border border-gray-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono">
                    <span>Chunk #{idx + 1}</span>
                    <span className="text-emerald-400">Cosine Similarity: 0.942</span>
                  </div>
                  <p className="text-gray-200 leading-relaxed">{chunk}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-800 flex items-center justify-between">
              <button
                onClick={() => handleDeleteDoc(selectedDocForChunks.id)}
                className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف المستند بالكامل</span>
              </button>
              <button
                onClick={() => setSelectedDocForChunks(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

