import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../utils/i18n.jsx';
import { PageTransition } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';

export default function Login() {
  const { login, register, isAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();

  const [refCode] = useState(() => {
    const urlRef = searchParams.get('ref');
    if (urlRef) { try { sessionStorage.setItem('pendingRefCode', urlRef); } catch {} return urlRef; }
    try { return sessionStorage.getItem('pendingRefCode') || ''; } catch { return ''; }
  });
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuth) { navigate('/', { replace: true }); return null; }

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    if (!username.trim() || !password.trim()) { setError(t('login.error.requiredFields')); return; }
    if (mode === 'register' && password.length < 4) { setError(t('login.error.shortPassword')); return; }
    if (mode === 'register' && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('login.error.badEmail')); return;
    }

    setLoading(true);
    const result = mode === 'register'
      ? await register(username.trim(), password.trim(), email.trim() || null)
      : await login(username.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      if (mode === 'register' && refCode) {
        try {
          const { api } = await import('../api');
          await api.applyReferral(refCode);
          sessionStorage.removeItem('pendingRefCode');
        } catch {}
      }
      navigate('/', { replace: true });
    } else {
      setError(result.message);
    }
  }

  const tabs = [
    { id: 'login',    label: t('login.tabLogin'),    icon: LogIn    },
    { id: 'register', label: t('login.tabRegister'), icon: UserPlus },
  ];

  return (
    <PageTransition>
      <div className="relative min-h-[85vh] flex items-center justify-center px-5 overflow-hidden">

        <PosterAccent src="/images/game-1.jpg" side="left"  top={0} height="100%" opacity={0.55} objectPosition="50% 20%" />
        <PosterAccent src="/images/game-2.jpg" side="right" top={0} height="100%" opacity={0.5}  objectPosition="50% 28%" />

        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-[420px] z-10">
          <div className="glass-static p-8 md:p-10 space-y-7">
            <div className="text-center space-y-4">
              <img src="/favicon.png" alt="4Game" className="w-16 h-16 mx-auto rounded-2xl object-cover shadow-glow-sm" />
              <h1 className="font-display text-[22px] font-bold" style={{ color: 'var(--text)' }}>
                {mode === 'login' ? t('login.title') : t('login.titleRegister')}
              </h1>
            </div>

            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface)' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setMode(tab.id); setError(''); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-display font-semibold transition-all"
                  style={{
                    background: mode === tab.id ? 'var(--bg-elevated)' : 'transparent',
                    color:      mode === tab.id ? 'var(--text)'        : 'var(--text-faint)',
                    boxShadow:  mode === tab.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <tab.icon size={14} /> {tab.label}
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
              {mode === 'register' && refCode && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-[12px] font-body text-center"
                >
                  {t('login.refBanner')} <strong className="font-display">{refCode}</strong> {t('login.refBannerSuffix')}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="label">{t('login.username')}</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={t('login.usernamePlaceholder')}
                  autoComplete="username"
                  className="input"
                />
              </div>
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="label">
                    {t('common.email')}{' '}
                    <span style={{ color: 'var(--text-faint)' }}>({t('login.emailDesc')})</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="input"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="label">{t('common.password')}</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? t('login.passwordPlaceholderNew') : t('login.passwordPlaceholder')}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    className="input pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition"
                    style={{ color: 'var(--text-faint)' }}
                    aria-label={showPass ? t('login.hidePassword') : t('login.showPassword')}
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
                  : <>{mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />} {mode === 'login' ? t('login.submit') : t('login.submitRegister')}</>
                }
              </motion.button>
            </form>

            <p className="font-body text-[11px] text-center" style={{ color: 'var(--text-faint)' }}>
              {mode === 'login' ? t('login.noAccount') : t('login.haveAccount')}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'login' ? t('login.switchToRegister') : t('login.switchToLogin')}
              </button>
            </p>
            {mode === 'login' && (
              <p className="font-body text-[11px] text-center" style={{ color: 'var(--text-faint)' }}>
                <Link to="/reset-password" className="hover:text-primary transition-colors">{t('login.forgotPassword')}</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
