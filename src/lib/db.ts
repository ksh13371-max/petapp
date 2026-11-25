import { Pool, type PoolClient } from "pg";

type Queryable = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>;
};

declare global {
  var __petPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
const isLocal = !!connectionString && /localhost|127\.0\.0\.1/.test(connectionString);

export const pool =
  global.__petPool ??
  new Pool({
    connectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    max: 5,
  });
if (process.env.NODE_ENV !== "production") global.__petPool = pool;

// ---- snake_case (DB) <-> camelCase (app) ----
function camelize(key: string) {
  return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}
function camelizeRow<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const k in row) out[camelize(k)] = row[k];
  return out as T;
}

// ---- parse `@camelName` / `?` placeholders into Postgres `$1, $2, ...` ----
function toPgQuery(sql: string) {
  const names: (string | null)[] = [];
  let i = 0;
  const text = sql.replace(/@(\w+)|\?/g, (_match, name?: string) => {
    i++;
    names.push(name ?? null);
    return `$${i}`;
  });
  return { text, names };
}

function resolveParams(names: (string | null)[], args: unknown[]): unknown[] {
  if (names.some((n) => n !== null)) {
    const obj = (args[0] ?? {}) as Record<string, unknown>;
    return names.map((n) => (n ? (obj[n] ?? null) : null));
  }
  return args;
}

function wrapStatement(queryable: Queryable, sql: string) {
  const { text, names } = toPgQuery(sql);
  return {
    run: async (...args: unknown[]) => {
      await ensureSchema();
      const values = resolveParams(names, args);
      const res = await queryable.query(text, values);
      return { changes: res.rowCount ?? 0 };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get: async (...args: any[]): Promise<any> => {
      await ensureSchema();
      const values = resolveParams(names, args);
      const res = await queryable.query(text, values);
      return res.rows[0] ? camelizeRow(res.rows[0]) : undefined;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    all: async (...args: any[]): Promise<any[]> => {
      await ensureSchema();
      const values = resolveParams(names, args);
      const res = await queryable.query(text, values);
      return res.rows.map((r) => camelizeRow(r));
    },
  };
}

function makeDb(queryable: Queryable) {
  return {
    exec: async (sql: string) => {
      await queryable.query(sql);
    },
    prepare: (sql: string) => wrapStatement(queryable, sql),
  };
}

export const db = makeDb(pool);
export type Db = ReturnType<typeof makeDb>;

export async function withTransaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client: PoolClient = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(makeDb(client));
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function runInitSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      district TEXT NOT NULL DEFAULT '강남구 역삼동',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      hero_color TEXT NOT NULL DEFAULT '#f4d9c6',
      categories TEXT NOT NULL DEFAULT 'GROOMING',
      open_time TEXT NOT NULL DEFAULT '10:00',
      close_time TEXT NOT NULL DEFAULT '19:00',
      rating REAL NOT NULL DEFAULT 4.8,
      review_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_menus (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      duration_min INTEGER NOT NULL DEFAULT 60,
      category TEXT NOT NULL DEFAULT 'GROOMING',
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS service_options (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      breed TEXT NOT NULL,
      weight_kg REAL NOT NULL,
      age INTEGER NOT NULL,
      avatar_color TEXT NOT NULL DEFAULT '#f4d9c6',
      note TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      service_menu_id TEXT NOT NULL REFERENCES service_menus(id),
      staff_name TEXT NOT NULL DEFAULT '담당자',
      scheduled_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
      request_note TEXT NOT NULL DEFAULT '',
      total_price INTEGER NOT NULL,
      deposit_price INTEGER NOT NULL DEFAULT 20000,
      deposit_paid INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS reservation_options (
      id TEXT PRIMARY KEY,
      reservation_id TEXT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
      service_option_id TEXT NOT NULL REFERENCES service_options(id)
    );

    CREATE TABLE IF NOT EXISTS stays (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'RESERVED'
    );

    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_threads (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      reservation_id TEXT REFERENCES reservations(id),
      last_message_at TEXT NOT NULL,
      customer_unread INTEGER NOT NULL DEFAULT 0,
      business_unread INTEGER NOT NULL DEFAULT 0,
      UNIQUE(business_id, customer_id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reservations_business ON reservations(business_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id);
  `);
}

declare global {
  var __petSchemaReady: Promise<void> | undefined;
}

export function ensureSchema(): Promise<void> {
  if (!global.__petSchemaReady) global.__petSchemaReady = runInitSchema();
  return global.__petSchemaReady;
}

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
}
