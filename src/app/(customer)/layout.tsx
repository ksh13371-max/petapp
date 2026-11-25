import { getCustomerSession } from "@/lib/auth";
import { countUnreadThreads } from "@/lib/queries";
import { CustomerBottomNav } from "@/components/CustomerBottomNav";

export default async function CustomerLayout({ children }: LayoutProps<"/">) {
  const session = await getCustomerSession();
  const chatUnread = session ? await countUnreadThreads(session.sub, "CUSTOMER") : 0;

  return (
    <div className="flex flex-col min-h-dvh bg-ink-50">
      <div className="flex-1 w-full max-w-md mx-auto bg-white min-h-dvh flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.04)]">
        <div className="flex-1">{children}</div>
        <CustomerBottomNav chatUnread={chatUnread} />
      </div>
    </div>
  );
}
