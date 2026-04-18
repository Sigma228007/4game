import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/games — все игры (с фильтрами)
router.get('/', async (req, res) => {
  try {
    const { genre, search, sort, featured } = req.query;

    let query = 'SELECT g.*, gr.name as genre_name, gr.icon as genre_icon FROM games g JOIN genres gr ON g.genre_id = gr.id';
    const conditions = [];
    const params = [];

    if (genre && genre !== 'all') {
      params.push(genre);
      conditions.push(`g.genre_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(`(LOWER(g.name) LIKE $${params.length} OR LOWER(g.description) LIKE $${params.length} OR EXISTS (SELECT 1 FROM unnest(g.tags) t WHERE LOWER(t) LIKE $${params.length}))`);
    }

    if (featured === 'true') {
      conditions.push('g.featured = true');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Сортировка
    switch (sort) {
      case 'price-asc':  query += ' ORDER BY g.price ASC'; break;
      case 'price-desc': query += ' ORDER BY g.price DESC'; break;
      case 'rating':     query += ' ORDER BY g.rating DESC'; break;
      case 'year':       query += ' ORDER BY g.year DESC'; break;
      default:           query += ' ORDER BY g.id ASC';
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Games list error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/games/genres — список жанров
router.get('/genres', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT g.*, COUNT(gm.id) as count FROM genres g LEFT JOIN games gm ON gm.genre_id = g.id GROUP BY g.id ORDER BY g.name'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/games/:id — одна игра
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT g.*, gr.name as genre_name, gr.icon as genre_icon FROM games g JOIN genres gr ON g.genre_id = gr.id WHERE g.id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Игра не найдена' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
