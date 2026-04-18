import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

/**
 * Сплэш при первом заходе. Показывается один раз за сессию (sessionStorage),
 * чтобы не раздражать при навигации между страницами.
 * Длительность: ~1.6 секунды.
 */
export default function Preloader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('splashShown') !== '1';
  });

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      sessionStorage.setItem('splashShown', '1');
      setVisible(false);
    }, 1600);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[9998] flex items-center justify-center"
        style={{ background: '#07070E' }}
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none" style={{ background: 'rgba(232,16,46,0.15)' }} />

        <div className="relative flex flex-col items-center gap-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-md">
              <Gamepad2 size={36} className="text-white" strokeWidth={2.5} />
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2"
              style={{ borderColor: '#07070E' }}
            />
          </motion.div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-display text-[32px] font-black tracking-tight">
              <span className="text-primary">4</span>
              <span className="text-white">Game</span>
            </h1>
            <p className="font-body text-[11px] tracking-[0.3em] uppercase mt-1 text-white/30">
              Digital Store
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-48 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.3, ease: [0.4, 0.05, 0.25, 1] }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
