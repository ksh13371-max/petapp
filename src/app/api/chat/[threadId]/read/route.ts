import { NextResponse } from "next/server";
import { getBusinessSession, getCustomerSession } from "@/lib/auth";
import { getThreadById, markThreadRead } from "@/lib/queries";

export async function POST(_request: Request, ctx: RouteContext<"/api/chat/[threadId]/read">) {
  const { threadId } = await ctx.params;
  const thread = await getThreadById(threadId);
  if (!thread) return NextResponse.json({ error: "대화를 찾을 수 없습니다." }, { status: 404 });

  const businessSession = await getBusinessSession();
  const customerSession = await getCustomerSession();

  if (businessSession && businessSession.sub === thread.businessId) {
    await markThreadRead(threadId, "BUSINESS");
  } else if (customerSession && customerSession.sub === thread.customerId) {
    await markThreadRead(threadId, "CUSTOMER");
  } else {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
