import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import { getCustomerById, listPetsByCustomer, listReservationsByCustomer } from "@/lib/queries";
import { Avatar, PawAvatar } from "@/components/Avatar";
import { LogoutButton } from "@/components/LogoutButton";

export default async function MyPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login");

  const customer = (await getCustomerById(session.sub))!;
  const pets = await listPetsByCustomer(session.sub);
  const reservations = await listReservationsByCustomer(session.sub);
  const completedCount = reservations.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="pb-8">
      <div className="px-4 pt-6 pb-5 flex items-center gap-3">
        <Avatar color="#ff3f73" size={56} label={customer.name} />
        <div>
          <p className="text-lg font-extrabold">{customer.name}</p>
          <p className="text-sm text-ink-400">{customer.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 mb-6">
        <div className="rounded-2xl bg-ink-50 p-4 text-center">
          <p className="text-2xl font-extrabold">{reservations.length}</p>
          <p className="text-xs text-ink-500 mt-1">전체 예약</p>
        </div>
        <div className="rounded-2xl bg-ink-50 p-4 text-center">
          <p className="text-2xl font-extrabold">{completedCount}</p>
          <p className="text-xs text-ink-500 mt-1">이용 완료</p>
        </div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="font-extrabold mb-3 text-[15px]">내 반려견</h2>
        <div className="flex flex-col gap-2">
          {pets.map((pet) => (
            <div key={pet.id} className="flex items-center gap-3 rounded-2xl border border-ink-100 p-3.5">
              <PawAvatar color={pet.avatarColor} size={42} />
              <div>
                <p className="font-bold">{pet.name}</p>
                <p className="text-xs text-ink-400">
                  {pet.breed} · {pet.weightKg}kg · {pet.age}살
                </p>
              </div>
            </div>
          ))}
          {pets.length === 0 && <p className="text-sm text-ink-400">등록된 반려견이 없어요.</p>}
        </div>
      </div>

      <div className="px-4 flex flex-col">
        {["공지사항", "자주 묻는 질문", "고객센터"].map((label) => (
          <button key={label} className="flex items-center justify-between py-3.5 border-b border-ink-50 text-sm font-bold text-ink-700">
            {label}
            <span className="text-ink-300">›</span>
          </button>
        ))}
        <LogoutButton />
      </div>
    </div>
  );
}
