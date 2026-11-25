import { NextResponse } from "next/server";
import { getBusinessByEmail } from "@/lib/queries";
import { verifyPassword, signSession, setBusinessSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const business = await getBusinessByEmail(email);
  if (!business || !(await verifyPassword(password, business.passwordHash))) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const token = await signSession({ sub: business.id, role: "BUSINESS" });
  await setBusinessSessionCookie(token);
  return NextResponse.json({ ok: true });
}
