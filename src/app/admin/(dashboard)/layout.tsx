import { redirect } from "next/navigation";
import { getBusinessSession } from "@/lib/auth";
import { getBusinessById, getBusinessDashboard, countUnreadThreads } from "@/lib/queries";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminDashboardLayout({ children }: LayoutProps<"/admin">) {
  const session = await getBusinessSession();
  if (!session) redirect("/admin/login");

  const business = getBusinessById(session.sub);
  if (!business) redirect("/admin/login");

  const stats = getBusinessDashboard(business.id);
  const chatCount = countUnreadThreads(business.id, "BUSINESS");

  return (
    <div className="min-h-dvh flex bg-ink-50">
      <AdminSidebar businessName={business.name} pendingCount={stats.pendingApprovalCount} chatCount={chatCount} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
