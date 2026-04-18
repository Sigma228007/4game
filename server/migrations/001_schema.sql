-- ═══════════════════════════════════
-- 4Game Database Schema v2
-- ═══════════════════════════════════

-- Пользователи с ролями
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(50) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  email        VARCHAR(200),
  role         VARCHAR(20) DEFAULT 'user',  -- user | support | admin
  avatar_color INTEGER DEFAULT 0,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Жанры
CREATE TABLE IF NOT EXISTS genres (
  id    VARCHAR(20) PRIMARY KEY,
  name  VARCHAR(50) NOT NULL,
  icon  VARCHAR(10) NOT NULL
);

-- Игры
CREATE TABLE IF NOT EXISTS games (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  genre_id    VARCHAR(20) REFERENCES genres(id),
  price       INTEGER NOT NULL,
  old_price   INTEGER,
  description TEXT,
  rating      DECIMAL(2,1) DEFAULT 0,
  year        INTEGER,
  featured    BOOLEAN DEFAULT false,
  image       VARCHAR(500),
  tags        TEXT[] DEFAULT '{}'
);

-- Избранное
CREATE TABLE IF NOT EXISTS favorites (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id   INTEGER REFERENCES games(id) ON DELETE CASCADE,
  added_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Корзина
CREATE TABLE IF NOT EXISTS cart (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  game_id   INTEGER REFERENCES games(id) ON DELETE CASCADE,
  added_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Заказы
CREATE TABLE IF NOT EXISTS orders (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  total       INTEGER NOT NULL,
  status      VARCHAR(20) DEFAULT 'completed',
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Позиции заказа с ключами активации
CREATE TABLE IF NOT EXISTS order_items (
  id        SERIAL PRIMARY KEY,
  order_id  INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  game_id   INTEGER REFERENCES games(id) ON DELETE SET NULL,
  price     INTEGER NOT NULL,
  game_key  VARCHAR(30) NOT NULL
);

-- Тикеты поддержки
CREATE TABLE IF NOT EXISTS tickets (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject     VARCHAR(200) NOT NULL,
  status      VARCHAR(20) DEFAULT 'open',  -- open | answered | closed
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Сообщения в тикете (чат)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id          SERIAL PRIMARY KEY,
  ticket_id   INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
