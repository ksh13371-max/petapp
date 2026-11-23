export function won(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

const statusLabel: Record<string, string> = {
  PENDING_APPROVAL: "승인 대기",
  CONFIRMED: "예약 확정",
  COMPLETED: "완료",
  CANCELED: "취소됨",
};

const statusStyle: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-50 text-amber-600",
  CONFIRMED: "bg-mint-500/10 text-mint-500",
  COMPLETED: "bg-ink-100 text-ink-500",
  CANCELED: "bg-ink-100 text-ink-400",
};

export function reservationStatusLabel(status: string) {
  return statusLabel[status] ?? status;
}

export function reservationStatusStyle(status: string) {
  return statusStyle[status] ?? "bg-ink-100 text-ink-500";
}

export function formatDateKo(iso: string) {
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function formatDateTimeKo(iso: string) {
  return `${formatDateKo(iso)} ${formatTime(iso)}`;
}

export function minutesSince(iso: string) {
  return Math.round((Date.now() - new Date(iso).getTime()) / 60000);
}

export function relativeMinutes(min: number) {
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}
