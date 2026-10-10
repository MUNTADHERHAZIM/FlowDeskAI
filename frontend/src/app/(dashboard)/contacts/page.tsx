"use client";

import React from "react";
import { Users, Plus, Search, Phone, Mail, Calendar, MessageSquare, Filter } from "lucide-react";

const mockContacts = [
  { id: "1", name: "سارة عبدالله المنصور", phone: "+966 50 123 4567", email: "sara.m@example.com", appointments: 3, channel: "WhatsApp", tags: ["عميل VIP", "أسنان"] },
  { id: "2", name: "م. فهد بن عبدالعزيز", phone: "+966 55 987 6543", email: "fahad.a@example.com", appointments: 1, channel: "Telegram", tags: ["استشارة"] },
  { id: "3", name: "نورة محمد القحطاني", phone: "+966 54 333 2211", email: "noura.q@example.com", appointments: 4, channel: "WebChat", tags: ["متابعة"] },
  { id: "4", name: "عمر سليمان الحربي", phone: "+966 56 444 7788", email: "omar.h@example.com", appointments: 2, channel: "Email", tags: ["علاج طبيعي"] },
];

export default function ContactsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
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

        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all">
          <Plus className="w-4 h-4" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث بالاسم، الجوال، أو البريد..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-gray-400">4 عملاء مسجلين</span>
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
              {mockContacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-800/30 transition-all">
                  <td className="p-4 font-bold text-gray-200">{c.name}</td>
                  <td className="p-4 text-gray-300 font-mono">{c.phone}</td>
                  <td className="p-4 text-gray-400 font-mono">{c.email}</td>
                  <td className="p-4 text-indigo-400 font-medium">{c.channel}</td>
                  <td className="p-4 font-bold text-gray-200">{c.appointments} مواعيد</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {c.tags.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-300 border border-gray-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                      الملف الكامل
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
