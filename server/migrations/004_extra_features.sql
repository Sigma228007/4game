-- ═══════════════════════════════════
-- 4Game Schema v4 — referrals, achievements, 2FA, subscriptions, gifts
-- ═══════════════════════════════════

-- Добавляем поля в users (если их ещё нет)
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'ru';
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency VARCHAR(5) DEFAULT 'RUB';

-- Wishlist с запомненной ценой (для уведомлений о снижении)
CREATE TABLE IF NOT EXISTS wishlist (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id      INTEGER REFERENCES games(id) ON DELETE CASCADE,
  price_at_add INTEGER NOT NULL,
  notify       BOOLEAN DEFAULT true,
  added_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Достижения: определение
CREATE TABLE IF NOT EXISTS achievements (
  id           VARCHAR(50) PRIMARY KEY,
  title        VARCHAR(100) NOT NULL,
  description  TEXT,
  icon         VARCHAR(10),
  tier         VARCHAR(20) DEFAULT 'bronze'  -- bronze | silver | gold | platinum
);

-- Достижения: выданные пользователям
CREATE TABLE IF NOT EXISTS user_achievements (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id  VARCHAR(50) REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Подарки: игра, купленная одним юзером для другого
CREATE TABLE IF NOT EXISTS gifts (
  id           SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  to_user_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id      INTEGER REFERENCES games(id) ON DELETE SET NULL,
  game_key     VARCHAR(30) NOT NULL,
  message      TEXT,
  claimed      BOOLEAN DEFAULT false,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Реферальные начисления (когда приглашённый совершил первую покупку)
CREATE TABLE IF NOT EXISTS referral_rewards (
  id             SERIAL PRIMARY KEY,
  referrer_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  referred_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reward_percent INTEGER NOT NULL DEFAULT 10,
  promo_code     VARCHAR(30),
  claimed        BOOLEAN DEFAULT false,
  created_at     TIMESTAMP DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Сиды достижений
INSERT INTO achievements (id, title, description, icon, tier) VALUES
  ('first_purchase',  'Первый шаг',       'Совершил первую покупку',              '🎯', 'bronze'),
  ('collector_5',     'Начинающий геймер', 'Купил 5 игр',                          '🎮', 'bronze'),
  ('collector_15',    'Коллекционер',     'Купил 15 игр',                         '🏆', 'silver'),
  ('collector_30',    'Профессионал',     'Купил 30 игр',                         '👑', 'gold'),
  ('spender_10k',     'Щедрый',           'Потратил более 10 000 ₽',              '💎', 'silver'),
  ('spender_30k',     'Магнат',           'Потратил более 30 000 ₽',              '💰', 'gold'),
  ('critic_5',        'Критик',           'Оставил 5 отзывов',                    '✍️', 'bronze'),
  ('critic_15',       'Эксперт',          'Оставил 15 отзывов',                   '📝', 'silver'),
  ('first_favorite',  'Первая любовь',    'Добавил игру в избранное',             '❤️', 'bronze'),
  ('ref_master',      'Рефовод',          'Пригласил 3 пользователей',            '🤝', 'silver')
ON CONFLICT (id) DO NOTHING;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_to ON gifts(to_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
