import { NextResponse } from "next/server";
import { getCustomerByEmail, createCustomer, createPet } from "@/lib/queries";
import { hashPassword, signSession, setCustomerSessionCookie } from "@/lib/auth";

const avatarPalette = ["#f3cfa8", "#cfe0f3", "#e4d4f4", "#f9dede", "#ded9c7", "#cdeedd"];

export async function POST(request: Request) {
  const { name, email, password, phone, pet } = await request.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "필수 정보를 입력해주세요." }, { status: 400 });
  }
  if (getCustomerByEmail(email)) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }
  const passwordHash = await hashPassword(password);
  const customer = createCustomer({ name, email, passwordHash, phone: phone ?? "" });

  if (pet?.name && pet?.breed) {
    createPet({
      customerId: customer.id,
      name: pet.name,
      breed: pet.breed,
      weightKg: Number(pet.weightKg) || 3,
      age: Number(pet.age) || 1,
      avatarColor: avatarPalette[Math.floor(Math.random() * avatarPalette.length)],
      note: "",
    });
  }

  const token = await signSession({ sub: customer.id, role: "CUSTOMER" });
  await setCustomerSessionCookie(token);
  return NextResponse.json({ ok: true });
}
