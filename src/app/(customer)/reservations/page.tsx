import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/auth";
import { listReservationsByCustomer, getReservationOptionNames } from "@/lib/queries";
import { formatDateKo, formatTime, reservationStatusLabel, reservationStatusStyle, won } from "@/lib/format";
import { PawAvatar } from "@/components/Avatar";
import { TopBar } from "@/components/TopBar";
import { ReservationActionButton } from "@/components/ReservationActionButton";

export default async function CustomerReservationsPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const reservations = await listReservationsByCustomer(session.sub);
  const reservationOptions = await Promise.all(reservations.map((r) => getReservationOptionNames(r.id)));

  return (
    <div>
      <TopBar title="예약 내역" />
      <div className="px-4 py-4 flex flex-col gap-3">
        {reservations.length === 0 && (
          <div className="py-20 text-center text-ink-400 text-sm">
            예약 내역이 없어요.
            <div className="mt-4">
              <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-ink-900 text-white text-sm font-bold">
                미용샵 둘러보기
              </Link>
            </div>
          </div>
        )}
        {reservations.map((r, i) => {
          const opts = reservationOptions[i];
          return (
            <div key={r.id} className="rounded-2xl border border-ink-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${reservationStatusStyle(r.status)}`}>
                  {reservationStatusLabel(r.status)}
                </span>
                <span className="text-xs text-ink-400">{formatDateKo(r.scheduledAt)} {formatTime(r.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <PawAvatar color="#f3cfa8" size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">
                    {r.businessName} · {r.serviceName}
                  </p>
                  <p className="text-sm text-ink-500 truncate">
                    {r.petName}
                    {opts.length > 0 ? ` · +${opts.map((o) => o.name).join(", ")}` : ""}
                  </p>
                </div>
                <p className="font-bold text-sm shrink-0">{won(r.totalPrice)}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <Link
                  href={`/business/${r.businessId}`}
                  className="flex-1 h-9 rounded-xl border border-ink-100 flex items-center justify-center text-xs font-bold text-ink-600"
                >
                  업체 보기
                </Link>
                {(r.status === "PENDING_APPROVAL" || r.status === "CONFIRMED") && (
                  <ReservationActionButton
                    reservationId={r.id}
                    status="CANCELED"
                    label="예약 취소"
                    variant="ghost"
                    confirmMessage="예약을 취소할까요? 예약금은 환불되지 않을 수 있어요."
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
