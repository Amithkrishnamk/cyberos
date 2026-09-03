"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AuthProvider from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { TimerProvider, useTimer } from "@/providers/TimerContext";
import StudyTimerWidget from "@/components/timer/StudyTimerWidget";
import SessionFeedbackModal from "@/components/timer/SessionFeedbackModal";
import AbandonedSessionPrompt from "@/components/timer/AbandonedSessionPrompt";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  CheckSquare,
  Clock,
  Settings,
  ShieldAlert,
  Users,
  LogOut,
  Loader2,
} from "lucide-react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { activeSessionId } = useTimer();

  const [signingOut, setSigningOut] = useState(false);

  const userRole = (session?.user as any)?.role || "STUDENT";
  const userName = session?.user?.name || "Student";

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Class Content", href: "/class-content", icon: Calendar },
    { name: "Notes & Docs", href: "/notes", icon: BookOpen },
    { name: "Lab Tracker", href: "/labs", icon: CheckSquare },
    { name: "Study Sessions", href: "/sessions", icon: Clock },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  if (userRole === "ADMIN") {
    navLinks.push(
      { name: "Admin Panel", href: "/admin", icon: ShieldAlert },
      { name: "User Management", href: "/admin/users", icon: Users }
    );
  }

  const handleLogout = async () => {
    setSigningOut(true);

    try {
      if (activeSessionId) {
        await fetch(`/api/sessions/${activeSessionId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endedAt: new Date().toISOString(),
            contentStudied: "Session auto-saved on user logout.",
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error("Logout timer cleanup error:", e);
    } finally {
      localStorage.removeItem("cyber_theme");
      await signOut({ callbackUrl: "/login", redirect: true });
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] flex flex-col md:flex-row">
      {/* Sidebar / Top Navigation */}
      <aside className="w-full md:w-64 bg-[#111827] border-b md:border-b-0 md:border-r border-[#1f293d] flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[#1f293d]">
            <img
              src="/logo.png"
              alt="Cyber OS Logo"
              className="h-12 w-auto object-contain shrink-0 filter drop-shadow-md"
            />
            <div>
              <h1 className="font-bold text-white tracking-wider font-mono text-base flex items-center gap-1 leading-tight">
                CYBER <span className="text-cyan-400">//</span> OS
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">OPERATOR PLATFORM</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition ${
                    isActive
                      ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="pt-4 border-t border-[#1f293d] mt-6">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{userName}</div>
              <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {userRole}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 transition disabled:opacity-50"
          >
            {signingOut ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                <span>CLOSING SESSION...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>TERMINATE SESSION</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Global Study Timer */}
        <header className="h-16 border-b border-[#1f293d] bg-[#0d1322]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <span className="text-cyan-400">SYSTEM:</span> ONLINE
          </div>

          <div className="flex items-center gap-4">
            <StudyTimerWidget />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>

        <SessionFeedbackModal />
        <AbandonedSessionPrompt />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TimerProvider>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </TimerProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
