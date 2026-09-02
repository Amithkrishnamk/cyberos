import Link from "next/link";
import {
  Shield,
  BookOpen,
  Clock,
  Download,
  Users,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] font-mono selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="h-20 border-b border-[#1f293d] bg-[#0d1322]/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
            ⚡
          </div>
          <div>
            <span className="font-bold text-white tracking-wider text-base flex items-center gap-1">
              CYBER <span className="text-cyan-400">//</span> OS
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1">SECURITY OPERATOR PLATFORM</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white rounded-lg text-xs transition"
          >
            LOG IN
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition shadow-lg shadow-cyan-600/20 flex items-center gap-1.5"
          >
            INITIALIZE <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs mb-2">
          <Shield className="w-3.5 h-3.5" /> PRODUCTION-GRADE CYBERSECURITY STUDY PLATFORM
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Master Cybersecurity with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">Notion-Style Block Docs</span> & Real-Time Telemetry
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Full-stack security study operating system featuring block-based note creation, terminal command cards, CVE vulnerability records, persistent heartbeated study timers, and role-based admin intelligence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-2"
          >
            LAUNCH OPERATOR DASHBOARD <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#111827] hover:bg-[#182238] border border-[#1f293d] hover:border-cyan-500/50 text-slate-300 rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            DEMO SIGN IN <Terminal className="w-4 h-4 text-cyan-400" />
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Notion-Style Block Editor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Markdown auto-formatting, slash menu (<code className="text-cyan-400">/</code>), terminal command cards (<code className="text-cyan-400">$</code>), CVE vulnerability records, and smart line paste engine.
            </p>
          </div>

          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Heartbeated Study Timer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Persistent countdown and stopwatch modes with 60s server heartbeats, crash recovery, and automated end-of-session reflection feedback modals.
            </p>
          </div>

          <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Admin Intelligence & PDF Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Server-side role-gated panel with aggregate difficulty insights across all students, per-student drill-downs, and weekly PDF report generation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1f293d] py-8 text-center text-xs text-slate-500 font-mono">
        CYBER // OS — Security Learning Platform • Production Architecture
      </footer>
    </div>
  );
}
