import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Middleware проверки роли admin
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
  next();
}

// GET /api/admin/stats — статистика для дашборда
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [users, games, orders, tickets] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM games'),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders'),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'open\') as open FROM tickets'),
    ]);

    res.json({
      users: parseInt(users.rows[0].count),
      games: parseInt(games.rows[0].count),
      orders: parseInt(orders.rows[0].count),
      revenue: parseInt(orders.rows[0].revenue),
      tickets: parseInt(tickets.rows[0].total),
      openTickets: parseInt(tickets.rows[0].open),
    });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/admin/users — список пользователей
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email, u.role, u.created_at,
              (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as order_count,
              (SELECT COUNT(*) FROM tickets t WHERE t.user_id = u.id) as ticket_count
       FROM users u ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// PUT /api/admin/users/:id/role — изменить роль
router.put('/users/:id/role', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'support', 'admin'].includes(role)) return res.status(400).json({ error: 'Неверная роль' });
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: 'Роль обновлена' });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/admin/orders — все заказы
router.get('/orders', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.username,
              json_agg(json_build_object('name', g.name, 'price', oi.price, 'gameKey', oi.game_key) ORDER BY oi.id) as items
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN games g ON oi.game_id = g.id
       GROUP BY o.id, u.username
       ORDER BY o.created_at DESC
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

export default router;
