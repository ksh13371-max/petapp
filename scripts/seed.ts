import { db } from "../src/lib/db";
import {
  createBusiness,
  createServiceMenu,
  createServiceOption,
  createCustomer,
  createPet,
  createReservation,
  createStay,
  createNotice,
  getOrCreateThread,
  sendMessage,
  updateReservationStatus,
  getBusinessByEmail,
} from "../src/lib/queries";
import bcrypt from "bcryptjs";

function atToday(hour: number, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
function atDaysFromNow(days: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
function minutesAgo(min: number) {
  return new Date(Date.now() - min * 60000).toISOString();
}

async function main() {
  if (getBusinessByEmail("owner@happydog.com")) {
    console.log("Seed already present, skipping.");
    return;
  }

  const pw = await bcrypt.hash("happydog123", 10);
  const biz = createBusiness({
    name: "해피독 미용실",
    email: "owner@happydog.com",
    passwordHash: pw,
    district: "강남구 역삼동",
    address: "서울 강남구 역삼로 123, 2층",
    phone: "02-1234-5678",
    description: "소형견 전문 1:1 미용. 낯가림 심한 아이도 천천히 적응시켜 드려요. 미용 후 사진은 채팅으로 바로 보내드립니다.",
    heroColor: "#f3cfa8",
    openTime: "10:00",
    closeTime: "19:00",
    rating: 4.8,
    reviewCount: 132,
  });

  db.prepare(`INSERT INTO staff (id, businessId, name) VALUES (?, ?, ?)`).run("stf_1", biz.id, "김수진");
  db.prepare(`INSERT INTO staff (id, businessId, name) VALUES (?, ?, ?)`).run("stf_2", biz.id, "이하늘");

  const bath = createServiceMenu({ businessId: biz.id, name: "목욕", description: "약 1시간", price: 25000, durationMin: 60, category: "GROOMING", sortOrder: 1 });
  const hygiene = createServiceMenu({ businessId: biz.id, name: "위생미용", description: "목욕 + 발바닥·배·항문 · 약 1시간 30분", price: 35000, durationMin: 90, category: "GROOMING", sortOrder: 2 });
  const full = createServiceMenu({ businessId: biz.id, name: "전체미용", description: "클리핑 · 약 2시간", price: 55000, durationMin: 120, category: "GROOMING", sortOrder: 3 });
  const scissor = createServiceMenu({ businessId: biz.id, name: "가위컷", description: "스타일 상담 포함 · 약 3시간", price: 75000, durationMin: 180, category: "GROOMING", sortOrder: 4 });

  const tangle = createServiceOption({ businessId: biz.id, name: "엉킴 제거", price: 10000 });
  const spa = createServiceOption({ businessId: biz.id, name: "스파", price: 15000 });

  createNotice({ businessId: biz.id, title: "방문 전 꼭 확인해주세요", body: "예약 시간 10분 전까지 방문 부탁드립니다. 노쇼/당일 취소는 예약금이 환불되지 않아요." });
  createNotice({ businessId: biz.id, title: "주차 안내", body: "건물 지하 1층 방문 주차 가능 (2시간 무료)." });

  // ---- customers & pets ----
  const pw1 = await bcrypt.hash("customer123", 10);
  const cust1 = createCustomer({ name: "박서연", email: "seoyeon@example.com", passwordHash: pw1, phone: "010-1111-2222" });
  const kong = createPet({ customerId: cust1.id, name: "콩이", breed: "푸들", weightKg: 4.2, age: 3, avatarColor: "#f3cfa8", note: "발 엉킴이 있는 편" });

  const cust2 = createCustomer({ name: "이준호", email: "junho@example.com", passwordHash: pw1, phone: "010-3333-4444" });
  const bori = createPet({ customerId: cust2.id, name: "보리", breed: "비숑프리제", weightKg: 5.8, age: 2, avatarColor: "#cfe0f3", note: "" });

  const cust3 = createCustomer({ name: "최유나", email: "yuna@example.com", passwordHash: pw1, phone: "010-5555-6666" });
  const dubu = createPet({ customerId: cust3.id, name: "두부", breed: "말티즈", weightKg: 3.1, age: 4, avatarColor: "#e4d4f4", note: "" });

  const cust4 = createCustomer({ name: "김하늘", email: "haneul@example.com", passwordHash: pw1, phone: "010-7777-8888" });
  const mango = createPet({ customerId: cust4.id, name: "망고", breed: "포메라니안", weightKg: 2.6, age: 1, avatarColor: "#f9dede", note: "" });

  const cust5 = createCustomer({ name: "정다인", email: "dain@example.com", passwordHash: pw1, phone: "010-9999-0000" });
  const choco = createPet({ customerId: cust5.id, name: "초코", breed: "닥스훈트", weightKg: 6.3, age: 5, avatarColor: "#ded9c7", note: "" });

  // ---- today's grooming reservations (6 total: 2 completed, 3 confirmed, 1 pending) ----
  const r1 = createReservation({ businessId: biz.id, customerId: cust1.id, petId: kong.id, serviceMenuId: bath.id, scheduledAt: atToday(9, 0), requestNote: "", totalPrice: bath.price, depositPrice: 20000, staffName: "김수진", optionIds: [] });
  updateReservationStatus(r1.id, "COMPLETED");

  const r2 = createReservation({ businessId: biz.id, customerId: cust3.id, petId: dubu.id, serviceMenuId: hygiene.id, scheduledAt: atToday(10, 30), requestNote: "", totalPrice: hygiene.price, depositPrice: 20000, staffName: "이하늘", optionIds: [] });
  updateReservationStatus(r2.id, "COMPLETED");

  const r3 = createReservation({ businessId: biz.id, customerId: cust1.id, petId: kong.id, serviceMenuId: full.id, scheduledAt: atToday(14, 0), requestNote: "지난번처럼 얼굴은 동글하게, 몸은 짧게 부탁드려요", totalPrice: full.price + spa.price, depositPrice: 20000, staffName: "김수진", optionIds: [spa.id] });
  updateReservationStatus(r3.id, "CONFIRMED");

  const r4 = createReservation({ businessId: biz.id, customerId: cust4.id, petId: mango.id, serviceMenuId: bath.id, scheduledAt: atToday(15, 30), requestNote: "", totalPrice: bath.price + tangle.price, depositPrice: 20000, staffName: "이하늘", optionIds: [tangle.id] });
  updateReservationStatus(r4.id, "CONFIRMED");

  const r5 = createReservation({ businessId: biz.id, customerId: cust5.id, petId: choco.id, serviceMenuId: hygiene.id, scheduledAt: atToday(17, 0), requestNote: "", totalPrice: hygiene.price, depositPrice: 20000, staffName: "김수진", optionIds: [] });
  updateReservationStatus(r5.id, "CONFIRMED");

  createReservation({ businessId: biz.id, customerId: cust2.id, petId: bori.id, serviceMenuId: scissor.id, scheduledAt: atDaysFromNow(2, 15, 0), requestNote: "가위컷 요청드려요", totalPrice: scissor.price, depositPrice: 20000, staffName: "김수진", optionIds: [] });

  createReservation({ businessId: biz.id, customerId: cust3.id, petId: dubu.id, serviceMenuId: full.id, scheduledAt: atDaysFromNow(3, 11, 0), requestNote: "", totalPrice: full.price, depositPrice: 20000, staffName: "이하늘", optionIds: [] });

  // past completed reservations, counted toward 정산 예정
  for (let i = 1; i <= 4; i++) {
    const rp = createReservation({ businessId: biz.id, customerId: [cust2, cust4, cust5, cust1][i - 1].id, petId: [bori, mango, choco, kong][i - 1].id, serviceMenuId: [bath, hygiene, full, bath][i - 1].id, scheduledAt: atDaysFromNow(-i, 13, 0), requestNote: "", totalPrice: [bath, hygiene, full, bath][i - 1].price, depositPrice: 20000, staffName: "이하늘", optionIds: [] });
    updateReservationStatus(rp.id, "COMPLETED");
  }

  // ---- hotel stays (투숙 중) ----
  createStay({ businessId: biz.id, petId: bori.id, checkIn: atDaysFromNow(-1, 14, 0), checkOut: atDaysFromNow(1, 11, 0), status: "CHECKED_IN" });
  createStay({ businessId: biz.id, petId: dubu.id, checkIn: atDaysFromNow(-2, 10, 0), checkOut: atToday(11, 0), status: "CHECKED_IN" });
  createStay({ businessId: biz.id, petId: mango.id, checkIn: atToday(9, 0), checkOut: atDaysFromNow(2, 10, 0), status: "CHECKED_IN" });
  createStay({ businessId: biz.id, petId: choco.id, checkIn: atDaysFromNow(1, 10, 0), checkOut: atDaysFromNow(3, 10, 0), status: "RESERVED" });

  // ---- chat threads ----
  const t1 = getOrCreateThread(biz.id, cust1.id, r3.id);
  sendMessage(t1.id, "BUSINESS", "안녕하세요! 콩이 예약 확인했어요 😊 원하시는 스타일 사진 있으면 미리 보내주세요.");
  sendMessage(t1.id, "CUSTOMER", "네! 지난번처럼 얼굴은 동글하게, 몸은 짧게 부탁드려요");
  sendMessage(t1.id, "BUSINESS", "사진 확인했어요. 발 엉킴이 좀 있어 보이는데 당일 상태 보고 안내드릴게요!");
  db.prepare(`UPDATE chat_threads SET businessUnread = 0 WHERE id = ?`).run(t1.id);

  const t2 = getOrCreateThread(biz.id, cust2.id);
  sendMessage(t2.id, "CUSTOMER", "안녕하세요, 보리 가위컷 11/17 15시 예약 가능할까요?");
  db.prepare(`UPDATE chat_messages SET createdAt = ? WHERE id = (SELECT id FROM chat_messages WHERE threadId = ? ORDER BY createdAt DESC LIMIT 1)`).run(minutesAgo(32), t2.id);
  db.prepare(`UPDATE chat_threads SET lastMessageAt = ? WHERE id = ?`).run(minutesAgo(32), t2.id);

  const t3 = getOrCreateThread(biz.id, cust3.id);
  sendMessage(t3.id, "CUSTOMER", "두부 미용 끝나고 사진 좀 보내주실 수 있나요?");
  db.prepare(`UPDATE chat_messages SET createdAt = ? WHERE id = (SELECT id FROM chat_messages WHERE threadId = ? ORDER BY createdAt DESC LIMIT 1)`).run(minutesAgo(50), t3.id);
  db.prepare(`UPDATE chat_threads SET lastMessageAt = ? WHERE id = ?`).run(minutesAgo(50), t3.id);

  const t4 = getOrCreateThread(biz.id, cust4.id);
  sendMessage(t4.id, "CUSTOMER", "오늘 망고 목욕 몇 시쯤 끝날까요?");
  db.prepare(`UPDATE chat_messages SET createdAt = ? WHERE id = (SELECT id FROM chat_messages WHERE threadId = ? ORDER BY createdAt DESC LIMIT 1)`).run(minutesAgo(70), t4.id);
  db.prepare(`UPDATE chat_threads SET lastMessageAt = ? WHERE id = ?`).run(minutesAgo(70), t4.id);

  const t5 = getOrCreateThread(biz.id, cust5.id);
  sendMessage(t5.id, "CUSTOMER", "초코 피부가 예민한 편인데 순한 샴푸 사용하시나요?");
  db.prepare(`UPDATE chat_messages SET createdAt = ? WHERE id = (SELECT id FROM chat_messages WHERE threadId = ? ORDER BY createdAt DESC LIMIT 1)`).run(minutesAgo(95), t5.id);
  db.prepare(`UPDATE chat_threads SET lastMessageAt = ? WHERE id = ?`).run(minutesAgo(95), t5.id);

  console.log("Seed complete:", { businessId: biz.id, customerLogins: [cust1.email, cust2.email, cust3.email, cust4.email, cust5.email] });
}

main();
