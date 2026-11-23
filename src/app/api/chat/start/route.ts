import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { getOrCreateThread } from "@/lib/queries";

export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { businessId } = (await request.json()) as { businessId: string };
  const thread = getOrCreateThread(businessId, session.sub);
  return NextResponse.json({ thread });
}
