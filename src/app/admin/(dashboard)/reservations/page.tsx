import Link from "next/link";
import { getBusinessSession } from "@/lib/auth";
import { listReservationsByBusiness, getPetById, getReservationOptionNames, type ReservationStatus } from "@/lib/queries";
import { formatDateKo, formatTime, reservationStatusLabel, reservationStatusStyle, won } from "@/lib/format";
import { PawAvatar } from "@/components/Avatar";
import { ReservationActionButton } from "@/components/ReservationActionButton";

const tabs: { key: string; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "PENDING_APPROVAL", label: "승인 대기" },
  { key: "CONFIRMED", label: "확정" },
  { key: "COMPLETED", label: "완료" },
  { key: "CANCELED", label: "취소" },
];

export default async function AdminReservationsPage({ searchParams }: PageProps<"/admin/reservations">) {
  const session = await getBusinessSession();
  const { status } = await searchParams;
  const activeTab = typeof status === "string" ? status : "ALL";

  const allUnsorted = await listReservationsByBusiness(session!.sub);
  const all = allUnsorted.sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
  const filtered = activeTab === "ALL" ? all : all.filter((r) => r.status === activeTab);
  const rowDetails = await Promise.all(
    filtered.map(async (r) => ({
      pet: await getPetById(r.petId),
      options: await getReservationOptionNames(r.id),
    }))
  );

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h1 className="text-[22px] font-extrabold mb-6">예약 관리</h1>

      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => {
          const count = tab.key === "ALL" ? all.length : all.filter((r) => r.status === tab.key).length;
          const active = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.key === "ALL" ? "/admin/reservations" : `/admin/reservations?status=${tab.key}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                active ? "bg-ink-900 text-white" : "bg-white border border-ink-100 text-ink-500 hover:bg-ink-50"
              }`}
            >
              {tab.label} {count}
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white overflow-hidden">
        <div className="grid grid-cols-[1.6fr_1.2fr_1.4fr_1fr_1fr_1.4fr] gap-2 px-5 py-3 text-[12px] font-bold text-ink-400 border-b border-ink-100">
          <span>반려견 / 보호자</span>
          <span>메뉴</span>
          <span>일정</span>
          <span>담당자</span>
          <span>금액</span>
          <span className="text-right">상태 / 액션</span>
        </div>

        {filtered.length === 0 && <p className="py-16 text-center text-ink-400 text-sm">예약이 없어요.</p>}

        {filtered.map((r, i) => {
          const { pet, options } = rowDetails[i];
          return (
            <div
              key={r.id}
              className="grid grid-cols-[1.6fr_1.2fr_1.4fr_1fr_1fr_1.4fr] gap-2 px-5 py-4 items-center border-b border-ink-50 last:border-b-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <PawAvatar color={pet?.avatarColor} size={38} />
                <div className="min-w-0">
                  <p className="font-bold truncate">{r.petName}</p>
                  <p className="text-xs text-ink-400 truncate">{r.customerName}</p>
                </div>
              </div>
              <div className="min-w-0">
                <p className="truncate">{r.serviceName}</p>
                {options.length > 0 && <p className="text-xs text-ink-400 truncate">+{options.map((o) => o.name).join(", ")}</p>}
              </div>
              <div className="text-sm text-ink-700">
                {formatDateKo(r.scheduledAt)} {formatTime(r.scheduledAt)}
              </div>
              <div className="text-sm text-ink-500">{r.staffName}</div>
              <div className="text-sm font-bold">{won(r.totalPrice)}</div>
              <div className="flex items-center justify-end gap-2">
                <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${reservationStatusStyle(r.status)}`}>
                  {reservationStatusLabel(r.status)}
                </span>
                <RowActions status={r.status} id={r.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RowActions({ status, id }: { status: ReservationStatus; id: string }) {
  if (status === "PENDING_APPROVAL")
    return (
      <div className="flex gap-1">
        <ReservationActionButton reservationId={id} status="CONFIRMED" label="승인" />
        <ReservationActionButton reservationId={id} status="CANCELED" label="거절" variant="ghost" confirmMessage="예약을 거절할까요?" />
      </div>
    );
  if (status === "CONFIRMED")
    return (
      <div className="flex gap-1">
        <ReservationActionButton reservationId={id} status="COMPLETED" label="완료 처리" />
        <ReservationActionButton reservationId={id} status="CANCELED" label="취소" variant="ghost" confirmMessage="예약을 취소할까요?" />
      </div>
    );
  return null;
}
