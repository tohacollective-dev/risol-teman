require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Izinkan request dari Vercel dan lokal
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:5173',
  process.env.FRONTEND_URL, // set ini ke URL Vercel kamu, contoh: https://nextapp-umber-kappa.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (curl, mobile apps) dan origins yang terdaftar
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Risol Teman POS', time: new Date().toISOString() });
});

// 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Start server dulu, baru init DB — supaya tidak crash kalau DB lambat
app.listen(PORT, () => {
  console.log(`Risol Teman POS running on http://localhost:${PORT}`);
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✓ set' : '✗ MISSING'}`);
});

initDb()
  .then(() => console.log('✓ Database connected & tables ready'))
  .catch(err => console.error('✗ DB init failed:', err.message));
