import { NextResponse } from "next/server";
import { clearBusinessSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearBusinessSessionCookie();
  return NextResponse.json({ ok: true });
}
