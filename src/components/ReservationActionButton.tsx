"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReservationStatus } from "@/lib/queries";

export function ReservationActionButton({
  reservationId,
  status,
  label,
  variant = "primary",
  confirmMessage,
}: {
  reservationId: string;
  status: ReservationStatus;
  label: string;
  variant?: "primary" | "ghost";
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setLoading(true);
    await fetch(`/api/reservations/${reservationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  const styles =
    variant === "primary"
      ? "bg-purple-50 text-purple-700 hover:bg-purple-100"
      : "bg-transparent text-ink-400 hover:bg-ink-50";

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`px-3.5 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition disabled:opacity-50 ${styles}`}
    >
      {loading ? "처리 중" : label}
    </button>
  );
}
