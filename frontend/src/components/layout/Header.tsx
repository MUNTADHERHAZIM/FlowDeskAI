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
  Shield,
  Activity,
} from "lucide-react";

export function Header() {
  const { user, activeTenant, switchTenant } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-[#0d121f]/80 backdrop-blur-md border-b border-gray-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Right side: Tenant Switcher & Search */}
      <div className="flex items-center gap-4">
        {/* Tenant Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
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

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111827] border border-gray-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 border-b border-gray-800">
                مساحات العمل والمؤسسات
              </div>

              <div className="py-1 space-y-0.5">
                {user?.tenants?.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => {
                      switchTenant(tenant);
                      setDropdownOpen(false);
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
                  onClick={() => alert("سيتم فتح نافذة إنشاء مؤسسة جديدة")}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>إنشاء مساحة عمل جديدة</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث في المحادثات، المواعيد، أو العملاء..."
            className="w-72 bg-gray-900/60 border border-gray-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 transition-all"
          />
        </div>
      </div>

      {/* Left side: System Status, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* System Health Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>النواة السحابية: متصلة بنجاح</span>
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-xl bg-gray-800/40 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 left-2 ring-4 ring-[#0d121f]"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pr-2 border-r border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20">
            {user?.first_name ? user.first_name[0] : "ع"}
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-gray-200">
              {user ? `${user.first_name} ${user.last_name}` : "مدير النظام"}
            </div>
            <div className="text-[10px] text-gray-500">{user?.email || "admin@flowdesk.ai"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
