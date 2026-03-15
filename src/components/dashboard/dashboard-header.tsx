"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Overview", description: "ภาพรวมระบบ Dashboard" },
  "/dashboard/content": { title: "สร้างบทความ", description: "เพิ่มบทความใหม่เข้าสู่ระบบ" },
  "/dashboard/posts": { title: "บทความทั้งหมด", description: "จัดการบทความในระบบ" },
  "/dashboard/users": { title: "จัดการผู้ใช้งาน", description: "เพิ่ม แก้ไข และลบผู้ใช้งานในระบบ" },
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const current = pageTitles[pathname] ?? { title: "Dashboard", description: "" };
  const now = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0 sticky top-0 z-10">
      {/* Left - Page title */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 leading-none">{current.title}</h1>
        {current.description && (
          <p className="text-xs text-gray-400 mt-0.5">{current.description}</p>
        )}
      </div>

      {/* Right - Date + Avatar */}
      <div className="flex items-center gap-4">
        <p className="text-xs text-gray-400 hidden md:block">{now}</p>
        <button className="relative w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-md">
          A
        </button>
      </div>
    </header>
  );
}
