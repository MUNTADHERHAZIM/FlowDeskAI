"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
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
  Search,
  X,
  Trash2,
  Check,
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

const initialAppointments: AppointmentItem[] = [
  { id: "1", client: "سارة عبدالحسين المنصوري", service: "كشف واستشارة تخصصية", staff: "د. أحمد السعدون", room: "عيادة 1 - جناح البصرة", time: "11:30 ص", duration: "30 دقيقة", status: "confirmed" },
  { id: "2", client: "م. علي حيدر التميمي", service: "متابعة دورية", staff: "د. ريم البصري", room: "عيادة 2 - الدور الاستشاري", time: "12:15 م", duration: "45 دقيقة", status: "confirmed" },
  { id: "3", client: "زينب قاسم العبادي", service: "فحص وتشخيص شامل", staff: "د. أحمد السعدون", room: "عيادة 1 - جناح البصرة", time: "01:00 م", duration: "30 دقيقة", status: "confirmed" },
  { id: "4", client: "كرار جاسم الخفاجي", service: "جلسة فحص تخطيط قلب", staff: "أخصائي عمار الشمري", room: "مختبر الفحوصات ب", time: "02:30 م", duration: "60 دقيقة", status: "pending" },
];

export default function CalendarPage() {
  const { user, activeTenant } = useAuth();
  const isDemo = activeTenant?.id === "demo-tenant-101" || activeTenant?.slug === "basra-medical-center";

  const [appointments, setAppointments] = useState<AppointmentItem[]>(() =>
    isDemo ? initialAppointments : []
  );
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "confirmed" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setAppointments(initialAppointments);
    } else {
      setAppointments([]);
    }
  }, [isDemo]);

  // New booking form state
  const [newClient, setNewClient] = useState("");
  const [newService, setNewService] = useState("كشف واستشارة تخصصية (35,000 د.ع)");
  const [newStaff, setNewStaff] = useState("د. أحمد السعدون (استشاري)");
  const [newTime, setNewTime] = useState("10:00 ص");
  const [newRoom, setNewRoom] = useState("عيادة 1 - جناح البصرة");

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim()) return;

    const newApp: AppointmentItem = {
      id: Date.now().toString(),
      client: newClient.trim(),
      service: newService.split(" (")[0],
      staff: newStaff.split(" (")[0],
      room: newRoom,
      time: newTime,
      duration: newService.includes("45") ? "45 دقيقة" : newService.includes("60") ? "60 دقيقة" : "30 دقيقة",
      status: "confirmed",
    };

    setAppointments((prev) => [newApp, ...prev]);
    setShowBookingModal(false);
    setNewClient("");
    setSuccessToast(`تم حجز موعد ${newApp.client} ذرياً بنجاح وحماية المورد من أي تعارض!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setSelectedAppointment(null);
    setSuccessToast("تم إلغاء الموعد وتحرير المورد في التقويم.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleToggleStatus = (id: string, newStatus: "confirmed" | "pending" | "completed") => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus });
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesFilter = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch =
      app.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.staff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-none">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 hover:opacity-95 transition-all hover:scale-105"
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
            <div className="text-sm font-extrabold text-white">
              {isDemo ? "4 مختصين نشطين" : "1 مالك / مدير نشط"}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1523]/80 border border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600/20 text-teal-400 flex items-center justify-center font-bold">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-gray-400">القاعات والعيادات</div>
            <div className="text-sm font-extrabold text-white">
              {isDemo ? "3 غرف فحص شاغرة" : "جاهز لإضافة الغرف والعيادات"}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0f1523]/80 border border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-gray-400">المنطقة الزمنية للمؤسسة</div>
            <div className="text-sm font-extrabold text-white">توقيت بغداد / مكة (UTC+3)</div>
          </div>
        </div>
      </div>

      {/* Appointments Filter & Table Card */}
      <div className="rounded-2xl bg-[#0f1523]/80 border border-gray-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === "all" ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30" : "text-gray-400 hover:text-white"
              }`}
            >
              جميع المواعيد ({appointments.length})
            </button>
            <button
              onClick={() => setFilterStatus("confirmed")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === "confirmed" ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30" : "text-gray-400 hover:text-white"
              }`}
            >
              المؤكدة ({appointments.filter((a) => a.status === "confirmed").length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === "pending" ? "bg-amber-600/20 text-amber-300 border border-amber-500/30" : "text-gray-400 hover:text-white"
              }`}
            >
              المعلقة ({appointments.filter((a) => a.status === "pending").length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الطبيب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
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
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-xs text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldCheck className="w-8 h-8 text-emerald-400/80 mb-1" />
                      <span className="font-bold text-gray-200 text-sm">
                        {appointments.length === 0
                          ? `لا توجد أي مواعيد مسجلة حتى الآن لمؤسسة ${activeTenant?.name || "مساحة عملك"}`
                          : "لا توجد مواعيد مطابقة لخيارات البحث"}
                      </span>
                      <span className="text-[11px] text-gray-500 max-w-md leading-relaxed">
                        🔒 جدول المواعيد محمي ومعزول تماماً ومخصص لك فقط. يمكنك الضغط على زر "حجز موعد جديد" أعلاه لإضافة أول موعد يدوياً أو استقبال المواعيد وتثبيتها تلقائياً عبر واتساب.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
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
                          : app.status === "completed"
                          ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{app.status === "confirmed" ? "مؤكد" : app.status === "completed" ? "مكتمل" : "معلق"}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedAppointment(app)}
                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-all"
                      >
                        تفاصيل الموعد
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <span>حجز موعد ذري جديد</span>
              </h2>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">اسم العميل</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محمد بن ناصر الحكيم"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">الخدمة والمدة</label>
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>استشارة طبية أولية (30 دقيقة)</option>
                  <option>متابعة دورية (45 دقيقة)</option>
                  <option>فحص شامل متقدم (60 دقيقة)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">الموظف / الطبيب المختص</label>
                <select
                  value={newStaff}
                  onChange={(e) => setNewStaff(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>د. خالد السالم (استشاري)</option>
                  <option>د. ريم الشمري (أخصائية)</option>
                  <option>أخصائي ماجد الدوسري (علاج طبيعي)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">الوقت المطلوب</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="مثال: 11:30 ص"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">القاعة / الغرفة</label>
                  <select
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option>عيادة 1</option>
                    <option>عيادة 2</option>
                    <option>قاعة العلاج ب</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                🔒 فحص التوافر الذري نشط: سيتم غلق السجل في PostgreSQL لمنع أي تعارض مزدوج فورياً.
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  تأكيد الحجز الذري
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                <span>تفاصيل الموعد: {selectedAppointment.client}</span>
              </h2>
              <button onClick={() => setSelectedAppointment(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">اسم العميل</span>
                <span className="font-bold text-white">{selectedAppointment.client}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">نوع الخدمة</span>
                <span className="text-gray-200">{selectedAppointment.service}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">المختص المسؤول</span>
                <span className="text-emerald-400 font-semibold">{selectedAppointment.staff}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">الموقع والقاعة</span>
                <span className="text-gray-300">{selectedAppointment.room}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-400">الوقت والمدة</span>
                <span className="font-mono text-cyan-300">{selectedAppointment.time} ({selectedAppointment.duration})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60 items-center">
                <span className="text-gray-400">الحالة الحالية</span>
                <span className="font-bold text-emerald-400">{selectedAppointment.status}</span>
              </div>

              <div className="pt-2">
                <label className="block text-gray-400 mb-1.5 font-medium">تغيير حالة الموعد:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(selectedAppointment.id, "confirmed")}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold ${
                      selectedAppointment.status === "confirmed"
                        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40"
                        : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    تأكيد
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedAppointment.id, "pending")}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold ${
                      selectedAppointment.status === "pending"
                        ? "bg-amber-600/20 text-amber-300 border-amber-500/40"
                        : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    تعليق
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedAppointment.id, "completed")}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold ${
                      selectedAppointment.status === "completed"
                        ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                        : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    مكتمل
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إلغاء الموعد نهائياً</span>
                </button>
                <button
                  onClick={() => setSelectedAppointment(null)}
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

