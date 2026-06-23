import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Баннер согласия на использование cookies и обработку персональных данных.
 * Показывается один раз, выбор сохраняется в localStorage.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Показываем баннер, только если согласие ещё не дано
    try {
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) {
        // Небольшая задержка, чтобы не мешать загрузке страницы
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch { setVisible(true); }
  }, []);

  function accept(level) {
    try {
      localStorage.setItem('cookie-consent', level);
      localStorage.setItem('cookie-consent-date', new Date().toISOString());
    } catch {}
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[95] px-4 pb-4 sm:px-5 sm:pb-5 pointer-events-none"
        >
          <div
            className="pointer-events-auto max-w-4xl mx-auto rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--surface-border)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(232,16,46,0.12)' }}>
              <Cookie size={22} className="text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-display text-[14px] font-bold mb-1" style={{ color: 'var(--text)' }}>
                Мы используем файлы cookie
              </p>
              <p className="font-body text-[12.5px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Сайт использует cookie для корректной работы и улучшения сервиса. Продолжая пользоваться сайтом,
                вы соглашаетесь на обработку персональных данных в соответствии с{' '}
                <Link to="/privacy" className="text-primary hover:underline">политикой конфиденциальности</Link>.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => accept('necessary')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[12px] font-display font-semibold uppercase tracking-wider transition-colors hover:bg-white/[0.05]"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}
              >
                Только необходимые
              </button>
              <button
                onClick={() => accept('all')}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-[12px] font-display font-semibold uppercase tracking-wider text-white transition-all hover:shadow-glow-sm"
                style={{ background: 'linear-gradient(135deg, #E8102E, #B50D24)' }}
              >
                Принять все
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
