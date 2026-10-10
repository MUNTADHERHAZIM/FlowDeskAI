"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  Filter,
  ShieldCheck,
  Building,
} from "lucide-react";

interface AppointmentItem {
  id: string;
  client: string;
  service: string;
  staff: string;
  room: string;
  time: string;
  duration: string;
  status: "confirmed" | "pending" | "completed";
}

const mockAppointments: AppointmentItem[] = [
  { id: "1", client: "سارة عبدالله المنصور", service: "استشارة طبية أولية", staff: "د. خالد السالم", room: "عيادة 2", time: "11:30 ص", duration: "30 دقيقة", status: "confirmed" },
  { id: "2", client: "م. فهد بن عبدالعزيز", service: "متابعة دورية", staff: "د. ريم الشمري", room: "عيادة 1", time: "12:15 م", duration: "45 دقيقة", status: "confirmed" },
  { id: "3", client: "نورة محمد القحطاني", service: "فحص وتشخيص متخصص", staff: "د. خالد السالم", room: "عيادة 2", time: "01:00 م", duration: "30 دقيقة", status: "confirmed" },
  { id: "4", client: "عمر سليمان الحربي", service: "جلسة علاج طبيعي", staff: "أخصائي ماجد الدوسري", room: "قاعة العلاج ب", time: "02:30 م", duration: "60 دقيقة", status: "pending" },
];

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(mockAppointments);
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-emerald-400" />
            <span>نظام المواعيد ومحرك الموارد الذري</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            إدارة الحجوزات مع منع التداخل والتعارض لكافة الموارد (الموظفين، القاعات، والمعدات) ذرياً.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PostgreSQL Atomic Guard: نشط</span>
          </div>
          <button
            onClick={() => setShowBookingModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>حجز موعد جديد</span>
          </button>
        </div>
      </div>

      {/* Resource & Timezone Quick Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0f1523]/80 border border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-gray-400">الموظفون والمختصون المتاحون</div>
            <div className="text-sm font-extrabold text-white">4 مختصين نشطين</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1523]/80 border border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-gray-400">القاعات والعيادات</div>
            <div className="text-sm font-extrabold text-white">3 غرف فحص شاغرة</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1523]/80 border border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-gray-400">المنطقة الزمنية للمؤسسة</div>
            <div className="text-sm font-extrabold text-white">توقيت مكة (Asia/Riyadh, UTC+3)</div>
          </div>
        </div>
      </div>

      {/* Appointments Table Card */}
      <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <span className="text-sm font-bold text-white">جدول مواعيد اليوم (الثلاثاء)</span>
          <span className="text-xs text-gray-400">4 مواعيد مجدولة</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-4 font-semibold">اسم العميل</th>
                <th className="p-4 font-semibold">نوع الخدمة</th>
                <th className="p-4 font-semibold">الموظف المسؤول</th>
                <th className="p-4 font-semibold">الموقع / القاعة</th>
                <th className="p-4 font-semibold">الوقت والمدة</th>
                <th className="p-4 font-semibold">الحالة</th>
                <th className="p-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {mockAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-800/30 transition-all">
                  <td className="p-4 font-bold text-gray-200">{app.client}</td>
                  <td className="p-4 text-gray-300">{app.service}</td>
                  <td className="p-4 text-gray-300">{app.staff}</td>
                  <td className="p-4 text-gray-400">{app.room}</td>
                  <td className="p-4">
                    <span className="font-bold text-emerald-400">{app.time}</span>
                    <span className="text-gray-500 text-[11px] mr-1.5">({app.duration})</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      app.status === "confirmed"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{app.status === "confirmed" ? "مؤكد" : "معلق"}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                      تفاصيل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal Demo */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              <span>حجز موعد ذري جديد</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">اسم العميل</label>
                <input type="text" placeholder="مثال: محمد بن ناصر" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">الخدمة</label>
                <select className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500">
                  <option>استشارة طبية أولية (30 دقيقة)</option>
                  <option>متابعة دورية (45 دقيقة)</option>
                  <option>فحص شامل (60 دقيقة)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">الموظف / الطبيب</label>
                <select className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500">
                  <option>د. خالد السالم (استشاري)</option>
                  <option>د. ريم الشمري (أخصائية)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                سيقوم النظام فورياً بفحص تزامن جدول الموظف والقاعة وحجز الفترة تلقائياً.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  alert("تم تسجيل الموعد بنجاح وحجز الموارد ذرياً!");
                  setShowBookingModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30"
              >
                تأكيد الحجز
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
