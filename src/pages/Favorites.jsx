import { Heart, ShoppingCart, Trash2, ArrowRight, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { PageTransition, Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';

export default function Favorites() {
  const { favItems, removeFromFavorites } = useFavorites();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  if (favItems.length === 0) {
    return (
      <PageTransition>
        <div className="relative min-h-[65vh] flex items-center justify-center px-5 overflow-hidden">
          <PosterAccent src="/images/game-1.jpg"  side="left"  top={0} height={700} opacity={0.5}  objectPosition="50% 18%" />
          <PosterAccent src="/images/game-11.jpg" side="right" top={0} height={700} opacity={0.5}  objectPosition="50% 30%" />
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-pink-500/[0.05] rounded-full blur-[120px] pointer-events-none" />

          <div className="relative text-center space-y-6 max-w-sm z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <Heart size={32} style={{ color: 'var(--text-faint)' }} />
            </div>
            <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>Список пуст</h2>
            <p className="font-body text-[15px]" style={{ color: 'var(--text-faint)' }}>Нажимайте ♥ на карточках, чтобы сохранить</p>
            <Link to="/catalog" className="btn-primary inline-flex">В каталог <ArrowRight size={16} /></Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <PosterAccent src="/images/game-2.jpg"  side="left"  top={80}   height={700} opacity={0.5}  objectPosition="50% 28%" />
        <PosterAccent src="/images/game-7.jpg"  side="right" top={80}   height={700} opacity={0.5}  objectPosition="22% 50%" />
        <PosterAccent src="/images/game-17.jpg" side="left"  top={900}  height={650} opacity={0.45} objectPosition="50% 85%" />
        <PosterAccent src="/images/game-11.jpg" side="right" top={900}  height={650} opacity={0.45} objectPosition="50% 30%" />

        <div className="absolute top-[10%] right-[20%] w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(236,72,153,0.04)' }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 z-10">
          <Reveal>
            <div className="mb-10">
              <span className="label block mb-3">Сохранённое</span>
              <h1 className="section-title text-4xl">Избранное</h1>
              <p className="font-body mt-3 text-[14px]" style={{ color: 'var(--text-faint)' }}>
                {favItems.length} {favItems.length === 1 ? 'игра' : favItems.length < 5 ? 'игры' : 'игр'}
              </p>
            </div>
          </Reveal>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favItems.map(game => {
              const inCart = isInCart(game.id);
              return (
                <StaggerItem key={game.id}>
                  <div className="glass overflow-hidden flex flex-col h-full">
                    <Link to={`/game/${game.id}`} className="relative aspect-video overflow-hidden" style={{ background: 'var(--surface)' }}>
                      <img src={game.image} alt={game.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg) 0%, transparent 50%)' }} />
                    </Link>
                    <div className="p-5 flex-1 flex flex-col gap-3">
                      <Link to={`/game/${game.id}`}>
                        <h3 className="font-display font-bold text-[15px] hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                          {game.name}
                        </h3>
                      </Link>
                      <p className="font-body text-[13px] line-clamp-2 flex-1" style={{ color: 'var(--text-muted)' }}>{game.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="price text-lg">{game.price.toLocaleString('ru-RU')}&nbsp;₽</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { removeFromFavorites(game.id); toast('Удалено из избранного', 'fav'); }}
                            className="w-9 h-9 rounded-xl flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-all"
                            style={{ background: 'var(--surface)', color: 'var(--text-faint)' }}
                            aria-label="Удалить"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            onClick={() => { if (inCart) return navigate('/cart'); addToCart(game.id); toast('Добавлено в корзину', 'cart'); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-display font-semibold uppercase tracking-wider transition-all ${inCart ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-primary text-white hover:shadow-glow-sm'}`}
                          >
                            {inCart ? <Check size={13} /> : <ShoppingCart size={13} />}
                            {inCart ? 'В корзине' : 'Купить'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </PageTransition>
  );
}
