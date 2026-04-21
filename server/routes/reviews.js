import express from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import { checkAchievements } from '../services/achievements.js';

const router = express.Router();

// Получить отзывы на игру + средний рейтинг + count
router.get('/game/:gameId', async (req, res) => {
  const gameId = Number(req.params.gameId);
  const sort = req.query.sort || 'helpful'; // helpful | newest | worst

  const orderBy = sort === 'newest'
    ? 'r.created_at DESC'
    : sort === 'worst'
    ? 'r.rating ASC, r.created_at DESC'
    : 'r.helpful DESC, r.created_at DESC';

  try {
    const reviews = await pool.query(`
      SELECT r.id, r.rating, r.text, r.helpful, r.created_at,
             u.username, u.avatar_color, u.id AS user_id
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.game_id = $1
      ORDER BY ${orderBy}
    `, [gameId]);

    const stats = await pool.query(`
      SELECT COUNT(*)::int AS total,
             COALESCE(AVG(rating), 0)::float AS avg,
             COUNT(*) FILTER (WHERE rating = 5)::int AS r5,
             COUNT(*) FILTER (WHERE rating = 4)::int AS r4,
             COUNT(*) FILTER (WHERE rating = 3)::int AS r3,
             COUNT(*) FILTER (WHERE rating = 2)::int AS r2,
             COUNT(*) FILTER (WHERE rating = 1)::int AS r1
      FROM reviews WHERE game_id = $1
    `, [gameId]);

    res.json({ reviews: reviews.rows, stats: stats.rows[0] });
  } catch (err) {
    console.error('reviews.get error:', err);
    res.status(500).json({ error: 'Не удалось загрузить отзывы' });
  }
});

// Проверить: может ли текущий юзер оставить отзыв (купил ли игру, есть ли уже отзыв)
router.get('/can-review/:gameId', auth, async (req, res) => {
  const gameId = Number(req.params.gameId);
  const userId = req.user.id;

  try {
    const purchased = await pool.query(`
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.user_id = $1 AND oi.game_id = $2 LIMIT 1
    `, [userId, gameId]);

    const existing = await pool.query(
      'SELECT id, rating, text FROM reviews WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );

    res.json({
      canReview: purchased.rows.length > 0,
      alreadyReviewed: existing.rows.length > 0,
      myReview: existing.rows[0] || null,
    });
  } catch (err) {
    console.error('can-review error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать или обновить отзыв (upsert)
router.post('/', auth, async (req, res) => {
  const { gameId, rating, text } = req.body;
  const userId = req.user.id;

  if (!gameId || !rating) return res.status(400).json({ error: 'gameId и rating обязательны' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Рейтинг должен быть 1–5' });

  // Проверяем что юзер купил игру
  const purchased = await pool.query(`
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.user_id = $1 AND oi.game_id = $2 LIMIT 1
  `, [userId, gameId]);
  if (!purchased.rows.length) {
    return res.status(403).json({ error: 'Оставлять отзывы могут только покупатели' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO reviews (user_id, game_id, rating, text)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, game_id)
      DO UPDATE SET rating = EXCLUDED.rating, text = EXCLUDED.text, updated_at = NOW()
      RETURNING *
    `, [userId, gameId, rating, text || '']);

    checkAchievements(userId).catch(err => console.error('Achievement check failed:', err.message));

    res.json(result.rows[0]);
  } catch (err) {
    console.error('reviews.post error:', err);
    res.status(500).json({ error: 'Не удалось сохранить отзыв' });
  }
});

// Удалить свой отзыв
router.delete('/:id', auth, async (req, res) => {
  const reviewId = Number(req.params.id);
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [reviewId, userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Отзыв не найден' });
    res.json({ success: true });
  } catch (err) {
    console.error('reviews.delete error:', err);
    res.status(500).json({ error: 'Не удалось удалить' });
  }
});

// Нажать "полезно" на чужой отзыв (toggle)
router.post('/:id/helpful', auth, async (req, res) => {
  const reviewId = Number(req.params.id);
  const userId = req.user.id;

  try {
    const review = await pool.query('SELECT user_id FROM reviews WHERE id = $1', [reviewId]);
    if (!review.rows.length) return res.status(404).json({ error: 'Отзыв не найден' });
    if (review.rows[0].user_id === userId) return res.status(400).json({ error: 'Нельзя лайкать свой отзыв' });

    // Проверяем - уже ли лайкал?
    const existing = await pool.query(
      'SELECT id FROM review_helpful WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (existing.rows.length) {
      // снять лайк
      await pool.query('DELETE FROM review_helpful WHERE review_id = $1 AND user_id = $2', [reviewId, userId]);
      await pool.query('UPDATE reviews SET helpful = GREATEST(helpful - 1, 0) WHERE id = $1', [reviewId]);
      res.json({ helpful: false });
    } else {
      await pool.query('INSERT INTO review_helpful (review_id, user_id) VALUES ($1, $2)', [reviewId, userId]);
      await pool.query('UPDATE reviews SET helpful = helpful + 1 WHERE id = $1', [reviewId]);
      res.json({ helpful: true });
    }
  } catch (err) {
    console.error('reviews.helpful error:', err);
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Все отзывы текущего юзера (для профиля)
router.get('/my', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, g.name AS game_name, g.image AS game_image
      FROM reviews r
      JOIN games g ON g.id = r.game_id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('reviews.my error:', err);
    res.status(500).json({ error: 'Ошибка' });
  }
});

export default router;
