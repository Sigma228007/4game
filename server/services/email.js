import nodemailer from 'nodemailer';

// Email сервис. Работает через SMTP (Gmail, Resend, Mailgun, любой).
// Если не настроен - логирует письма в консоль, но не падает (удобно для dev).
//
// Нужные переменные в .env:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=your-email@gmail.com
//   SMTP_PASS=your-app-password  (для Gmail - пароль приложения, не основной!)
//   EMAIL_FROM="4Game <noreply@4game.com>"
//   FRONTEND_URL=https://4game-blush.vercel.app

const isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('📧 Email-сервис готов (SMTP настроен)');
} else {
  console.log('📧 Email-сервис в dev-режиме (SMTP не настроен — письма в консоль)');
}

const FROM = process.env.EMAIL_FROM || '4Game <noreply@4game.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://4game-blush.vercel.app';

async function send({ to, subject, html, text }) {
  if (!to) { console.warn('Email: получатель не указан, пропуск'); return; }

  if (!isConfigured) {
    console.log('\n─── EMAIL (dev) ───');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text?.slice(0, 200) || html?.replace(/<[^>]+>/g, '').slice(0, 200));
    console.log('───────────────────\n');
    return { queued: true, dev: true };
  }

  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html, text });
    console.log(`📧 Письмо отправлено → ${to} (${subject})`);
    return { queued: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email ошибка:', err.message);
    return { queued: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════
// ШАБЛОНЫ ПИСЕМ
// ══════════════════════════════════════════════════

function wrap(title, content) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0A0610;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0610;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#141424;border-radius:16px;overflow:hidden;max-width:600px">
        <tr><td style="background:linear-gradient(135deg,#E8102E,#B50D24);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:900;letter-spacing:-0.5px">4GAME</h1>
          <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:11px;letter-spacing:3px;text-transform:uppercase">Digital Store</p>
        </td></tr>
        <tr><td style="padding:40px 32px;color:#e5e5ea">
          <h2 style="color:#fff;font-size:22px;margin:0 0 16px">${title}</h2>
          ${content}
        </td></tr>
        <tr><td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);font-size:12px;text-align:center">
          4Game · г. Владивосток · support@4game.com · +7 (924) 248-53-93
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendOrderReceipt({ to, order, username }) {
  const itemsHtml = (order.items || []).map(i => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
        <div style="color:#fff;font-weight:bold;font-size:14px">${escapeHtml(i.name)}</div>
        <code style="display:inline-block;margin-top:6px;padding:6px 10px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:6px;color:#10B981;font-size:12px;font-family:monospace">${escapeHtml(i.game_key || i.gameKey || '—')}</code>
      </td>
      <td align="right" style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#10B981;font-weight:bold">
        ${(i.price || 0).toLocaleString('ru-RU')}&nbsp;₽
      </td>
    </tr>`).join('');

  const content = `
    <p style="color:rgba(255,255,255,0.7);line-height:1.6">Привет, <strong style="color:#fff">${escapeHtml(username || 'геймер')}</strong>! Спасибо за покупку. Ниже — твои ключи активации.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">${itemsHtml}</table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;padding-top:20px;border-top:2px solid rgba(255,255,255,0.08)">
      <tr>
        <td style="color:#fff;font-size:16px;font-weight:bold">Итого</td>
        <td align="right" style="color:#10B981;font-size:22px;font-weight:900">${(order.total || 0).toLocaleString('ru-RU')}&nbsp;₽</td>
      </tr>
    </table>
    <div style="margin-top:32px;padding:16px;background:rgba(232,16,46,0.08);border-left:3px solid #E8102E;border-radius:4px;color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6">
      <strong style="color:#fff">Как активировать:</strong> скопируй ключ → открой Steam / Epic / GOG → «Активировать продукт» → вставь ключ. Всё.
    </div>
    <p style="margin-top:24px;color:rgba(255,255,255,0.5);font-size:13px">Посмотреть все заказы: <a href="${FRONTEND_URL}/orders" style="color:#E8102E">4game-blush.vercel.app/orders</a></p>`;

  return send({
    to,
    subject: `Заказ #${order.id} — твои ключи активации`,
    html: wrap('Твой заказ готов 🎮', content),
    text: `Спасибо за покупку!\nЗаказ #${order.id}\nИтого: ${(order.total || 0).toLocaleString('ru-RU')} ₽\n\nКлючи:\n${(order.items || []).map(i => `${i.name}: ${i.game_key || i.gameKey}`).join('\n')}`,
  });
}

export async function sendPasswordReset({ to, username, resetUrl }) {
  const content = `
    <p style="color:rgba(255,255,255,0.7);line-height:1.6">Привет, <strong style="color:#fff">${escapeHtml(username || 'геймер')}</strong>! Ты запросил восстановление пароля в 4Game.</p>
    <p style="margin:24px 0"><a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#E8102E,#B50D24);color:#fff;text-decoration:none;border-radius:10px;font-weight:bold">Сбросить пароль</a></p>
    <p style="color:rgba(255,255,255,0.5);font-size:12px">Или скопируй эту ссылку в браузер: <br/><code style="color:#9CA3AF;word-break:break-all">${resetUrl}</code></p>
    <p style="margin-top:24px;color:rgba(255,255,255,0.4);font-size:12px">Ссылка действует 30 минут. Если ты не запрашивал восстановление — просто проигнорируй это письмо.</p>`;

  return send({
    to,
    subject: 'Восстановление пароля 4Game',
    html: wrap('Сброс пароля 🔑', content),
    text: `Для сброса пароля перейди по ссылке (действительна 30 минут): ${resetUrl}`,
  });
}

export async function sendTicketReply({ to, username, ticketId, subject, message, fromRole }) {
  const roleLabel = fromRole === 'admin' ? 'Администратор' : fromRole === 'support' ? 'Поддержка' : 'Пользователь';
  const content = `
    <p style="color:rgba(255,255,255,0.7);line-height:1.6">Привет, <strong style="color:#fff">${escapeHtml(username || 'геймер')}</strong>! В твоё обращение <strong style="color:#fff">«${escapeHtml(subject)}»</strong> пришёл ответ от <span style="color:#10B981">${roleLabel}</span>.</p>
    <div style="margin:20px 0;padding:16px 20px;background:rgba(255,255,255,0.03);border-left:3px solid #10B981;border-radius:4px;color:rgba(255,255,255,0.85);font-style:italic;line-height:1.6">${escapeHtml(message).slice(0, 500)}${message.length > 500 ? '…' : ''}</div>
    <p><a href="${FRONTEND_URL}/support/${ticketId}" style="display:inline-block;padding:12px 24px;background:#E8102E;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:13px">Открыть чат</a></p>`;

  return send({
    to,
    subject: `Новый ответ в обращении #${ticketId}`,
    html: wrap('Новое сообщение в поддержке', content),
    text: `${roleLabel} ответил в обращении "${subject}":\n\n${message}\n\nОткрыть: ${FRONTEND_URL}/support/${ticketId}`,
  });
}

export async function sendWelcome({ to, username }) {
  const content = `
    <p style="color:rgba(255,255,255,0.7);line-height:1.6">Добро пожаловать, <strong style="color:#fff">${escapeHtml(username)}</strong>! Рады видеть тебя в 4Game.</p>
    <p style="color:rgba(255,255,255,0.7);line-height:1.6">У нас 35+ игр для Steam, Epic, GOG. Честные цены, ключи за 30 секунд, поддержка 24/7.</p>
    <p style="margin:24px 0"><a href="${FRONTEND_URL}/catalog" style="display:inline-block;padding:12px 24px;background:#E8102E;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">В каталог</a></p>
    <div style="margin-top:24px;padding:14px 18px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15);border-radius:8px">
      <p style="margin:0;color:#10B981;font-size:13px"><strong>Промокод на первую покупку:</strong> <code style="background:rgba(0,0,0,0.3);padding:3px 8px;border-radius:4px;font-family:monospace">WELCOME10</code> — скидка 10%</p>
    </div>`;

  return send({
    to,
    subject: 'Добро пожаловать в 4Game 🎮',
    html: wrap('Приветствуем в 4Game!', content),
    text: `Добро пожаловать в 4Game! Промокод на первую покупку: WELCOME10 (−10%). ${FRONTEND_URL}/catalog`,
  });
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export default { send, sendOrderReceipt, sendPasswordReset, sendTicketReply, sendWelcome };
