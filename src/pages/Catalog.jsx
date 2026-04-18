import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, LayoutGrid } from 'lucide-react';
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

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeGenre, setActiveGenre] = useState(searchParams.get('genre') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => { const g = searchParams.get('genre'); if (g) setActiveGenre(g); }, [searchParams]);

  const filtered = useMemo(() => {
    let r = searchQuery ? searchGames(searchQuery) : activeGenre === 'all' ? [...games] : games.filter(g => g.genre === activeGenre);
    if (sortBy === 'price-asc')  r.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') r.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     r.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'year')       r.sort((a, b) => b.year - a.year);
    return r;
  }, [activeGenre, searchQuery, sortBy]);

  function switchGenre(id) {
    setActiveGenre(id);
    setSearchQuery('');
    setSearchParams(id === 'all' ? {} : { genre: id });
  }

  const c = filtered.length;
  const noun = c === 1 ? 'игра' : c >= 2 && c <= 4 ? 'игры' : 'игр';
  const activeGenreName = activeGenre !== 'all' ? GENRES.find(g => g.id === activeGenre)?.name : null;

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">

        {/* Персонажи по бокам каталога */}
        <PosterAccent src="/images/game-1.jpg"  side="left"  top={80}   height={720} opacity={0.5}  objectPosition="50% 18%" />
        <PosterAccent src="/images/game-2.jpg"  side="right" top={80}   height={720} opacity={0.5}  objectPosition="50% 28%" />
        <PosterAccent src="/images/game-11.jpg" side="left"  top={900}  height={720} opacity={0.45} objectPosition="50% 30%" />
        <PosterAccent src="/images/game-7.jpg"  side="right" top={900}  height={720} opacity={0.45} objectPosition="22% 50%" />
        <PosterAccent src="/images/game-17.jpg" side="left"  top={1700} height={650} opacity={0.4}  objectPosition="50% 85%" />
        {/* Низ-право: Геральт из Witcher 3 — ранее нигде не использовался */}
        <PosterAccent src="/images/game-16.jpg" side="right" top={1700} height={720} opacity={0.45} objectPosition="50% 25%" />
        {/* Самый низ: пати BG3 слева и Сэм Портер (Death Stranding) справа */}
        <PosterAccent src="/images/game-18.jpg" side="left"  top={2450} height={550} opacity={0.4}  objectPosition="50% 35%" />
        <PosterAccent src="/images/game-21.jpg" side="right" top={2450} height={550} opacity={0.4}  objectPosition="32% 35%" />

        <div className="absolute top-[10%] left-[10%] w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(232,16,46,0.04)' }} />
        <div className="absolute bottom-[20%] right-[15%] w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(147,51,234,0.04)' }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 z-10">

          {/* Header */}
          <Reveal>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="label block mb-3">
                  {activeGenreName ? `Раздел · ${activeGenreName}` : 'Библиотека'}
                </span>
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
                  В наличии <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{c}</span> {noun}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Controls */}
          <Reveal delay={0.05}>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
                <input
                  type="text"
                  placeholder="Найти игру..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setActiveGenre('all'); }}
                  className="input pl-11 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition hover:scale-110"
                    style={{ color: 'var(--text-faint)' }}
                    aria-label="Очистить"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <div className="min-w-[220px]">
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  options={SORT_OPTIONS}
                  icon={SlidersHorizontal}
                />
              </div>
            </div>
          </Reveal>

          {/* Genre chips */}
          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => switchGenre('all')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-display font-semibold uppercase tracking-wider transition-all ${
                  activeGenre === 'all' && !searchQuery
                    ? 'bg-primary text-white shadow-glow-sm'
                    : 'hover:scale-[1.02]'
                }`}
                style={activeGenre === 'all' && !searchQuery ? {} : {
                  background: 'var(--surface)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--surface-border)',
                }}
              >
                <LayoutGrid size={13} /> Все
              </button>
              {GENRES.map(g => (
                <button
                  key={g.id}
                  onClick={() => switchGenre(g.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-display font-semibold uppercase tracking-wider transition-all ${
                    activeGenre === g.id && !searchQuery
                      ? 'bg-primary text-white shadow-glow-sm'
                      : 'hover:scale-[1.02]'
                  }`}
                  style={activeGenre === g.id && !searchQuery ? {} : {
                    background: 'var(--surface)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--surface-border)',
                  }}
                >
                  {g.icon} {g.name}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Games grid */}
          {filtered.length > 0 ? (
            <StaggerContainer
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
              key={activeGenre + searchQuery + sortBy}
            >
              {filtered.map(g => <StaggerItem key={g.id}><GameCard game={g} /></StaggerItem>)}
            </StaggerContainer>
          ) : (
            <div className="text-center py-24">
              <p className="font-display text-3xl mb-3" style={{ color: 'var(--text-faint)' }}>Ничего не нашлось</p>
              <p className="font-body mb-6" style={{ color: 'var(--text-muted)' }}>Попробуйте другой запрос</p>
              <button onClick={() => { setSearchQuery(''); switchGenre('all'); }} className="btn-ghost">Сбросить</button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
