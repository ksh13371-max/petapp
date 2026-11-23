import Link from "next/link";
import { getBusinessSession } from "@/lib/auth";
import { listThreadsByBusiness } from "@/lib/queries";
import { relativeMinutes, minutesSince } from "@/lib/format";
import { Avatar } from "@/components/Avatar";

export default async function AdminChatListPage() {
  const session = await getBusinessSession();
  const threads = listThreadsByBusiness(session!.sub);

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <h1 className="text-[22px] font-extrabold mb-6">채팅</h1>

      <div className="rounded-2xl border border-ink-100 bg-white overflow-hidden">
        {threads.length === 0 && <p className="py-16 text-center text-ink-400 text-sm">대화가 없어요.</p>}
        {threads.map((t) => {
          const minutesAgo = minutesSince(t.lastMessageAt);
          return (
            <Link
              key={t.id}
              href={`/admin/chat/${t.id}`}
              className="flex items-center gap-3 px-5 py-4 border-b border-ink-50 last:border-b-0 hover:bg-ink-50 transition"
            >
              <Avatar color="#6c57e8" size={44} label={t.customerName} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{t.customerName}</p>
                  {t.businessUnread > 0 && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                </div>
                <p className="text-sm text-ink-500 truncate">{t.lastMessage}</p>
              </div>
              <span className="text-xs text-ink-400 shrink-0">{relativeMinutes(minutesAgo)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
