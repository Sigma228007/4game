import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Command, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { games, searchGames, GENRES } from '../data/games';

/**
 * Глобальный поиск: Ctrl/Cmd+K → overlay → ищет по играм и жанрам.
 * Живая фильтрация, навигация стрелками, Enter для перехода.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Ctrl/Cmd+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(v => !v);
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, totalCount - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter')     { e.preventDefault(); goActive(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Автофокус при открытии
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const { matchedGames, matchedGenres } = useMemo(() => {
    if (!query.trim()) {
      // Дефолтный список — топ-5 featured игр и все жанры
      return {
        matchedGames: games.filter(g => g.featured).slice(0, 5),
        matchedGenres: GENRES,
      };
    }
    const q = query.toLowerCase().trim();
    const mg = searchGames(query).slice(0, 8);
    const mgenres = GENRES.filter(g => g.name.toLowerCase().includes(q));
    return { matchedGames: mg, matchedGenres: mgenres };
  }, [query]);

  const totalCount = matchedGames.length + matchedGenres.length;

  // Собираем упорядоченный список ссылок для перехода по Enter
  const orderedItems = useMemo(() => [
    ...matchedGames.map(g => ({ type: 'game', id: g.id, to: `/game/${g.id}`, name: g.name })),
    ...matchedGenres.map(g => ({ type: 'genre', id: g.id, to: `/catalog?genre=${g.id}`, name: g.name })),
  ], [matchedGames, matchedGenres]);

  function goActive() {
    const item = orderedItems[active];
    if (item) {
      navigate(item.to);
      setOpen(false);
    }
  }

  // Скроллим активный элемент в видимую зону
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <>
      {/* Триггер-кнопка (видимый намёк на фичу) — теперь скрыт, открывается по Ctrl+K или кнопкой из хедера */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-[12vh]"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--surface-border)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
              }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                <Search size={18} style={{ color: 'var(--text-faint)' }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActive(0); }}
                  placeholder="Найти игру или жанр..."
                  className="flex-1 bg-transparent outline-none font-body text-[15px]"
                  style={{ color: 'var(--text)' }}
                />
                <kbd
                  className="px-2 py-1 rounded-md text-[10px] font-display font-bold"
                  style={{ background: 'var(--surface)', color: 'var(--text-faint)', border: '1px solid var(--surface-border)' }}
                >
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
                {totalCount === 0 ? (
                  <div className="py-12 text-center">
                    <p className="font-body text-[14px]" style={{ color: 'var(--text-faint)' }}>
                      Ничего не нашлось по запросу «{query}»
                    </p>
                  </div>
                ) : (
                  <>
                    {matchedGames.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                          {query ? 'Игры' : 'Популярное'}
                        </div>
                        {matchedGames.map((g, i) => {
                          const idx = i;
                          const isActive = active === idx;
                          return (
                            <Link
                              key={g.id}
                              to={`/game/${g.id}`}
                              data-idx={idx}
                              onClick={() => setOpen(false)}
                              onMouseEnter={() => setActive(idx)}
                              className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                              style={{ background: isActive ? 'var(--surface-hover)' : 'transparent' }}
                            >
                              <img src={g.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-display text-[13px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>
                                  {g.name}
                                </p>
                                <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                                  {g.year} · <span className="text-accent">{g.price.toLocaleString('ru-RU')} ₽</span>
                                </p>
                              </div>
                              {isActive && <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />}
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {matchedGenres.length > 0 && (
                      <div className="mt-2">
                        <div className="px-3 py-2 text-[10px] font-display font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                          Жанры
                        </div>
                        {matchedGenres.map((g, i) => {
                          const idx = matchedGames.length + i;
                          const isActive = active === idx;
                          return (
                            <Link
                              key={g.id}
                              to={`/catalog?genre=${g.id}`}
                              data-idx={idx}
                              onClick={() => setOpen(false)}
                              onMouseEnter={() => setActive(idx)}
                              className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                              style={{ background: isActive ? 'var(--surface-hover)' : 'transparent' }}
                            >
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl" style={{ background: 'var(--surface)' }}>
                                {g.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-display text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>
                                  {g.name}
                                </p>
                                <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>Перейти в раздел</p>
                              </div>
                              {isActive && <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center justify-between px-5 py-3 border-t text-[10px] font-body" style={{ borderColor: 'var(--surface-border)', color: 'var(--text-faint)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'var(--surface)' }}>↑</kbd><kbd className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'var(--surface)' }}>↓</kbd> навигация</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: 'var(--surface)' }}>Enter</kbd> открыть</span>
                </div>
                <span>4Game Search</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
