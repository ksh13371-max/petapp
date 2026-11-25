import { NextResponse } from "next/server";
import { getBusinessSession, getCustomerSession } from "@/lib/auth";
import { getReservationById, updateReservationStatus, type ReservationStatus } from "@/lib/queries";

export async function PATCH(request: Request, ctx: RouteContext<"/api/reservations/[id]">) {
  const { id } = await ctx.params;
  const reservation = await getReservationById(id);
  if (!reservation) return NextResponse.json({ error: "예약을 찾을 수 없습니다." }, { status: 404 });

  const { status } = (await request.json()) as { status: ReservationStatus };

  const businessSession = await getBusinessSession();
  const customerSession = await getCustomerSession();

  const isOwnerBusiness = businessSession && businessSession.sub === reservation.businessId;
  const isOwnerCustomer = customerSession && customerSession.sub === reservation.customerId;

  if (!isOwnerBusiness && !isOwnerCustomer) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  if (isOwnerCustomer && !isOwnerBusiness && status !== "CANCELED") {
    return NextResponse.json({ error: "고객은 취소만 할 수 있습니다." }, { status: 403 });
  }

  const updated = await updateReservationStatus(id, status);
  return NextResponse.json({ reservation: updated });
}
