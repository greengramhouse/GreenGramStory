import Link from "next/link";

const stats = [
  {
    label: "บทความทั้งหมด",
    value: "—",
    description: "เนื้อหาในระบบ",
    color: "from-violet-500 to-indigo-600",
    iconBg: "bg-indigo-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Publish แล้ว",
    value: "—",
    description: "บทความสาธารณะ",
    color: "from-emerald-400 to-teal-500",
    iconBg: "bg-emerald-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "เฉพาะ VIP",
    value: "—",
    description: "สำหรับสมาชิก premium",
    color: "from-amber-400 to-orange-500",
    iconBg: "bg-amber-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    label: "Draft",
    value: "—",
    description: "ยังไม่เผยแพร่",
    color: "from-slate-400 to-gray-500",
    iconBg: "bg-slate-50",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
];

const quickActions = [
  {
    label: "สร้างบทความใหม่",
    href: "/dashboard/content",
    description: "เพิ่มบทความเข้าระบบ",
    gradient: "bg-gradient-to-br from-violet-500 to-indigo-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    label: "ดูบทความทั้งหมด",
    href: "/dashboard/posts",
    description: "จัดการเนื้อหา",
    gradient: "bg-gradient-to-br from-emerald-400 to-teal-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: "ไปที่เว็บไซต์",
    href: "/",
    description: "กลับสู่หน้าหลัก",
    gradient: "bg-gradient-to-br from-slate-500 to-gray-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-8 text-white shadow-xl">
        {/* Background decoration */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-5 w-40 h-40 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
              ✨ Admin Dashboard
            </span>
          </div>
          <h2 className="text-2xl font-bold mt-3">ยินดีต้อนรับ, Admin 👋</h2>
          <p className="text-gray-400 text-sm mt-1">
            จัดการเนื้อหาและตั้งค่าระบบ MyLern ของคุณได้จากที่นี่
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/content"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              สร้างบทความใหม่
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">ภาพรวม</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`relative overflow-hidden group ${action.gradient} p-5 rounded-2xl text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl group-hover:bg-white/15 transition" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  {action.icon}
                </div>
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs text-white/70 mt-0.5">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}