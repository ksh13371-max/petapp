import Link from "next/link";
import { getCustomerSession } from "@/lib/auth";
import { listBusinesses, listServicesByBusiness, getNextReservationForCustomer } from "@/lib/queries";
import { formatDateKo, formatTime, reservationStatusLabel } from "@/lib/format";
import { BusinessCard } from "@/components/BusinessCard";

export default async function CustomerHomePage() {
  const session = await getCustomerSession();
  const businesses = listBusinesses();
  const nextReservation = session ? getNextReservationForCustomer(session.sub) : undefined;

  return (
    <div className="pb-6">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <button className="flex items-center gap-1 font-bold text-[15px]">
          📍 강남구 역삼동
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Link href="/notifications" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-ink-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" strokeLinejoin="round" />
            <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      <div className="px-4 mb-4">
        <div className="h-11 rounded-full bg-ink-50 flex items-center px-4 text-sm text-ink-400 gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          사업장 · 견종 · 지역 검색
        </div>
      </div>

      <div className="px-4 grid grid-cols-3 gap-2 mb-6">
        {[
          { label: "유치원", emoji: "🏠" },
          { label: "호텔", emoji: "🛏️" },
          { label: "미용", emoji: "✂️" },
        ].map((c) => (
          <a
            key={c.label}
            href="#businesses"
            className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-ink-50 hover:bg-ink-100 transition"
          >
            <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">{c.emoji}</span>
            <span className="text-xs font-bold text-ink-700">{c.label}</span>
          </a>
        ))}
      </div>

      <div className="px-4 mb-6">
        <h2 className="font-extrabold mb-2 text-[15px]">내 다음 예약</h2>
        {session ? (
          nextReservation ? (
            <div className="rounded-2xl border border-ink-100 p-4">
              <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-mint-500/10 text-mint-500 mb-2">
                {reservationStatusLabel(nextReservation.status)}
              </span>
              <p className="font-bold">
                {nextReservation.businessName} · {nextReservation.serviceName}
              </p>
              <p className="text-sm text-ink-500 mt-0.5">
                {formatDateKo(nextReservation.scheduledAt)} {formatTime(nextReservation.scheduledAt)} · {nextReservation.petName}
              </p>
              <div className="flex gap-2 mt-3">
                <Link href="/reservations" className="flex-1 h-10 rounded-xl border border-ink-100 flex items-center justify-center text-sm font-bold">
                  예약 상세
                </Link>
                <Link
                  href="/chat"
                  className="flex-1 h-10 rounded-xl bg-ink-900 text-white flex items-center justify-center text-sm font-bold"
                >
                  문의하기
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-ink-50 p-5 text-center text-sm text-ink-500">예정된 예약이 없어요. 미용 예약을 잡아볼까요?</div>
          )
        ) : (
          <Link href="/login" className="rounded-2xl bg-ink-50 p-5 flex items-center justify-between">
            <span className="text-sm font-bold text-ink-700">로그인하고 예약을 확인하세요</span>
            <span className="text-brand-600 font-bold text-sm">로그인 ›</span>
          </Link>
        )}
      </div>

      <div className="px-4 mb-6">
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-400 text-white px-5 py-4 flex items-center justify-between">
          <p className="font-bold">첫 미용 예약 시 5,000원 할인</p>
          <span className="text-white/70 text-lg">›</span>
        </div>
      </div>

      <div id="businesses" className="px-4">
        <h2 className="font-extrabold mb-3 text-[15px]">오늘의 미용</h2>
        <div className="grid grid-cols-2 gap-3">
          {businesses.map((b) => {
            const services = listServicesByBusiness(b.id);
            const minPrice = Math.min(...services.map((s) => s.price));
            return (
              <BusinessCard
                key={b.id}
                id={b.id}
                name={b.name}
                heroColor={b.heroColor}
                rating={b.rating}
                reviewCount={b.reviewCount}
                district={b.district}
                minPrice={minPrice}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
