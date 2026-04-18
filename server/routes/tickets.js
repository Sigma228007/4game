import { Router } from 'express';
import pool from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// POST /api/tickets — создать тикет
router.post('/', auth, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ error: 'Заполните тему и сообщение' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const ticketResult = await client.query(
        'INSERT INTO tickets (user_id, subject) VALUES ($1, $2) RETURNING id, status, created_at',
        [req.user.id, subject]
      );
      const ticket = ticketResult.rows[0];

      await client.query(
        'INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES ($1, $2, $3)',
        [ticket.id, req.user.id, message]
      );

      await client.query('COMMIT');
      res.status(201).json({ id: ticket.id, subject, status: ticket.status, createdAt: ticket.created_at });
    } finally { client.release(); }
  } catch (err) { console.error('Create ticket error:', err); res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/tickets — мои тикеты (для пользователей) или все (для support/admin)
router.get('/', auth, async (req, res) => {
  try {
    const isStaff = req.user.role === 'admin' || req.user.role === 'support';
    const query = isStaff
      ? `SELECT t.*, u.username, 
           (SELECT COUNT(*) FROM ticket_messages tm WHERE tm.ticket_id = t.id) as message_count
         FROM tickets t JOIN users u ON t.user_id = u.id ORDER BY t.updated_at DESC`
      : `SELECT t.*,
           (SELECT COUNT(*) FROM ticket_messages tm WHERE tm.ticket_id = t.id) as message_count
         FROM tickets t WHERE t.user_id = $1 ORDER BY t.updated_at DESC`;

    const result = isStaff
      ? await pool.query(query)
      : await pool.query(query, [req.user.id]);

    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/tickets/:id — тикет с сообщениями
router.get('/:id', auth, async (req, res) => {
  try {
    const isStaff = req.user.role === 'admin' || req.user.role === 'support';

    // Проверяем доступ
    const ticketResult = await pool.query('SELECT t.*, u.username FROM tickets t JOIN users u ON t.user_id = u.id WHERE t.id = $1', [req.params.id]);
    if (ticketResult.rows.length === 0) return res.status(404).json({ error: 'Тикет не найден' });

    const ticket = ticketResult.rows[0];
    if (!isStaff && ticket.user_id !== req.user.id) return res.status(403).json({ error: 'Нет доступа' });

    // Получаем сообщения
    const messagesResult = await pool.query(
      `SELECT tm.*, u.username, u.role as sender_role
       FROM ticket_messages tm
       JOIN users u ON tm.sender_id = u.id
       WHERE tm.ticket_id = $1
       ORDER BY tm.created_at ASC`,
      [req.params.id]
    );

    res.json({ ...ticket, messages: messagesResult.rows });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/tickets/:id/messages — отправить сообщение в тикет
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Введите сообщение' });

    const isStaff = req.user.role === 'admin' || req.user.role === 'support';

    // Проверяем доступ
    const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    if (ticketResult.rows.length === 0) return res.status(404).json({ error: 'Тикет не найден' });
    const ticket = ticketResult.rows[0];
    if (!isStaff && ticket.user_id !== req.user.id) return res.status(403).json({ error: 'Нет доступа' });

    // Добавляем сообщение
    const msgResult = await pool.query(
      'INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES ($1, $2, $3) RETURNING id, created_at',
      [req.params.id, req.user.id, message]
    );

    // Обновляем статус тикета
    const newStatus = isStaff ? 'answered' : 'open';
    await pool.query('UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, req.params.id]);

    res.json({
      id: msgResult.rows[0].id,
      ticketId: parseInt(req.params.id),
      senderId: req.user.id,
      username: req.user.username,
      senderRole: req.user.role,
      message,
      createdAt: msgResult.rows[0].created_at,
    });
  } catch (err) { console.error('Send message error:', err); res.status(500).json({ error: 'Ошибка сервера' }); }
});

// PUT /api/tickets/:id/close — закрыть тикет
router.put('/:id/close', auth, async (req, res) => {
  try {
    const isStaff = req.user.role === 'admin' || req.user.role === 'support';
    const ticketResult = await pool.query('SELECT * FROM tickets WHERE id = $1', [req.params.id]);
    if (ticketResult.rows.length === 0) return res.status(404).json({ error: 'Тикет не найден' });
    if (!isStaff && ticketResult.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Нет доступа' });

    await pool.query('UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2', ['closed', req.params.id]);
    res.json({ message: 'Тикет закрыт' });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

export default router;
