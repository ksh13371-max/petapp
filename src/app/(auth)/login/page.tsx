"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("seoyeon@example.com");
  const [password, setPassword] = useState("customer123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/customer/login", {
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
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex-1 flex flex-col pt-16 pb-10">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center mb-4">
          <PawMark />
        </div>
        <h1 className="text-2xl font-extrabold">반갑습니다!</h1>
        <p className="text-ink-500 mt-1">해피독에 로그인하고 반려견 케어를 시작하세요.</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-13 rounded-2xl border border-ink-100 px-4 py-3.5 text-[15px] outline-none focus:border-brand-400 bg-ink-50"
        />
        <input
          type="password"
          required
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-13 rounded-2xl border border-ink-100 px-4 py-3.5 text-[15px] outline-none focus:border-brand-400 bg-ink-50"
        />
        {error && <p className="text-brand-600 text-sm px-1">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-3 h-13 rounded-2xl bg-brand-500 text-white font-bold py-3.5 active:scale-[0.99] transition disabled:opacity-60"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-brand-600 font-bold">
          회원가입
        </Link>
      </p>

      <div className="mt-8 rounded-2xl bg-ink-50 p-4 text-xs text-ink-500 leading-relaxed">
        데모 계정: seoyeon@example.com / customer123
        <br />
        사업자이신가요?{" "}
        <Link href="/admin/login" className="text-ink-700 font-bold underline">
          사업자 로그인
        </Link>
      </div>
    </div>
  );
}

function PawMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <circle cx="5.5" cy="9" r="2.3" />
      <circle cx="10.5" cy="5.5" r="2.3" />
      <circle cx="15.5" cy="5.5" r="2.3" />
      <circle cx="19" cy="10.5" r="2.1" />
      <path d="M12 11.2c-3 0-6.2 2.3-6.2 5.3 0 1.9 1.6 3.3 3.6 3.3 1.1 0 1.8-.4 2.6-.4s1.5.4 2.6.4c2 0 3.6-1.4 3.6-3.3 0-3-3.2-5.3-6.2-5.3z" />
    </svg>
  );
}
