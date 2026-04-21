import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, TrendingDown, ShoppingCart, Trash2, Bell, BellOff, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { PageTransition, Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';
import { usePrice } from '../hooks/usePrice';

export default function Wishlist() {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const { format } = usePrice();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWishlist()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(gameId) {
    try {
      await api.removeWishlist(gameId);
      setItems(prev => prev.filter(i => i.game_id !== gameId));
      toast('Удалено из списка желаний', 'success');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function toggleNotify(gameId, current) {
    try {
      await api.toggleWishlistNotify(gameId, !current);
      setItems(prev => prev.map(i => i.game_id === gameId ? { ...i, notify: !current } : i));
    } catch (err) { toast(err.message, 'error'); }
  }

  async function handleAddToCart(gameId, name) {
    if (isInCart(gameId)) return navigate('/cart');
    addToCart(gameId);
    toast(`${name} в корзине`, 'cart');
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <PosterAccent src="/images/game-17.jpg" side="left"  top={80} height={720} opacity={0.45} objectPosition="50% 85%" />
        <PosterAccent src="/images/game-16.jpg" side="right" top={80} height={720} opacity={0.45} objectPosition="50% 25%" />
        <div className="absolute top-[20%] left-1/3 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(16,185,129,0.05)' }} />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 z-10">
          <Reveal>
            <div className="mb-10">
              <span className="label block mb-3">Список желаний</span>
              <h1 className="section-title text-4xl">Wishlist</h1>
              <p className="font-body mt-3 text-[14px]" style={{ color: 'var(--text-faint)' }}>
                Следите за изменением цен и получайте уведомления о скидках
              </p>
            </div>
          </Reveal>

          {items.length === 0 ? (
            <div className="glass-static p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/8 flex items-center justify-center mb-4">
                <Bookmark size={28} className="text-accent" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Список пуст</h3>
              <p className="font-body text-[14px] mb-6" style={{ color: 'var(--text-faint)' }}>
                Добавьте игры, чтобы следить за их ценой
              </p>
              <Link to="/catalog" className="btn-primary inline-flex">В каталог <ArrowRight size={16} /></Link>
            </div>
          ) : (
            <StaggerContainer className="space-y-3">
              {items.map(item => {
                const hasDrop = item.discount_since_add > 0;
                const inCart = isInCart(item.game_id);
                return (
                  <StaggerItem key={item.game_id}>
                    <div className={`glass flex items-center gap-4 p-4 ${hasDrop ? 'ring-2 ring-accent/30' : ''}`}>
                      <Link to={`/game/${item.game_id}`} className="flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-[88px] h-[64px] rounded-xl object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/game/${item.game_id}`}>
                          <h3 className="font-display font-bold text-[14px] truncate hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="price text-[14px]">{format(item.current_price)}</span>
                          {hasDrop && (
                            <span className="flex items-center gap-1 text-[11px] font-display font-bold text-accent">
                              <TrendingDown size={11} /> −{format(item.discount_since_add)}
                            </span>
                          )}
                          <span className="font-body text-[10px]" style={{ color: 'var(--text-faint)' }}>
                            · добавлено по {format(item.price_at_add)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleNotify(item.game_id, item.notify)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                          style={{
                            background: item.notify ? 'rgba(16,185,129,0.1)' : 'var(--surface)',
                            color: item.notify ? '#10B981' : 'var(--text-faint)',
                          }}
                          title={item.notify ? 'Уведомления включены' : 'Уведомления выключены'}
                        >
                          {item.notify ? <Bell size={14} /> : <BellOff size={14} />}
                        </button>
                        <button
                          onClick={() => handleRemove(item.game_id)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-all"
                          style={{ background: 'var(--surface)', color: 'var(--text-faint)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => handleAddToCart(item.game_id, item.name)}
                          className={`flex items-center gap-2 px-4 h-9 rounded-xl text-[12px] font-display font-semibold uppercase tracking-wider transition-all ${inCart ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-primary text-white hover:shadow-glow-sm'}`}
                        >
                          {inCart ? <Check size={13} /> : <ShoppingCart size={13} />}
                          {inCart ? 'В корзине' : 'Купить'}
                        </button>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
