import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import { getBusinessById, listServicesByBusiness, listOptionsByBusiness, listNoticesByBusiness } from "@/lib/queries";
import { won } from "@/lib/format";
import { PawAvatar } from "@/components/Avatar";
import { ChatStartButton } from "@/components/ChatStartButton";
import { parseCategories, categoryLabel, categoryBadgeStyle } from "@/lib/categories";

const tabs = [
  { key: "home", label: "홈" },
  { key: "fee", label: "요금" },
  { key: "gallery", label: "갤러리" },
  { key: "notice", label: "공지" },
  { key: "review", label: "리뷰" },
];

export default async function BusinessDetailPage({ params, searchParams }: PageProps<"/business/[id]">) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = typeof tab === "string" ? tab : "home";

  const business = await getBusinessById(id);
  if (!business) notFound();

  const services = await listServicesByBusiness(id);
  const options = await listOptionsByBusiness(id);
  const notices = await listNoticesByBusiness(id);
  const session = await getCustomerSession();
  const minPrice = services.length > 0 ? Math.min(...services.map((s) => s.price)) : 0;
  const categories = parseCategories(business.categories);

  return (
    <div className="pb-24">
      <div className="relative h-56 flex items-center justify-center" style={{ background: business.heroColor }}>
        <PawAvatar color="rgba(255,255,255,0.35)" size={80} />
        <Link href="/" className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="absolute bottom-3 right-3 text-xs font-bold bg-black/30 text-white px-2 py-1 rounded-full">1 / 8</span>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-1.5 mb-2">
          {categories.map((c) => (
            <span key={c} className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${categoryBadgeStyle(c)}`}>
              {categoryLabel(c)}
            </span>
          ))}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-mint-500/10 text-mint-500">영업중</span>
        </div>
        <h1 className="text-xl font-extrabold">{business.name}</h1>
        <p className="text-sm text-ink-500 mt-1">
          <span className="text-amber-500 font-bold">★ {business.rating.toFixed(1)}</span> · 리뷰 {business.reviewCount} · {business.district}
        </p>
        <p className="text-sm text-ink-700 mt-3 leading-relaxed">{business.description}</p>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <a href={`tel:${business.phone}`} className="h-11 rounded-xl border border-ink-100 flex items-center justify-center gap-1.5 text-sm font-bold">
            📞 전화
          </a>
          <div className="h-11 rounded-xl border border-ink-100 flex items-center justify-center gap-1.5 text-sm font-bold text-ink-400">
            📍 길찾기
          </div>
          <ChatStartButton businessId={business.id} loggedIn={!!session} />
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-white border-b border-ink-100 mt-5">
        <div className="flex px-4 gap-5 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/business/${id}?tab=${t.key}`}
              className={`py-3 text-sm font-bold whitespace-nowrap border-b-2 ${
                activeTab === t.key ? "border-ink-900 text-ink-900" : "border-transparent text-ink-400"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {activeTab === "home" && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="font-extrabold mb-2">소개</h3>
              <p className="text-sm text-ink-700 leading-relaxed">{business.description}</p>
            </div>
            <div>
              <h3 className="font-extrabold mb-2">영업 시간</h3>
              <p className="text-sm text-ink-700">
                매일 {business.openTime} – {business.closeTime}
              </p>
            </div>
            <div>
              <h3 className="font-extrabold mb-2">주소</h3>
              <p className="text-sm text-ink-700">{business.address}</p>
            </div>
          </div>
        )}

        {activeTab === "fee" && (
          <div>
            <h3 className="font-extrabold mb-3">미용 요금</h3>
            <div className="rounded-2xl border border-ink-100 overflow-hidden">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between px-4 py-3.5 border-b border-ink-50 last:border-b-0">
                  <div>
                    <p className="font-bold text-sm">{s.name}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{s.description}</p>
                  </div>
                  <p className="font-bold text-sm">{won(s.price)}</p>
                </div>
              ))}
            </div>
            {options.length > 0 && (
              <>
                <h3 className="font-extrabold mb-3 mt-5">추가 옵션</h3>
                <div className="rounded-2xl border border-ink-100 overflow-hidden">
                  {options.map((o) => (
                    <div key={o.id} className="flex items-center justify-between px-4 py-3.5 border-b border-ink-50 last:border-b-0">
                      <p className="font-bold text-sm">{o.name}</p>
                      <p className="font-bold text-sm">+{won(o.price)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl flex items-center justify-center"
                style={{ background: i % 2 === 0 ? business.heroColor : "#e4d4f4" }}
              >
                <PawAvatar color="rgba(255,255,255,0.4)" size={36} />
              </div>
            ))}
          </div>
        )}

        {activeTab === "notice" && (
          <div className="flex flex-col gap-3">
            {notices.map((n) => (
              <div key={n.id} className="rounded-2xl border border-ink-100 p-4">
                <p className="font-bold text-sm">{n.title}</p>
                <p className="text-sm text-ink-500 mt-1 leading-relaxed">{n.body}</p>
              </div>
            ))}
            {notices.length === 0 && <p className="text-center text-ink-400 text-sm py-10">등록된 공지가 없어요.</p>}
          </div>
        )}

        {activeTab === "review" && (
          <div className="text-center text-ink-400 text-sm py-10">
            ★ {business.rating.toFixed(1)} · 리뷰 {business.reviewCount}개
            <br />
            리뷰 기능은 준비 중이에요.
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-white border-t border-ink-100 p-3 flex items-center gap-3">
        <div>
          <p className="text-xs text-ink-400">목욕 기준</p>
          <p className="font-extrabold">{won(minPrice)}~</p>
        </div>
        <Link
          href={`/booking/new?businessId=${business.id}`}
          className="flex-1 h-12 rounded-2xl bg-brand-500 text-white font-bold flex items-center justify-center"
        >
          예약하기
        </Link>
      </div>
    </div>
  );
}
