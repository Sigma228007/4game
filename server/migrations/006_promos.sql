-- Таблица использованных промокодов (для однократного использования)
CREATE TABLE IF NOT EXISTS used_promos (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code      VARCHAR(50) NOT NULL,
  used_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, code)
);

-- Добавляем поля промокода в pending_payments
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS promo_code     VARCHAR(50);
ALTER TABLE pending_payments ADD COLUMN IF NOT EXISTS promo_discount INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_used_promos_user ON used_promos(user_id);
