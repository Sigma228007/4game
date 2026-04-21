import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from './Toast';
import { useFlyTo } from './FlyToTarget';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePrice } from '../hooks/usePrice';

export default function GameCard({ game }) {
  const { isAuth } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();
  const toast = useToast();
  const flyTo = useFlyTo();
  const { format } = usePrice();
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);

  const fav = isFavorite(game.id);
  const inCart = isInCart(game.id);
  const discount = game.oldPrice ? Math.round((1 - game.price / game.oldPrice) * 100) : null;

  function handleFav(e) {
    e.preventDefault(); e.stopPropagation();
    if (!isAuth) return navigate('/login');
    const wasFav = fav;
    const added = toggleFavorite(game.id);
    // Летим в иконку избранного только при добавлении
    if (!wasFav && added && imgRef.current) {
      flyTo({
        image: game.image,
        from: imgRef.current.getBoundingClientRect(),
        target: 'favorites',
      });
    }
    toast(added ? 'Добавлено в избранное' : 'Убрано из избранного', 'fav');
  }

  function handleCart(e) {
    e.preventDefault(); e.stopPropagation();
    if (!isAuth) return navigate('/login');
    if (inCart) return navigate('/cart');
    addToCart(game.id);
    // Летим в корзину
    if (imgRef.current) {
      flyTo({
        image: game.image,
        from: imgRef.current.getBoundingClientRect(),
        target: 'cart',
      });
    }
    toast(`${game.name} в корзине`, 'cart');
  }

  return (
    <Link to={`/game/${game.id}`} className="block">
      <article className="glass group relative overflow-hidden cursor-pointer h-full flex flex-col">
        {discount && (
          <div className="absolute top-3 left-3 z-20 badge bg-primary text-white shadow-glow-sm">−{discount}%</div>
        )}

        <motion.button
          onClick={handleFav}
          whileTap={{ scale: 0.85 }}
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
            fav
              ? 'bg-primary text-white shadow-glow-sm scale-105'
              : 'backdrop-blur text-white/40 opacity-0 group-hover:opacity-100 hover:text-primary'
          }`}
          style={{ background: fav ? undefined : 'rgba(0,0,0,0.4)' }}
          aria-label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <Heart size={14} fill={fav ? 'currentColor' : 'none'} strokeWidth={2.5} />
        </motion.button>

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden flex-none" style={{ background: 'var(--bg-secondary)' }}>
          {/* Blur-up placeholder: небольшая версия обложки с размытием, пока грузится основная */}
          {!imgLoaded && (
            <>
              <div className="absolute inset-0 skeleton" />
              <img
                src={game.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                style={{ filter: 'blur(20px) saturate(1.4)', transform: 'scale(1.1)' }}
              />
            </>
          )}
          <img
            ref={imgRef}
            src={game.image}
            alt={game.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`relative w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
            <motion.button
              onClick={handleCart}
              whileTap={{ scale: 0.95 }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-display font-bold uppercase tracking-wider ${
                inCart ? 'bg-accent/90 text-white' : 'bg-primary text-white'
              }`}
            >
              {inCart ? <Check size={13} /> : <ShoppingCart size={13} />}
              {inCart ? 'В корзине' : 'В корзину'}
            </motion.button>
          </div>
        </div>

        <div className="p-4 space-y-2 flex flex-col">
          <div className="flex gap-1.5 overflow-hidden h-[18px]">
            {game.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-[9px] font-display font-semibold uppercase tracking-[0.1em] whitespace-nowrap px-2 py-0.5 rounded-md"
                style={{ color: 'var(--text-faint)', background: 'var(--surface)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="font-display font-bold text-[13px] leading-snug line-clamp-2 transition-colors min-h-[2.5em]" style={{ color: 'var(--text-secondary)' }}>
            {game.name}
          </h3>

          <div className="flex items-center gap-2">
            <Star size={11} className="text-amber-400" fill="currentColor" />
            <span className="text-[12px] font-body" style={{ color: 'var(--text-muted)' }}>{game.rating}</span>
            <span className="w-0.5 h-0.5 rounded-full" style={{ background: 'var(--text-faint)' }} />
            <span className="text-[12px] font-body" style={{ color: 'var(--text-faint)' }}>{game.year}</span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="price text-[17px]">{format(game.price)}</span>
            {game.oldPrice && <span className="text-[11px] line-through font-body" style={{ color: 'var(--text-faint)' }}>{format(game.oldPrice)}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}
