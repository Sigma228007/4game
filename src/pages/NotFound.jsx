import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowRight } from 'lucide-react';
import { PageTransition } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';

export default function NotFound() {
  const location = useLocation();

  return (
    <PageTransition>
      <div className="relative min-h-[85vh] flex items-center justify-center px-5 overflow-hidden">
        {/* Фоновые постеры */}
        <PosterAccent src="/images/game-5.jpg"  side="left"  top={0} height={700} opacity={0.4} objectPosition="50% 20%" />
        <PosterAccent src="/images/game-12.jpg" side="right" top={0} height={700} opacity={0.35} objectPosition="50% 30%" />

        {/* Свечения */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center space-y-8 max-w-lg">
          {/* 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              className="font-display font-black leading-none select-none"
              style={{
                fontSize: 'clamp(120px, 20vw, 180px)',
                background: 'linear-gradient(135deg, #E8102E 0%, #FF5C73 40%, #9333EA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 40px rgba(232,16,46,0.2))',
              }}
            >
              404
            </h1>
          </motion.div>

          {/* Текст */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Страница не найдена
            </h2>
            <p className="font-body text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Страница{' '}
              <code
                className="font-mono text-[13px] px-2 py-0.5 rounded-lg"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}
              >
                {location.pathname}
              </code>
              {' '}не существует или была удалена.
            </p>
          </motion.div>

          {/* Кнопки */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/" className="btn-primary text-[14px] gap-2">
              <Home size={16} /> На главную
            </Link>
            <Link to="/catalog" className="btn-ghost text-[14px] gap-2">
              Каталог игр <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Подсказка */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="inline-flex items-center gap-2 text-[13px] font-body transition-colors"
            style={{ color: 'var(--text-faint)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}
          >
            <Search size={13} />
            Или найди игру через поиск
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-display font-bold" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>⌘K</kbd>
          </motion.button>
        </div>
      </div>
    </PageTransition>
  );
}
