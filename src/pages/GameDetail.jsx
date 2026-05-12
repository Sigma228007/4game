import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Heart, ShoppingCart, Star, Check, Shield, Zap, Clock, Tag, Monitor, Globe, Cpu, HardDrive, Gamepad2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGameById, getGamesByGenre, GENRES, games as allGames } from '../data/games';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../components/Toast';
import { useFlyTo } from '../components/FlyToTarget';
import { usePrice } from '../hooks/usePrice';
import { PageTransition, Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import GameCard from '../components/GameCard';
import ReviewsBlock from '../components/ReviewsBlock';
import { pushRecentlyViewed } from '../utils/recentlyViewed';
import { getSystemRequirements, getLanguages, getGallery, getPlatforms } from '../utils/gameDetails';
import { useI18n } from '../utils/i18n.jsx';

const LANG_CELL = {
  full: { symbol: '✓', color: 'text-accent',      bg: 'bg-accent/10' },
  sub:  { symbol: '~', color: 'text-amber-400',   bg: 'bg-amber-400/10' },
};

export default function GameDetail() {
  const { id } = useParams();
  const game = getGameById(Number(id));
  const navigate = useNavigate();
  const { isAuth } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const toast = useToast();
  const flyTo = useFlyTo();
  const heroImgRef = useRef(null);

  const { format } = usePrice();
  const { t } = useI18n();
  const [activeShot, setActiveShot] = useState(0);
  const [tab, setTab] = useState('req');
  const slideshowRef = useRef(null);

  useEffect(() => { if (game) pushRecentlyViewed(game.id); }, [game?.id]);
  useEffect(() => { setActiveShot(0); setTab('req'); }, [id]);

  // Auto-slideshow every 3 seconds
  useEffect(() => {
    const gallery = game ? getGallery(game) : [];
    if (gallery.length <= 1) return;
    slideshowRef.current = setInterval(() => {
      setActiveShot(prev => (prev + 1) % gallery.length);
    }, 3000);
    return () => clearInterval(slideshowRef.current);
  }, [game?.id]);

  if (!game) {
    return (
      <PageTransition>
        <div className="min-h-[65vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="font-display text-2xl" style={{ color: 'var(--text-muted)' }}>{t('game.notFound')}</p>
            <Link to="/catalog" className="btn-primary inline-flex">В каталог</Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  const fav = isFavorite(game.id);
  const inCart = isInCart(game.id);
  const discount = game.oldPrice ? Math.round((1 - game.price / game.oldPrice) * 100) : null;
  const genre = GENRES.find(g => g.id === game.genre);
  const related = getGamesByGenre(game.genre).filter(g => g.id !== game.id).slice(0, 4);

  const gallery = getGallery(game, allGames);
  const requirements = getSystemRequirements(game);
  const languages = getLanguages(game);
  const platforms = getPlatforms(game);

  function handleFav(e) {
    e?.preventDefault?.();
    if (!isAuth) return navigate('/login');
    const wasFav = fav;
    const added = toggleFavorite(game.id);
    if (!wasFav && added && heroImgRef.current) {
      flyTo({ image: game.image, from: heroImgRef.current.getBoundingClientRect(), target: 'favorites' });
    }
    toast(added ? `${game.name} в избранном` : 'Убрано из избранного', 'fav');
  }

  function handleCart() {
    if (!isAuth) return navigate('/login');
    if (inCart) return navigate('/cart');
    addToCart(game.id);
    if (heroImgRef.current) {
      flyTo({ image: game.image, from: heroImgRef.current.getBoundingClientRect(), target: 'cart' });
    }
    toast(`${game.name} в корзине`, 'cart');
  }

  async function handleShare() {
    const url = window.location.href;
    const shareData = { title: game.name, text: `${game.name} — ${format(game.price)} на 4Game`, url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast('Ссылка скопирована', 'success');
      } catch { toast('Не удалось скопировать', 'error'); }
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen">

        {/* HERO BANNER */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <motion.img
            ref={heroImgRef}
            src={gallery[activeShot] || game.image}
            alt={game.name}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            key={activeShot}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg) 0%, rgba(7,7,14,0.6) 40%, rgba(7,7,14,0.3) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(7,7,14,0.8) 0%, transparent 40%, transparent 100%)' }} />

          <div className="absolute top-6 left-5 sm:left-8 z-10">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-lg text-[13px] font-body transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(7,7,14,0.5)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)' }}
            >
              <ArrowLeft size={16} /> {t('game.back')}
            </button>
          </div>

          <div className="absolute top-6 right-5 sm:right-8 z-10 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-xl backdrop-blur-lg flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'rgba(7,7,14,0.5)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)' }}
              title={t('game.share')}
              aria-label={t('game.share')}
            >
              <Share2 size={16} />
            </button>
            {discount && (
              <span className="badge bg-primary text-white text-[12px] px-3 py-1.5 shadow-glow-sm">
                −{discount}% {t('game.discount')}
              </span>
            )}
          </div>

          {/* Gallery thumbnails */}
          {gallery.length > 1 && (
            <div className="absolute bottom-4 left-5 sm:left-8 right-5 sm:right-8 z-10 flex gap-2 justify-center sm:justify-start overflow-x-auto">
              {gallery.map((src, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveShot(i);
                    clearInterval(slideshowRef.current);
                    slideshowRef.current = setInterval(() => {
                      setActiveShot(prev => (prev + 1) % gallery.length);
                    }, 3000);
                  }}
                  className={`relative h-12 w-20 rounded-lg overflow-hidden transition-all flex-shrink-0 ${i === activeShot ? 'ring-2 ring-primary scale-105' : 'opacity-60 hover:opacity-100'}`}
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  aria-label={`${t('game.screenshot')} ${i + 1}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-8">
              <Reveal>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {genre && (
                      <Link to={`/catalog?genre=${genre.id}`} className="badge bg-white/[0.06] transition-colors" style={{ color: 'var(--text-muted)' }}>
                        {genre.icon} {genre.name}
                      </Link>
                    )}
                    <span className="font-body text-[13px]" style={{ color: 'var(--text-faint)' }}>{game.year}</span>
                    <div className="flex items-center gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < Math.floor(game.rating) ? 'text-amber-400' : ''}
                          style={i >= Math.floor(game.rating) ? { color: 'var(--text-faint)' } : {}}
                          fill="currentColor"
                        />
                      ))}
                      <span className="font-display text-[13px] font-bold ml-1" style={{ color: 'var(--text-secondary)' }}>{game.rating}</span>
                    </div>
                  </div>

                  <h1 className="font-display text-3xl md:text-5xl font-black leading-tight tracking-tight" style={{ color: 'var(--text)' }}>
                    {game.name}
                  </h1>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="glass p-6 md:p-8 space-y-5">
                  <h2 className="font-display text-[14px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('game.about')}</h2>
                  <p className="font-body text-[16px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {game.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {game.tags.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-display font-semibold uppercase tracking-wider"
                        style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--text-faint)' }}
                      >
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Tabs: Requirements / Languages */}
              <Reveal delay={0.15}>
                <div className="glass-static overflow-hidden">
                  <div className="flex gap-1 p-1.5" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--surface-border)' }}>
                    {[
                      { id: 'req',  label: t('game.sysreq'), icon: Monitor },
                      { id: 'lang', label: t('game.languages'), icon: Globe   },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setTab(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-display font-semibold transition-all"
                        style={{
                          background: tab === item.id ? 'var(--bg-elevated)' : 'transparent',
                          color:      tab === item.id ? 'var(--text)'        : 'var(--text-faint)',
                        }}
                      >
                        <item.icon size={13} /> {item.label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {tab === 'req' && (
                      <motion.div
                        key="req"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
                      >
                        {[
                          { title: t('game.min'), specs: requirements.min, accent: 'var(--text-muted)' },
                          { title: t('game.rec'), specs: requirements.rec, accent: '#10B981' },
                        ].map((block) => (
                          <div key={block.title} className="space-y-3">
                            <h4 className="font-display text-[12px] font-bold uppercase tracking-wider" style={{ color: block.accent }}>
                              {block.title}
                            </h4>
                            <div className="space-y-2">
                              {[
                                { icon: Monitor,   label: t('game.os'),   value: block.specs.os      },
                                { icon: Cpu,       label: t('game.cpu'),  value: block.specs.cpu     },
                                { icon: HardDrive, label: t('game.ram'),  value: block.specs.ram     },
                                { icon: Gamepad2,  label: t('game.gpu'),  value: block.specs.gpu     },
                                { icon: HardDrive, label: t('game.hdd'),  value: block.specs.storage },
                                { icon: Zap,       label: t('game.dx'),   value: block.specs.directx },
                              ].map((row) => (
                                <div key={row.label} className="flex items-start gap-3 text-[12px]">
                                  <row.icon size={13} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                                  <span className="font-body min-w-[80px]" style={{ color: 'var(--text-faint)' }}>{row.label}:</span>
                                  <span className="font-body flex-1" style={{ color: 'var(--text-secondary)' }}>{row.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {tab === 'lang' && (
                      <motion.div
                        key="lang"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-6"
                      >
                        <div className="overflow-x-auto">
                          <table className="w-full text-[12px]">
                            <thead>
                              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                <th className="text-left pb-3 font-display uppercase tracking-wider text-[10px]"   style={{ color: 'var(--text-faint)' }}>{t('game.languages')}</th>
                                <th className="text-center pb-3 font-display uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>{t('game.full')}</th>
                                <th className="text-center pb-3 font-display uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>{t('game.full')}</th>
                                <th className="text-center pb-3 font-display uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-faint)' }}>{t('game.subs')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {languages.map((l) => (
                                <tr key={l.lang} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                  <td className="py-3 font-display font-bold" style={{ color: 'var(--text-secondary)' }}>{l.lang}</td>
                                  {['interface', 'audio', 'subtitles'].map((col) => {
                                    const val = l[col];
                                    const b = LANG_CELL[val];
                                    return (
                                      <td key={col} className="py-3 text-center">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold ${b.bg} ${b.color}`}>
                                          {b.symbol}
                                        </span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="flex items-center gap-4 mt-5 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                            <span><span className="inline-flex w-5 h-5 rounded bg-accent/10 text-accent items-center justify-center text-[10px] font-bold mr-1">✓</span> {t('game.full')}</span>
                            <span><span className="inline-flex w-5 h-5 rounded bg-amber-400/10 text-amber-400 items-center justify-center text-[10px] font-bold mr-1">~</span> {t('game.subs')}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>

              {/* Features */}
              <Reveal delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Shield, label: t('game.licKey'),   desc: t('game.verified') },
                    { icon: Zap,    label: t('game.instant'),  desc: t('game.email30') },
                    { icon: Clock,  label: t('game.guarantee'), desc: t('game.guarantee24') },
                  ].map(f => (
                    <div key={f.label} className="glass p-4 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <f.icon size={16} className="text-accent" />
                      </div>
                      <div>
                        <p className="font-display text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{f.label}</p>
                        <p className="font-body text-[12px] mt-0.5" style={{ color: 'var(--text-faint)' }}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Reviews */}
              <Reveal delay={0.25}>
                <ReviewsBlock gameId={game.id} />
              </Reveal>
            </div>

            {/* Right column: Buy panel */}
            <div className="lg:col-span-1">
              <Reveal delay={0.1} direction="left">
                <div className="glass p-6 space-y-6 sticky top-24">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="price text-[32px]">{format(game.price)}</span>
                      {game.oldPrice && (
                        <span className="text-[16px] line-through font-body" style={{ color: 'var(--text-faint)' }}>
                          {format(game.oldPrice)}
                        </span>
                      )}
                    </div>
                    {discount && (
                      <p className="font-body text-[13px] text-accent/70">
                        {t('game.youSave')} {format(game.oldPrice - game.price)}
                      </p>
                    )}
                  </div>

                  {/* Platforms */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>{t('game.activation')}</span>
                    {platforms.map(p => (
                      <span
                        key={p}
                        className="text-[10px] font-display font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                        style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>

                  <motion.button
                    onClick={handleCart}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-[15px] font-display font-bold uppercase tracking-wider transition-all duration-300 ${
                      inCart
                        ? 'bg-accent/15 text-accent border border-accent/20'
                        : 'bg-primary text-white shadow-glow-md hover:brightness-110'
                    }`}
                  >
                    {inCart ? <Check size={18} /> : <ShoppingCart size={18} />}
                    {inCart ? t('game.inCart') : t('cart.checkout')}
                  </motion.button>

                  <motion.button
                    onClick={handleFav}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[13px] font-display font-semibold uppercase tracking-wider transition-all duration-300 ${
                      fav
                        ? 'bg-pink-500/15 text-pink-400 border border-pink-400/20'
                        : ''
                    }`}
                    style={!fav ? { background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' } : {}}
                  >
                    <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
                    {fav ? t('game.inFav') : t('game.toFav')}
                  </motion.button>

                  {/* Trust list */}
                  <div className="pt-2 space-y-2.5">
                    {[
                      t('game.activateIn') + ' ' + platforms.join(' / '),
                      t('game.emailDelivery'),
                      t('game.support247'),
                    ].map(text => (
                      <div key={text} className="flex items-center gap-2.5" style={{ color: 'var(--text-faint)' }}>
                        <Check size={12} className="text-accent/70 flex-shrink-0" />
                        <span className="font-body text-[12px]">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Related games */}
          {related.length > 0 && (
            <div className="mt-20">
              <Reveal>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="label block mb-2">{t('game.similar')}</span>
                    <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>{t('game.youMayLike')}</h2>
                  </div>
                </div>
              </Reveal>
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {related.map(g => (
                  <StaggerItem key={g.id}>
                    <GameCard game={g} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
