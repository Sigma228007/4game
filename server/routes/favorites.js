import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import { checkAchievements } from '../services/achievements.js';

const router = Router();

// GET /api/favorites — список избранного
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, gr.name as genre_name, gr.icon as genre_icon, f.added_at
       FROM favorites f
       JOIN games g ON f.game_id = g.id
       JOIN genres gr ON g.genre_id = gr.id
       WHERE f.user_id = $1
       ORDER BY f.added_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/favorites/:gameId — добавить
router.post('/:gameId', auth, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO favorites (user_id, game_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, req.params.gameId]
    );
    checkAchievements(req.user.id).catch(() => {});
    res.json({ message: 'Добавлено в избранное' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/favorites/:gameId — удалить
router.delete('/:gameId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND game_id = $2',
      [req.user.id, req.params.gameId]
    );
    res.json({ message: 'Удалено из избранного' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/favorites/ids — только id (для быстрой проверки)
router.get('/ids', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT game_id FROM favorites WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows.map(r => r.game_id));
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
