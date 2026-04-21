// Переключатель валют. Курсы захардкожены (можно заменить на API, но это diploma).
// Цены в БД хранятся в рублях, конвертируются на фронте при отображении.

export const CURRENCIES = {
  RUB: { code: 'RUB', symbol: '₽',  name: 'Рубли',         rate: 1       },
  USD: { code: 'USD', symbol: '$',  name: 'Доллары',        rate: 0.011   },
  EUR: { code: 'EUR', symbol: '€',  name: 'Евро',           rate: 0.010   },
  KZT: { code: 'KZT', symbol: '₸',  name: 'Тенге',          rate: 5.4     },
  BYN: { code: 'BYN', symbol: 'Br', name: 'Бел. рубли',     rate: 0.036   },
};

const STORAGE_KEY = 'currency';

export function getCurrency() {
  try {
    const c = localStorage.getItem(STORAGE_KEY);
    return c && CURRENCIES[c] ? c : 'RUB';
  } catch { return 'RUB'; }
}

export function setCurrency(code) {
  if (!CURRENCIES[code]) return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
    window.dispatchEvent(new Event('currency-change'));
  } catch {}
}

export function formatPrice(rubAmount, code) {
  const c = code || getCurrency();
  const cur = CURRENCIES[c] || CURRENCIES.RUB;
  const value = Math.round(Number(rubAmount) * cur.rate);
  return `${value.toLocaleString('ru-RU')}\u00a0${cur.symbol}`;
}
