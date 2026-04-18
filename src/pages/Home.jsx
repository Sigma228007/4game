import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Zap, Headphones, ChevronRight, Star, Swords, Target, Sparkles, Crown, Trophy, Flame, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import GameCard from '../components/GameCard';
import { PageTransition, Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import { getFeaturedGames, games, GENRES, getGameById } from '../data/games';
import { getRecentlyViewed } from '../utils/recentlyViewed';

// Иконки + фоновые постеры для жанров (берём из уже имеющихся артов)
const GENRE_META = {
  action:   { Icon: Swords,   image: '/images/game-1.jpg',  accent: '#E8102E' },
  shooter:  { Icon: Target,   image: '/images/game-11.jpg', accent: '#F59E0B' },
  rpg:      { Icon: Sparkles, image: '/images/game-17.jpg', accent: '#9333EA' },
  strategy: { Icon: Crown,    image: '/images/game-23.jpg', accent: '#3B82F6' },
  sport:    { Icon: Trophy,   image: '/images/game-29.jpg', accent: '#10B981' },
};

// Игры-постеры для декоративной стопки в hero
const HERO_POSTERS = [
  { src: '/images/game-17.jpg', rot: 8,   x: '74%', y: '10%', z: 3, w: 210, h: 280, opacity: 0.85 },
  { src: '/images/game-2.jpg',  rot: -6,  x: '58%', y: '28%', z: 2, w: 190, h: 255, opacity: 0.7 },
  { src: '/images/game-7.jpg',  rot: 14,  x: '82%', y: '48%', z: 1, w: 175, h: 230, opacity: 0.55 },
];

export default function Home() {
  const featured = getFeaturedGames().slice(0, 8);
  const newReleases = [...games].sort((a, b) => b.year - a.year).slice(0, 4);
  const cheapest = [...games].sort((a, b) => a.price - b.price).slice(0, 4);
  const topDeal = [...games].filter(g => g.oldPrice).sort((a, b) => (b.oldPrice - b.price) - (a.oldPrice - a.price))[0];

  // Недавно смотренные — читаем из localStorage
  const [recentIds, setRecentIds] = useState([]);
  useEffect(() => {
    const load = () => setRecentIds(getRecentlyViewed());
    load();
    window.addEventListener('recently-viewed-change', load);
    return () => window.removeEventListener('recently-viewed-change', load);
  }, []);
  const recentGames = recentIds.map(id => getGameById(id)).filter(Boolean).slice(0, 4);

  return (
    <PageTransition>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">

        {/* Ambient glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[150px] animate-glow" style={{ background: 'var(--gradient-hero-1)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'var(--gradient-hero-2)' }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-accent/[0.03] rounded-full blur-[100px]" />

        {/* Subtle grid */}
        <div className="absolute inset-0" style={{ opacity: 0.012, backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        {/* Floating game posters (только на больших экранах) */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
          {HERO_POSTERS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotate: p.rot - 4 }}
              animate={{ opacity: p.opacity, y: 0, rotate: p.rot }}
              transition={{ delay: 0.4 + i * 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="poster-accent absolute rounded-2xl overflow-hidden"
              style={{
                left: p.x,
                top: p.y,
                width: p.w,
                height: p.h,
                zIndex: p.z,
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
              }}
            >
              <img src={p.src} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(160deg, rgba(7,7,14,0.1) 0%, rgba(7,7,14,0.4) 55%, rgba(7,7,14,0.85) 100%)',
              }} />
            </motion.div>
          ))}

          {/* Soft gradient fade on the right to blend posters into background */}
          <div
            className="absolute top-0 right-0 w-[55%] h-full pointer-events-none"
            style={{ background: 'linear-gradient(to left, var(--bg) 0%, transparent 50%)' }}
          />
        </div>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 w-full z-10">
          <div className="max-w-2xl space-y-9">

            {/* "Top deal" pill - живой, реальный. Крутится самая большая скидка из каталога. */}
            {topDeal && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="inline-flex items-center gap-3 px-3 py-2 rounded-full"
                style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
              >
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/15">
                  <Flame size={11} className="text-primary" />
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider text-primary">
                    −{Math.round((1 - topDeal.price / topDeal.oldPrice) * 100)}%
                  </span>
                </span>
                <span className="font-body text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{topDeal.name}</span>
                  <span className="mx-1.5" style={{ color: 'var(--text-faint)' }}>·</span>
                  <span className="price text-[13px]">{topDeal.price.toLocaleString('ru-RU')}&nbsp;₽</span>
                </span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-black text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.95] tracking-tight"
            >
              <span style={{ color: 'var(--text)' }}>Играй больше.</span><br />
              <span style={{ color: 'var(--text)' }}>Плати&nbsp;</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">меньше</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M1 5.5Q50 1 100 4T199 3" stroke="#10B981" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
                </svg>
              </span>
              <span style={{ color: 'var(--text)', opacity: 0.6 }}>.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="font-body text-[clamp(1rem,2vw,1.2rem)] max-w-xl leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              Лицензионные ключи Steam, Epic и GOG напрямую от дистрибьюторов. Оплатил — получил код на почту. Без ожидания и скрытых наценок.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link to="/catalog" className="btn-primary px-8 py-4 text-[15px]">Открыть каталог <ArrowRight size={18} /></Link>
              <Link to="/about" className="btn-ghost px-6 py-4 text-[15px]">Как это работает</Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap items-center gap-6 pt-4 font-body text-[13px]"
              style={{ color: 'var(--text-faint)' }}
            >
              <div className="flex items-center gap-2"><Shield size={14} className="text-accent/50" /> Лицензионные ключи</div>
              <div className="flex items-center gap-2"><Zap size={14} className="text-amber-400/50" /> Доставка за 30 сек</div>
              <div className="flex items-center gap-2"><Headphones size={14} className="text-secondary/50" /> Поддержка 24/7</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ STATS (конкретные, проверяемые) ═══ */}
      <Reveal>
        <section style={{ borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-3 gap-8">
              {[
                { value: `${games.length}+`, label: 'Игр в каталоге' },
                { value: '30 сек', label: 'Выдача ключа' },
                { value: '24/7', label: 'Поддержка' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-display font-black text-2xl md:text-3xl" style={{ color: 'var(--text)' }}>{s.value}</div>
                  <div className="font-body text-[13px] mt-1" style={{ color: 'var(--text-faint)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══ НЕДАВНО СМОТРЕЛИ ═══ */}
      {recentGames.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-end justify-between mb-8 md:mb-10">
                <div>
                  <span className="label block mb-3 flex items-center gap-2">
                    <Clock size={11} /> История просмотров
                  </span>
                  <h2 className="section-title text-2xl md:text-3xl">Недавно смотрели</h2>
                </div>
              </div>
            </Reveal>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {recentGames.map(game => <StaggerItem key={game.id}><GameCard game={game} /></StaggerItem>)}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ═══ ЛИДЕРЫ ПРОДАЖ ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-end justify-between mb-10 md:mb-14">
              <div>
                <span className="label block mb-3">Хиты сезона</span>
                <h2 className="section-title text-3xl md:text-[2.75rem]">Лидеры продаж</h2>
              </div>
              <Link to="/catalog" className="hidden sm:flex items-center gap-1.5 font-body text-[13px] hover:text-primary transition-colors" style={{ color: 'var(--text-faint)' }}>
                Все игры <ChevronRight size={16} />
              </Link>
            </div>
          </Reveal>
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {featured.map(game => <StaggerItem key={game.id}><GameCard game={game} /></StaggerItem>)}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ ЖАНРЫ (постер-карточки) ═══ */}
      <section className="py-20 md:py-24" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <span className="label block mb-3">Подборки</span>
              <h2 className="section-title text-3xl md:text-[2.75rem]">Выбери свой жанр</h2>
            </div>
          </Reveal>
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {GENRES.map(genre => {
              const count = games.filter(g => g.genre === genre.id).length;
              const meta = GENRE_META[genre.id];
              const Icon = meta?.Icon;
              return (
                <StaggerItem key={genre.id}>
                  <Link
                    to={`/catalog?genre=${genre.id}`}
                    className="relative block h-[200px] rounded-2xl overflow-hidden group transition-transform duration-500 hover:-translate-y-1"
                    style={{ border: '1px solid var(--surface-border)' }}
                  >
                    {/* Poster background */}
                    {meta?.image && (
                      <img
                        src={meta.image}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        style={{ filter: 'saturate(0.85)' }}
                      />
                    )}
                    {/* Dark gradient overlay */}
                    <div
                      className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80"
                      style={{ background: 'linear-gradient(180deg, rgba(7,7,14,0.35) 0%, rgba(7,7,14,0.75) 50%, rgba(7,7,14,0.95) 100%)' }}
                    />
                    {/* Accent color glow (появляется на hover) */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
                      style={{ background: `radial-gradient(ellipse at top, ${meta?.accent || '#E8102E'}40 0%, transparent 70%)` }}
                    />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between p-5 z-10">
                      {/* Icon на фоне */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-md transition-all duration-500 group-hover:scale-110"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: meta?.accent || '#ffffff',
                        }}
                      >
                        {Icon && <Icon size={20} strokeWidth={2} />}
                      </div>

                      {/* Name + count */}
                      <div>
                        <h3 className="font-display font-bold text-[17px] text-white mb-1 tracking-tight">
                          {genre.name}
                        </h3>
                        <p className="font-body text-[12px] text-white/55">
                          {count} {count === 1 ? 'игра' : count >= 2 && count <= 4 ? 'игры' : 'игр'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ NEW + CHEAP ═══ */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[
              { title: `Новинки ${new Date().getFullYear()}`, badge: 'Свежие', badgeColor: 'bg-secondary/15 text-secondary-light', icon: TrendingUp, iconColor: 'text-secondary/30', items: newReleases },
              { title: 'Лучшая цена',                         badge: 'Скидки',  badgeColor: 'bg-accent/15 text-accent-light',       icon: Zap,         iconColor: 'text-accent/30',    items: cheapest    },
            ].map((section, si) => (
              <Reveal key={section.title} delay={si * 0.1}>
                <div className="glass-static p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`badge ${section.badgeColor}`}>{section.badge}</span>
                      <h3 className="font-display text-xl font-bold mt-3" style={{ color: 'var(--text)' }}>{section.title}</h3>
                    </div>
                    <section.icon size={20} className={section.iconColor} />
                  </div>
                  <div className="space-y-2">
                    {section.items.map(g => (
                      <Link
                        to={`/game/${g.id}`}
                        key={g.id}
                        className="flex items-center gap-4 p-2.5 rounded-xl transition-colors"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <img src={g.image} alt={g.name} className="w-14 h-10 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-[12px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{g.name}</p>
                          {g.oldPrice && si === 1
                            ? <p className="font-body text-[11px] text-primary">−{Math.round((1 - g.price / g.oldPrice) * 100)}%</p>
                            : <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>{g.year}</p>
                          }
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="price text-[14px]">{g.price.toLocaleString('ru-RU')}&nbsp;₽</span>
                          {g.oldPrice && <span className="block text-[10px] line-through" style={{ color: 'var(--text-faint)' }}>{g.oldPrice.toLocaleString('ru-RU')}&nbsp;₽</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ОТЗЫВЫ ═══ */}
      <section className="py-20 md:py-24" style={{ borderTop: '1px solid var(--surface-border)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-14">
              <span className="label block mb-3">Отзывы</span>
              <h2 className="section-title text-3xl md:text-[2.75rem]">Что говорят покупатели</h2>
            </div>
          </Reveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { text: 'Заказал Elden Ring — ключ пришёл на почту минуты через две. Активировал в Steam, всё чисто. Беру уже третью игру тут.', author: 'Алексей К.', since: 'Покупатель с 2024', av: 'А' },
              { text: 'Цены реально ниже Steam. Один раз был вопрос по активации — написал в поддержку, ответили в течение получаса, помогли разобраться.', author: 'Мария С.', since: 'Покупатель с 2025', av: 'М' },
              { text: 'Взял BG3 со скидкой — сэкономил прилично. Ключ рабочий, претензий нет. Сайт удобный, всё понятно.',                                           author: 'Игорь В.', since: 'Покупатель с 2024', av: 'И' },
            ].map((r, i) => (
              <StaggerItem key={i}>
                <div className="glass-static p-6 md:p-7 space-y-5">
                  <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <Star key={j} size={13} className="text-amber-400" fill="currentColor" />)}</div>
                  <p className="font-body text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>«{r.text}»</p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center">
                      <span className="text-white text-[11px] font-display font-bold">{r.av}</span>
                    </div>
                    <div>
                      <p className="font-display text-[12px] font-bold" style={{ color: 'var(--text-secondary)' }}>{r.author}</p>
                      <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>{r.since}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative glass-static p-10 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/[0.06] rounded-full blur-[100px]" />
              <div className="relative space-y-6">
                <h2 className="font-display text-3xl md:text-4xl font-black" style={{ color: 'var(--text)' }}>Готов к новым приключениям?</h2>
                <p className="font-body text-[17px] max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
                  Зарегистрируйся, выбери игру и получи ключ мгновенно.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Link to="/catalog" className="btn-primary px-8 py-4 text-[15px]">Начать покупки <ArrowRight size={18} /></Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageTransition>
  );
}
