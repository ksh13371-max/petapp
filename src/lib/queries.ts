import { db, newId, withTransaction } from "./db";

export type Business = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  district: string;
  address: string;
  phone: string;
  description: string;
  heroColor: string;
  categories: string;
  openTime: string;
  closeTime: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
};

export type ServiceMenu = {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  category: string;
  sortOrder: number;
};

export type ServiceOption = { id: string; businessId: string; name: string; price: number };

export type Customer = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  createdAt: string;
};

export type Pet = {
  id: string;
  customerId: string;
  name: string;
  breed: string;
  weightKg: number;
  age: number;
  avatarColor: string;
  note: string;
};

export type ReservationStatus = "PENDING_APPROVAL" | "CONFIRMED" | "COMPLETED" | "CANCELED";

export type Reservation = {
  id: string;
  businessId: string;
  customerId: string;
  petId: string;
  serviceMenuId: string;
  staffName: string;
  scheduledAt: string;
  status: ReservationStatus;
  requestNote: string;
  totalPrice: number;
  depositPrice: number;
  depositPaid: number;
  createdAt: string;
  completedAt: string | null;
};

export type ChatThread = {
  id: string;
  businessId: string;
  customerId: string;
  reservationId: string | null;
  lastMessageAt: string;
  customerUnread: number;
  businessUnread: number;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderType: "CUSTOMER" | "BUSINESS";
  content: string;
  createdAt: string;
};

export type Stay = {
  id: string;
  businessId: string;
  petId: string;
  checkIn: string;
  checkOut: string;
  status: "CHECKED_IN" | "CHECKED_OUT" | "RESERVED";
};

export type Notice = { id: string; businessId: string; title: string; body: string; createdAt: string };

// ---------- Business ----------
export async function createBusiness(data: Omit<Business, "id" | "createdAt">): Promise<Business> {
  const id = newId("biz");
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO businesses (id, name, email, password_hash, district, address, phone, description, hero_color, categories, open_time, close_time, rating, review_count, created_at)
       VALUES (@id, @name, @email, @passwordHash, @district, @address, @phone, @description, @heroColor, @categories, @openTime, @closeTime, @rating, @reviewCount, @createdAt)`
    )
    .run({ id, createdAt, ...data });
  return (await getBusinessById(id))!;
}

export async function getBusinessByEmail(email: string): Promise<Business | undefined> {
  return db.prepare(`SELECT * FROM businesses WHERE email = ?`).get(email);
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  return db.prepare(`SELECT * FROM businesses WHERE id = ?`).get(id);
}

export async function listBusinesses(): Promise<Business[]> {
  return db.prepare(`SELECT * FROM businesses ORDER BY created_at DESC`).all();
}

export async function listBusinessesByCategory(categoryCode: string): Promise<Business[]> {
  const all = await listBusinesses();
  return all.filter((b) =>
    b.categories
      .split(",")
      .map((c) => c.trim())
      .includes(categoryCode)
  );
}

export async function listServicesByBusiness(businessId: string): Promise<ServiceMenu[]> {
  return db
    .prepare(`SELECT * FROM service_menus WHERE business_id = ? ORDER BY sort_order ASC, price ASC`)
    .all(businessId);
}

export async function getServiceById(id: string): Promise<ServiceMenu | undefined> {
  return db.prepare(`SELECT * FROM service_menus WHERE id = ?`).get(id);
}

export async function createServiceMenu(data: Omit<ServiceMenu, "id">): Promise<ServiceMenu> {
  const id = newId("svc");
  await db
    .prepare(
      `INSERT INTO service_menus (id, business_id, name, description, price, duration_min, category, sort_order)
       VALUES (@id, @businessId, @name, @description, @price, @durationMin, @category, @sortOrder)`
    )
    .run({ id, ...data });
  return (await getServiceById(id))!;
}

export async function listOptionsByBusiness(businessId: string): Promise<ServiceOption[]> {
  return db.prepare(`SELECT * FROM service_options WHERE business_id = ?`).all(businessId);
}

export async function createServiceOption(data: Omit<ServiceOption, "id">): Promise<ServiceOption> {
  const id = newId("opt");
  await db
    .prepare(`INSERT INTO service_options (id, business_id, name, price) VALUES (@id, @businessId, @name, @price)`)
    .run({ id, ...data });
  return db.prepare(`SELECT * FROM service_options WHERE id = ?`).get(id);
}

export async function listNoticesByBusiness(businessId: string): Promise<Notice[]> {
  return db.prepare(`SELECT * FROM notices WHERE business_id = ? ORDER BY created_at DESC`).all(businessId);
}

export async function createNotice(data: Omit<Notice, "id" | "createdAt">): Promise<Notice> {
  const id = newId("ntc");
  const createdAt = new Date().toISOString();
  await db
    .prepare(`INSERT INTO notices (id, business_id, title, body, created_at) VALUES (@id, @businessId, @title, @body, @createdAt)`)
    .run({ id, createdAt, ...data });
  return db.prepare(`SELECT * FROM notices WHERE id = ?`).get(id);
}

// ---------- Customer ----------
export async function createCustomer(data: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
  const id = newId("cus");
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO customers (id, name, email, password_hash, phone, created_at) VALUES (@id, @name, @email, @passwordHash, @phone, @createdAt)`
    )
    .run({ id, createdAt, ...data });
  return (await getCustomerById(id))!;
}

export async function getCustomerByEmail(email: string): Promise<Customer | undefined> {
  return db.prepare(`SELECT * FROM customers WHERE email = ?`).get(email);
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  return db.prepare(`SELECT * FROM customers WHERE id = ?`).get(id);
}

export async function listPetsByCustomer(customerId: string): Promise<Pet[]> {
  return db.prepare(`SELECT * FROM pets WHERE customer_id = ?`).all(customerId);
}

export async function getPetById(id: string): Promise<Pet | undefined> {
  return db.prepare(`SELECT * FROM pets WHERE id = ?`).get(id);
}

export async function createPet(data: Omit<Pet, "id">): Promise<Pet> {
  const id = newId("pet");
  await db
    .prepare(
      `INSERT INTO pets (id, customer_id, name, breed, weight_kg, age, avatar_color, note)
       VALUES (@id, @customerId, @name, @breed, @weightKg, @age, @avatarColor, @note)`
    )
    .run({ id, ...data });
  return (await getPetById(id))!;
}

// ---------- Reservations ----------
export async function createReservation(data: {
  businessId: string;
  customerId: string;
  petId: string;
  serviceMenuId: string;
  scheduledAt: string;
  requestNote: string;
  totalPrice: number;
  depositPrice: number;
  staffName: string;
  optionIds: string[];
}): Promise<Reservation> {
  const id = newId("rsv");
  const createdAt = new Date().toISOString();

  await withTransaction(async (tx) => {
    await tx
      .prepare(
        `INSERT INTO reservations (id, business_id, customer_id, pet_id, service_menu_id, staff_name, scheduled_at, request_note, total_price, deposit_price, deposit_paid, status, created_at)
         VALUES (@id, @businessId, @customerId, @petId, @serviceMenuId, @staffName, @scheduledAt, @requestNote, @totalPrice, @depositPrice, 1, 'PENDING_APPROVAL', @createdAt)`
      )
      .run({
        id,
        createdAt,
        businessId: data.businessId,
        customerId: data.customerId,
        petId: data.petId,
        serviceMenuId: data.serviceMenuId,
        staffName: data.staffName,
        scheduledAt: data.scheduledAt,
        requestNote: data.requestNote,
        totalPrice: data.totalPrice,
        depositPrice: data.depositPrice,
      });
    for (const optionId of data.optionIds) {
      await tx
        .prepare(`INSERT INTO reservation_options (id, reservation_id, service_option_id) VALUES (?, ?, ?)`)
        .run(newId("rso"), id, optionId);
    }
  });

  return (await getReservationById(id))!;
}

export async function getReservationById(id: string): Promise<Reservation | undefined> {
  return db.prepare(`SELECT * FROM reservations WHERE id = ?`).get(id);
}

export async function getReservationOptionNames(reservationId: string): Promise<ServiceOption[]> {
  return db
    .prepare(
      `SELECT so.* FROM reservation_options ro JOIN service_options so ON so.id = ro.service_option_id WHERE ro.reservation_id = ?`
    )
    .all(reservationId);
}

export type ReservationFull = Reservation & {
  petName: string;
  petBreed: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  servicePrice: number;
};

export async function listReservationsByBusiness(businessId: string): Promise<ReservationFull[]> {
  return db
    .prepare(
      `SELECT r.*, p.name as pet_name, p.breed as pet_breed, c.name as customer_name, b.name as business_name,
              sm.name as service_name, sm.price as service_price
       FROM reservations r
       JOIN pets p ON p.id = r.pet_id
       JOIN customers c ON c.id = r.customer_id
       JOIN businesses b ON b.id = r.business_id
       JOIN service_menus sm ON sm.id = r.service_menu_id
       WHERE r.business_id = ?
       ORDER BY r.scheduled_at ASC`
    )
    .all(businessId);
}

export async function listReservationsByCustomer(customerId: string): Promise<ReservationFull[]> {
  return db
    .prepare(
      `SELECT r.*, p.name as pet_name, p.breed as pet_breed, c.name as customer_name, b.name as business_name,
              sm.name as service_name, sm.price as service_price
       FROM reservations r
       JOIN pets p ON p.id = r.pet_id
       JOIN customers c ON c.id = r.customer_id
       JOIN businesses b ON b.id = r.business_id
       JOIN service_menus sm ON sm.id = r.service_menu_id
       WHERE r.customer_id = ?
       ORDER BY r.scheduled_at DESC`
    )
    .all(customerId);
}

export async function getNextReservationForCustomer(customerId: string): Promise<ReservationFull | undefined> {
  const nowIso = new Date().toISOString();
  const all = await listReservationsByCustomer(customerId);
  return all
    .filter((r) => r.status !== "CANCELED" && r.status !== "COMPLETED" && r.scheduledAt >= nowIso)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
}

export async function updateReservationStatus(id: string, status: ReservationStatus) {
  const completedAt = status === "COMPLETED" ? new Date().toISOString() : null;
  await db.prepare(`UPDATE reservations SET status = ?, completed_at = ? WHERE id = ?`).run(status, completedAt, id);
  return getReservationById(id);
}

// ---------- Stays ----------
export async function listStaysByBusiness(businessId: string): Promise<(Stay & { petName: string; petBreed: string })[]> {
  return db
    .prepare(
      `SELECT s.*, p.name as pet_name, p.breed as pet_breed FROM stays s JOIN pets p ON p.id = s.pet_id WHERE s.business_id = ? ORDER BY check_in ASC`
    )
    .all(businessId);
}

export async function createStay(data: Omit<Stay, "id">) {
  const id = newId("stay");
  await db
    .prepare(
      `INSERT INTO stays (id, business_id, pet_id, check_in, check_out, status) VALUES (@id, @businessId, @petId, @checkIn, @checkOut, @status)`
    )
    .run({ id, ...data });
}

// ---------- Chat ----------
export async function getOrCreateThread(businessId: string, customerId: string, reservationId?: string): Promise<ChatThread> {
  const existing: ChatThread | undefined = await db
    .prepare(`SELECT * FROM chat_threads WHERE business_id = ? AND customer_id = ?`)
    .get(businessId, customerId);
  if (existing) {
    if (reservationId && !existing.reservationId) {
      await db.prepare(`UPDATE chat_threads SET reservation_id = ? WHERE id = ?`).run(reservationId, existing.id);
      return { ...existing, reservationId };
    }
    return existing;
  }
  const id = newId("thr");
  const now = new Date().toISOString();
  await db
    .prepare(`INSERT INTO chat_threads (id, business_id, customer_id, reservation_id, last_message_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id, businessId, customerId, reservationId ?? null, now);
  return db.prepare(`SELECT * FROM chat_threads WHERE id = ?`).get(id);
}

export async function getThreadById(id: string): Promise<ChatThread | undefined> {
  return db.prepare(`SELECT * FROM chat_threads WHERE id = ?`).get(id);
}

export type ThreadWithParty = ChatThread & {
  businessName: string;
  businessHeroColor: string;
  customerName: string;
  lastMessage: string | null;
};

export async function listThreadsByBusiness(businessId: string): Promise<ThreadWithParty[]> {
  return db
    .prepare(
      `SELECT t.*, b.name as business_name, b.hero_color as business_hero_color, c.name as customer_name,
        (SELECT content FROM chat_messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message
       FROM chat_threads t
       JOIN businesses b ON b.id = t.business_id
       JOIN customers c ON c.id = t.customer_id
       WHERE t.business_id = ?
       ORDER BY t.last_message_at DESC`
    )
    .all(businessId);
}

export async function listThreadsByCustomer(customerId: string): Promise<ThreadWithParty[]> {
  return db
    .prepare(
      `SELECT t.*, b.name as business_name, b.hero_color as business_hero_color, c.name as customer_name,
        (SELECT content FROM chat_messages m WHERE m.thread_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message
       FROM chat_threads t
       JOIN businesses b ON b.id = t.business_id
       JOIN customers c ON c.id = t.customer_id
       WHERE t.customer_id = ?
       ORDER BY t.last_message_at DESC`
    )
    .all(customerId);
}

export async function listMessages(threadId: string): Promise<ChatMessage[]> {
  return db.prepare(`SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC`).all(threadId);
}

export async function sendMessage(threadId: string, senderType: "CUSTOMER" | "BUSINESS", content: string): Promise<ChatMessage> {
  const id = newId("msg");
  const now = new Date().toISOString();
  await db
    .prepare(`INSERT INTO chat_messages (id, thread_id, sender_type, content, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id, threadId, senderType, content, now);
  const unreadCol = senderType === "CUSTOMER" ? "business_unread" : "customer_unread";
  await db
    .prepare(`UPDATE chat_threads SET last_message_at = ?, ${unreadCol} = ${unreadCol} + 1 WHERE id = ?`)
    .run(now, threadId);
  return db.prepare(`SELECT * FROM chat_messages WHERE id = ?`).get(id);
}

export async function markThreadRead(threadId: string, role: "CUSTOMER" | "BUSINESS") {
  const col = role === "CUSTOMER" ? "customer_unread" : "business_unread";
  await db.prepare(`UPDATE chat_threads SET ${col} = 0 WHERE id = ?`).run(threadId);
}

export async function countUnreadThreads(businessOrCustomerId: string, role: "CUSTOMER" | "BUSINESS") {
  const col = role === "CUSTOMER" ? "customer_id" : "business_id";
  const unreadCol = role === "CUSTOMER" ? "customer_unread" : "business_unread";
  const row: { n: number } = await db
    .prepare(`SELECT COUNT(*) as n FROM chat_threads WHERE ${col} = ? AND ${unreadCol} > 0`)
    .get(businessOrCustomerId);
  return Number(row.n);
}

export async function oldestUnreadThreadMinutesAgo(businessId: string): Promise<number | null> {
  const row: { createdAt: string } | undefined = await db
    .prepare(
      `SELECT m.created_at as created_at FROM chat_threads t
       JOIN chat_messages m ON m.thread_id = t.id
       WHERE t.business_id = ? AND t.business_unread > 0
       ORDER BY m.created_at ASC LIMIT 1`
    )
    .get(businessId);
  if (!row) return null;
  return Math.max(0, Math.round((Date.now() - new Date(row.createdAt).getTime()) / 60000));
}

export type CustomerWithPets = Customer & { pets: Pet[]; reservationCount: number; lastVisit: string | null };

export async function listCustomersForBusiness(businessId: string): Promise<CustomerWithPets[]> {
  const customerIds: { customerId: string }[] = await db
    .prepare(
      `SELECT DISTINCT customer_id as customer_id FROM reservations WHERE business_id = ?
       UNION
       SELECT DISTINCT customer_id as customer_id FROM chat_threads WHERE business_id = ?`
    )
    .all(businessId, businessId);

  const result: CustomerWithPets[] = [];
  for (const { customerId } of customerIds) {
    const customer = (await getCustomerById(customerId))!;
    const pets = await listPetsByCustomer(customerId);
    const stats: { n: number; last: string | null } = await db
      .prepare(`SELECT COUNT(*) as n, MAX(scheduled_at) as last FROM reservations WHERE business_id = ? AND customer_id = ?`)
      .get(businessId, customerId);
    result.push({ ...customer, pets, reservationCount: Number(stats.n), lastVisit: stats.last });
  }
  return result.sort((a, b) => (b.lastVisit ?? "").localeCompare(a.lastVisit ?? ""));
}

// ---------- Dashboard ----------
export async function getBusinessDashboard(businessId: string) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const all = await listReservationsByBusiness(businessId);
  const todays = all.filter((r) => r.scheduledAt.slice(0, 10) === todayStr && r.status !== "CANCELED");
  const completedToday = todays.filter((r) => r.status === "COMPLETED");
  const remainingToday = todays.filter((r) => r.status !== "COMPLETED");
  const pending = all.filter((r) => r.status === "PENDING_APPROVAL");

  const stays = await listStaysByBusiness(businessId);
  const activeStays = stays.filter((s) => s.status === "CHECKED_IN");
  const checkInToday = stays.filter((s) => s.checkIn.slice(0, 10) === todayStr).length;
  const checkOutToday = stays.filter((s) => s.checkOut.slice(0, 10) === todayStr).length;

  const unreadThreads = await countUnreadThreads(businessId, "BUSINESS");
  const oldestUnreadMin = await oldestUnreadThreadMinutesAgo(businessId);

  const todayRevenue = todays.reduce((sum, r) => sum + r.totalPrice, 0);
  const pendingSettlement = all
    .filter((r) => r.status === "CONFIRMED" || r.status === "COMPLETED")
    .reduce((sum, r) => sum + r.totalPrice, 0);

  return {
    todayStr,
    groomingTotal: todays.length,
    groomingCompleted: completedToday.length,
    groomingRemaining: remainingToday.length,
    staysActive: activeStays.length,
    checkInToday,
    checkOutToday,
    pendingApprovalCount: pending.length,
    unreadThreadCount: unreadThreads,
    oldestUnreadMin,
    todayRevenue,
    pendingSettlement,
    todayTasks: [...remainingToday, ...pending].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
  };
}
