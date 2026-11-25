import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import {
  getThreadById,
  listMessages,
  getBusinessById,
  getReservationById,
  getReservationOptionNames,
  getServiceById,
  getPetById,
} from "@/lib/queries";
import { formatDateKo, formatTime, won } from "@/lib/format";
import { PawAvatar } from "@/components/Avatar";
import { ChatPanel } from "@/components/ChatPanel";

export default async function CustomerChatThreadPage({ params }: PageProps<"/chat/[threadId]">) {
  const { threadId } = await params;
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const thread = await getThreadById(threadId);
  if (!thread || thread.customerId !== session.sub) notFound();

  const business = (await getBusinessById(thread.businessId))!;
  const messages = await listMessages(threadId);
  const reservation = thread.reservationId ? await getReservationById(thread.reservationId) : undefined;
  const reservationOptions = reservation ? await getReservationOptionNames(reservation.id) : [];
  const reservationService = reservation ? await getServiceById(reservation.serviceMenuId) : undefined;
  const reservationPet = reservation ? await getPetById(reservation.petId) : undefined;

  return (
    <div className="flex flex-col h-dvh">
      <div className="flex items-center gap-3 px-3 h-16 border-b border-ink-100 shrink-0">
        <Link href="/chat" className="w-9 h-9 flex items-center justify-center text-ink-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <PawAvatar color={business.heroColor} size={36} />
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{business.name}</p>
          <p className="text-xs text-mint-500 font-bold">보통 10분 내 답장</p>
        </div>
        <Link href={`/business/${business.id}`} className="w-9 h-9 flex items-center justify-center text-ink-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3.5" y="5" width="17" height="16" rx="2.2" />
            <path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" />
          </svg>
        </Link>
      </div>

      {reservation && (
        <div className="mx-4 mt-3 rounded-2xl border border-ink-100 p-4 shrink-0">
          <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-mint-500/10 text-mint-500 mb-2">예약 확정</span>
          <p className="font-bold">
            {reservationService?.name} · {reservationPet?.name}
            {reservationOptions.length > 0 ? ` (+${reservationOptions.map((o) => o.name).join(", ")})` : ""}
          </p>
          <p className="text-sm text-ink-500 mt-0.5">
            {formatDateKo(reservation.scheduledAt)} {formatTime(reservation.scheduledAt)} · 담당 {reservation.staffName}
          </p>
          <p className="text-brand-600 font-extrabold mt-1">
            {won(reservation.totalPrice)}{" "}
            <span className="text-ink-400 font-normal text-sm">(예약금 {won(reservation.depositPrice)} 결제됨)</span>
          </p>
        </div>
      )}

      <ChatPanel threadId={threadId} selfRole="CUSTOMER" initialMessages={messages} className="flex-1 min-h-0" />
    </div>
  );
}
