CREATE TABLE IF NOT EXISTS pending_payments (
  id          VARCHAR(100) PRIMARY KEY,
  user_id     INTEGER      NOT NULL REFERENCES users(id),
  amount      NUMERIC(10,2) NOT NULL,
  cart_snapshot JSONB      NOT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
  order_id    INTEGER      REFERENCES orders(id),
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
