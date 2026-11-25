import { db } from "../src/lib/db";
import {
  createBusiness,
  createServiceMenu,
  createServiceOption,
  createCustomer,
  createPet,
  createNotice,
  getOrCreateThread,
  sendMessage,
  getBusinessByEmail,
} from "../src/lib/queries";
import bcrypt from "bcryptjs";

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
    categories: "GROOMING,HOTEL",
    openTime: "10:00",
    closeTime: "19:00",
    rating: 4.8,
    reviewCount: 132,
  });

  db.prepare(`INSERT INTO staff (id, businessId, name) VALUES (?, ?, ?)`).run("stf_1", biz.id, "김수진");
  db.prepare(`INSERT INTO staff (id, businessId, name) VALUES (?, ?, ?)`).run("stf_2", biz.id, "이하늘");

  createServiceMenu({ businessId: biz.id, name: "목욕", description: "약 1시간", price: 25000, durationMin: 60, category: "GROOMING", sortOrder: 1 });
  createServiceMenu({ businessId: biz.id, name: "위생미용", description: "목욕 + 발바닥·배·항문 · 약 1시간 30분", price: 35000, durationMin: 90, category: "GROOMING", sortOrder: 2 });
  createServiceMenu({ businessId: biz.id, name: "전체미용", description: "클리핑 · 약 2시간", price: 55000, durationMin: 120, category: "GROOMING", sortOrder: 3 });
  createServiceMenu({ businessId: biz.id, name: "가위컷", description: "스타일 상담 포함 · 약 3시간", price: 75000, durationMin: 180, category: "GROOMING", sortOrder: 4 });

  createServiceOption({ businessId: biz.id, name: "엉킴 제거", price: 10000 });
  createServiceOption({ businessId: biz.id, name: "스파", price: 15000 });

  createNotice({ businessId: biz.id, title: "방문 전 꼭 확인해주세요", body: "예약 시간 10분 전까지 방문 부탁드립니다. 노쇼/당일 취소는 예약금이 환불되지 않아요." });
  createNotice({ businessId: biz.id, title: "주차 안내", body: "건물 지하 1층 방문 주차 가능 (2시간 무료)." });

  // ---- customers & pets ----
  const pw1 = await bcrypt.hash("customer123", 10);
  const cust1 = createCustomer({ name: "박서연", email: "seoyeon@example.com", passwordHash: pw1, phone: "010-1111-2222" });
  createPet({ customerId: cust1.id, name: "콩이", breed: "푸들", weightKg: 4.2, age: 3, avatarColor: "#f3cfa8", note: "발 엉킴이 있는 편" });

  const cust2 = createCustomer({ name: "이준호", email: "junho@example.com", passwordHash: pw1, phone: "010-3333-4444" });
  createPet({ customerId: cust2.id, name: "보리", breed: "비숑프리제", weightKg: 5.8, age: 2, avatarColor: "#cfe0f3", note: "" });

  const cust3 = createCustomer({ name: "최유나", email: "yuna@example.com", passwordHash: pw1, phone: "010-5555-6666" });
  createPet({ customerId: cust3.id, name: "두부", breed: "말티즈", weightKg: 3.1, age: 4, avatarColor: "#e4d4f4", note: "" });

  const cust4 = createCustomer({ name: "김하늘", email: "haneul@example.com", passwordHash: pw1, phone: "010-7777-8888" });
  createPet({ customerId: cust4.id, name: "망고", breed: "포메라니안", weightKg: 2.6, age: 1, avatarColor: "#f9dede", note: "" });

  const cust5 = createCustomer({ name: "정다인", email: "dain@example.com", passwordHash: pw1, phone: "010-9999-0000" });
  createPet({ customerId: cust5.id, name: "초코", breed: "닥스훈트", weightKg: 6.3, age: 5, avatarColor: "#ded9c7", note: "" });

  // ---- chat threads (no pre-made reservations; dashboard starts at zero) ----
  const t1 = getOrCreateThread(biz.id, cust1.id);
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
