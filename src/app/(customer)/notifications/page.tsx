import { TopBar } from "@/components/TopBar";

export default function NotificationsPage() {
  return (
    <div>
      <TopBar title="알림" />
      <div className="py-24 text-center text-ink-400 text-sm">아직 알림이 없어요.</div>
    </div>
  );
}
