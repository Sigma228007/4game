import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // При загрузке проверяем токен
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.getMe()
      .then(data => setUser(data))
      .catch(() => {
        // Токен протух или сервер не запущен — пробуем localStorage fallback
        const saved = localStorage.getItem('currentUser');
        if (saved) {
          const accRaw = localStorage.getItem('userAccount');
          let createdAt = null;
          if (accRaw) { try { createdAt = JSON.parse(accRaw).createdAt; } catch {} }
          setUser({ username: saved, id: null, offline: true, createdAt });
        }
        else localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    try {
      const data = await api.login(username, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true, message: 'Добро пожаловать!' };
    } catch (err) {
      // Если сервер не запущен — fallback на localStorage
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        return loginOffline(username, password);
      }
      return { success: false, message: err.message };
    }
  }

  async function register(username, password) {
    try {
      const data = await api.register(username, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true, message: 'Аккаунт создан!' };
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        return loginOffline(username, password);
      }
      return { success: false, message: err.message };
    }
  }

  // Fallback для работы без бэкенда
  function loginOffline(username, password) {
    const accRaw = localStorage.getItem('userAccount');
    if (!accRaw) {
      const createdAt = new Date().toISOString();
      localStorage.setItem('userAccount', JSON.stringify({ login: username, password, createdAt }));
      localStorage.setItem('currentUser', username);
      setUser({ username, id: null, offline: true, createdAt });
      return { success: true, message: 'Аккаунт создан (offline)' };
    }
    try {
      const acc = JSON.parse(accRaw);
      if (username === acc.login && password === acc.password) {
        localStorage.setItem('currentUser', username);
        setUser({ username, id: null, offline: true, createdAt: acc.createdAt });
        return { success: true, message: 'Вход выполнен (offline)' };
      }
      return { success: false, message: 'Неверный логин или пароль' };
    } catch {
      return { success: false, message: 'Ошибка данных' };
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      username: user?.username || null,
      login,
      register,
      logout,
      loading,
      isAuth: !!user,
      isOffline: user?.offline || false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
