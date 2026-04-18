import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { getGameById } from '../data/games';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartIds, setCartIds] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [useApi, setUseApi] = useState(true);

  // Загрузка корзины
  const loadCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      loadFromLocal();
      return;
    }

    try {
      const ids = await api.getCartIds();
      setCartIds(ids);
      setUseApi(true);
      // Получаем данные игр из локальной базы (быстрее)
      const items = ids.map(id => getGameById(id)).filter(Boolean);
      setCartItems(items);
      setTotal(items.reduce((s, g) => s + g.price, 0));
    } catch {
      setUseApi(false);
      loadFromLocal();
    }
  }, []);

  function loadFromLocal() {
    try {
      const ids = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartIds(ids);
      const items = ids.map(id => getGameById(id)).filter(Boolean);
      setCartItems(items);
      setTotal(items.reduce((s, g) => s + g.price, 0));
    } catch { setCartIds([]); setCartItems([]); setTotal(0); }
  }

  useEffect(() => { loadCart(); }, [loadCart]);

  // Синхронизация localStorage для offline
  useEffect(() => {
    if (!useApi) localStorage.setItem('cart', JSON.stringify(cartIds));
  }, [cartIds, useApi]);

  async function addToCart(gameId) {
    if (cartIds.includes(gameId)) return false;
    try {
      if (useApi) await api.addToCart(gameId);
    } catch { /* continue offline */ }

    const newIds = [...cartIds, gameId];
    setCartIds(newIds);
    const items = newIds.map(id => getGameById(id)).filter(Boolean);
    setCartItems(items);
    setTotal(items.reduce((s, g) => s + g.price, 0));
    if (!useApi) localStorage.setItem('cart', JSON.stringify(newIds));
    return true;
  }

  async function removeFromCart(gameId) {
    try {
      if (useApi) await api.removeFromCart(gameId);
    } catch { /* continue */ }

    const newIds = cartIds.filter(id => id !== gameId);
    setCartIds(newIds);
    const items = newIds.map(id => getGameById(id)).filter(Boolean);
    setCartItems(items);
    setTotal(items.reduce((s, g) => s + g.price, 0));
    if (!useApi) localStorage.setItem('cart', JSON.stringify(newIds));
  }

  function isInCart(gameId) {
    return cartIds.includes(gameId);
  }

  async function clearCart() {
    try {
      if (useApi) await api.clearCart();
    } catch { /* continue */ }
    setCartIds([]);
    setCartItems([]);
    setTotal(0);
    localStorage.setItem('cart', '[]');
  }

  return (
    <CartContext.Provider value={{ cartItems, cartIds, total, count: cartIds.length, addToCart, removeFromCart, isInCart, clearCart, reload: loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
