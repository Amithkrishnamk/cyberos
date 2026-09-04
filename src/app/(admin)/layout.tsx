"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AuthProvider from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { TimerProvider, useTimer } from "@/providers/TimerContext";
import StudyTimerWidget from "@/components/timer/StudyTimerWidget";
import ThemeToggle from "@/components/theme/ThemeToggle";
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
  Menu,
  X,
} from "lucide-react";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { activeSessionId } = useTimer();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const userRole = (session?.user as any)?.role || "ADMIN";
  const userName = session?.user?.name || "Instructor Admin";

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Class Content", href: "/class-content", icon: Calendar },
    { name: "Notes & Docs", href: "/notes", icon: BookOpen },
    { name: "Lab Tracker", href: "/labs", icon: CheckSquare },
    { name: "Study Sessions", href: "/sessions", icon: Clock },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Admin Panel", href: "/admin", icon: ShieldAlert },
    { name: "User Management", href: "/admin/users", icon: Users },
  ];

  const bottomNavPills = [
    { name: "Admin", href: "/admin", icon: ShieldAlert },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Class", href: "/class-content", icon: Calendar },
    { name: "Notes", href: "/notes", icon: BookOpen },
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  ];

  const handleLogout = async () => {
    setSigningOut(true);

    try {
      if (activeSessionId) {
        await fetch(`/api/sessions/${activeSessionId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endedAt: new Date().toISOString(),
            contentStudied: "Session auto-saved on admin logout.",
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
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] flex flex-col md:flex-row font-mono">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-[#111827] border-r border-[#1f293d] flex-col justify-between p-4 shrink-0">
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-[#1f293d]">
            <img
              src="/logo.jpg"
              alt="Cyber OS Logo"
              className="h-12 w-auto object-contain rounded-xl shrink-0"
            />
            <div>
              <h1 className="font-bold text-white tracking-wider text-base flex items-center gap-1 leading-tight">
                CYBER <span className="text-red-400">//</span> OS
              </h1>
              <p className="text-[10px] text-red-400 font-bold">ADMIN CONTROL</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition ${
                    isActive
                      ? "bg-red-500/10 border border-red-500/40 text-red-400 font-bold shadow-sm shadow-red-500/10"
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

        {/* Admin Profile & Sign Out */}
        <div className="pt-4 border-t border-[#1f293d] mt-6">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-red-300 text-xs font-bold shrink-0">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{userName}</div>
              <div className="text-[10px] text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                {userRole}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/40 transition disabled:opacity-50"
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
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Top Header */}
        <header className="md:hidden h-16 border-b border-[#1f293d] bg-[#090d16]/90 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Logo" className="h-9 w-auto rounded-lg object-contain" />
            <span className="font-bold text-white text-sm tracking-wider">
              CYBER <span className="text-red-400">//</span> OS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StudyTimerWidget />
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-red-400 hover:bg-slate-700 active:scale-95 transition"
              aria-label="Toggle Admin Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Slide-Over Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Side Drawer Sheet */}
            <div className="relative w-4/5 max-w-xs bg-[#111827] border-r border-red-500/30 p-5 flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-200">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img src="/logo.jpg" alt="Logo" className="h-10 w-auto rounded-xl" />
                    <div>
                      <h2 className="font-bold text-white text-sm">CYBER // OS</h2>
                      <p className="text-[10px] text-red-400">ADMIN CONTROL HUB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="space-y-1.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive =
                      link.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs transition ${
                          isActive
                            ? "bg-red-500/15 border border-red-500/40 text-red-400 font-bold"
                            : "text-slate-300 hover:bg-slate-800/80"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-red-400" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* User Logout Footer */}
              <div className="border-t border-slate-800 pt-4 mt-6">
                <div className="flex items-center gap-3 px-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-red-300 text-xs font-bold">
                    {userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white truncate">{userName}</div>
                    <div className="text-[10px] text-red-400">{userRole}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs bg-red-950/40 border border-red-800/60 text-red-300 font-bold"
                >
                  <LogOut className="w-4 h-4" /> TERMINATE SESSION
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 border-b border-[#1f293d] bg-[#0d1322]/80 backdrop-blur-md px-6 items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-red-400 font-bold">ROLE:</span> ADMIN PRIVILEGED
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-slate-400 text-[11px]">NETWORKING: ACTIVE</div>
          </div>

          <div className="flex items-center gap-4">
            <StudyTimerWidget />
            <ThemeToggle />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">{children}</main>

        {/* Mobile Floating Cyber Dock Navigation */}
        <div className="md:hidden fixed bottom-3 left-3 right-3 bg-[#111827]/95 border border-red-500/30 backdrop-blur-xl rounded-2xl p-2 z-40 shadow-2xl flex items-center justify-around">
          {bottomNavPills.map((pill) => {
            const Icon = pill.icon;
            const isActive = pathname === pill.href;
            return (
              <Link
                key={pill.href}
                href={pill.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition ${
                  isActive
                    ? "text-red-400 bg-red-500/10 border border-red-500/40 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{pill.name}</span>
              </Link>
            );
          })}
        </div>

        <SessionFeedbackModal />
        <AbandonedSessionPrompt />
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TimerProvider>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </TimerProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
