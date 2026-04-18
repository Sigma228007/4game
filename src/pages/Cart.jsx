import { ShoppingCart, Trash2, ArrowRight, CreditCard, Shield, Tag, X, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { PageTransition, Reveal } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';
import { api } from '../api';
import { useState } from 'react';
import { applyPromo } from '../utils/promoCodes';

export default function Cart() {
  const { cartItems, total, removeFromCart, clearCart, reload } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [checking, setChecking] = useState(false);
  const savings = cartItems.reduce((s, g) => s + (g.oldPrice ? g.oldPrice - g.price : 0), 0);

  // Промокод
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // { code, discount, promo }
  const [promoError, setPromoError] = useState('');

  function handleApplyPromo() {
    const result = applyPromo(promoInput, total);
    if (result.valid) {
      setPromoApplied({ code: result.code, discount: result.discount, promo: result.promo });
      setPromoError('');
      setPromoInput('');
      toast(`Промокод применён: −${result.discount.toLocaleString('ru-RU')} ₽`, 'success');
    } else {
      setPromoError(result.error);
      setPromoApplied(null);
    }
  }

  function handleRemovePromo() {
    setPromoApplied(null);
    setPromoError('');
  }

  const promoDiscount = promoApplied?.discount || 0;
  const finalTotal = Math.max(0, total - promoDiscount);

  async function handleCheckout() {
    setChecking(true);
    try {
      const orderData = await api.checkout();
      await reload();
      navigate('/success', { state: orderData });
    } catch (err) {
      clearCart();
      navigate('/success');
    }
    setChecking(false);
  }

  if (cartItems.length === 0) {
    return (
      <PageTransition>
        <div className="relative min-h-[65vh] flex items-center justify-center px-5 overflow-hidden">
          <PosterAccent src="/images/game-1.jpg" side="left"  top={0} height={700} opacity={0.5} objectPosition="50% 18%" />
          <PosterAccent src="/images/game-2.jpg" side="right" top={0} height={700} opacity={0.45} objectPosition="50% 28%" />
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/[0.05] rounded-full blur-[120px] pointer-events-none" />

          <div className="relative text-center space-y-6 max-w-sm z-10">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
              <ShoppingCart size={32} style={{ color: 'var(--text-faint)' }} />
            </div>
            <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>Корзина пуста</h2>
            <p className="font-body text-[15px]" style={{ color: 'var(--text-faint)' }}>Самое время выбрать что-нибудь из каталога</p>
            <Link to="/catalog" className="btn-primary inline-flex">В каталог <ArrowRight size={16} /></Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        {/* Персонажи по бокам */}
        <PosterAccent src="/images/game-7.jpg"  side="left"  top={80}  height={720} opacity={0.5}  objectPosition="22% 50%" />
        <PosterAccent src="/images/game-11.jpg" side="right" top={80}  height={720} opacity={0.5}  objectPosition="50% 30%" />
        <PosterAccent src="/images/game-17.jpg" side="left"  top={900} height={650} opacity={0.45} objectPosition="50% 85%" />
        <PosterAccent src="/images/game-2.jpg"  side="right" top={850} height={650} opacity={0.45} objectPosition="50% 28%" />

        <div className="absolute top-[5%] right-[20%] w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(16,185,129,0.05)' }} />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 z-10">
          <Reveal>
            <div className="mb-10">
              <span className="label block mb-3">Оформление</span>
              <h1 className="section-title text-4xl">Корзина</h1>
              <p className="font-body mt-3 text-[14px]" style={{ color: 'var(--text-faint)' }}>
                {cartItems.length} {cartItems.length === 1 ? 'товар' : cartItems.length < 5 ? 'товара' : 'товаров'}
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass flex items-center gap-4 p-4"
                >
                  <Link to={`/game/${game.id}`} className="w-[88px] h-[64px] rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--surface)' }}>
                    <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/game/${game.id}`}>
                      <h3 className="font-display text-[13px] font-bold truncate hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        {game.name}
                      </h3>
                    </Link>
                    <div className="flex gap-1.5 mt-1">
                      {game.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] font-display uppercase tracking-[0.1em] px-2 py-0.5 rounded" style={{ color: 'var(--text-faint)', background: 'var(--surface)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <span className="price text-[15px]">{game.price.toLocaleString('ru-RU')}&nbsp;₽</span>
                      {game.oldPrice && <span className="block text-[10px] line-through" style={{ color: 'var(--text-faint)' }}>{game.oldPrice.toLocaleString('ru-RU')}&nbsp;₽</span>}
                    </div>
                    <button
                      onClick={() => { removeFromCart(game.id); toast('Удалено из корзины', 'cart'); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:text-primary hover:bg-primary/10 transition-all"
                      style={{ background: 'var(--surface)', color: 'var(--text-faint)' }}
                      aria-label="Удалить из корзины"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Reveal delay={0.1} direction="left">
                <div className="relative glass-static p-6 space-y-5 sticky top-24 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/[0.06] rounded-full blur-3xl pointer-events-none" />
                  <div className="relative">
                    <h3 className="label mb-4">Итого</h3>
                    <div className="space-y-2">
                      {cartItems.map(g => (
                        <div key={g.id} className="flex justify-between text-[13px]">
                          <span className="font-body truncate mr-3" style={{ color: 'var(--text-muted)' }}>{g.name}</span>
                          <span className="font-display font-semibold flex-shrink-0 tabular-nums" style={{ color: 'var(--text-secondary)' }}>{g.price.toLocaleString('ru-RU')}&nbsp;₽</span>
                        </div>
                      ))}
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-[13px] py-3 mt-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
                        <span className="font-body text-accent/70">Экономия</span>
                        <span className="font-display font-semibold text-accent">−{savings.toLocaleString('ru-RU')}&nbsp;₽</span>
                      </div>
                    )}

                    {/* Промокод */}
                    <div className="pt-4 mt-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
                      <AnimatePresence mode="wait">
                        {promoApplied ? (
                          <motion.div
                            key="applied"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20"
                          >
                            <CheckCircle size={16} className="text-accent flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-[12px] font-bold text-accent">
                                {promoApplied.code}
                              </p>
                              <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                                {promoApplied.promo.label}
                              </p>
                            </div>
                            <button
                              onClick={handleRemovePromo}
                              className="p-1 rounded-lg hover:bg-white/[0.05] transition"
                              style={{ color: 'var(--text-faint)' }}
                              aria-label="Убрать промокод"
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="input"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Tag size={12} style={{ color: 'var(--text-faint)' }} />
                              <span className="label text-[10px]">Промокод</span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                value={promoInput}
                                onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                                onKeyDown={e => { if (e.key === 'Enter') handleApplyPromo(); }}
                                placeholder="WELCOME10"
                                className="input flex-1 text-[13px] py-2.5 uppercase tracking-wider"
                              />
                              <button
                                onClick={handleApplyPromo}
                                disabled={!promoInput.trim()}
                                className="px-4 rounded-xl text-[12px] font-display font-semibold uppercase tracking-wider disabled:opacity-40 transition-colors"
                                style={{
                                  background: 'var(--surface)',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--surface-border)',
                                }}
                              >
                                OK
                              </button>
                            </div>
                            {promoError && (
                              <p className="font-body text-[11px] text-primary mt-2">{promoError}</p>
                            )}
                            <p className="font-body text-[10px] mt-2" style={{ color: 'var(--text-faint)' }}>
                              Попробуйте: WELCOME10, NEWBIE500, GAMER25
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Итог */}
                    {promoApplied && (
                      <div className="flex justify-between text-[13px] py-2 mt-3">
                        <span className="font-body" style={{ color: 'var(--text-muted)' }}>Промокод</span>
                        <span className="font-display font-semibold text-accent">−{promoDiscount.toLocaleString('ru-RU')}&nbsp;₽</span>
                      </div>
                    )}

                    <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
                      <div className="flex justify-between items-baseline">
                        <span className="font-display text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>К оплате</span>
                        <span className="price text-[28px]">{finalTotal.toLocaleString('ru-RU')}&nbsp;₽</span>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCheckout}
                      disabled={checking}
                      className="btn-primary w-full py-4 text-[15px] disabled:opacity-50 mt-5"
                    >
                      {checking ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CreditCard size={18} /> Оплатить</>}
                    </motion.button>
                    <div className="flex items-center justify-center gap-2 text-[11px] font-body mt-3" style={{ color: 'var(--text-faint)' }}>
                      <Shield size={11} /> Безопасная оплата
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
