"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Bell,
  Search,
  Activity,
  LogOut,
  User,
  Settings,
  X,
  Workflow,
  Calendar,
  MessageSquare,
  Users,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  time: string;
  type: "booking" | "ai" | "message" | "system";
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", title: "حجز موعد جديد: سارة عبدالحسين المنصوري (د. أحمد السعدون)", time: "منذ دقيقتين", type: "booking", read: false },
  { id: "2", title: "تم تنفيذ مسار الأتمتة: WhatsApp Inbound -> RAG Answer", time: "منذ 10 دقائق", type: "ai", read: false },
  { id: "3", title: "رسالة جديدة واردة عبر واتساب من رقم +9647801234567", time: "منذ 25 دقيقة", type: "message", read: false },
  { id: "4", title: "اكتمال الفحص الذري لجدول الأطباء بدون أي تعارض", time: "منذ ساعة", type: "system", read: true },
];

export function Header() {
  const { user, activeTenant, switchTenant, logout } = useAuth();
  const router = useRouter();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createWorkspaceModalOpen, setCreateWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    const newTenant = {
      id: `tenant-${Date.now()}`,
      name: newWorkspaceName.trim(),
      slug: newWorkspaceName.trim().toLowerCase().replace(/\s+/g, "-"),
      role: "owner",
      is_default: false,
    };

    if (user && user.tenants) {
      user.tenants.push(newTenant);
    }
    switchTenant(newTenant);
    setNewWorkspaceName("");
    setCreateWorkspaceModalOpen(false);
  };

  // Quick navigation items for Search Spotlight
  const quickLinks = [
    { title: "محرّك الأتمتة المرئي (شبيه n8n)", href: "/workflows", icon: Workflow, tag: "أتمتة" },
    { title: "صندوق الوارد الموحد", href: "/inbox", icon: MessageSquare, tag: "محادثات" },
    { title: "التقويم والمواعيد (فحص ذري)", href: "/calendar", icon: Calendar, tag: "حجوزات" },
    { title: "إدارة العملاء CRM", href: "/contacts", icon: Users, tag: "بيانات" },
    { title: "إعدادات المؤسسة ومساحة العمل", href: "/settings", icon: Settings, tag: "تهيئة" },
  ];

  const filteredLinks = searchQuery
    ? quickLinks.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : quickLinks;

  return (
    <>
      <header className="h-16 bg-[#0d121f]/90 backdrop-blur-md border-b border-gray-800/80 px-6 flex items-center justify-between sticky top-0 z-20 select-none">
        {/* Right side: Tenant Switcher & Search */}
        <div className="flex items-center gap-4">
          {/* Tenant Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setTenantDropdownOpen(!tenantDropdownOpen);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gray-800/60 border border-gray-700/60 hover:border-indigo-500/50 hover:bg-gray-800 transition-all text-sm font-medium text-gray-200"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">{activeTenant?.name || "اختر المؤسسة"}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {activeTenant?.role === "owner" ? "مالك" : "مدير"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {tenantDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111827] border border-gray-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 border-b border-gray-800">
                  مساحات العمل والمؤسسات
                </div>

                <div className="py-1 space-y-0.5">
                  {user?.tenants?.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => {
                        switchTenant(tenant);
                        setTenantDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        activeTenant?.id === tenant.id
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span>{tenant.name}</span>
                      </div>
                      {activeTenant?.id === tenant.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-800">
                  <button
                    onClick={() => {
                      setTenantDropdownOpen(false);
                      setCreateWorkspaceModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>إنشاء مساحة عمل جديدة</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Global Search Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="relative hidden md:flex items-center gap-2 w-72 bg-gray-900/60 border border-gray-800 hover:border-indigo-500/50 rounded-xl px-3 py-1.5 text-xs text-gray-400 transition-all text-right"
          >
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <span className="flex-1">البحث السريع (Ctrl + K)...</span>
            <kbd className="text-[10px] bg-gray-800 border border-gray-700 px-1.5 py-0.5 rounded text-gray-400 font-mono">⌘K</kbd>
          </button>
        </div>

        {/* Left side: System Status, Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* System Health Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>محرك FlowDesk: متصل بنجاح</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setTenantDropdownOpen(false);
                setProfileOpen(false);
              }}
              className="w-9 h-9 rounded-xl bg-gray-800/40 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 absolute top-2 left-2 ring-4 ring-[#0d121f] animate-pulse"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-[#111827] border border-gray-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">الإشعارات الحية</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-full font-bold">
                        {unreadCount} جديد
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      onClick={markAllAsRead}
                      className="text-indigo-400 hover:underline flex items-center gap-0.5"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>قراءة الكل</span>
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="text-gray-500 hover:text-gray-300"
                    >
                      مسح
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-500">لا توجد إشعارات حالياً</div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl transition-all text-right ${
                          item.read ? "bg-gray-900/40 text-gray-400" : "bg-indigo-950/30 border border-indigo-500/20 text-gray-200"
                        }`}
                      >
                        <div className="text-xs font-medium leading-snug">{item.title}</div>
                        <div className="text-[10px] text-gray-500 mt-1">{item.time}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setTenantDropdownOpen(false);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 pr-2 border-r border-gray-800 hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20">
                {user?.first_name ? user.first_name[0] : "م"}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-gray-200">
                  {user ? `${user.first_name} ${user.last_name}` : "منتظر حازم"}
                </div>
                <div className="text-[10px] text-gray-500">{user?.email || "muntadher@flowdesk.iq"}</div>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-[#111827] border border-gray-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                <div className="p-2 border-b border-gray-800">
                  <div className="font-bold text-white">{user?.first_name} {user?.last_name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
                  <div className="mt-1 text-[10px] text-cyan-300 font-semibold">المؤسسة: {activeTenant?.name}</div>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    <span>إعدادات المؤسسة</span>
                  </Link>
                  <Link
                    href="/workflows"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                  >
                    <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                    <span>محرّك الأتمتة المرئي</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>إنشاء حساب / عيادة جديدة</span>
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all font-medium"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>تبديل الحساب / تسجيل الدخول</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Spotlight Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#111827] border border-gray-800 shadow-2xl p-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-800">
              <Search className="w-4 h-4 text-indigo-400" />
              <input
                type="text"
                autoFocus
                placeholder="ابحث عن مسار عمل، عميل، موعد، أو صفحة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-1 max-h-72 overflow-y-auto">
              <div className="px-2 py-1 text-[11px] font-semibold text-gray-500">الوحدات والصفحات</div>
              {filteredLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setSearchModalOpen(false);
                      router.push(item.href);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-gray-200 hover:bg-gray-800 text-xs transition-all text-right"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gray-800 text-indigo-400 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-white">{item.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">{item.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {createWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111827] border border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>إنشاء مساحة عمل / مؤسسة جديدة</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              سيتم إنشاء مؤسسة جديدة تحت عزل تام للبيانات وحصانة أمنية منفصلة.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">اسم المؤسسة أو العيادة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عيادة الرعاية المتطورة - بغداد"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">المنطقة الزمنية</label>
                <select className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500">
                  <option>توقيت بغداد / مكة المكرمة (UTC+3)</option>
                  <option>توقيت دبي (UTC+4)</option>
                  <option>توقيت القاهرة (UTC+3)</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateWorkspaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  إنشاء مساحة العمل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

