"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@happydog.com");
  const [password, setPassword] = useState("happydog123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/business/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "로그인에 실패했습니다.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-ink-50 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_40px_rgba(20,10,40,0.08)] p-8">
        <div className="w-11 h-11 rounded-2xl bg-purple-500 flex items-center justify-center mb-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <circle cx="5.5" cy="9" r="2.3" />
            <circle cx="10.5" cy="5.5" r="2.3" />
            <circle cx="15.5" cy="5.5" r="2.3" />
            <circle cx="19" cy="10.5" r="2.1" />
            <path d="M12 11.2c-3 0-6.2 2.3-6.2 5.3 0 1.9 1.6 3.3 3.6 3.3 1.1 0 1.8-.4 2.6-.4s1.5.4 2.6.4c2 0 3.6-1.4 3.6-3.3 0-3-3.2-5.3-6.2-5.3z" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold">사업자 로그인</h1>
        <p className="text-ink-500 mt-1 mb-7 text-sm">해피독 파트너 관리자 모드</p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-xl border border-ink-100 px-4 text-[15px] outline-none focus:border-purple-400 bg-ink-50"
          />
          <input
            type="password"
            required
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl border border-ink-100 px-4 text-[15px] outline-none focus:border-purple-400 bg-ink-50"
          />
          {error && <p className="text-brand-600 text-sm px-1">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 rounded-xl bg-purple-500 text-white font-bold active:scale-[0.99] transition disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-ink-50 p-3.5 text-xs text-ink-500 leading-relaxed">
          데모 계정: owner@happydog.com / happydog123
        </div>
      </div>
    </div>
  );
}
