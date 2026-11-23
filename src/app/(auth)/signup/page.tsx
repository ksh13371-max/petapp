"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", petName: "", petBreed: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/customer/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        pet: form.petName ? { name: form.petName, breed: form.petBreed || "믹스견", weightKg: 3, age: 1 } : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "회원가입에 실패했습니다.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const inputClass = "h-13 rounded-2xl border border-ink-100 px-4 py-3.5 text-[15px] outline-none focus:border-brand-400 bg-ink-50";

  return (
    <div className="flex-1 flex flex-col pt-12 pb-10">
      <h1 className="text-2xl font-extrabold mb-1">회원가입</h1>
      <p className="text-ink-500 mb-8">반려견 정보까지 등록하면 예약이 더 빨라져요.</p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input required placeholder="이름" value={form.name} onChange={update("name")} className={inputClass} />
        <input required type="email" placeholder="이메일" value={form.email} onChange={update("email")} className={inputClass} />
        <input required type="password" placeholder="비밀번호" value={form.password} onChange={update("password")} className={inputClass} />
        <input placeholder="전화번호 (선택)" value={form.phone} onChange={update("phone")} className={inputClass} />

        <div className="mt-2 mb-1 text-sm font-bold text-ink-700">반려견 정보 (선택)</div>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="반려견 이름" value={form.petName} onChange={update("petName")} className={inputClass} />
          <input placeholder="견종" value={form.petBreed} onChange={update("petBreed")} className={inputClass} />
        </div>

        {error && <p className="text-brand-600 text-sm px-1">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-3 h-13 rounded-2xl bg-brand-500 text-white font-bold py-3.5 active:scale-[0.99] transition disabled:opacity-60"
        >
          {loading ? "가입 중..." : "가입하고 시작하기"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-500 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-brand-600 font-bold">
          로그인
        </Link>
      </p>
    </div>
  );
}
