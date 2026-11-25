import { getBusinessSession } from "@/lib/auth";
import { listCustomersForBusiness } from "@/lib/queries";
import { formatDateKo } from "@/lib/format";
import { PawAvatar, Avatar } from "@/components/Avatar";

export default async function AdminCustomersPage() {
  const session = await getBusinessSession();
  const customers = await listCustomersForBusiness(session!.sub);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h1 className="text-[22px] font-extrabold mb-6">고객 ({customers.length})</h1>

      <div className="grid grid-cols-2 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar color="#6c57e8" size={42} label={c.name} />
              <div>
                <p className="font-bold">{c.name}</p>
                <p className="text-xs text-ink-400">{c.phone || c.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-bold">{c.reservationCount}회 방문</p>
                {c.lastVisit && <p className="text-[11px] text-ink-400">최근 {formatDateKo(c.lastVisit)}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {c.pets.map((pet) => (
                <div key={pet.id} className="flex items-center gap-2 bg-ink-50 rounded-xl pl-1.5 pr-3 py-1.5">
                  <PawAvatar color={pet.avatarColor} size={30} />
                  <div>
                    <p className="text-sm font-bold leading-tight">{pet.name}</p>
                    <p className="text-[11px] text-ink-400 leading-tight">
                      {pet.breed} · {pet.weightKg}kg · {pet.age}세
                    </p>
                  </div>
                </div>
              ))}
              {c.pets.length === 0 && <p className="text-xs text-ink-300">등록된 반려견 없음</p>}
            </div>
          </div>
        ))}
        {customers.length === 0 && <p className="text-ink-400 text-sm py-10">아직 고객이 없어요.</p>}
      </div>
    </div>
  );
}
