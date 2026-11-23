import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessSession } from "@/lib/auth";
import { getThreadById, listMessages, getCustomerById } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";
import { ChatPanel } from "@/components/ChatPanel";

export default async function AdminChatThreadPage({ params }: PageProps<"/admin/chat/[threadId]">) {
  const { threadId } = await params;
  const session = await getBusinessSession();
  const thread = getThreadById(threadId);
  if (!thread || thread.businessId !== session!.sub) notFound();

  const customer = getCustomerById(thread.customerId)!;
  const messages = listMessages(threadId);

  return (
    <div className="max-w-3xl mx-auto px-8 py-8 h-dvh flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/admin/chat" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-ink-50 text-ink-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Avatar color="#6c57e8" size={38} label={customer.name} />
        <div>
          <p className="font-bold">{customer.name}</p>
          <p className="text-xs text-ink-400">{customer.phone}</p>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-ink-100 bg-white overflow-hidden flex flex-col min-h-0">
        <ChatPanel threadId={threadId} selfRole="BUSINESS" initialMessages={messages} className="flex-1 min-h-0" />
      </div>
    </div>
  );
}
