-- Добавляем отдельный промокод для приглашённого (referred) пользователя
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS referred_promo_code VARCHAR(30);
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS referred_claimed BOOLEAN NOT NULL DEFAULT false;
