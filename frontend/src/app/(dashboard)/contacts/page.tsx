"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Search, Phone, Mail, Calendar, MessageSquare, Filter, X, Trash2, CheckCircle2, ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  appointments: number;
  channel: string;
  tags: string[];
  notes?: string;
}

const initialContacts: Contact[] = [
  { id: "1", name: "سارة عبدالحسين المنصوري", phone: "+964 780 123 4567", email: "sara.m@example.com", appointments: 3, channel: "WhatsApp", tags: ["عميل VIP", "باطنية"], notes: "تفضل المواعيد الصباحية دائماً مع د. أحمد السعدون." },
  { id: "2", name: "م. علي حيدر التميمي", phone: "+964 781 987 6543", email: "ali.t@example.com", appointments: 1, channel: "Telegram", tags: ["استشارة"], notes: "تم إرسال التقارير الطبية عبر بوت تيليجرام." },
  { id: "3", name: "زينب قاسم العبادي", phone: "+964 770 333 2211", email: "zainab.q@example.com", appointments: 4, channel: "WebChat", tags: ["متابعة"], notes: "تسأل عن خطة الفحص السنوي الشامل." },
  { id: "4", name: "كرار جاسم الخفاجي", phone: "+964 771 444 7788", email: "karrar.k@example.com", appointments: 2, channel: "Email", tags: ["تخطيط قلب"], notes: "فحوصات دورية شهرية." },
];

export default function ContactsPage() {
  const { user, activeTenant } = useAuth();
  const isDemo = activeTenant?.id === "demo-tenant-101" || activeTenant?.slug === "basra-medical-center";

  const [contacts, setContacts] = useState<Contact[]>(() => isDemo ? initialContacts : []);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setContacts(initialContacts);
    } else {
      setContacts([]);
    }
  }, [isDemo]);

  // New Contact form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("+964 7");
  const [newEmail, setNewEmail] = useState("");
  const [newChannel, setNewChannel] = useState("WhatsApp");
  const [newTag, setNewTag] = useState("عميل جديد");

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newC: Contact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, ".")}@example.com`,
      channel: newChannel,
      appointments: 0,
      tags: [newTag],
      notes: "تمت إضافة العميل يدوياً إلى سجلات المؤسسة.",
    };

    setContacts((prev) => [newC, ...prev]);
    setShowAddModal(false);
    setNewName("");
    setNewPhone("+964 7");
    setNewEmail("");
    setSuccessToast(`تمت إضافة العميل ${newC.name} بنجاح إلى قاعدة بيانات المؤسسة.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setSelectedContact(null);
    setSuccessToast("تم حذف ملف العميل.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-200">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>إدارة العملاء وملفات الاتصال (CRM)</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            سجل موحد لبيانات العملاء وهوياتهم عبر القنوات المختلفة (الهوية الموحدة للعميل).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Contacts Table Card */}
      <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="relative w-80">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث بالاسم، الجوال، البريد، أو الوسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-gray-400">{filteredContacts.length} عملاء مسجلين</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-4 font-semibold">اسم العميل</th>
                <th className="p-4 font-semibold">رقم الهاتف</th>
                <th className="p-4 font-semibold">البريد الإلكتروني</th>
                <th className="p-4 font-semibold">القناة الأساسية</th>
                <th className="p-4 font-semibold">المواعيد السابقة</th>
                <th className="p-4 font-semibold">الوسوم</th>
                <th className="p-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldCheck className="w-8 h-8 text-indigo-400/80 mb-1" />
                      <span className="font-bold text-gray-200 text-sm">
                        {contacts.length === 0
                          ? `لا يوجد أي عملاء مسجلين حتى الآن لمؤسسة ${activeTenant?.name || "مساحة عملك"}`
                          : "لا يوجد عملاء يطابقون استعلام البحث"}
                      </span>
                      <span className="text-[11px] text-gray-500 max-w-md leading-relaxed">
                        🔒 قاعدة بيانات العملاء معزولة ومحمية بالكامل وخاصة بمؤسستك فقط. يمكنك الضغط على "إضافة عميل جديد" أعلاه أو استقبال العملاء وتوثيقهم تلقائياً عند مراسلتهم لقنواتك.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/30 transition-all">
                    <td className="p-4 font-bold text-gray-200">{c.name}</td>
                    <td className="p-4 text-gray-300 font-mono">{c.phone}</td>
                    <td className="p-4 text-gray-400 font-mono">{c.email}</td>
                    <td className="p-4 text-indigo-400 font-medium">{c.channel}</td>
                    <td className="p-4 font-bold text-gray-200">{c.appointments} مواعيد</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {c.tags.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-300 border border-gray-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedContact(c)}
                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-all"
                      >
                        الملف الكامل
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>إضافة عميل جديد إلى CRM</span>
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">اسم العميل بالكامل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد عبدالحسين البصري"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">رقم الهاتف (الواتساب)</label>
                <input
                  type="text"
                  required
                  placeholder="+964 780 ..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  placeholder="ahmed@example.iq"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">القناة الأساسية</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>WhatsApp</option>
                    <option>Telegram</option>
                    <option>WebChat</option>
                    <option>Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">الوسم المبدئي</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>عميل جديد</option>
                    <option>عميل VIP</option>
                    <option>استشارة</option>
                    <option>متابعة</option>
                  </select>
                </div>
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Profile Drawer/Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {selectedContact.name[0]}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{selectedContact.name}</h2>
                  <span className="text-[11px] text-gray-400">القناة المفضلة: {selectedContact.channel}</span>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <div>
                  <span className="text-gray-500 text-[10px] font-semibold block">الهاتف</span>
                  <span className="text-white font-mono">{selectedContact.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] font-semibold block">البريد الإلكتروني</span>
                  <span className="text-white font-mono truncate block">{selectedContact.email}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">الوسوم والتصنيفات:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {selectedContact.tags.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-gray-400 font-semibold block mb-1">ملاحظات العميل وسياق المحادثة:</span>
                <p className="p-3 rounded-xl bg-gray-900/40 border border-gray-800 text-gray-300 leading-relaxed">
                  {selectedContact.notes || "لا توجد ملاحظات إضافية مسجلة لهذا العميل."}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 flex items-center justify-between">
                <span>سجل المواعيد المؤكدة:</span>
                <span className="font-bold text-white">{selectedContact.appointments} مواعيد سابقة</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href="/inbox"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/25"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>فتح المحادثة الفورية</span>
                </Link>
                <Link
                  href="/calendar"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-center flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/25"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>حجز موعد جديد</span>
                </Link>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteContact(selectedContact.id)}
                  className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف العميل من السجل</span>
                </button>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="px-4 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

