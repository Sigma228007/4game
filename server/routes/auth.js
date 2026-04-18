import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

function createToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Введите логин и пароль' });
    if (username.length < 2) return res.status(400).json({ error: 'Логин минимум 2 символа' });
    if (password.length < 4) return res.status(400).json({ error: 'Пароль минимум 4 символа' });

    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Пользователь уже существует' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, avatar_color, created_at',
      [username, hash, email || null, 'user']
    );
    const user = result.rows[0];
    res.status(201).json({ token: createToken(user), user: { id: user.id, username: user.username, email: user.email, role: user.role, avatarColor: user.avatar_color, createdAt: user.created_at } });
  } catch (err) { console.error('Register error:', err); res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Введите логин и пароль' });

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Неверный логин или пароль' });

    res.json({ token: createToken(user), user: { id: user.id, username: user.username, email: user.email, role: user.role, avatarColor: user.avatar_color, createdAt: user.created_at } });
  } catch (err) { console.error('Login error:', err); res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, role, avatar_color, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Не найден' });
    const u = result.rows[0];
    res.json({ id: u.id, username: u.username, email: u.email, role: u.role, avatarColor: u.avatar_color, createdAt: u.created_at });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// PUT /api/auth/password
router.put('/password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Заполните все поля' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'Минимум 4 символа' });
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Неверный текущий пароль' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Пароль обновлён' });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// PUT /api/auth/avatar
router.put('/avatar', auth, async (req, res) => {
  try {
    await pool.query('UPDATE users SET avatar_color = $1 WHERE id = $2', [req.body.color, req.user.id]);
    res.json({ message: 'Аватар обновлён' });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// PUT /api/auth/email
router.put('/email', auth, async (req, res) => {
  try {
    await pool.query('UPDATE users SET email = $1 WHERE id = $2', [req.body.email, req.user.id]);
    res.json({ message: 'Email обновлён' });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

export default router;
