import { useState, useEffect } from 'react';
import { getCurrency, formatPrice as fp } from '../utils/currency';

/**
 * Хук: живая цена. Подписывается на смену валюты и форматирует цену.
 */
export function usePrice() {
  const [currency, setCurrency] = useState(getCurrency());

  useEffect(() => {
    const handler = () => setCurrency(getCurrency());
    window.addEventListener('currency-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('currency-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return {
    currency,
    format: (rub) => fp(rub, currency),
  };
}
