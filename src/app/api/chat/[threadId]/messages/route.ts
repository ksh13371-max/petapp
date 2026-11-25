import { NextResponse } from "next/server";
import { getBusinessSession, getCustomerSession } from "@/lib/auth";
import { getThreadById, listMessages, sendMessage } from "@/lib/queries";

async function resolveRole(threadId: string) {
  const thread = await getThreadById(threadId);
  if (!thread) return { thread: null, role: null as null };
  const businessSession = await getBusinessSession();
  const customerSession = await getCustomerSession();
  if (businessSession && businessSession.sub === thread.businessId) return { thread, role: "BUSINESS" as const };
  if (customerSession && customerSession.sub === thread.customerId) return { thread, role: "CUSTOMER" as const };
  return { thread, role: null };
}

export async function GET(_request: Request, ctx: RouteContext<"/api/chat/[threadId]/messages">) {
  const { threadId } = await ctx.params;
  const { thread, role } = await resolveRole(threadId);
  if (!thread) return NextResponse.json({ error: "대화를 찾을 수 없습니다." }, { status: 404 });
  if (!role) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const messages = await listMessages(threadId);
  return NextResponse.json({ messages });
}

export async function POST(request: Request, ctx: RouteContext<"/api/chat/[threadId]/messages">) {
  const { threadId } = await ctx.params;
  const { thread, role } = await resolveRole(threadId);
  if (!thread) return NextResponse.json({ error: "대화를 찾을 수 없습니다." }, { status: 404 });
  if (!role) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

  const { content } = (await request.json()) as { content: string };
  if (!content?.trim()) return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });

  const message = await sendMessage(threadId, role, content.trim());
  return NextResponse.json({ message });
}
