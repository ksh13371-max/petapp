import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerSession } from "@/lib/auth";
import { listThreadsByCustomer } from "@/lib/queries";
import { relativeMinutes, minutesSince } from "@/lib/format";
import { PawAvatar } from "@/components/Avatar";
import { TopBar } from "@/components/TopBar";

export default async function CustomerChatListPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const threads = await listThreadsByCustomer(session.sub);

  return (
    <div>
      <TopBar title="채팅" />
      <div className="divide-y divide-ink-50">
        {threads.length === 0 && <p className="py-20 text-center text-ink-400 text-sm">대화가 없어요.</p>}
        {threads.map((t) => {
          const minutesAgo = minutesSince(t.lastMessageAt);
          return (
            <Link key={t.id} href={`/chat/${t.id}`} className="flex items-center gap-3 px-4 py-4 hover:bg-ink-50 transition">
              <PawAvatar color={t.businessHeroColor} size={46} />
              <div className="flex-1 min-w-0">
                <p className="font-bold">{t.businessName}</p>
                <p className="text-sm text-ink-500 truncate">{t.lastMessage}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-xs text-ink-400">{relativeMinutes(minutesAgo)}</span>
                {t.customerUnread > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] leading-[18px] text-center font-bold">
                    {t.customerUnread}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
