"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { UserResponse } from "@/types/common";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("sahaya_token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const u = await api.get<UserResponse>("/auth/me");
        setUser(u);
      } catch (err) {
        api.logout();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
        ", " +
        now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    api.logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500 font-medium">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  const operationsNav = [
    { name: "Dashboard",              path: "/dashboard",            icon: "🏠" },
    { name: "Incident Verification",  path: "/dashboard/incidents",  icon: "🚨" },
    { name: "Collector Approval",     path: "/dashboard/incidents",  icon: "✅", matchExact: false },
    { name: "Dispatch Automation",    path: "/dashboard/dispatches", icon: "🚑" },
    { name: "Mission Execution",      path: "/dashboard/field",      icon: "🚒" },
    { name: "Resources & Shelters",   path: "/dashboard/resources",  icon: "🏥" },
  ];

  const monitoringNav = [
    { name: "Automation Metrics",     path: "/dashboard/analytics",  icon: "📊" },
    { name: "Automation Logs",        path: "/dashboard/audit",      icon: "📝" },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden font-sans">

      {/* HEADER */}
      <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-5 shrink-0 select-none shadow-sm">

        {/* Left: Brand */}
        <div className="flex items-center space-x-4 h-full">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight">Sahaya AI</div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight">Odisha SEOC</div>
            </div>
          </div>
        </div>

        {/* Right: Clock + Profile + Logout */}
        <div className="flex items-center space-x-5">
          <span className="text-xs text-slate-500 font-medium">{time || "Loading..."}</span>

          <div className="h-6 w-px bg-slate-200"></div>

          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              {user?.name?.[0] || "U"}
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-800">{user?.name}</div>
              <div className="text-[10px] text-slate-500">{user?.designation} &bull; {user?.district}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-slate-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">

          <nav className="flex-1 flex flex-col pt-4 px-3">

            {/* OPERATIONS */}
            <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operations</div>
            {operationsNav.map(renderNavItem)}

            {/* Divider */}
            <div className="h-px bg-slate-100 my-3 mx-2"></div>

            {/* MONITORING */}
            <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monitoring</div>
            {monitoringNav.map(renderNavItem)}

          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-slate-100 mt-2">
            <div className="text-[10px] text-slate-400 leading-relaxed">
              Odisha State Emergency<br/>
              Operations Center (SEOC)
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 bg-slate-50 overflow-y-auto relative">
          {children}
        </main>
      </div>
    </div>
  );

  function renderNavItem(item: { name: string; path: string; icon: string }) {
    const active =
      item.path === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.path || pathname.startsWith(item.path + "/");
    return (
      <Link
        key={item.name}
        href={item.path}
        className={`flex items-center px-3 py-2 text-[13px] font-medium rounded-md mb-0.5 transition-colors ${
          active
            ? "bg-blue-50 text-blue-700 font-semibold"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <span className="w-5 text-center mr-2.5 text-[14px]">{item.icon}</span>
        <span>{item.name}</span>
      </Link>
    );
  }
}
