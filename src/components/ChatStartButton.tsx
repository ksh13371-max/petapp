"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChatStartButton({ businessId, loggedIn }: { businessId: string; loggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.thread) router.push(`/chat/${data.thread.id}`);
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="h-11 rounded-xl bg-ink-900 text-white flex items-center justify-center gap-1.5 text-sm font-bold disabled:opacity-60"
    >
      💬 채팅
    </button>
  );
}
