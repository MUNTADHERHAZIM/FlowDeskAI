import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlowDesk AI | منصة الاتصالات الموحدة والأتمتة الذكية",
  description: "منصة سحابية متقدمة متعددة المؤسسات للاتصالات، إدارة المواعيد، والأتمتة بالذكاء الاصطناعي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${cairo.variable} antialiased bg-[#090d16] text-gray-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
