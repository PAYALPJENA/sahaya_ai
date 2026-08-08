"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("collector@sahaya.ai"); // Pre-filled for demo ease
  const [password, setPassword] = useState("password123");     // Pre-filled for demo ease
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-950 to-black">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl glow-ai">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs text-indigo-400 font-bold uppercase tracking-widest bg-indigo-950/40 border border-indigo-900 px-3 py-1 rounded-full">
            Officer Portal
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-4 tracking-tight">
            Command Center
          </h1>
          <p className="text-gray-500 text-xs mt-2">
            Disaster Management Authority Authentication
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 text-xs rounded-xl mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@sahaya.ai"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Access Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all mt-4"
          >
            {loading ? "Authenticating security credentials..." : "Initiate Command Session"}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-900 pt-4 text-center">
          <span className="text-xs text-gray-600">
            For Demo: collector@sahaya.ai / password123
          </span>
        </div>

      </div>
    </main>
  );
}
