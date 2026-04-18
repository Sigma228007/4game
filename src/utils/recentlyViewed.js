// Управление списком "Недавно смотренных" игр. Хранится в localStorage.
const KEY = 'recentlyViewed';
const MAX = 8;

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter(n => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

export function pushRecentlyViewed(gameId) {
  const id = Number(gameId);
  if (!Number.isFinite(id)) return;
  const current = getRecentlyViewed().filter(x => x !== id);
  const next = [id, ...current].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('recently-viewed-change'));
  } catch {}
}

export function clearRecentlyViewed() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event('recently-viewed-change'));
  } catch {}
}
