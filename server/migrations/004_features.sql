-- ═══════════════════════════════════════════
-- 4Game Schema v4 — full coverage
-- gifts, bundles, preorders, price alerts,
-- achievements, referrals, 2FA, custom tags
-- ═══════════════════════════════════════════

-- ── 2FA TOTP для admin/support ──
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret    VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled   BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by    INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code  VARCHAR(16) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS language       VARCHAR(5) DEFAULT 'ru';
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency       VARCHAR(3) DEFAULT 'RUB';
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme          VARCHAR(20) DEFAULT 'dark';

-- ── Алерты цен (wishlist price drop) ──
-- Хранит что за игру следим + цену на момент добавления + было ли уже отправлено уведомление
CREATE TABLE IF NOT EXISTS price_alerts (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id         INTEGER REFERENCES games(id) ON DELETE CASCADE,
  initial_price   INTEGER NOT NULL,
  notified_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- ── Подарки (gifting) ──
-- Покупка игры другому пользователю (по username или email)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS gift_message    TEXT;

-- ── Бандлы ──
-- Набор игр со скидкой за покупку комплектом
CREATE TABLE IF NOT EXISTS bundles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  image       VARCHAR(500),
  discount    INTEGER NOT NULL DEFAULT 25, -- %
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id          SERIAL PRIMARY KEY,
  bundle_id   INTEGER REFERENCES bundles(id) ON DELETE CASCADE,
  game_id     INTEGER REFERENCES games(id)  ON DELETE CASCADE,
  UNIQUE(bundle_id, game_id)
);

-- ── Предзаказы ──
-- Флаг на игре: "игра будет доступна с этой даты"
ALTER TABLE games ADD COLUMN IF NOT EXISTS release_date  TIMESTAMP;
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_preorder   BOOLEAN DEFAULT false;

-- ── Достижения пользователя ──
CREATE TABLE IF NOT EXISTS achievements (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code        VARCHAR(50) NOT NULL,         -- first_purchase, collector, critic, …
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, code)
);

-- ── Crowd-sourced теги ──
-- Пользователи голосуют за подходящие теги
CREATE TABLE IF NOT EXISTS game_tags (
  id          SERIAL PRIMARY KEY,
  game_id     INTEGER REFERENCES games(id) ON DELETE CASCADE,
  tag         VARCHAR(40) NOT NULL,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(game_id, tag, user_id)
);

-- ── Индексы ──
CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_game ON price_alerts(game_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_game_tags_game ON game_tags(game_id);

-- ── Инициализация реф-кодов для существующих пользователей ──
-- (короткий буквенно-цифровой код из username + random суффикс)
UPDATE users
SET referral_code = UPPER(SUBSTRING(username FROM 1 FOR 4)) || SUBSTRING(MD5(id::TEXT) FROM 1 FOR 4)
WHERE referral_code IS NULL;
