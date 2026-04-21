import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// GET /api/wishlist — список + отметка "игра подешевела"
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.game_id, w.price_at_add, w.notify, w.added_at,
             g.name, g.price AS current_price, g.old_price, g.image, g.rating, g.year,
             CASE WHEN g.price < w.price_at_add THEN w.price_at_add - g.price ELSE 0 END AS discount_since_add
      FROM wishlist w
      JOIN games g ON g.id = w.game_id
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/wishlist/:gameId — добавить
router.post('/:gameId', auth, async (req, res) => {
  try {
    const game = await pool.query('SELECT price FROM games WHERE id = $1', [req.params.gameId]);
    if (game.rows.length === 0) return res.status(404).json({ error: 'Игра не найдена' });
    await pool.query(
      'INSERT INTO wishlist (user_id, game_id, price_at_add) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.gameId, game.rows[0].price]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// DELETE /api/wishlist/:gameId
router.delete('/:gameId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM wishlist WHERE user_id = $1 AND game_id = $2', [req.user.id, req.params.gameId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// PUT /api/wishlist/:gameId/notify — переключить уведомления
router.put('/:gameId/notify', auth, async (req, res) => {
  try {
    const { notify } = req.body;
    await pool.query('UPDATE wishlist SET notify = $1 WHERE user_id = $2 AND game_id = $3', [notify, req.user.id, req.params.gameId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

export default router;
