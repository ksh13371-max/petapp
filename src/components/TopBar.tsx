"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function TopBar({ title, right, onBack }: { title: string; right?: ReactNode; onBack?: () => void }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-ink-100">
      <div className="h-14 flex items-center px-2 gap-1">
        <button
          onClick={() => (onBack ? onBack() : router.back())}
          className="w-10 h-10 flex items-center justify-center text-ink-700"
          aria-label="뒤로"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="flex-1 text-[17px] font-bold truncate">{title}</h1>
        {right}
      </div>
    </div>
  );
}
