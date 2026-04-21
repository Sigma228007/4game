import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, CheckCircle, Key, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { PageTransition } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Два режима: без токена — "забыл пароль" (вводишь email), с токеном — "задаёшь новый"
  const [mode] = useState(token ? 'reset' : 'request');

  // Режим "запросить восстановление"
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  // Режим "установить новый пароль"
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRequest(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Введите email'); return; }
    setLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    if (newPass.length < 4) { setError('Пароль минимум 4 символа'); return; }
    if (newPass !== confirmPass) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    try {
      await api.resetPassword(token, newPass);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <PageTransition>
      <div className="relative min-h-[85vh] flex items-center justify-center px-5 overflow-hidden">
        <PosterAccent src="/images/game-1.jpg" side="left"  top={0} height="100%" opacity={0.55} objectPosition="50% 20%" />
        <PosterAccent src="/images/game-2.jpg" side="right" top={0} height="100%" opacity={0.5}  objectPosition="50% 28%" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[150px] pointer-events-none" />

        <div className="relative w-full max-w-[420px] z-10">
          <div className="glass-static p-8 md:p-10 space-y-6">

            {mode === 'request' && !sent && (
              <>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-sm">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-[22px] font-bold" style={{ color: 'var(--text)' }}>Забыли пароль?</h1>
                    <p className="font-body text-[13px] mt-2" style={{ color: 'var(--text-faint)' }}>
                      Введите email от аккаунта, и мы отправим ссылку для сброса пароля
                    </p>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3 rounded-xl bg-primary/8 border border-primary/12 text-primary text-[13px] font-body text-center">
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleRequest} className="space-y-4">
                  <div className="space-y-2">
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      autoComplete="email"
                      className="input"
                    />
                  </div>
                  <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-primary w-full py-4 text-[15px] disabled:opacity-50">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Отправить ссылку</>}
                  </motion.button>
                </form>

                <Link to="/login" className="flex items-center justify-center gap-2 font-body text-[12px] hover:text-white transition-colors" style={{ color: 'var(--text-faint)' }}>
                  <ArrowLeft size={12} /> Вернуться ко входу
                </Link>
              </>
            )}

            {mode === 'request' && sent && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/15 flex items-center justify-center">
                  <CheckCircle size={28} className="text-accent" />
                </div>
                <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>Проверьте почту</h1>
                <p className="font-body text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Если такой email зарегистрирован, письмо со ссылкой уже в пути. Она действует 30 минут.
                </p>
                <Link to="/login" className="btn-ghost inline-flex text-[13px]">
                  <ArrowLeft size={14} /> К входу
                </Link>
              </motion.div>
            )}

            {mode === 'reset' && !done && (
              <>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-sm">
                    <Key size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-[22px] font-bold" style={{ color: 'var(--text)' }}>Новый пароль</h1>
                    <p className="font-body text-[13px] mt-2" style={{ color: 'var(--text-faint)' }}>
                      Придумайте новый пароль для вашего аккаунта
                    </p>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3 rounded-xl bg-primary/8 border border-primary/12 text-primary text-[13px] font-body text-center">
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-2">
                    <label className="label">Новый пароль</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        placeholder="Минимум 4 символа"
                        autoComplete="new-password"
                        className="input pr-12"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="label">Подтвердите пароль</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      placeholder="Повторите пароль"
                      className="input"
                    />
                  </div>
                  <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-primary w-full py-4 text-[15px] disabled:opacity-50">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Lock size={16} /> Сохранить новый пароль</>}
                  </motion.button>
                </form>
              </>
            )}

            {mode === 'reset' && done && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/15 flex items-center justify-center">
                  <CheckCircle size={28} className="text-accent" />
                </div>
                <h1 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>Готово!</h1>
                <p className="font-body text-[14px]" style={{ color: 'var(--text-muted)' }}>
                  Пароль изменён. Перенаправляем на страницу входа...
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
