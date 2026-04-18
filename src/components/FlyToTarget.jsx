import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Контекст для анимации «летящей обложки».
 * Использование:
 *   const flyTo = useFlyTo();
 *   flyTo({ image, from: event.currentTarget.getBoundingClientRect(), target: 'cart' | 'favorites' });
 *
 * Цель определяется по data-fly-target="cart" или "favorites" (указаны на иконках в Header).
 */

const FlyContext = createContext(null);

export function FlyToProvider({ children }) {
  const [flights, setFlights] = useState([]);

  const flyTo = useCallback(({ image, from, target }) => {
    // Находим DOM-цель по data-атрибуту
    const targetEl = document.querySelector(`[data-fly-target="${target}"]`);
    if (!targetEl || !from) return;

    const toRect = targetEl.getBoundingClientRect();
    const id = Date.now() + Math.random();

    // Сдвигаем немного к центру цели
    const to = {
      x: toRect.left + toRect.width / 2 - 24,
      y: toRect.top + toRect.height / 2 - 24,
    };
    const start = {
      x: from.left + from.width / 2 - 24,
      y: from.top + from.height / 2 - 24,
    };

    setFlights(prev => [...prev, { id, image, start, to, target }]);

    // Удаляем после анимации
    setTimeout(() => {
      setFlights(prev => prev.filter(f => f.id !== id));
      // Маленький «клик» по цели — отзовётся scale-пульсацией
      targetEl.dispatchEvent(new CustomEvent('fly-arrive', { bubbles: true }));
    }, 800);
  }, []);

  return (
    <FlyContext.Provider value={flyTo}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[200]">
        <AnimatePresence>
          {flights.map(f => (
            <motion.div
              key={f.id}
              initial={{
                x: f.start.x,
                y: f.start.y,
                scale: 1.6,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: f.to.x,
                y: f.to.y,
                scale: 0.25,
                opacity: 0.3,
                rotate: f.target === 'favorites' ? -20 : 15,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute w-12 h-12 rounded-xl overflow-hidden shadow-2xl"
              style={{
                boxShadow: f.target === 'favorites'
                  ? '0 10px 40px rgba(236,72,153,0.6), 0 0 0 2px rgba(236,72,153,0.4)'
                  : '0 10px 40px rgba(232,16,46,0.6),  0 0 0 2px rgba(232,16,46,0.4)',
              }}
            >
              <img src={f.image} alt="" className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyContext.Provider>
  );
}

export const useFlyTo = () => {
  const ctx = useContext(FlyContext);
  if (!ctx) throw new Error('useFlyTo must be inside FlyToProvider');
  return ctx;
};
