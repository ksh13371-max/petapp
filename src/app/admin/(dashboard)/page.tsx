import Link from "next/link";
import { getBusinessSession } from "@/lib/auth";
import { getBusinessById, getBusinessDashboard, getPetById, listStaysByBusiness } from "@/lib/queries";
import { formatDateKo, formatTime, won } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { PawAvatar } from "@/components/Avatar";
import { ReservationActionButton } from "@/components/ReservationActionButton";

export default async function AdminDashboardPage() {
  const session = await getBusinessSession();
  const business = (await getBusinessById(session!.sub))!;
  const stats = await getBusinessDashboard(business.id);
  const stays = await listStaysByBusiness(business.id);
  const activeStays = stays.filter((s) => s.status === "CHECKED_IN").length;
  const taskPets = await Promise.all(stats.todayTasks.map((task) => getPetById(task.petId)));

  const todayLabel = formatDateKo(new Date().toISOString());

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="text-sm font-bold text-purple-600 mb-1">사업자 모드</p>
          <h1 className="text-[26px] font-extrabold">{business.name}</h1>
          <p className="text-ink-500 mt-1">
            {todayLabel} &nbsp;·&nbsp; 영업중 {business.openTime} – {business.closeTime}
          </p>
        </div>
        <Link
          href="/admin/reservations"
          className="h-10 px-4 rounded-xl border border-ink-100 text-sm font-bold text-ink-700 flex items-center hover:bg-ink-50"
        >
          예약 전체보기
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard label="오늘 미용 예약" value={stats.groomingTotal} sub={`완료 ${stats.groomingCompleted} · 남음 ${stats.groomingRemaining}`} />
        <StatCard label="투숙 중" value={activeStays} sub={`체크인 ${stats.checkInToday} · 체크아웃 ${stats.checkOutToday}`} />
        <StatCard label="승인 대기" value={stats.pendingApprovalCount} sub="24시간 내 처리" accent="amber" />
        <StatCard
          label="미답변 채팅"
          value={stats.unreadThreadCount}
          sub={stats.oldestUnreadMin != null ? `가장 오래된 ${stats.oldestUnreadMin}분 전` : "모두 응답 완료"}
          accent="brand"
        />
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-400 text-white p-6 flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-white/80 font-bold">오늘 매출</p>
          <p className="text-3xl font-extrabold mt-1">{won(stats.todayRevenue)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-white/80 font-bold">정산 예정</p>
          <p className="text-3xl font-extrabold mt-1">{won(stats.pendingSettlement)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-extrabold">지금 처리할 일</h2>
        <Link href="/admin/reservations" className="text-sm font-bold text-ink-400 hover:text-ink-600">
          전체보기 ›
        </Link>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white divide-y divide-ink-100 overflow-hidden">
        {stats.todayTasks.length === 0 && <p className="p-8 text-center text-ink-400 text-sm">처리할 일이 없어요. 오늘도 평온하네요 🐾</p>}
        {stats.todayTasks.map((task, i) => {
          const pet = taskPets[i];
          const isPending = task.status === "PENDING_APPROVAL";
          return (
            <div key={task.id} className="flex items-center gap-4 px-5 py-4">
              <PawAvatar color={pet?.avatarColor} size={44} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold truncate">{task.petName}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isPending ? "bg-amber-50 text-amber-600" : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    {isPending ? "승인 대기" : "미용"}
                  </span>
                </div>
                <p className="text-sm text-ink-500 truncate mt-0.5">
                  {formatDateKo(task.scheduledAt)} {formatTime(task.scheduledAt)} · {task.serviceName} · {task.customerName}
                  {isPending && task.requestNote ? ` · "${task.requestNote}"` : ""}
                </p>
              </div>
              {isPending ? (
                <ReservationActionButton reservationId={task.id} status="CONFIRMED" label="승인" />
              ) : (
                <ReservationActionButton reservationId={task.id} status="COMPLETED" label="완료 처리" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
