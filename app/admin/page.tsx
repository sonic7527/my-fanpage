"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "登入失敗");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">北大後台管理</h1>
          <p className="text-sm text-white/40 mt-2">請輸入帳號密碼登入</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">帳號</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition"
              placeholder="請輸入帳號"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition"
              placeholder="請輸入密碼"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登入中..." : "登入"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/20">
          <a href="/" className="hover:text-white/40 transition">← 回到首頁</a>
        </p>
      </div>
    </div>
  );
}
