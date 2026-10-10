"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Lock, Mail, Building2, User, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await apiClient("/auth/register/", {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        organization_name: orgName,
        email,
        password,
      }),
    });

    setLoading(false);

    if (res.data) {
      alert("تم إنشاء الحساب والمؤسسة بنجاح! يمكنك الآن تسجيل الدخول.");
      router.push("/login");
    } else {
      setError(res.error || "تعذر إكمال التسجيل، يرجى التحقق من المدخلات.");
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl bg-[#0f1523]/80 border border-gray-800 p-8 shadow-2xl backdrop-blur-xl relative z-10 animate-in zoom-in-95 duration-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">إنشاء حساب ومؤسسة جديدة</h1>
          <p className="text-gray-400 text-xs mt-1">ابدأ مساحة عملك المستقلة على FlowDesk AI</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">الاسم الأول</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="أحمد"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1.5 font-medium">اسم العائلة</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="المطوع"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1.5 font-medium">اسم المؤسسة أو النشاط التجاري</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="مثال: عيادة النخبة، مكتب العدالة..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pr-10 pl-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1.5 font-medium">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pr-10 pl-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1.5 font-medium">كلمة المرور (8 خانات على الأقل)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pr-10 pl-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "جارٍ الإنشاء..." : "إنشاء الحساب ومساحة العمل"}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800 text-center text-xs text-gray-400">
          <span>لديك حساب بالفعل؟ </span>
          <Link href="/login" className="text-indigo-400 font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
