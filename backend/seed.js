const db = require('./db');

const products = [
  { name: 'Risol Mayo',       category: 'Risol',   price: 5000, modal: 2500, stock: 27, min_stock: 10, unit: 'pcs', emoji: '🥐' },
  { name: 'Risol Smoke Beef', category: 'Risol',   price: 6000, modal: 3000, stock: 15, min_stock: 10, unit: 'pcs', emoji: '🥙' },
  { name: 'Risol Ayam Pedas', category: 'Risol',   price: 5500, modal: 2750, stock: 8,  min_stock: 10, unit: 'pcs', emoji: '🌶️' },
  { name: 'Risol Keju',       category: 'Risol',   price: 6500, modal: 3250, stock: 32, min_stock: 10, unit: 'pcs', emoji: '🧀' },
  { name: 'Risol Original',   category: 'Risol',   price: 4500, modal: 2250, stock: 4,  min_stock: 10, unit: 'pcs', emoji: '✨' },
  { name: 'Es Teh Manis',     category: 'Minuman', price: 3000, modal: 1000, stock: 50, min_stock: 20, unit: 'cup', emoji: '🧋' },
  { name: 'Es Jeruk',         category: 'Minuman', price: 4000, modal: 1500, stock: 30, min_stock: 20, unit: 'cup', emoji: '🍊' },
];

const existing = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (existing.c > 0) {
  console.log('Database already seeded, skipping.');
  process.exit(0);
}

const insertProduct = db.prepare(
  'INSERT INTO products (name, category, price, modal, stock, min_stock, unit, emoji) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

const seedProducts = db.transaction((prods) => {
  for (const p of prods) insertProduct.run(p.name, p.category, p.price, p.modal, p.stock, p.min_stock, p.unit, p.emoji);
});

seedProducts(products);
console.log(`Seeded ${products.length} products.`);

// Seed 7 days of transactions
const prodRows = db.prepare('SELECT * FROM products').all();
const insertTx = db.prepare(
  'INSERT INTO transactions (date, total, modal_total, payment, change) VALUES (?, ?, ?, ?, ?)'
);
const insertItem = db.prepare(
  'INSERT INTO transaction_items (transaction_id, product_id, name, price, modal, qty) VALUES (?, ?, ?, ?, ?, ?)'
);

const seedTx = db.transaction(() => {
  const today = new Date('2026-05-05');
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().slice(0, 10);
    const txCount = Math.floor(Math.random() * 10) + 5;
    for (let t = 0; t < txCount; t++) {
      const items = [];
      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numItems; i++) {
        const p = prodRows[Math.floor(Math.random() * prodRows.length)];
        items.push({ product_id: p.id, name: p.name, price: p.price, modal: p.modal, qty: Math.floor(Math.random() * 4) + 1 });
      }
      const total = items.reduce((s, i) => s + i.price * i.qty, 0);
      const modal_total = items.reduce((s, i) => s + i.modal * i.qty, 0);
      const tx = insertTx.run(dateStr, total, modal_total, total, 0);
      for (const item of items) insertItem.run(tx.lastInsertRowid, item.product_id, item.name, item.price, item.modal, item.qty);
    }
  }
});

seedTx();
console.log('Seeded 7 days of transactions.');
