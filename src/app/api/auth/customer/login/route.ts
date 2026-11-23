import { NextResponse } from "next/server";
import { getCustomerByEmail } from "@/lib/queries";
import { verifyPassword, signSession, setCustomerSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const customer = getCustomerByEmail(email);
  if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  const token = await signSession({ sub: customer.id, role: "CUSTOMER" });
  await setCustomerSessionCookie(token);
  return NextResponse.json({ ok: true });
}
