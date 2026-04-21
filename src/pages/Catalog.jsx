import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, LayoutGrid, Filter, Tag, Percent, Calendar, Wallet, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GameCard from '../components/GameCard';
import { PageTransition, Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import Select from '../components/Select';
import PosterAccent from '../components/PosterAccent';
import { games, GENRES, searchGames } from '../data/games';

const SORT_OPTIONS = [
  { value: 'default',    label: 'По умолчанию' },
  { value: 'price-asc',  label: 'Сначала дешёвые' },
  { value: 'price-desc', label: 'Сначала дорогие' },
  { value: 'rating',     label: 'По рейтингу' },
  { value: 'year',       label: 'По новизне' },
];

// Вычисляем границы цен/годов по данным
const PRICE_MIN = Math.min(...games.map(g => g.price));
const PRICE_MAX = Math.max(...games.map(g => g.price));
const YEAR_MIN  = Math.min(...games.map(g => g.year));
const YEAR_MAX  = Math.max(...games.map(g => g.year));

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGenre = searchParams.get('genre');
  const [selectedGenres, setSelectedGenres] = useState(initialGenre ? [initialGenre] : []);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Расширенный фильтр
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [yearRange, setYearRange] = useState([YEAR_MIN, YEAR_MAX]);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const g = searchParams.get('genre');
    if (g) setSelectedGenres([g]);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let r = searchQuery ? searchGames(searchQuery) : [...games];

    // Фильтр по жанрам (мультивыбор)
    if (selectedGenres.length > 0 && !searchQuery) {
      r = r.filter(g => selectedGenres.includes(g.genre));
    }

    // Цена
    r = r.filter(g => g.price >= priceRange[0] && g.price <= priceRange[1]);

    // Год
    r = r.filter(g => g.year >= yearRange[0] && g.year <= yearRange[1]);

    // Только со скидкой
    if (onSaleOnly) r = r.filter(g => g.oldPrice && g.oldPrice > g.price);

    // Сортировка
    if (sortBy === 'price-asc')  r.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') r.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     r.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'year')       r.sort((a, b) => b.year - a.year);

    return r;
  }, [selectedGenres, searchQuery, sortBy, priceRange, yearRange, onSaleOnly]);

  function toggleGenre(id) {
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setSearchQuery('');
    setSearchParams({});
  }

  function resetAll() {
    setSelectedGenres([]);
    setSearchQuery('');
    setSortBy('default');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setYearRange([YEAR_MIN, YEAR_MAX]);
    setOnSaleOnly(false);
    setSearchParams({});
  }

  const hasActiveFilters = selectedGenres.length > 0 || searchQuery ||
    priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX ||
    yearRange[0]  !== YEAR_MIN  || yearRange[1]  !== YEAR_MAX ||
    onSaleOnly;

  const c = filtered.length;
  const noun = c === 1 ? 'игра' : c >= 2 && c <= 4 ? 'игры' : 'игр';

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">

        <PosterAccent src="/images/game-1.jpg"  side="left"  top={80}   height={720} opacity={0.5}  objectPosition="50% 18%" />
        <PosterAccent src="/images/game-2.jpg"  side="right" top={80}   height={720} opacity={0.5}  objectPosition="50% 28%" />
        <PosterAccent src="/images/game-11.jpg" side="left"  top={900}  height={720} opacity={0.45} objectPosition="50% 30%" />
        <PosterAccent src="/images/game-7.jpg"  side="right" top={900}  height={720} opacity={0.45} objectPosition="22% 50%" />
        <PosterAccent src="/images/game-17.jpg" side="left"  top={1700} height={650} opacity={0.4}  objectPosition="50% 85%" />
        <PosterAccent src="/images/game-16.jpg" side="right" top={1700} height={720} opacity={0.45} objectPosition="50% 25%" />
        <PosterAccent src="/images/game-18.jpg" side="left"  top={2450} height={550} opacity={0.4}  objectPosition="50% 35%" />
        <PosterAccent src="/images/game-21.jpg" side="right" top={2450} height={550} opacity={0.4}  objectPosition="32% 35%" />

        <div className="absolute top-[10%] left-[10%] w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(232,16,46,0.04)' }} />
        <div className="absolute bottom-[20%] right-[15%] w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(147,51,234,0.04)' }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 z-10">

          <Reveal>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="label block mb-3">Библиотека</span>
                <h1 className="section-title text-4xl md:text-5xl">Каталог игр</h1>
              </div>
              <div
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full self-start sm:self-auto"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="font-body text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  Найдено <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{c}</span> {noun}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Controls row */}
          <Reveal delay={0.05}>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  placeholder="Найти игру, жанр, тег..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input pl-11 pr-10"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }}>
                    <X size={15} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-display font-semibold transition-colors ${filterOpen ? 'bg-primary text-white' : ''}`}
                style={!filterOpen ? { background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' } : {}}
              >
                <Filter size={14} /> Фильтр {hasActiveFilters && <span className="w-2 h-2 bg-accent rounded-full" />}
              </button>
              <div className="min-w-[200px]">
                <Select value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} icon={SlidersHorizontal} />
              </div>
            </div>
          </Reveal>

          {/* Expanded filter panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden mb-6"
              >
                <div className="glass-static p-5 md:p-6 space-y-5">
                  {/* Price */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet size={14} style={{ color: 'var(--text-faint)' }} />
                      <span className="label text-[10px]">Цена</span>
                      <span className="font-body text-[12px] ml-auto" style={{ color: 'var(--text-secondary)' }}>
                        {priceRange[0].toLocaleString('ru-RU')} — {priceRange[1].toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-body text-[10px] block mb-1" style={{ color: 'var(--text-faint)' }}>От</label>
                        <input
                          type="range"
                          min={PRICE_MIN}
                          max={PRICE_MAX}
                          step={100}
                          value={priceRange[0]}
                          onChange={e => setPriceRange([Math.min(+e.target.value, priceRange[1]), priceRange[1]])}
                          className="w-full accent-primary"
                        />
                      </div>
                      <div>
                        <label className="font-body text-[10px] block mb-1" style={{ color: 'var(--text-faint)' }}>До</label>
                        <input
                          type="range"
                          min={PRICE_MIN}
                          max={PRICE_MAX}
                          step={100}
                          value={priceRange[1]}
                          onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0])])}
                          className="w-full accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Year */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={14} style={{ color: 'var(--text-faint)' }} />
                      <span className="label text-[10px]">Год выпуска</span>
                      <span className="font-body text-[12px] ml-auto" style={{ color: 'var(--text-secondary)' }}>
                        {yearRange[0]} — {yearRange[1]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-body text-[10px] block mb-1" style={{ color: 'var(--text-faint)' }}>От</label>
                        <input
                          type="range"
                          min={YEAR_MIN}
                          max={YEAR_MAX}
                          value={yearRange[0]}
                          onChange={e => setYearRange([Math.min(+e.target.value, yearRange[1]), yearRange[1]])}
                          className="w-full accent-primary"
                        />
                      </div>
                      <div>
                        <label className="font-body text-[10px] block mb-1" style={{ color: 'var(--text-faint)' }}>До</label>
                        <input
                          type="range"
                          min={YEAR_MIN}
                          max={YEAR_MAX}
                          value={yearRange[1]}
                          onChange={e => setYearRange([yearRange[0], Math.max(+e.target.value, yearRange[0])])}
                          className="w-full accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sale only + Reset */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={onSaleOnly}
                        onChange={e => setOnSaleOnly(e.target.checked)}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      <Percent size={14} className="text-amber-400" />
                      <span className="font-body text-[13px]" style={{ color: 'var(--text-secondary)' }}>Только со скидкой</span>
                    </label>
                    {hasActiveFilters && (
                      <button
                        onClick={resetAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-display font-semibold uppercase tracking-wider transition-colors hover:bg-white/[0.05]"
                        style={{ color: 'var(--text-faint)' }}
                      >
                        <RotateCcw size={11} /> Сбросить всё
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Genre chips - multi-select */}
          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setSelectedGenres([])}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-display font-semibold uppercase tracking-wider transition-all ${
                  selectedGenres.length === 0
                    ? 'bg-primary text-white shadow-glow-sm'
                    : 'hover:scale-[1.02]'
                }`}
                style={selectedGenres.length === 0 ? {} : {
                  background: 'var(--surface)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--surface-border)',
                }}
              >
                <LayoutGrid size={13} /> Все
              </button>
              {GENRES.map(g => {
                const active = selectedGenres.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleGenre(g.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-display font-semibold uppercase tracking-wider transition-all ${
                      active ? 'bg-primary text-white shadow-glow-sm' : 'hover:scale-[1.02]'
                    }`}
                    style={active ? {} : {
                      background: 'var(--surface)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--surface-border)',
                    }}
                  >
                    {g.icon} {g.name}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Games grid */}
          {filtered.length > 0 ? (
            <StaggerContainer
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
              key={selectedGenres.join('-') + searchQuery + sortBy + priceRange.join('-') + yearRange.join('-') + onSaleOnly}
            >
              {filtered.map(g => <StaggerItem key={g.id}><GameCard game={g} /></StaggerItem>)}
            </StaggerContainer>
          ) : (
            <div className="text-center py-24">
              <p className="font-display text-3xl mb-3" style={{ color: 'var(--text-faint)' }}>Ничего не нашлось</p>
              <p className="font-body mb-6" style={{ color: 'var(--text-muted)' }}>Попробуйте изменить фильтры или поиск</p>
              <button onClick={resetAll} className="btn-ghost">
                <RotateCcw size={14} /> Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
