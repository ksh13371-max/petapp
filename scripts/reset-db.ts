import { pool, ensureSchema } from "../src/lib/db";

async function main() {
  await ensureSchema();
  await pool.query(`
    TRUNCATE TABLE
      chat_messages, chat_threads, reservation_options, reservations, stays,
      notices, service_options, service_menus, staff, pets, customers, businesses
    RESTART IDENTITY CASCADE
  `);
  console.log("All tables truncated.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
