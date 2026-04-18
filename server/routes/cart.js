import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// GET /api/cart
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, gr.name as genre_name, gr.icon as genre_icon, c.added_at
       FROM cart c
       JOIN games g ON c.game_id = g.id
       JOIN genres gr ON g.genre_id = gr.id
       WHERE c.user_id = $1
       ORDER BY c.added_at DESC`,
      [req.user.id]
    );
    const items = result.rows;
    const total = items.reduce((sum, g) => sum + g.price, 0);
    res.json({ items, total, count: items.length });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/cart/:gameId
router.post('/:gameId', auth, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO cart (user_id, game_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.gameId]
    );
    res.json({ message: 'Добавлено в корзину' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/cart/:gameId
router.delete('/:gameId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND game_id = $2',
      [req.user.id, req.params.gameId]
    );
    res.json({ message: 'Удалено из корзины' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/cart — очистить корзину
router.delete('/', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Корзина очищена' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/cart/ids
router.get('/ids', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT game_id FROM cart WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows.map(r => r.game_id));
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
