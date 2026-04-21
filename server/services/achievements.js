import pool from '../db.js';

/**
 * Система достижений. Проверяет условия и выдаёт ачивки автоматически.
 * Вызывается из routes/orders.js, reviews.js, favorites.js.
 */

// Выдать ачивку (безопасно: не выдаст дважды)
async function grant(userId, achievementId) {
  try {
    const result = await pool.query(
      'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id',
      [userId, achievementId]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('Achievement grant error:', err.message);
    return false;
  }
}

// Проверить все ачивки пользователя — вызывать после каждой "значимой" операции
export async function checkAchievements(userId) {
  try {
    // Считаем активность
    const [orders, spent, reviews, favs, refs] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS n, COUNT(DISTINCT oi.game_id)::int AS games FROM orders o JOIN order_items oi ON oi.order_id = o.id WHERE o.user_id = $1', [userId]),
      pool.query('SELECT COALESCE(SUM(total), 0)::int AS total FROM orders WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*)::int AS n FROM reviews WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*)::int AS n FROM favorites WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*)::int AS n FROM users WHERE referred_by = $1', [userId]),
    ]);

    const gamesCount = orders.rows[0].games || 0;
    const totalSpent = spent.rows[0].total || 0;
    const reviewsCount = reviews.rows[0].n || 0;
    const favsCount = favs.rows[0].n || 0;
    const refsCount = refs.rows[0].n || 0;

    const granted = [];

    if (gamesCount >= 1  && await grant(userId, 'first_purchase')) granted.push('first_purchase');
    if (gamesCount >= 5  && await grant(userId, 'collector_5'))    granted.push('collector_5');
    if (gamesCount >= 15 && await grant(userId, 'collector_15'))   granted.push('collector_15');
    if (gamesCount >= 30 && await grant(userId, 'collector_30'))   granted.push('collector_30');

    if (totalSpent >= 10000 && await grant(userId, 'spender_10k')) granted.push('spender_10k');
    if (totalSpent >= 30000 && await grant(userId, 'spender_30k')) granted.push('spender_30k');

    if (reviewsCount >= 5  && await grant(userId, 'critic_5'))  granted.push('critic_5');
    if (reviewsCount >= 15 && await grant(userId, 'critic_15')) granted.push('critic_15');

    if (favsCount >= 1 && await grant(userId, 'first_favorite')) granted.push('first_favorite');
    if (refsCount >= 3 && await grant(userId, 'ref_master'))     granted.push('ref_master');

    return granted;
  } catch (err) {
    console.error('checkAchievements error:', err.message);
    return [];
  }
}

export default { checkAchievements };
