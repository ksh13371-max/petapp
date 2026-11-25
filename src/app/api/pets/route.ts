import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { createPet } from "@/lib/queries";

const palette = ["#f3cfa8", "#cfe0f3", "#e4d4f4", "#f9dede", "#ded9c7", "#cdeedd"];

export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { name, breed, weightKg, age } = await request.json();
  if (!name || !breed) return NextResponse.json({ error: "반려견 정보를 입력해주세요." }, { status: 400 });

  const pet = await createPet({
    customerId: session.sub,
    name,
    breed,
    weightKg: Number(weightKg) || 3,
    age: Number(age) || 1,
    avatarColor: palette[Math.floor(Math.random() * palette.length)],
    note: "",
  });
  return NextResponse.json({ pet });
}
