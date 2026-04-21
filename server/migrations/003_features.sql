-- ═══════════════════════════════════
-- 4Game Schema v3 — reviews, password resets, price history
-- ═══════════════════════════════════

-- Отзывы пользователей на игры
CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id     INTEGER REFERENCES games(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text        TEXT,
  helpful     INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- "Полезность" отзыва - кто поставил +1 (чтоб не накручивали)
CREATE TABLE IF NOT EXISTS review_helpful (
  id          SERIAL PRIMARY KEY,
  review_id   INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Токены восстановления пароля
CREATE TABLE IF NOT EXISTS password_resets (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(100) UNIQUE NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  used        BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Email-подписки (маркетинг, скидки)
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(200) UNIQUE NOT NULL,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  confirmed   BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- История цен игр - для графика динамики цены
CREATE TABLE IF NOT EXISTS price_history (
  id          SERIAL PRIMARY KEY,
  game_id     INTEGER REFERENCES games(id) ON DELETE CASCADE,
  price       INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_reviews_game ON reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_price_history_game ON price_history(game_id, recorded_at DESC);
