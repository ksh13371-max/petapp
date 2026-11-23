"use client";

import Link from "next/link";
import { useState } from "react";
import { PawAvatar } from "@/components/Avatar";
import { won } from "@/lib/format";

export function BusinessCard({
  id,
  name,
  heroColor,
  rating,
  reviewCount,
  district,
  minPrice,
  description,
}: {
  id: string;
  name: string;
  heroColor: string;
  rating: number;
  reviewCount: number;
  district: string;
  minPrice: number;
  description?: string;
}) {
  const [liked, setLiked] = useState(false);
  return (
    <Link href={`/business/${id}`} className="block rounded-2xl overflow-hidden border border-ink-100 hover:shadow-md transition">
      <div className="relative h-32 flex items-center justify-center" style={{ background: heroColor }}>
        <PawAvatar color="rgba(255,255,255,0.35)" size={56} />
        <button
          onClick={(e) => {
            e.preventDefault();
            setLiked((v) => !v);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
          aria-label="찜하기"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#ff3f73" : "none"} stroke={liked ? "#ff3f73" : "#9a98a6"} strokeWidth="2">
            <path d="M12 20s-7-4.4-9.5-8.8C.7 7.8 2.4 4 6.2 4c2 0 3.5 1 5.8 3.3C14.3 5 15.8 4 17.8 4c3.8 0 5.5 3.8 3.7 7.2C19 15.6 12 20 12 20Z" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="p-3.5">
        <p className="font-bold truncate">{name}</p>
        <p className="text-xs text-ink-400 mt-0.5 flex items-center gap-1">
          <span className="text-amber-500">★</span> {rating.toFixed(1)} · 리뷰 {reviewCount} · {district}
        </p>
        {description && <p className="text-xs text-ink-400 mt-1.5 line-clamp-2">{description}</p>}
        <p className="text-sm font-bold mt-2">
          {won(minPrice)}
          <span className="text-ink-400 font-normal">~</span>
        </p>
      </div>
    </Link>
  );
}
