const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// GET /api/transactions?date=YYYY-MM-DD&from=YYYY-MM-DD&to=YYYY-MM-DD&limit=50&offset=0
router.get('/', async (req, res) => {
  try {
    const { date, from, to, limit = 50, offset = 0 } = req.query;
    let where = '1=1';
    const args = [];
    if (date) {
      where += ` AND t.date = $${args.length + 1}`; args.push(date);
    } else if (from && to) {
      where += ` AND t.date BETWEEN $${args.length + 1} AND $${args.length + 2}`; args.push(from, to);
    } else if (from) {
      where += ` AND t.date >= $${args.length + 1}`; args.push(from);
    }
    args.push(Number(limit), Number(offset));

    const { rows } = await pool.query(
      `SELECT t.* FROM transactions t WHERE ${where} ORDER BY t.created_at DESC LIMIT $${args.length - 1} OFFSET $${args.length}`,
      args
    );

    const result = await Promise.all(rows.map(async tx => {
      const { rows: items } = await pool.query(
        `SELECT ti.*, p.emoji FROM transaction_items ti
         LEFT JOIN products p ON p.id = ti.product_id
         WHERE ti.transaction_id = $1`,
        [tx.id]
      );
      return { ...tx, modalTotal: tx.modal_total, items };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows: txRows } = await pool.query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    const tx = txRows[0];
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const { rows: items } = await pool.query(
      `SELECT ti.*, p.emoji FROM transaction_items ti
       LEFT JOIN products p ON p.id = ti.product_id
       WHERE ti.transaction_id = $1`,
      [tx.id]
    );
    res.json({ ...tx, modalTotal: tx.modal_total, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions — create sale, auto-decrement stock
router.post('/', async (req, res) => {
  try {
    const { items, payment, note = null, date } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }
    if (payment == null) return res.status(400).json({ error: 'payment amount is required' });

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const modal_total = items.reduce((s, i) => s + (i.modal || 0) * i.qty, 0);
    const change = payment - total;
    if (change < 0) return res.status(400).json({ error: 'Payment is less than total' });

    const txDate = date || new Date().toISOString().slice(0, 10);
    let newId;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: txRows } = await client.query(
        'INSERT INTO transactions (date, total, modal_total, payment, change, note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
        [txDate, total, modal_total, payment, change, note]
      );
      newId = txRows[0].id;

      for (const item of items) {
        await client.query(
          'INSERT INTO transaction_items (transaction_id, product_id, name, price, modal, qty) VALUES ($1,$2,$3,$4,$5,$6)',
          [newId, item.productId || null, item.name, item.price, item.modal || 0, item.qty]
        );
        if (item.productId) {
          await client.query(
            'UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2',
            [item.qty, item.productId]
          );
          await client.query(
            'INSERT INTO stock_log (product_id, delta, reason, note) VALUES ($1,$2,$3,$4)',
            [item.productId, -item.qty, 'sale', `Transaksi #${newId}`]
          );
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const [{ rows: txFinal }, { rows: itemsFinal }] = await Promise.all([
      pool.query('SELECT * FROM transactions WHERE id = $1', [newId]),
      pool.query('SELECT * FROM transaction_items WHERE transaction_id = $1', [newId]),
    ]);
    const row = txFinal[0];
    res.status(201).json({ ...row, modalTotal: row.modal_total, items: itemsFinal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id — void, restore stock
router.delete('/:id', async (req, res) => {
  try {
    const { rows: txRows } = await pool.query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);
    const txData = txRows[0];
    if (!txData) return res.status(404).json({ error: 'Transaction not found' });

    const { rows: itemRows } = await pool.query(
      'SELECT * FROM transaction_items WHERE transaction_id = $1',
      [txData.id]
    );

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of itemRows) {
        if (item.product_id) {
          await client.query(
            'UPDATE products SET stock = stock + $1 WHERE id = $2',
            [item.qty, item.product_id]
          );
          await client.query(
            'INSERT INTO stock_log (product_id, delta, reason, note) VALUES ($1,$2,$3,$4)',
            [item.product_id, item.qty, 'void', `Void transaksi #${txData.id}`]
          );
        }
      }
      await client.query('DELETE FROM transactions WHERE id = $1', [txData.id]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ message: 'Transaction voided and stock restored' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
