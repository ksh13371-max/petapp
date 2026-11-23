import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export type SessionPayload = { sub: string; role: "CUSTOMER" | "BUSINESS" };

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

const CUSTOMER_COOKIE = "petapp_customer_session";
const BUSINESS_COOKIE = "petapp_business_session";

export async function getCustomerSession() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session || session.role !== "CUSTOMER") return null;
  return session;
}

export async function getBusinessSession() {
  const jar = await cookies();
  const token = jar.get(BUSINESS_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session || session.role !== "BUSINESS") return null;
  return session;
}

export async function setCustomerSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function setBusinessSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(BUSINESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSessionCookie() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

export async function clearBusinessSessionCookie() {
  const jar = await cookies();
  jar.delete(BUSINESS_COOKIE);
}
