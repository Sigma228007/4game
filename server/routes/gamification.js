import { Router } from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import { checkAchievements } from '../services/achievements.js';
import emailService from '../services/email.js';

const router = Router();

// ══════════════ ACHIEVEMENTS ══════════════

// GET /api/gamification/achievements - все ачивки с отметкой "есть/нет у меня"
router.get('/achievements', auth, async (req, res) => {
  try {
    const all = await pool.query('SELECT * FROM achievements');
    const mine = await pool.query(
      'SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = $1',
      [req.user.id]
    );
    const earnedMap = Object.fromEntries(mine.rows.map(r => [r.achievement_id, r.earned_at]));
    const list = all.rows.map(a => ({
      ...a,
      earned: !!earnedMap[a.id],
      earned_at: earnedMap[a.id] || null,
    }));
    res.json(list);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// ══════════════ PLAYER STATS (для профиля) ══════════════

router.get('/stats', auth, async (req, res) => {
  try {
    const [orders, genres, fav, topGame, savings] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS orders, COALESCE(SUM(total), 0)::int AS spent FROM orders WHERE user_id = $1', [req.user.id]),
      pool.query(`SELECT g.genre_id, COUNT(*)::int AS n FROM order_items oi
                  JOIN orders o ON o.id = oi.order_id
                  JOIN games g ON g.id = oi.game_id
                  WHERE o.user_id = $1 GROUP BY g.genre_id ORDER BY n DESC`, [req.user.id]),
      pool.query('SELECT COUNT(*)::int AS n FROM favorites WHERE user_id = $1', [req.user.id]),
      pool.query(`SELECT g.name, g.image, oi.price FROM order_items oi
                  JOIN orders o ON o.id = oi.order_id
                  JOIN games g ON g.id = oi.game_id
                  WHERE o.user_id = $1 ORDER BY oi.price DESC LIMIT 1`, [req.user.id]),
      pool.query(`SELECT COALESCE(SUM(g.old_price - oi.price), 0)::int AS savings
                  FROM order_items oi
                  JOIN orders o ON o.id = oi.order_id
                  JOIN games g ON g.id = oi.game_id
                  WHERE o.user_id = $1 AND g.old_price IS NOT NULL AND g.old_price > oi.price`, [req.user.id]),
    ]);

    res.json({
      ordersCount: orders.rows[0].orders,
      totalSpent: orders.rows[0].spent,
      favoritesCount: fav.rows[0].n,
      topGame: topGame.rows[0] || null,
      totalSavings: savings.rows[0].savings,
      genreBreakdown: genres.rows,
    });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// ══════════════ REFERRAL ══════════════

// GET /api/gamification/referral — мой код + список приглашённых
router.get('/referral', auth, async (req, res) => {
  try {
    // Генерируем код если ещё нет
    let codeResult = await pool.query('SELECT referral_code FROM users WHERE id = $1', [req.user.id]);
    let code = codeResult.rows[0].referral_code;
    if (!code) {
      code = crypto.randomBytes(4).toString('hex').toUpperCase();
      await pool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [code, req.user.id]);
    }

    const referred = await pool.query(`
      SELECT u.id, u.username, u.created_at,
             (SELECT COUNT(*)::int FROM orders WHERE user_id = u.id) AS order_count
      FROM users u WHERE u.referred_by = $1 ORDER BY u.created_at DESC
    `, [req.user.id]);

    const rewards = await pool.query(
      'SELECT * FROM referral_rewards WHERE referrer_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      code,
      link: `${process.env.FRONTEND_URL || 'https://4game-blush.vercel.app'}/?ref=${code}`,
      referredUsers: referred.rows,
      rewards: rewards.rows,
    });
  } catch (err) { console.error('referral error:', err); res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/gamification/referral/apply — применить при регистрации (вызывается с фронта после успешной регистрации)
router.post('/referral/apply', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Код не указан' });

    // Не принимаем свой код
    const me = await pool.query('SELECT referral_code, referred_by FROM users WHERE id = $1', [req.user.id]);
    if (me.rows[0].referral_code === code) return res.status(400).json({ error: 'Нельзя применить свой код' });
    if (me.rows[0].referred_by) return res.status(400).json({ error: 'Вы уже применяли реф-код' });

    const referrer = await pool.query('SELECT id FROM users WHERE referral_code = $1', [code]);
    if (referrer.rows.length === 0) return res.status(404).json({ error: 'Код не найден' });

    await pool.query('UPDATE users SET referred_by = $1 WHERE id = $2', [referrer.rows[0].id, req.user.id]);
    res.json({ success: true, message: 'Реф-код применён. После первой покупки пригласивший получит бонус.' });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// ══════════════ EMAIL SUBSCRIPTIONS ══════════════

// POST /api/gamification/subscribe - подписаться на рассылку скидок
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Неверный email' });
    }
    await pool.query(
      'INSERT INTO email_subscriptions (email, confirmed) VALUES ($1, true) ON CONFLICT (email) DO NOTHING',
      [email]
    );
    res.json({ success: true, message: 'Спасибо! Промокод WELCOME10 уже на почте.' });
    // Отправляем приветственное письмо с промо
    emailService.sendWelcome({ to: email, username: 'Подписчик' }).catch(() => {});
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// ══════════════ GIFTS ══════════════

// GET /api/gamification/gifts - подарки, которые мне подарили
router.get('/gifts', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT gf.*, g.name, g.image, u.username AS from_username
      FROM gifts gf
      LEFT JOIN games g ON g.id = gf.game_id
      LEFT JOIN users u ON u.id = gf.from_user_id
      WHERE gf.to_user_id = $1
      ORDER BY gf.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/gamification/gifts/:id/claim — забрать подарок (ключ становится виден)
router.post('/gifts/:id/claim', auth, async (req, res) => {
  try {
    const r = await pool.query(
      'UPDATE gifts SET claimed = true WHERE id = $1 AND to_user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Подарок не найден' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// ══════════════ 2FA (TOTP) — упрощённая ══════════════
// Без библиотеки speakeasy — используем простой HMAC-SHA1 код (как настоящий TOTP по RFC 6238)

function generateTotpSecret() {
  // Base32 alphabet
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const bytes = crypto.randomBytes(20);
  for (let i = 0; i < 16; i++) secret += alphabet[bytes[i] % 32];
  return secret;
}

function base32ToBytes(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = base32.replace(/=/g, '').toUpperCase();
  let bits = '';
  for (const c of cleaned) {
    const idx = alphabet.indexOf(c);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

function generateTotpCode(secret, step = 30) {
  const time = Math.floor(Date.now() / 1000 / step);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(time));
  const key = base32ToBytes(secret);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(code % 1000000).padStart(6, '0');
}

function verifyTotp(secret, code) {
  // ±1 шаг для учёта рассинхрона часов
  const now = Math.floor(Date.now() / 1000 / 30);
  for (let delta = -1; delta <= 1; delta++) {
    const time = now + delta;
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(time));
    const key = base32ToBytes(secret);
    const hmac = crypto.createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const v = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    if (String(v % 1000000).padStart(6, '0') === String(code)) return true;
  }
  return false;
}

// POST /api/gamification/2fa/setup - начать настройку, получить секрет и QR-URL
router.post('/2fa/setup', auth, async (req, res) => {
  try {
    // Только для админов и support (не все пользователи)
    const user = await pool.query('SELECT role, username FROM users WHERE id = $1', [req.user.id]);
    const u = user.rows[0];
    if (u.role !== 'admin' && u.role !== 'support') {
      return res.status(403).json({ error: '2FA доступна только для админов и поддержки' });
    }

    const secret = generateTotpSecret();
    await pool.query('UPDATE users SET totp_secret = $1, totp_enabled = false WHERE id = $2', [secret, req.user.id]);

    const otpauth = `otpauth://totp/4Game:${encodeURIComponent(u.username)}?secret=${secret}&issuer=4Game&algorithm=SHA1&digits=6&period=30`;
    res.json({ secret, otpauth });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/gamification/2fa/verify - подтвердить, включить 2FA
router.post('/2fa/verify', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const u = await pool.query('SELECT totp_secret FROM users WHERE id = $1', [req.user.id]);
    if (!u.rows[0].totp_secret) return res.status(400).json({ error: 'Сначала вызови /setup' });

    if (!verifyTotp(u.rows[0].totp_secret, code)) {
      return res.status(400).json({ error: 'Неверный код' });
    }

    await pool.query('UPDATE users SET totp_enabled = true WHERE id = $1', [req.user.id]);
    res.json({ success: true, message: '2FA включена' });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/gamification/2fa/disable
router.post('/2fa/disable', auth, async (req, res) => {
  try {
    const { code } = req.body;
    const u = await pool.query('SELECT totp_secret FROM users WHERE id = $1', [req.user.id]);
    if (!u.rows[0].totp_secret) return res.json({ success: true });
    if (!verifyTotp(u.rows[0].totp_secret, code)) return res.status(400).json({ error: 'Неверный код' });
    await pool.query('UPDATE users SET totp_enabled = false, totp_secret = NULL WHERE id = $1', [req.user.id]);
    res.json({ success: true, message: '2FA отключена' });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/gamification/2fa/status
router.get('/2fa/status', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT totp_enabled FROM users WHERE id = $1', [req.user.id]);
    res.json({ enabled: r.rows[0]?.totp_enabled || false });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// ══════════════ GDPR EXPORT ══════════════

router.get('/export-data', auth, async (req, res) => {
  try {
    const [user, orders, tickets, reviews, favorites, achievements] = await Promise.all([
      pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [req.user.id]),
      pool.query(`SELECT o.id, o.total, o.created_at,
                  (SELECT json_agg(json_build_object('name', g.name, 'price', oi.price, 'key', oi.game_key))
                   FROM order_items oi LEFT JOIN games g ON g.id = oi.game_id WHERE oi.order_id = o.id) AS items
                  FROM orders o WHERE o.user_id = $1`, [req.user.id]),
      pool.query('SELECT id, subject, status, created_at FROM tickets WHERE user_id = $1', [req.user.id]),
      pool.query(`SELECT r.rating, r.text, r.created_at, g.name AS game_name
                  FROM reviews r JOIN games g ON g.id = r.game_id WHERE r.user_id = $1`, [req.user.id]),
      pool.query('SELECT f.added_at, g.name FROM favorites f JOIN games g ON g.id = f.game_id WHERE f.user_id = $1', [req.user.id]),
      pool.query('SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = $1', [req.user.id]),
    ]);

    res.json({
      exported_at: new Date().toISOString(),
      user: user.rows[0],
      orders: orders.rows,
      tickets: tickets.rows,
      reviews: reviews.rows,
      favorites: favorites.rows,
      achievements: achievements.rows,
    });
  } catch (err) { console.error('export error:', err); res.status(500).json({ error: 'Ошибка сервера' }); }
});

export default router;
export { checkAchievements };
