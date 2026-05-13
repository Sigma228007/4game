import { Router } from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';
import emailService from '../services/email.js';
import { checkAchievements } from '../services/achievements.js';

const router = Router();

const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://4game-blush.vercel.app';

function generateKey() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () => Array.from({ length: 5 }, () => chars[crypto.randomInt(chars.length)]).join('');
  return `${segment()}-${segment()}-${segment()}`;
}

async function ykRequest(method, path, body) {
  const credentials = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64');
  const res = await fetch(`https://api.yookassa.ru/v3${path}`, {
    method,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.description || `YooKassa ${res.status}`);
  return data;
}

// Creates the order in DB after successful payment (used by webhook and status-poll)
async function fulfillOrder(pending) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING id, created_at',
      [pending.user_id, pending.amount]
    );
    const order = orderResult.rows[0];

    const orderItems = [];
    for (const item of pending.cart_snapshot) {
      const gameKey = generateKey();
      await client.query(
        'INSERT INTO order_items (order_id, game_id, price, game_key) VALUES ($1, $2, $3, $4)',
        [order.id, item.id, item.price, gameKey]
      );
      orderItems.push({ gameId: item.id, name: item.name, price: item.price, image: item.image, gameKey });
    }

    await client.query('DELETE FROM cart WHERE user_id = $1', [pending.user_id]);
    await client.query(
      'UPDATE pending_payments SET status = $1, order_id = $2 WHERE id = $3',
      ['succeeded', order.id, pending.id]
    );

    await client.query('COMMIT');

    // Email receipt (async, don't block)
    pool.query('SELECT email, username FROM users WHERE id = $1', [pending.user_id]).then(({ rows }) => {
      const { email, username } = rows[0] || {};
      if (email) {
        emailService.sendOrderReceipt({
          to: email, username,
          order: { id: order.id, total: pending.amount, items: orderItems.map(i => ({ name: i.name, game_key: i.gameKey, price: i.price })) },
        }).catch(err => console.error('Receipt email failed:', err.message));
      }
    });

    checkAchievements(pending.user_id).catch(() => {});

    // Referral bonus on first purchase
    pool.query('SELECT referred_by FROM users WHERE id = $1', [pending.user_id]).then(async ({ rows }) => {
      const referrerId = rows[0]?.referred_by;
      if (!referrerId) return;
      const { rows: cnt } = await pool.query('SELECT COUNT(*)::int AS n FROM orders WHERE user_id = $1', [pending.user_id]);
      if (cnt[0].n === 1) {
        const promoCode = 'REF' + crypto.randomBytes(4).toString('hex').toUpperCase();
        await pool.query(
          'INSERT INTO referral_rewards (referrer_id, referred_id, reward_percent, promo_code) VALUES ($1, $2, 10, $3) ON CONFLICT DO NOTHING',
          [referrerId, pending.user_id, promoCode]
        );
        checkAchievements(referrerId).catch(() => {});
      }
    }).catch(() => {});

    return order.id;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// POST /api/payments/create
router.post('/create', auth, async (req, res) => {
  try {
    const cartResult = await pool.query(
      'SELECT g.id, g.name, g.price, g.image FROM cart c JOIN games g ON c.game_id = g.id WHERE c.user_id = $1',
      [req.user.id]
    );
    if (cartResult.rows.length === 0) return res.status(400).json({ error: 'Корзина пуста' });

    const items = cartResult.rows;
    const total = items.reduce((s, g) => s + parseFloat(g.price), 0);
    const description = `4Game: ${items.map(g => g.name).join(', ')}`.slice(0, 128);

    const payment = await ykRequest('POST', '/payments', {
      amount: { value: total.toFixed(2), currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: `${FRONTEND_URL}/success` },
      capture: true,
      description,
      metadata: { userId: String(req.user.id) },
    });

    await pool.query(
      'INSERT INTO pending_payments (id, user_id, amount, cart_snapshot) VALUES ($1, $2, $3, $4)',
      [payment.id, req.user.id, total, JSON.stringify(items)]
    );

    res.json({ paymentId: payment.id, confirmationUrl: payment.confirmation.confirmation_url });
  } catch (err) {
    console.error('Payment create error:', err);
    res.status(500).json({ error: 'Ошибка создания платежа' });
  }
});

// POST /api/payments/webhook — YooKassa notification
router.post('/webhook', async (req, res) => {
  res.sendStatus(200); // respond immediately

  try {
    const { event, object } = req.body || {};
    if (event !== 'payment.succeeded' || !object?.id) return;

    const { rows } = await pool.query(
      'SELECT * FROM pending_payments WHERE id = $1 AND status = $2',
      [object.id, 'pending']
    );
    if (rows.length === 0) return;

    await fulfillOrder(rows[0]);
    console.log(`✅ Payment ${object.id} fulfilled via webhook`);
  } catch (err) {
    console.error('Webhook error:', err);
  }
});

// GET /api/payments/status/:paymentId — frontend polls this after redirect
router.get('/status/:paymentId', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM pending_payments WHERE id = $1 AND user_id = $2',
      [req.params.paymentId, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Платёж не найден' });

    let pending = rows[0];

    // If still pending, ask YooKassa directly (fallback if webhook hasn't fired)
    if (pending.status === 'pending') {
      try {
        const ykPayment = await ykRequest('GET', `/payments/${pending.id}`);
        if (ykPayment.status === 'succeeded') {
          await fulfillOrder(pending);
          pending = (await pool.query('SELECT * FROM pending_payments WHERE id = $1', [pending.id])).rows[0];
          console.log(`✅ Payment ${pending.id} fulfilled via status poll`);
        } else if (ykPayment.status === 'canceled') {
          await pool.query('UPDATE pending_payments SET status = $1 WHERE id = $2', ['canceled', pending.id]);
          pending.status = 'canceled';
        }
      } catch (_) { /* YooKassa unreachable, return current status */ }
    }

    if (pending.status !== 'succeeded') {
      return res.json({ status: pending.status, order: null });
    }

    // Return order with keys
    const orderResult = await pool.query(
      `SELECT o.id, o.total, o.created_at,
              json_agg(json_build_object(
                'gameId', oi.game_id, 'price', oi.price, 'gameKey', oi.game_key,
                'name', g.name, 'image', g.image
              ) ORDER BY oi.id) as items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN games g ON g.id = oi.game_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [pending.order_id]
    );

    const order = orderResult.rows[0];
    res.json({
      status: 'succeeded',
      order: {
        orderId: order.id,
        total: parseFloat(order.total),
        items: order.items,
        createdAt: order.created_at,
      },
    });
  } catch (err) {
    console.error('Payment status error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
