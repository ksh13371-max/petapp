import { pool } from "../src/lib/db";
import {
  createBusiness,
  createServiceMenu,
  createServiceOption,
  createCustomer,
  createPet,
  createNotice,
  getBusinessByEmail,
} from "../src/lib/queries";
import bcrypt from "bcryptjs";

async function main() {
  if (await getBusinessByEmail("owner@happydog.com")) {
    console.log("Seed already present, skipping.");
    return;
  }

  const pw = await bcrypt.hash("happydog123", 10);
  const biz = await createBusiness({
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

  await pool.query(`INSERT INTO staff (id, business_id, name) VALUES ($1, $2, $3)`, ["stf_1", biz.id, "김수진"]);
  await pool.query(`INSERT INTO staff (id, business_id, name) VALUES ($1, $2, $3)`, ["stf_2", biz.id, "이하늘"]);

  await createServiceMenu({ businessId: biz.id, name: "목욕", description: "약 1시간", price: 25000, durationMin: 60, category: "GROOMING", sortOrder: 1 });
  await createServiceMenu({ businessId: biz.id, name: "위생미용", description: "목욕 + 발바닥·배·항문 · 약 1시간 30분", price: 35000, durationMin: 90, category: "GROOMING", sortOrder: 2 });
  await createServiceMenu({ businessId: biz.id, name: "전체미용", description: "클리핑 · 약 2시간", price: 55000, durationMin: 120, category: "GROOMING", sortOrder: 3 });
  await createServiceMenu({ businessId: biz.id, name: "가위컷", description: "스타일 상담 포함 · 약 3시간", price: 75000, durationMin: 180, category: "GROOMING", sortOrder: 4 });

  await createServiceOption({ businessId: biz.id, name: "엉킴 제거", price: 10000 });
  await createServiceOption({ businessId: biz.id, name: "스파", price: 15000 });

  await createNotice({ businessId: biz.id, title: "방문 전 꼭 확인해주세요", body: "예약 시간 10분 전까지 방문 부탁드립니다. 노쇼/당일 취소는 예약금이 환불되지 않아요." });
  await createNotice({ businessId: biz.id, title: "주차 안내", body: "건물 지하 1층 방문 주차 가능 (2시간 무료)." });

  // ---- customers & pets ----
  const pw1 = await bcrypt.hash("customer123", 10);
  const cust1 = await createCustomer({ name: "박서연", email: "seoyeon@example.com", passwordHash: pw1, phone: "010-1111-2222" });
  await createPet({ customerId: cust1.id, name: "콩이", breed: "푸들", weightKg: 4.2, age: 3, avatarColor: "#f3cfa8", note: "발 엉킴이 있는 편" });

  const cust2 = await createCustomer({ name: "이준호", email: "junho@example.com", passwordHash: pw1, phone: "010-3333-4444" });
  await createPet({ customerId: cust2.id, name: "보리", breed: "비숑프리제", weightKg: 5.8, age: 2, avatarColor: "#cfe0f3", note: "" });

  const cust3 = await createCustomer({ name: "최유나", email: "yuna@example.com", passwordHash: pw1, phone: "010-5555-6666" });
  await createPet({ customerId: cust3.id, name: "두부", breed: "말티즈", weightKg: 3.1, age: 4, avatarColor: "#e4d4f4", note: "" });

  const cust4 = await createCustomer({ name: "김하늘", email: "haneul@example.com", passwordHash: pw1, phone: "010-7777-8888" });
  await createPet({ customerId: cust4.id, name: "망고", breed: "포메라니안", weightKg: 2.6, age: 1, avatarColor: "#f9dede", note: "" });

  const cust5 = await createCustomer({ name: "정다인", email: "dain@example.com", passwordHash: pw1, phone: "010-9999-0000" });
  await createPet({ customerId: cust5.id, name: "초코", breed: "닥스훈트", weightKg: 6.3, age: 5, avatarColor: "#ded9c7", note: "" });

  console.log("Seed complete:", { businessId: biz.id, customerLogins: [cust1.email, cust2.email, cust3.email, cust4.email, cust5.email] });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
