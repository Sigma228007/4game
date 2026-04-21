import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import emailService from '../services/email.js';

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

    if (email) {
      const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (emailExists.rows.length > 0) return res.status(409).json({ error: 'Email уже используется' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, avatar_color, created_at',
      [username, hash, email || null, 'user']
    );
    const user = result.rows[0];

    // Приветственное письмо (асинхронно, не блокирует ответ)
    if (email) {
      emailService.sendWelcome({ to: email, username }).catch(err => console.error('Welcome email failed:', err.message));
    }

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

// ═══════════ ВОССТАНОВЛЕНИЕ ПАРОЛЯ ═══════════

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Введите email' });

    // Всегда отвечаем одинаково, независимо от того есть ли email в базе
    // (защита от email enumeration атак)
    const result = await pool.query('SELECT id, username FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 минут

      await pool.query(
        'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, expiresAt]
      );

      const frontendUrl = process.env.FRONTEND_URL || 'https://4game-blush.vercel.app';
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

      emailService.sendPasswordReset({ to: email, username: user.username, resetUrl })
        .catch(err => console.error('Password reset email failed:', err.message));
    }

    res.json({ message: 'Если такой email зарегистрирован, письмо уже отправлено' });
  } catch (err) {
    console.error('forgot-password error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Неверные данные' });
    if (newPassword.length < 4) return res.status(400).json({ error: 'Пароль минимум 4 символа' });

    const result = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Ссылка недействительна или просрочена' });
    }

    const resetRecord = result.rows[0];
    const hash = await bcrypt.hash(newPassword, 10);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, resetRecord.user_id]);
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [resetRecord.id]);

    res.json({ message: 'Пароль успешно изменён. Теперь можно войти.' });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
