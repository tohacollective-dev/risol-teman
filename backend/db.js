const { Pool } = require('pg');

// In production set DATABASE_URL to your Supabase connection string.
// Locally, falls back to a local postgres URL or can be overridden.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id         SERIAL PRIMARY KEY,
      name       TEXT    NOT NULL,
      category   TEXT    NOT NULL DEFAULT 'Risol',
      price      INTEGER NOT NULL DEFAULT 0,
      modal      INTEGER NOT NULL DEFAULT 0,
      stock      INTEGER NOT NULL DEFAULT 0,
      min_stock  INTEGER NOT NULL DEFAULT 10,
      unit       TEXT    NOT NULL DEFAULT 'pcs',
      emoji      TEXT    NOT NULL DEFAULT '🥐',
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT    NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          SERIAL PRIMARY KEY,
      date        TEXT    NOT NULL DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
      total       INTEGER NOT NULL DEFAULT 0,
      modal_total INTEGER NOT NULL DEFAULT 0,
      payment     INTEGER NOT NULL DEFAULT 0,
      change      INTEGER NOT NULL DEFAULT 0,
      note        TEXT,
      created_at  TEXT    NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id             SERIAL PRIMARY KEY,
      transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      product_id     INTEGER REFERENCES products(id),
      name           TEXT    NOT NULL,
      price          INTEGER NOT NULL,
      modal          INTEGER NOT NULL DEFAULT 0,
      qty            INTEGER NOT NULL DEFAULT 1
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stock_log (
      id         SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      delta      INTEGER NOT NULL,
      reason     TEXT    NOT NULL DEFAULT 'manual',
      note       TEXT,
      created_at TEXT    NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
    )
  `);

  // Migrasi: tambah kolom yang mungkin hilang di tabel yang sudah ada sebelumnya
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category   TEXT    NOT NULL DEFAULT 'Risol'`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS unit       TEXT    NOT NULL DEFAULT 'pcs'`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS active     INTEGER NOT NULL DEFAULT 1`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS modal      INTEGER NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock  INTEGER NOT NULL DEFAULT 10`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS emoji      TEXT    NOT NULL DEFAULT '🥐'`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TEXT    NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')`);
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS date        TEXT    NOT NULL DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')`);
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS modal_total INTEGER NOT NULL DEFAULT 0`);
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS note        TEXT`);
  await pool.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_at  TEXT    NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')`);
  await pool.query(`ALTER TABLE transaction_items ADD COLUMN IF NOT EXISTS modal INTEGER NOT NULL DEFAULT 0`);
}

module.exports = { pool, initDb };
