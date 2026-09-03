"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      // Automatically sign in upon registration
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (loginRes?.error) {
        router.push("/login?registered=true");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred during signup.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] flex flex-col justify-center items-center p-4 relative overflow-hidden font-mono">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#111827] border border-[#1f293d] rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/logo.jpg"
            alt="CYBER OS Logo"
            className="w-16 h-16 rounded-2xl object-contain bg-white/90 p-1 mb-3 shadow-xl border border-cyan-500/30"
          />
          <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
            CYBER <span className="text-cyan-400">//</span> OS
          </h1>
          <p className="text-xs text-slate-400 mt-1">Register Student Operator Account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-red-400 text-sm font-mono flex items-center gap-2">
            <span>⚠ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">FULL NAME</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-[#090d16] border border-[#1f293d] focus:border-cyan-500 text-white rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@cyberos.dev"
                className="w-full bg-[#090d16] border border-[#1f293d] focus:border-cyan-500 text-white rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">PASSWORD (MIN 6 CHARS)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#090d16] border border-[#1f293d] focus:border-cyan-500 text-white rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-600/20 transition flex items-center justify-center gap-2 font-mono text-sm disabled:opacity-50"
          >
            {loading ? (
              <span>REGISTERING...</span>
            ) : (
              <>
                INITIALIZE ACCOUNT <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline font-mono">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
