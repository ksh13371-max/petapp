"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/customer/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="flex items-center justify-between py-3.5 text-sm font-bold text-ink-400 text-left">
      로그아웃
    </button>
  );
}
