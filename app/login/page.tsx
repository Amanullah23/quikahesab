"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-card rounded-3xl border border-border shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: branding panel */}
        <div className="bg-forest text-white p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Zap size={18} />
              </span>
              <span className="font-display text-lg font-bold">QuikaHesab</span>
            </div>
          
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold leading-tight">
              Wireless ISP billing,
              <br />
              made simple.
            </h1>
            <p className="text-white/70 text-sm mt-4 leading-relaxed">
              Manage customers, bills, and payments for your entire network from one place.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/60">
            <div>
              <p className="font-display text-2xl font-bold text-white">500+</p>
              <p>Customers</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-white">3</p>
              <p>Roles</p>
            </div>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="font-display text-2xl font-bold text-text mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-8">Sign in to your QuikaHesab account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest bg-bg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 pr-11 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest bg-bg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-badge-red-text bg-badge-red-bg rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest text-white py-3 rounded-full font-medium hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition duration-150 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-text-muted text-center mt-8">
            Quika ISP Billing System
          </p>
        </div>
      </div>
    </div>
  );
}