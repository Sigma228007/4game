import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import authRoutes from './routes/auth.js';
import gamesRoutes from './routes/games.js';
import favoritesRoutes from './routes/favorites.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import ticketsRoutes from './routes/tickets.js';
import adminRoutes from './routes/admin.js';
import reviewsRoutes from './routes/reviews.js';
import wishlistRoutes from './routes/wishlist.js';
import gamificationRoutes from './routes/gamification.js';
import paymentsRoutes from './routes/payments.js';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', /\.vercel\.app$/, /\.onrender\.com$/],
  credentials: true,
}));
app.use(express.json());

// Логирование
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const c = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${c}${req.method}\x1b[0m ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/payments', paymentsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// One-time setup: creates admin/support accounts and promotes ADMIN_EMAIL
// Protected by SETUP_SECRET env var: GET /api/setup?secret=YOUR_SECRET
app.get('/api/setup', async (req, res) => {
  const secret = process.env.SETUP_SECRET;
  if (!secret || req.query.secret !== secret) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const results = [];
  try {
    const accounts = [
      { username: 'admin',   password: 'admin123',   email: 'admin@4game.com',   role: 'admin'   },
      { username: 'support', password: 'support123',  email: 'support@4game.com', role: 'support' },
    ];
    for (const acc of accounts) {
      const hash = await bcrypt.hash(acc.password, 10);
      await pool.query(
        'INSERT INTO users (username, password, email, role) VALUES ($1,$2,$3,$4) ON CONFLICT (username) DO UPDATE SET password=$2, role=$4',
        [acc.username, hash, acc.email, acc.role]
      );
      results.push(`✅ ${acc.role}: ${acc.username} / ${acc.password}`);
    }
    // promote ADMIN_EMAIL user
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const r = await pool.query(
        "UPDATE users SET role='admin' WHERE email=$1 RETURNING username",
        [adminEmail]
      );
      if (r.rows.length) results.push(`✅ promoted ${r.rows[0].username} (${adminEmail}) → admin`);
      else results.push(`⚠️  no user with email ${adminEmail} found`);
    }
    res.json({ ok: true, results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

async function ensureRoles() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const supportEmail = process.env.SUPPORT_EMAIL;
    if (adminEmail) {
      const r = await pool.query(
        "UPDATE users SET role = 'admin' WHERE email = $1 AND role != 'admin' RETURNING username",
        [adminEmail]
      );
      if (r.rows.length) console.log(`✅ Auto-promoted ${r.rows[0].username} → admin`);
    }
    if (supportEmail) {
      const r = await pool.query(
        "UPDATE users SET role = 'support' WHERE email = $1 AND role != 'admin' AND role != 'support' RETURNING username",
        [supportEmail]
      );
      if (r.rows.length) console.log(`✅ Auto-promoted ${r.rows[0].username} → support`);
    }
  } catch (e) {
    console.error('Role auto-promote failed:', e.message);
  }
}

app.listen(PORT, () => {
  console.log(`\n🚀 4Game API на http://localhost:${PORT}\n`);
  ensureRoles();
});
