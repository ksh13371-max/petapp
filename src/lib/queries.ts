import { db, newId } from "./db";

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
export function createBusiness(data: Omit<Business, "id" | "createdAt">): Business {
  const id = newId("biz");
  db.prepare(
    `INSERT INTO businesses (id, name, email, passwordHash, district, address, phone, description, heroColor, openTime, closeTime, rating, reviewCount)
     VALUES (@id, @name, @email, @passwordHash, @district, @address, @phone, @description, @heroColor, @openTime, @closeTime, @rating, @reviewCount)`
  ).run({ id, ...data });
  return getBusinessById(id)!;
}

export function getBusinessByEmail(email: string): Business | undefined {
  return db.prepare(`SELECT * FROM businesses WHERE email = ?`).get(email) as Business | undefined;
}

export function getBusinessById(id: string): Business | undefined {
  return db.prepare(`SELECT * FROM businesses WHERE id = ?`).get(id) as Business | undefined;
}

export function listBusinesses(): Business[] {
  return db.prepare(`SELECT * FROM businesses ORDER BY createdAt DESC`).all() as Business[];
}

export function listServicesByBusiness(businessId: string): ServiceMenu[] {
  return db
    .prepare(`SELECT * FROM service_menus WHERE businessId = ? ORDER BY sortOrder ASC, price ASC`)
    .all(businessId) as ServiceMenu[];
}

export function getServiceById(id: string): ServiceMenu | undefined {
  return db.prepare(`SELECT * FROM service_menus WHERE id = ?`).get(id) as ServiceMenu | undefined;
}

export function createServiceMenu(data: Omit<ServiceMenu, "id">): ServiceMenu {
  const id = newId("svc");
  db.prepare(
    `INSERT INTO service_menus (id, businessId, name, description, price, durationMin, category, sortOrder)
     VALUES (@id, @businessId, @name, @description, @price, @durationMin, @category, @sortOrder)`
  ).run({ id, ...data });
  return getServiceById(id)!;
}

export function listOptionsByBusiness(businessId: string): ServiceOption[] {
  return db.prepare(`SELECT * FROM service_options WHERE businessId = ?`).all(businessId) as ServiceOption[];
}

export function createServiceOption(data: Omit<ServiceOption, "id">): ServiceOption {
  const id = newId("opt");
  db.prepare(`INSERT INTO service_options (id, businessId, name, price) VALUES (@id, @businessId, @name, @price)`).run({
    id,
    ...data,
  });
  return db.prepare(`SELECT * FROM service_options WHERE id = ?`).get(id) as ServiceOption;
}

export function listNoticesByBusiness(businessId: string): Notice[] {
  return db.prepare(`SELECT * FROM notices WHERE businessId = ? ORDER BY createdAt DESC`).all(businessId) as Notice[];
}

export function createNotice(data: Omit<Notice, "id" | "createdAt">): Notice {
  const id = newId("ntc");
  db.prepare(`INSERT INTO notices (id, businessId, title, body) VALUES (@id, @businessId, @title, @body)`).run({
    id,
    ...data,
  });
  return db.prepare(`SELECT * FROM notices WHERE id = ?`).get(id) as Notice;
}

// ---------- Customer ----------
export function createCustomer(data: Omit<Customer, "id" | "createdAt">): Customer {
  const id = newId("cus");
  db.prepare(
    `INSERT INTO customers (id, name, email, passwordHash, phone) VALUES (@id, @name, @email, @passwordHash, @phone)`
  ).run({ id, ...data });
  return getCustomerById(id)!;
}

export function getCustomerByEmail(email: string): Customer | undefined {
  return db.prepare(`SELECT * FROM customers WHERE email = ?`).get(email) as Customer | undefined;
}

export function getCustomerById(id: string): Customer | undefined {
  return db.prepare(`SELECT * FROM customers WHERE id = ?`).get(id) as Customer | undefined;
}

export function listPetsByCustomer(customerId: string): Pet[] {
  return db.prepare(`SELECT * FROM pets WHERE customerId = ?`).all(customerId) as Pet[];
}

export function getPetById(id: string): Pet | undefined {
  return db.prepare(`SELECT * FROM pets WHERE id = ?`).get(id) as Pet | undefined;
}

export function createPet(data: Omit<Pet, "id">): Pet {
  const id = newId("pet");
  db.prepare(
    `INSERT INTO pets (id, customerId, name, breed, weightKg, age, avatarColor, note)
     VALUES (@id, @customerId, @name, @breed, @weightKg, @age, @avatarColor, @note)`
  ).run({ id, ...data });
  return getPetById(id)!;
}

// ---------- Reservations ----------
export function createReservation(data: {
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
}): Reservation {
  const id = newId("rsv");
  db.exec("BEGIN");
  try {
    db.prepare(
      `INSERT INTO reservations (id, businessId, customerId, petId, serviceMenuId, staffName, scheduledAt, requestNote, totalPrice, depositPrice, depositPaid, status)
       VALUES (@id, @businessId, @customerId, @petId, @serviceMenuId, @staffName, @scheduledAt, @requestNote, @totalPrice, @depositPrice, 1, 'PENDING_APPROVAL')`
    ).run({
      id,
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
      db.prepare(`INSERT INTO reservation_options (id, reservationId, serviceOptionId) VALUES (?, ?, ?)`).run(
        newId("rso"),
        id,
        optionId
      );
    }
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  return getReservationById(id)!;
}

export function getReservationById(id: string): Reservation | undefined {
  return db.prepare(`SELECT * FROM reservations WHERE id = ?`).get(id) as Reservation | undefined;
}

export function getReservationOptionNames(reservationId: string): ServiceOption[] {
  return db
    .prepare(
      `SELECT so.* FROM reservation_options ro JOIN service_options so ON so.id = ro.serviceOptionId WHERE ro.reservationId = ?`
    )
    .all(reservationId) as ServiceOption[];
}

export type ReservationFull = Reservation & {
  petName: string;
  petBreed: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  servicePrice: number;
};

export function listReservationsByBusiness(businessId: string): ReservationFull[] {
  return db
    .prepare(
      `SELECT r.*, p.name as petName, p.breed as petBreed, c.name as customerName, b.name as businessName,
              sm.name as serviceName, sm.price as servicePrice
       FROM reservations r
       JOIN pets p ON p.id = r.petId
       JOIN customers c ON c.id = r.customerId
       JOIN businesses b ON b.id = r.businessId
       JOIN service_menus sm ON sm.id = r.serviceMenuId
       WHERE r.businessId = ?
       ORDER BY r.scheduledAt ASC`
    )
    .all(businessId) as ReservationFull[];
}

export function listReservationsByCustomer(customerId: string): ReservationFull[] {
  return db
    .prepare(
      `SELECT r.*, p.name as petName, p.breed as petBreed, c.name as customerName, b.name as businessName,
              sm.name as serviceName, sm.price as servicePrice
       FROM reservations r
       JOIN pets p ON p.id = r.petId
       JOIN customers c ON c.id = r.customerId
       JOIN businesses b ON b.id = r.businessId
       JOIN service_menus sm ON sm.id = r.serviceMenuId
       WHERE r.customerId = ?
       ORDER BY r.scheduledAt DESC`
    )
    .all(customerId) as ReservationFull[];
}

export function getNextReservationForCustomer(customerId: string): ReservationFull | undefined {
  const nowIso = new Date().toISOString();
  return listReservationsByCustomer(customerId)
    .filter((r) => r.status !== "CANCELED" && r.status !== "COMPLETED" && r.scheduledAt >= nowIso)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0];
}

export function updateReservationStatus(id: string, status: ReservationStatus) {
  const completedAt = status === "COMPLETED" ? new Date().toISOString() : null;
  db.prepare(`UPDATE reservations SET status = ?, completedAt = ? WHERE id = ?`).run(status, completedAt, id);
  return getReservationById(id);
}

// ---------- Stays ----------
export function listStaysByBusiness(businessId: string) {
  return db
    .prepare(
      `SELECT s.*, p.name as petName, p.breed as petBreed FROM stays s JOIN pets p ON p.id = s.petId WHERE s.businessId = ? ORDER BY checkIn ASC`
    )
    .all(businessId) as (Stay & { petName: string; petBreed: string })[];
}

export function createStay(data: Omit<Stay, "id">) {
  const id = newId("stay");
  db.prepare(
    `INSERT INTO stays (id, businessId, petId, checkIn, checkOut, status) VALUES (@id, @businessId, @petId, @checkIn, @checkOut, @status)`
  ).run({ id, ...data });
}

// ---------- Chat ----------
export function getOrCreateThread(businessId: string, customerId: string, reservationId?: string): ChatThread {
  const existing = db
    .prepare(`SELECT * FROM chat_threads WHERE businessId = ? AND customerId = ?`)
    .get(businessId, customerId) as ChatThread | undefined;
  if (existing) {
    if (reservationId && !existing.reservationId) {
      db.prepare(`UPDATE chat_threads SET reservationId = ? WHERE id = ?`).run(reservationId, existing.id);
      return { ...existing, reservationId };
    }
    return existing;
  }
  const id = newId("thr");
  db.prepare(
    `INSERT INTO chat_threads (id, businessId, customerId, reservationId) VALUES (?, ?, ?, ?)`
  ).run(id, businessId, customerId, reservationId ?? null);
  return db.prepare(`SELECT * FROM chat_threads WHERE id = ?`).get(id) as ChatThread;
}

export function getThreadById(id: string): ChatThread | undefined {
  return db.prepare(`SELECT * FROM chat_threads WHERE id = ?`).get(id) as ChatThread | undefined;
}

export type ThreadWithParty = ChatThread & {
  businessName: string;
  businessHeroColor: string;
  customerName: string;
  lastMessage: string | null;
};

export function listThreadsByBusiness(businessId: string): ThreadWithParty[] {
  return db
    .prepare(
      `SELECT t.*, b.name as businessName, b.heroColor as businessHeroColor, c.name as customerName,
        (SELECT content FROM chat_messages m WHERE m.threadId = t.id ORDER BY m.createdAt DESC LIMIT 1) as lastMessage
       FROM chat_threads t
       JOIN businesses b ON b.id = t.businessId
       JOIN customers c ON c.id = t.customerId
       WHERE t.businessId = ?
       ORDER BY t.lastMessageAt DESC`
    )
    .all(businessId) as ThreadWithParty[];
}

export function listThreadsByCustomer(customerId: string): ThreadWithParty[] {
  return db
    .prepare(
      `SELECT t.*, b.name as businessName, b.heroColor as businessHeroColor, c.name as customerName,
        (SELECT content FROM chat_messages m WHERE m.threadId = t.id ORDER BY m.createdAt DESC LIMIT 1) as lastMessage
       FROM chat_threads t
       JOIN businesses b ON b.id = t.businessId
       JOIN customers c ON c.id = t.customerId
       WHERE t.customerId = ?
       ORDER BY t.lastMessageAt DESC`
    )
    .all(customerId) as ThreadWithParty[];
}

export function listMessages(threadId: string): ChatMessage[] {
  return db.prepare(`SELECT * FROM chat_messages WHERE threadId = ? ORDER BY createdAt ASC`).all(threadId) as ChatMessage[];
}

export function sendMessage(threadId: string, senderType: "CUSTOMER" | "BUSINESS", content: string): ChatMessage {
  const id = newId("msg");
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO chat_messages (id, threadId, senderType, content, createdAt) VALUES (?, ?, ?, ?, ?)`).run(
    id,
    threadId,
    senderType,
    content,
    now
  );
  const unreadField = senderType === "CUSTOMER" ? "businessUnread" : "customerUnread";
  db.prepare(`UPDATE chat_threads SET lastMessageAt = ?, ${unreadField} = ${unreadField} + 1 WHERE id = ?`).run(now, threadId);
  return db.prepare(`SELECT * FROM chat_messages WHERE id = ?`).get(id) as ChatMessage;
}

export function markThreadRead(threadId: string, role: "CUSTOMER" | "BUSINESS") {
  const field = role === "CUSTOMER" ? "customerUnread" : "businessUnread";
  db.prepare(`UPDATE chat_threads SET ${field} = 0 WHERE id = ?`).run(threadId);
}

export function countUnreadThreads(businessOrCustomerId: string, role: "CUSTOMER" | "BUSINESS") {
  const col = role === "CUSTOMER" ? "customerId" : "businessId";
  const unreadCol = role === "CUSTOMER" ? "customerUnread" : "businessUnread";
  const row = db
    .prepare(`SELECT COUNT(*) as n FROM chat_threads WHERE ${col} = ? AND ${unreadCol} > 0`)
    .get(businessOrCustomerId) as { n: number };
  return row.n;
}

export function oldestUnreadThreadMinutesAgo(businessId: string): number | null {
  const row = db
    .prepare(
      `SELECT m.createdAt as createdAt FROM chat_threads t
       JOIN chat_messages m ON m.threadId = t.id
       WHERE t.businessId = ? AND t.businessUnread > 0
       ORDER BY m.createdAt ASC LIMIT 1`
    )
    .get(businessId) as { createdAt: string } | undefined;
  if (!row) return null;
  return Math.max(0, Math.round((Date.now() - new Date(row.createdAt).getTime()) / 60000));
}

export type CustomerWithPets = Customer & { pets: Pet[]; reservationCount: number; lastVisit: string | null };

export function listCustomersForBusiness(businessId: string): CustomerWithPets[] {
  const customerIds = db
    .prepare(
      `SELECT DISTINCT customerId FROM reservations WHERE businessId = ?
       UNION
       SELECT DISTINCT customerId FROM chat_threads WHERE businessId = ?`
    )
    .all(businessId, businessId) as { customerId: string }[];

  return customerIds
    .map(({ customerId }) => {
      const customer = getCustomerById(customerId)!;
      const pets = listPetsByCustomer(customerId);
      const stats = db
        .prepare(
          `SELECT COUNT(*) as n, MAX(scheduledAt) as last FROM reservations WHERE businessId = ? AND customerId = ?`
        )
        .get(businessId, customerId) as { n: number; last: string | null };
      return { ...customer, pets, reservationCount: stats.n, lastVisit: stats.last };
    })
    .sort((a, b) => (b.lastVisit ?? "").localeCompare(a.lastVisit ?? ""));
}

// ---------- Dashboard ----------
export function getBusinessDashboard(businessId: string) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const all = listReservationsByBusiness(businessId);
  const todays = all.filter((r) => r.scheduledAt.slice(0, 10) === todayStr && r.status !== "CANCELED");
  const completedToday = todays.filter((r) => r.status === "COMPLETED");
  const remainingToday = todays.filter((r) => r.status !== "COMPLETED");
  const pending = all.filter((r) => r.status === "PENDING_APPROVAL");

  const stays = listStaysByBusiness(businessId);
  const activeStays = stays.filter((s) => s.status === "CHECKED_IN");
  const checkInToday = stays.filter((s) => s.checkIn.slice(0, 10) === todayStr).length;
  const checkOutToday = stays.filter((s) => s.checkOut.slice(0, 10) === todayStr).length;

  const unreadThreads = countUnreadThreads(businessId, "BUSINESS");
  const oldestUnreadMin = oldestUnreadThreadMinutesAgo(businessId);

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
