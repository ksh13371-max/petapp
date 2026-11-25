import { DatabaseSync, type StatementSync } from "node:sqlite";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

// node:sqlite returns rows as null-prototype objects, which React Server
// Components refuse to pass to Client Components. Shallow-copy to plain
// objects so DB rows can flow straight into props.
function toPlain(row: unknown) {
  return row == null ? row : { ...(row as object) };
}

function wrapStatement(stmt: StatementSync) {
  return {
    run: stmt.run.bind(stmt),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: (...args: any[]) => toPlain((stmt.get as any)(...args)),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    all: (...args: any[]) => (stmt.all as any)(...args).map(toPlain),
  };
}

export interface Db {
  exec: DatabaseSync["exec"];
  prepare: (sql: string) => ReturnType<typeof wrapStatement>;
}

declare global {
  var __petDb: Db | undefined;
}

function createConnection(): Db {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const raw = new DatabaseSync(DB_PATH);
  raw.exec("PRAGMA journal_mode = WAL");
  raw.exec("PRAGMA foreign_keys = ON");
  return {
    exec: raw.exec.bind(raw),
    prepare: (sql: string) => wrapStatement(raw.prepare(sql)),
  };
}

export const db = global.__petDb ?? createConnection();
if (process.env.NODE_ENV !== "production") global.__petDb = db;

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      district TEXT NOT NULL DEFAULT '강남구 역삼동',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      heroColor TEXT NOT NULL DEFAULT '#f4d9c6',
      categories TEXT NOT NULL DEFAULT 'GROOMING',
      openTime TEXT NOT NULL DEFAULT '10:00',
      closeTime TEXT NOT NULL DEFAULT '19:00',
      rating REAL NOT NULL DEFAULT 4.8,
      reviewCount INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_menus (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      durationMin INTEGER NOT NULL DEFAULT 60,
      category TEXT NOT NULL DEFAULT 'GROOMING',
      sortOrder INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS service_options (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      breed TEXT NOT NULL,
      weightKg REAL NOT NULL,
      age INTEGER NOT NULL,
      avatarColor TEXT NOT NULL DEFAULT '#f4d9c6',
      note TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customerId TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      petId TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      serviceMenuId TEXT NOT NULL REFERENCES service_menus(id),
      staffName TEXT NOT NULL DEFAULT '담당자',
      scheduledAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
      requestNote TEXT NOT NULL DEFAULT '',
      totalPrice INTEGER NOT NULL,
      depositPrice INTEGER NOT NULL DEFAULT 20000,
      depositPaid INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      completedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS reservation_options (
      id TEXT PRIMARY KEY,
      reservationId TEXT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      serviceOptionId TEXT NOT NULL REFERENCES service_options(id)
    );

    CREATE TABLE IF NOT EXISTS stays (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      petId TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      checkIn TEXT NOT NULL,
      checkOut TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'RESERVED'
    );

    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_threads (
      id TEXT PRIMARY KEY,
      businessId TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customerId TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      reservationId TEXT REFERENCES reservations(id),
      lastMessageAt TEXT NOT NULL DEFAULT (datetime('now')),
      customerUnread INTEGER NOT NULL DEFAULT 0,
      businessUnread INTEGER NOT NULL DEFAULT 0,
      UNIQUE(businessId, customerId)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      threadId TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
      senderType TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_business ON reservations(businessId);
    CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customerId);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(threadId);
  `);

  // Migration for databases created before the `categories` column existed.
  const hasCategories = (
    db.prepare(`PRAGMA table_info(businesses)`).all() as { name: string }[]
  ).some((col) => col.name === "categories");
  if (!hasCategories) {
    db.exec(`ALTER TABLE businesses ADD COLUMN categories TEXT NOT NULL DEFAULT 'GROOMING'`);
  }
}

initSchema();

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}
