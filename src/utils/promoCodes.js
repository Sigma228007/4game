// Промокоды. Реальная проверка с условиями.
// type: 'percent' | 'fixed'; minOrder - минимальная сумма для применения; maxDiscount - потолок
export const PROMO_CODES = {
  WELCOME10:   { type: 'percent', value: 10,   minOrder: 0,    label: 'Скидка 10%',           maxDiscount: 1000 },
  GAMER25:     { type: 'percent', value: 25,   minOrder: 3000, label: '25% от суммы 3000 ₽', maxDiscount: 2500 },
  NEWBIE500:   { type: 'fixed',   value: 500,  minOrder: 1500, label: '−500 ₽ от 1500 ₽',    maxDiscount: 500  },
  SUMMER2026:  { type: 'percent', value: 15,   minOrder: 2000, label: '15% на лето',         maxDiscount: 1500 },
};

// Возвращает { valid: true, discount: N, promo } либо { valid: false, error: '...' }
export function applyPromo(code, subtotal) {
  if (!code) return { valid: false, error: 'Введите промокод' };
  const key = code.trim().toUpperCase();
  const promo = PROMO_CODES[key];
  if (!promo) return { valid: false, error: 'Промокод не найден' };
  if (subtotal < promo.minOrder) {
    return {
      valid: false,
      error: `Минимальная сумма для ${key}: ${promo.minOrder.toLocaleString('ru-RU')} ₽`,
    };
  }
  const raw = promo.type === 'percent' ? Math.floor(subtotal * promo.value / 100) : promo.value;
  const discount = Math.min(raw, promo.maxDiscount);
  return { valid: true, discount, promo, code: key };
}
