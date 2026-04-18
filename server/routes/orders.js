import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// Генерация ключа как в Steam: XXXXX-XXXXX-XXXXX
function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // без O,0,1,I для читаемости
  const segment = () => Array.from({ length: 5 }, () => chars[crypto.randomInt(chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}`;
}

// POST /api/orders/checkout
router.post('/checkout', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cartResult = await client.query(
      'SELECT g.id, g.name, g.price, g.image FROM cart c JOIN games g ON c.game_id = g.id WHERE c.user_id = $1',
      [req.user.id]
    );
    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    const items = cartResult.rows;
    const total = items.reduce((s, g) => s + g.price, 0);

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id, created_at',
      [req.user.id, total]
    );
    const order = orderResult.rows[0];

    // Генерируем ключ для каждой игры
    const orderItems = [];
    for (const item of items) {
      const gameKey = generateKey();
      await client.query(
        'INSERT INTO order_items (order_id, game_id, price, game_key) VALUES ($1, $2, $3, $4)',
        [order.id, item.id, item.price, gameKey]
      );
      orderItems.push({ gameId: item.id, name: item.name, price: item.price, image: item.image, gameKey });
    }

    await client.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    await client.query('COMMIT');

    res.json({
      orderId: order.id,
      total,
      items: orderItems,
      createdAt: order.created_at,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Ошибка оформления заказа' });
  } finally { client.release(); }
});

// GET /api/orders — история заказов с ключами
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at,
              json_agg(json_build_object(
                'gameId', oi.game_id, 'price', oi.price, 'gameKey', oi.game_key,
                'name', g.name, 'image', g.image
              ) ORDER BY oi.id) as items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN games g ON oi.game_id = g.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/orders/:id — один заказ с ключами
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at,
              json_agg(json_build_object(
                'gameId', oi.game_id, 'price', oi.price, 'gameKey', oi.game_key,
                'name', g.name, 'image', g.image
              ) ORDER BY oi.id) as items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN games g ON oi.game_id = g.id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

export default router;
