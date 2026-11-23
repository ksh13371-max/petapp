import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import {
  getServiceById,
  getPetById,
  listOptionsByBusiness,
  createReservation,
  getOrCreateThread,
  sendMessage,
} from "@/lib/queries";

export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const { petId, serviceMenuId, scheduledAt, requestNote, optionIds, staffName } = body as {
    petId: string;
    serviceMenuId: string;
    scheduledAt: string;
    requestNote?: string;
    optionIds?: string[];
    staffName?: string;
  };

  const service = getServiceById(serviceMenuId);
  const pet = getPetById(petId);
  if (!service || !pet || pet.customerId !== session.sub) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const businessOptions = listOptionsByBusiness(service.businessId);
  const selectedOptions = businessOptions.filter((o) => (optionIds ?? []).includes(o.id));
  const totalPrice = service.price + selectedOptions.reduce((sum, o) => sum + o.price, 0);

  const reservation = createReservation({
    businessId: service.businessId,
    customerId: session.sub,
    petId,
    serviceMenuId,
    scheduledAt,
    requestNote: requestNote ?? "",
    totalPrice,
    depositPrice: 20000,
    staffName: staffName || "담당자",
    optionIds: selectedOptions.map((o) => o.id),
  });

  const thread = getOrCreateThread(service.businessId, session.sub, reservation.id);
  sendMessage(
    thread.id,
    "BUSINESS",
    `예약이 접수됐어요! ${pet.name} · ${service.name} · ${new Date(scheduledAt).toLocaleString("ko-KR")}\n확인 후 빠르게 안내드릴게요 🐾`
  );

  return NextResponse.json({ reservation });
}
