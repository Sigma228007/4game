import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { getGameById } from '../data/games';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favIds, setFavIds] = useState([]);
  const [favItems, setFavItems] = useState([]);
  const [useApi, setUseApi] = useState(true);

  const loadFavorites = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      loadFromLocal();
      return;
    }

    try {
      const ids = await api.getFavoriteIds();
      setFavIds(ids);
      setUseApi(true);
      setFavItems(ids.map(id => getGameById(id)).filter(Boolean));
    } catch {
      setUseApi(false);
      loadFromLocal();
    }
  }, []);

  function loadFromLocal() {
    try {
      const ids = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavIds(ids);
      setFavItems(ids.map(id => getGameById(id)).filter(Boolean));
    } catch { setFavIds([]); setFavItems([]); }
  }

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  useEffect(() => {
    if (!useApi) localStorage.setItem('favorites', JSON.stringify(favIds));
  }, [favIds, useApi]);

  function updateState(newIds) {
    setFavIds(newIds);
    setFavItems(newIds.map(id => getGameById(id)).filter(Boolean));
    if (!useApi) localStorage.setItem('favorites', JSON.stringify(newIds));
  }

  async function addToFavorites(gameId) {
    if (favIds.includes(gameId)) return false;
    try { if (useApi) await api.addFavorite(gameId); } catch {}
    updateState([...favIds, gameId]);
    return true;
  }

  async function removeFromFavorites(gameId) {
    try { if (useApi) await api.removeFavorite(gameId); } catch {}
    updateState(favIds.filter(id => id !== gameId));
  }

  function isFavorite(gameId) {
    return favIds.includes(gameId);
  }

  async function toggleFavorite(gameId) {
    if (isFavorite(gameId)) {
      await removeFromFavorites(gameId);
      return false;
    } else {
      await addToFavorites(gameId);
      return true;
    }
  }

  return (
    <FavoritesContext.Provider value={{ favItems, favIds, count: favIds.length, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite, reload: loadFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be inside FavoritesProvider');
  return ctx;
};
