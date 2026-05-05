const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE active = 1 ORDER BY category, name');
    res.json(rows.map(normalize));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND active = 1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(normalize(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { name, category = 'Risol', price, modal, stock = 0, minStock = 10, unit = 'pcs', emoji = '🥐' } = req.body;
    if (!name || price == null || modal == null) {
      return res.status(400).json({ error: 'name, price, and modal are required' });
    }
    const { rows } = await pool.query(
      'INSERT INTO products (name, category, price, modal, stock, min_stock, unit, emoji) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, category, price, modal, stock, minStock, unit, emoji]
    );
    res.status(201).json(normalize(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const check = await pool.query('SELECT id FROM products WHERE id = $1 AND active = 1', [req.params.id]);
    if (!check.rows[0]) return res.status(404).json({ error: 'Product not found' });

    const { name, category, price, modal, stock, minStock, unit, emoji } = req.body;
    await pool.query(`
      UPDATE products SET
        name      = COALESCE($1, name),
        category  = COALESCE($2, category),
        price     = COALESCE($3, price),
        modal     = COALESCE($4, modal),
        stock     = COALESCE($5, stock),
        min_stock = COALESCE($6, min_stock),
        unit      = COALESCE($7, unit),
        emoji     = COALESCE($8, emoji)
      WHERE id = $9`,
      [name ?? null, category ?? null, price ?? null, modal ?? null,
       stock ?? null, minStock ?? null, unit ?? null, emoji ?? null, req.params.id]
    );
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    res.json(normalize(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id/stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const check = await pool.query('SELECT * FROM products WHERE id = $1 AND active = 1', [req.params.id]);
    const product = check.rows[0];
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { delta, stock, reason = 'manual', note = null } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (stock != null) {
        const d = stock - product.stock;
        await client.query('UPDATE products SET stock = $1 WHERE id = $2', [stock, req.params.id]);
        await client.query('INSERT INTO stock_log (product_id, delta, reason, note) VALUES ($1,$2,$3,$4)',
          [req.params.id, d, reason, note]);
      } else if (delta != null) {
        const newStock = Math.max(0, product.stock + delta);
        await client.query('UPDATE products SET stock = $1 WHERE id = $2', [newStock, req.params.id]);
        await client.query('INSERT INTO stock_log (product_id, delta, reason, note) VALUES ($1,$2,$3,$4)',
          [req.params.id, delta, reason, note]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    res.json(normalize(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id — soft delete
router.delete('/:id', async (req, res) => {
  try {
    const check = await pool.query('SELECT id FROM products WHERE id = $1', [req.params.id]);
    if (!check.rows[0]) return res.status(404).json({ error: 'Product not found' });
    await pool.query('UPDATE products SET active = 0 WHERE id = $1', [req.params.id]);
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function normalize(p) {
  return { ...p, minStock: p.min_stock };
}

module.exports = router;
