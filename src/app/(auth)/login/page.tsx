"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError("An error occurred during authentication.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#111827] border border-[#1f293d] rounded-2xl shadow-2xl p-8 relative z-10 font-mono">
      <div className="flex flex-col items-center mb-6 text-center">
        <img
          src="/logo.jpg"
          alt="CYBER OS Logo"
          className="w-16 h-16 rounded-2xl object-contain bg-white/90 p-1 mb-3 shadow-xl border border-cyan-500/30"
        />
        <h1 className="text-2xl font-bold text-white tracking-wider flex items-center gap-2">
          CYBER <span className="text-cyan-400">//</span> OS
        </h1>
        <p className="text-xs text-slate-400 mt-1">Authenticate to access platform</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-red-400 text-sm font-mono flex items-center gap-2">
          <span>⚠ {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">EMAIL ADDRESS</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-[#090d16] border border-[#1f293d] focus:border-cyan-500 text-white rounded-lg pl-9 pr-3 py-2.5 text-sm font-mono focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">PASSWORD</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              required
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
            <span>VERIFYING CREDENTIALS...</span>
          ) : (
            <>
              AUTHENTICATE <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Need an operator account?{" "}
        <Link href="/signup" className="text-cyan-400 hover:underline font-mono">
          Sign up here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-[#e2e8f0] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-cyan-400 font-mono text-xs">Loading authentication page...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
