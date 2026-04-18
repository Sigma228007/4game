import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PageTransition } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';

export default function Login() {
  const { login, register, isAuth } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuth) { navigate('/', { replace: true }); return null; }

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    if (!username.trim() || !password.trim()) { setError('Заполните оба поля'); return; }
    if (mode === 'register' && password.length < 4) { setError('Пароль минимум 4 символа'); return; }

    setLoading(true);
    const fn = mode === 'register' ? register : login;
    const result = await fn(username.trim(), password.trim());
    setLoading(false);

    if (result.success) navigate('/', { replace: true });
    else setError(result.message);
  }

  return (
    <PageTransition>
      <div className="relative min-h-[85vh] flex items-center justify-center px-5 overflow-hidden">

        {/* Персонажи — Джин слева, Артур справа */}
        <PosterAccent src="/images/game-1.jpg" side="left"  top={0} height="100%" opacity={0.55} objectPosition="50% 20%" />
        <PosterAccent src="/images/game-2.jpg" side="right" top={0} height="100%" opacity={0.5}  objectPosition="50% 28%" />

        {/* Свечения за формой */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-[420px] z-10">
          <div className="glass-static p-8 md:p-10 space-y-7">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-sm">
                <Gamepad2 size={26} className="text-white" />
              </div>
              <h1 className="font-display text-[22px] font-bold" style={{ color: 'var(--text)' }}>
                {mode === 'login' ? 'Войти в 4Game' : 'Создать аккаунт'}
              </h1>
            </div>

            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)' }}>
              {[
                { id: 'login',    label: 'Вход',        icon: LogIn    },
                { id: 'register', label: 'Регистрация', icon: UserPlus },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setMode(t.id); setError(''); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-display font-semibold transition-all"
                  style={{
                    background: mode === t.id ? 'var(--bg-elevated)' : 'transparent',
                    color:      mode === t.id ? 'var(--text)'        : 'var(--text-faint)',
                    boxShadow:  mode === t.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-3 rounded-xl bg-primary/8 border border-primary/12 text-primary text-[13px] font-body text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="label">Логин</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Придумайте логин"
                  autoComplete="username"
                  className="input"
                />
              </div>
              <div className="space-y-2">
                <label className="label">Пароль</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Минимум 4 символа' : 'Ваш пароль'}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    className="input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition"
                    style={{ color: 'var(--text-faint)' }}
                    aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full py-4 text-[15px] disabled:opacity-50"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <>{mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />} {mode === 'login' ? 'Войти' : 'Создать аккаунт'}</>
                }
              </motion.button>
            </form>

            <p className="font-body text-[11px] text-center" style={{ color: 'var(--text-faint)' }}>
              {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'login' ? 'Зарегистрируйтесь' : 'Войдите'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
