const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/summary', async (req, res) => {
  try {
    const { from, to } = dateRange(req.query);

    const [totalsRes, itemsRes, topRes, lowRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as transaction_count,
           COALESCE(SUM(total), 0) as revenue,
           COALESCE(SUM(modal_total), 0) as cogs,
           COALESCE(SUM(total - modal_total), 0) as profit
         FROM transactions WHERE date BETWEEN $1 AND $2`,
        [from, to]
      ),
      pool.query(
        `SELECT COALESCE(SUM(ti.qty), 0) as total
         FROM transaction_items ti
         JOIN transactions t ON t.id = ti.transaction_id
         WHERE t.date BETWEEN $1 AND $2`,
        [from, to]
      ),
      pool.query(
        `SELECT ti.name, ti.product_id,
           SUM(ti.qty) as qty_sold,
           SUM(ti.price * ti.qty) as revenue,
           SUM((ti.price - ti.modal) * ti.qty) as profit
         FROM transaction_items ti
         JOIN transactions t ON t.id = ti.transaction_id
         WHERE t.date BETWEEN $1 AND $2
         GROUP BY ti.product_id, ti.name
         ORDER BY revenue DESC LIMIT 10`,
        [from, to]
      ),
      pool.query(
        'SELECT id, name, stock, min_stock as "minStock", emoji FROM products WHERE active = 1 AND stock <= min_stock ORDER BY stock ASC'
      ),
    ]);

    const totals = totalsRes.rows[0];
    const revenue = Number(totals.revenue);
    const profit = Number(totals.profit);

    res.json({
      from, to,
      revenue,
      cogs: Number(totals.cogs),
      profit,
      margin: revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
      transactionCount: Number(totals.transaction_count),
      itemsSold: Number(itemsRes.rows[0].total),
      topProducts: topRes.rows,
      lowStock: lowRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD&group=day|week|month
router.get('/sales', async (req, res) => {
  try {
    const { from, to } = dateRange(req.query);
    const group = req.query.group || 'day';

    let dateExpr;
    if (group === 'month') dateExpr = "TO_CHAR(date::date, 'YYYY-MM')";
    else if (group === 'week') dateExpr = "TO_CHAR(date::date, 'IYYY-\"W\"IW')";
    else dateExpr = 'date';

    const { rows } = await pool.query(
      `SELECT ${dateExpr} as period,
         COUNT(*) as transaction_count,
         SUM(total) as revenue,
         SUM(modal_total) as cogs,
         SUM(total - modal_total) as profit
       FROM transactions
       WHERE date BETWEEN $1 AND $2
       GROUP BY period ORDER BY period ASC`,
      [from, to]
    );

    res.json({ from, to, group, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/profit?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/profit', async (req, res) => {
  try {
    const { from, to } = dateRange(req.query);

    const [byCatRes, byProdRes] = await Promise.all([
      pool.query(
        `SELECT p.category,
           SUM(ti.qty) as qty_sold,
           SUM(ti.price * ti.qty) as revenue,
           SUM(ti.modal * ti.qty) as cogs,
           SUM((ti.price - ti.modal) * ti.qty) as profit
         FROM transaction_items ti
         JOIN transactions t ON t.id = ti.transaction_id
         LEFT JOIN products p ON p.id = ti.product_id
         WHERE t.date BETWEEN $1 AND $2
         GROUP BY p.category ORDER BY profit DESC`,
        [from, to]
      ),
      pool.query(
        `SELECT ti.name, ti.product_id, p.category, p.emoji,
           SUM(ti.qty) as qty_sold,
           SUM(ti.price * ti.qty) as revenue,
           SUM(ti.modal * ti.qty) as cogs,
           SUM((ti.price - ti.modal) * ti.qty) as profit,
           ROUND(100.0 * (ti.price - ti.modal) / NULLIF(ti.price, 0), 1) as margin_pct
         FROM transaction_items ti
         JOIN transactions t ON t.id = ti.transaction_id
         LEFT JOIN products p ON p.id = ti.product_id
         WHERE t.date BETWEEN $1 AND $2
         GROUP BY ti.product_id, ti.name, p.category, p.emoji
         ORDER BY profit DESC`,
        [from, to]
      ),
    ]);

    res.json({ from, to, byCategory: byCatRes.rows, byProduct: byProdRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/stock
router.get('/stock', async (req, res) => {
  try {
    const [productsRes, movementsRes] = await Promise.all([
      pool.query(`
        SELECT p.*, p.min_stock as "minStock",
          CASE WHEN p.stock = 0 THEN 'empty'
               WHEN p.stock <= p.min_stock THEN 'low'
               ELSE 'ok' END as status
        FROM products p WHERE p.active = 1 ORDER BY p.stock ASC
      `),
      pool.query(`
        SELECT sl.product_id, p.name, p.emoji,
          SUM(CASE WHEN sl.delta > 0 THEN sl.delta ELSE 0 END) as total_in,
          SUM(CASE WHEN sl.delta < 0 THEN ABS(sl.delta) ELSE 0 END) as total_out
        FROM stock_log sl
        JOIN products p ON p.id = sl.product_id
        WHERE sl.created_at >= TO_CHAR(NOW() - INTERVAL '30 days', 'YYYY-MM-DD HH24:MI:SS')
        GROUP BY sl.product_id, p.name, p.emoji
      `),
    ]);

    res.json({ products: productsRes.rows, movements: movementsRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function dateRange(query) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  return {
    from: query.from || thirtyDaysAgo,
    to: query.to || today,
  };
}

module.exports = router;
