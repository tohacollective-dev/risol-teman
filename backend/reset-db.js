require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function reset() {
  console.log('Dropping old tables...');
  await pool.query(`DROP TABLE IF EXISTS stock_log CASCADE`);
  await pool.query(`DROP TABLE IF EXISTS transaction_items CASCADE`);
  await pool.query(`DROP TABLE IF EXISTS transactions CASCADE`);
  await pool.query(`DROP TABLE IF EXISTS products CASCADE`);
  console.log('Recreating tables...');
  await pool.query(`
    CREATE TABLE products (
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
    CREATE TABLE transactions (
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
    CREATE TABLE transaction_items (
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
    CREATE TABLE stock_log (
      id         SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      delta      INTEGER NOT NULL,
      reason     TEXT    NOT NULL DEFAULT 'manual',
      note       TEXT,
      created_at TEXT    NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS')
    )
  `);
  console.log('✓ Done! Tables created fresh.');
  await pool.end();
}

reset().catch(err => { console.error('✗', err.message); process.exit(1); });
