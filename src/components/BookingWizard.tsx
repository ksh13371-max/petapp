"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Business, ServiceMenu, ServiceOption, Pet } from "@/lib/queries";
import { won } from "@/lib/format";
import { PawAvatar } from "@/components/Avatar";
import { TopBar } from "@/components/TopBar";

const STEPS = ["반려견", "메뉴", "일정", "결제"];

function dayLabel(d: Date) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  const prefix = diff === 0 ? "오늘" : diff === 1 ? "내일" : `${d.getMonth() + 1}/${d.getDate()}`;
  return `${prefix} (${days[d.getDay()]})`;
}

function buildTimeSlots(openTime: string, closeTime: string, date: Date) {
  const [openH] = openTime.split(":").map(Number);
  const [closeH] = closeTime.split(":").map(Number);
  const slots: string[] = [];
  for (let h = openH; h < closeH; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (!isToday) return slots;
  return slots.filter((slot) => {
    const [h, m] = slot.split(":").map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(h, m, 0, 0);
    return slotDate.getTime() > now.getTime() + 60 * 60000;
  });
}

export function BookingWizard({
  business,
  services,
  options,
  pets: initialPets,
}: {
  business: Business;
  services: ServiceMenu[];
  options: ServiceOption[];
  pets: Pet[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pets, setPets] = useState(initialPets);
  const [petId, setPetId] = useState(initialPets[0]?.id ?? "");
  const [addingPet, setAddingPet] = useState(initialPets.length === 0);
  const [newPet, setNewPet] = useState({ name: "", breed: "", weightKg: "3", age: "1" });
  const [savingPet, setSavingPet] = useState(false);

  const [serviceId, setServiceId] = useState("");
  const [optionIds, setOptionIds] = useState<string[]>([]);

  const dateOptions = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, []);
  const [selectedDate, setSelectedDate] = useState(dateOptions[1]);
  const [selectedTime, setSelectedTime] = useState("");
  const [requestNote, setRequestNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedOptions = options.filter((o) => optionIds.includes(o.id));
  const totalPrice = (selectedService?.price ?? 0) + selectedOptions.reduce((sum, o) => sum + o.price, 0);
  const timeSlots = buildTimeSlots(business.openTime, business.closeTime, selectedDate);

  async function saveNewPet() {
    if (!newPet.name || !newPet.breed) return;
    setSavingPet(true);
    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPet),
    });
    setSavingPet(false);
    if (res.ok) {
      const data = await res.json();
      setPets((prev) => [...prev, data.pet]);
      setPetId(data.pet.id);
      setAddingPet(false);
    }
  }

  async function submitBooking() {
    setSubmitting(true);
    setError("");
    const scheduledAt = new Date(selectedDate);
    const [h, m] = selectedTime.split(":").map(Number);
    scheduledAt.setHours(h, m, 0, 0);

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        petId,
        serviceMenuId: serviceId,
        scheduledAt: scheduledAt.toISOString(),
        requestNote,
        optionIds,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "예약에 실패했습니다.");
      return;
    }
    router.push("/reservations?created=1");
  }

  const canNext = step === 1 ? !!petId : step === 2 ? !!serviceId : step === 3 ? !!selectedTime : true;

  return (
    <div className="flex flex-col min-h-dvh">
      <TopBar
        title="미용 예약"
        onBack={() => (step > 1 ? setStep(step - 1) : router.back())}
      />

      <div className="flex px-4 pt-3 pb-1 gap-5">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <div key={label} className="flex-1 text-center">
              <p className={`text-[13px] font-bold ${active ? "text-brand-600" : done ? "text-ink-700" : "text-ink-300"}`}>
                {n} {label}
              </p>
              <div className={`mt-2 h-[3px] rounded-full ${active || done ? "bg-brand-500" : "bg-ink-100"}`} />
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {step === 1 && (
          <div>
            {pets.length > 0 && !addingPet && (
              <div className="flex flex-col gap-2 mb-4">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setPetId(pet.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                      petId === pet.id ? "border-brand-500 bg-brand-50/40" : "border-ink-100"
                    }`}
                  >
                    <PawAvatar color={pet.avatarColor} size={44} />
                    <div className="flex-1">
                      <p className="font-bold">{pet.name}</p>
                      <p className="text-xs text-ink-400">
                        {pet.breed} · {pet.weightKg}kg · {pet.age}살
                      </p>
                    </div>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${petId === pet.id ? "border-brand-500" : "border-ink-200"}`}>
                      {petId === pet.id && <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                    </span>
                  </button>
                ))}
                <button onClick={() => setAddingPet(true)} className="text-sm font-bold text-ink-500 py-2 text-left">
                  + 새 반려견 등록
                </button>
              </div>
            )}

            {addingPet && (
              <div className="flex flex-col gap-3">
                <p className="font-bold text-sm text-ink-700">반려견 정보를 입력해주세요</p>
                <input
                  placeholder="이름"
                  value={newPet.name}
                  onChange={(e) => setNewPet((p) => ({ ...p, name: e.target.value }))}
                  className="h-12 rounded-xl border border-ink-100 px-4 bg-ink-50"
                />
                <input
                  placeholder="견종"
                  value={newPet.breed}
                  onChange={(e) => setNewPet((p) => ({ ...p, breed: e.target.value }))}
                  className="h-12 rounded-xl border border-ink-100 px-4 bg-ink-50"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="몸무게(kg)"
                    type="number"
                    value={newPet.weightKg}
                    onChange={(e) => setNewPet((p) => ({ ...p, weightKg: e.target.value }))}
                    className="h-12 rounded-xl border border-ink-100 px-4 bg-ink-50"
                  />
                  <input
                    placeholder="나이"
                    type="number"
                    value={newPet.age}
                    onChange={(e) => setNewPet((p) => ({ ...p, age: e.target.value }))}
                    className="h-12 rounded-xl border border-ink-100 px-4 bg-ink-50"
                  />
                </div>
                <button
                  onClick={saveNewPet}
                  disabled={savingPet || !newPet.name || !newPet.breed}
                  className="h-12 rounded-xl bg-ink-900 text-white font-bold disabled:opacity-40"
                >
                  {savingPet ? "저장 중..." : "등록하고 선택"}
                </button>
                {pets.length > 0 && (
                  <button onClick={() => setAddingPet(false)} className="text-sm text-ink-400 py-1">
                    취소
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-extrabold mb-3">메뉴 선택</h3>
            <div className="flex flex-col gap-2 mb-6">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                    serviceId === s.id ? "border-brand-500 bg-brand-50/40" : "border-ink-100"
                  }`}
                >
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{s.description}</p>
                  </div>
                  <p className="font-bold text-brand-600 shrink-0 ml-3">{won(s.price)}</p>
                </button>
              ))}
            </div>

            {options.length > 0 && (
              <>
                <h3 className="font-extrabold mb-3">추가 옵션 선택</h3>
                <div className="flex flex-wrap gap-2">
                  {options.map((o) => {
                    const active = optionIds.includes(o.id);
                    return (
                      <button
                        key={o.id}
                        onClick={() =>
                          setOptionIds((prev) => (active ? prev.filter((id) => id !== o.id) : [...prev, o.id]))
                        }
                        className={`px-3.5 py-2 rounded-full text-sm font-bold border transition ${
                          active ? "border-brand-500 bg-brand-500 text-white" : "border-ink-200 text-ink-600"
                        }`}
                      >
                        {o.name} +{o.price.toLocaleString()}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-extrabold mb-3">날짜 선택</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
              {dateOptions.map((d) => {
                const active = d.toDateString() === selectedDate.toDateString();
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedTime("");
                    }}
                    className={`shrink-0 px-3.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap border ${
                      active ? "border-brand-500 bg-brand-500 text-white" : "border-ink-100 text-ink-600"
                    }`}
                  >
                    {dayLabel(d)}
                  </button>
                );
              })}
            </div>

            <h3 className="font-extrabold mb-3">시간 선택</h3>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2.5 rounded-xl text-sm font-bold border ${
                    selectedTime === slot ? "border-brand-500 bg-brand-500 text-white" : "border-ink-100 text-ink-600"
                  }`}
                >
                  {slot}
                </button>
              ))}
              {timeSlots.length === 0 && <p className="col-span-4 text-center text-ink-400 text-sm py-4">예약 가능한 시간이 없어요.</p>}
            </div>

            <h3 className="font-extrabold mb-2">요청사항 (선택)</h3>
            <textarea
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="예: 얼굴은 동글하게, 몸은 짧게 부탁드려요"
              rows={3}
              className="w-full rounded-xl border border-ink-100 p-3.5 text-sm bg-ink-50 outline-none resize-none"
            />
          </div>
        )}

        {step === 4 && selectedService && (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="text-xs font-bold text-ink-400 mb-3">예약 정보</p>
              <Row label="업체" value={business.name} />
              <Row label="반려견" value={pets.find((p) => p.id === petId)?.name ?? ""} />
              <Row label="메뉴" value={selectedService.name} />
              {selectedOptions.length > 0 && <Row label="옵션" value={selectedOptions.map((o) => o.name).join(", ")} />}
              <Row label="일시" value={`${dayLabel(selectedDate)} ${selectedTime}`} />
              {requestNote && <Row label="요청사항" value={requestNote} />}
            </div>

            <div className="rounded-2xl border border-ink-100 p-4">
              <p className="text-xs font-bold text-ink-400 mb-3">결제 금액</p>
              <Row label={selectedService.name} value={won(selectedService.price)} />
              {selectedOptions.map((o) => (
                <Row key={o.id} label={o.name} value={`+${won(o.price)}`} />
              ))}
              <div className="h-px bg-ink-100 my-2" />
              <Row label="총 금액" value={won(totalPrice)} bold />
              <Row label="예약금 (현장 잔금 결제)" value={won(20000)} />
            </div>

            <p className="text-xs text-ink-400 leading-relaxed">
              예약금 20,000원은 결제 즉시 차감되며, 노쇼/당일 취소 시 환불되지 않아요. 나머지 금액은 방문 후 현장에서 결제합니다.
            </p>
            {error && <p className="text-brand-600 text-sm">{error}</p>}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-ink-100 p-4 flex items-center gap-3">
        {step < 4 ? (
          <>
            <div className="flex-1">
              <p className="text-xs text-ink-400">예상 금액</p>
              <p className="font-extrabold text-lg">{won(totalPrice)}</p>
            </div>
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="h-12 px-10 rounded-2xl bg-brand-500 text-white font-bold disabled:opacity-40"
            >
              다음
            </button>
          </>
        ) : (
          <button
            onClick={submitBooking}
            disabled={submitting}
            className="flex-1 h-12 rounded-2xl bg-brand-500 text-white font-bold disabled:opacity-60"
          >
            {submitting ? "처리 중..." : `${won(20000)} 결제하고 예약하기`}
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between py-1 gap-3">
      <span className="text-sm text-ink-500 shrink-0">{label}</span>
      <span className={`text-sm text-right ${bold ? "font-extrabold text-brand-600" : "text-ink-900"}`}>{value}</span>
    </div>
  );
}
