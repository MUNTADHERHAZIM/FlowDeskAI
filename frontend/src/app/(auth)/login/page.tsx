"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Lock, Mail, ArrowLeft, Shield, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await apiClient("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.data) {
      login(res.data.access, res.data.refresh, res.data.user);
      router.push("/");
    } else {
      setError(res.error || "فشل تسجيل الدخول. يرجى التحقق من البريد وكلمة المرور.");
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl bg-[#0f1523]/80 border border-gray-800 p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-in zoom-in-95 duration-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">تسجيل الدخول إلى FlowDesk</h1>
          <p className="text-gray-400 text-xs mt-1">المنصة السحابية الموحدة للاتصالات والأتمتة الذكية</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1.5 font-medium">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pr-10 pl-3.5 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1.5 font-medium">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pr-10 pl-10 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "جارٍ التحقق..." : "دخول إلى مساحة العمل"}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-xs text-gray-400">
          <span>ليس لديك حساب بعد؟ </span>
          <Link href="/register" className="text-indigo-400 font-bold hover:underline">
            إنشاء مساحة عمل جديدة
          </Link>
        </div>
      </div>
    </div>
  );
}
