import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Key, Copy, Check, Package, Loader2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/Motion';
import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { usePrice } from '../hooks/usePrice';
import { useI18n } from '../utils/i18n.jsx';
import { api } from '../api';
import { useCart } from '../context/CartContext';

const POLL_INTERVAL = 2000;
const POLL_TIMEOUT = 60000;

export default function Success() {
  const location = useLocation();
  const toast = useToast();
  const { format } = usePrice();
  const { t } = useI18n();
  const [copiedKey, setCopiedKey] = useState(null);
  const { reload: reloadCart } = useCart();

  // Payment polling state
  const [orderData, setOrderData] = useState(null);   // { orderId, total, items, createdAt }
  const [pollStatus, setPollStatus] = useState('idle'); // idle | polling | succeeded | canceled | timeout

  useEffect(() => {
    const paymentId = localStorage.getItem('pendingPaymentId');
    if (!paymentId) {
      if (location.state) {
        setOrderData(location.state);
        setPollStatus('succeeded');
      }
      return;
    }

    localStorage.removeItem('pendingPaymentId');
    setPollStatus('polling');

    let elapsed = 0;
    let timer;

    async function poll() {
      try {
        const { status, order } = await api.getPaymentStatus(paymentId);
        if (status === 'succeeded' && order) {
          setOrderData(order);
          setPollStatus('succeeded');
          reloadCart();
          return;
        }
        if (status === 'canceled') {
          setPollStatus('canceled');
          return;
        }
      } catch (_) { /* network error, keep polling */ }

      elapsed += POLL_INTERVAL;
      if (elapsed >= POLL_TIMEOUT) {
        setPollStatus('timeout');
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL);
    }

    timer = setTimeout(poll, POLL_INTERVAL);
    return () => clearTimeout(timer);
  }, []);

  function copyKey(key) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast(t('order.keyCopied'), 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <PageTransition><div className="min-h-[85vh] flex items-center justify-center px-5 py-10">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative w-full max-w-lg space-y-8">

        {/* Polling spinner */}
        {pollStatus === 'polling' && (
          <>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center shadow-lg">
              <Loader2 size={36} className="text-white animate-spin" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-3">
              <h1 className="font-display text-3xl font-black" style={{ color: 'var(--text)' }}>Проверяем оплату</h1>
              <p className="font-body text-[15px]" style={{ color: 'var(--text-muted)' }}>Подождите несколько секунд…</p>
            </motion.div>
          </>
        )}

        {/* Timeout */}
        {pollStatus === 'timeout' && (
          <>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'var(--surface)' }}>
              <Loader2 size={36} style={{ color: 'var(--text-muted)' }} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-3">
              <h1 className="font-display text-2xl font-black" style={{ color: 'var(--text)' }}>Оплата обрабатывается</h1>
              <p className="font-body text-[15px]" style={{ color: 'var(--text-muted)' }}>
                Платёж принят. Ключи появятся в разделе «Мои покупки» после подтверждения.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
              <Link to="/orders" className="btn-primary text-[13px]"><Package size={16} /> Мои покупки</Link>
              <Link to="/catalog" className="btn-ghost text-[13px]">{t('success.moreGames')} <ArrowRight size={16} /></Link>
            </motion.div>
          </>
        )}

        {/* Canceled */}
        {pollStatus === 'canceled' && (
          <>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center shadow-lg">
              <XCircle size={36} className="text-white" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-3">
              <h1 className="font-display text-3xl font-black" style={{ color: 'var(--text)' }}>Оплата отменена</h1>
              <p className="font-body text-[15px]" style={{ color: 'var(--text-muted)' }}>Товары остались в корзине.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-4">
              <Link to="/cart" className="btn-primary text-[13px]">Вернуться в корзину</Link>
              <Link to="/catalog" className="btn-ghost text-[13px]">{t('success.moreGames')} <ArrowRight size={16} /></Link>
            </motion.div>
          </>
        )}

        {/* Success */}
        {pollStatus === 'succeeded' && (
          <>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
              <CheckCircle size={36} className="text-white" strokeWidth={2.5} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-3">
              <h1 className="font-display text-3xl font-black" style={{ color: 'var(--text)' }}>{t('success.title')}</h1>
              {orderData && (
                <p className="font-body text-[15px]" style={{ color: 'var(--text-muted)' }}>
                  {t('success.order')} #{orderData.orderId} · {format(orderData.total)}
                </p>
              )}
            </motion.div>

            {orderData?.items && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass-static overflow-hidden">
                <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--surface-border)' }}>
                  <Key size={15} className="text-accent" />
                  <span className="font-display text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t('success.keys')}</span>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--surface-border)' }}>
                  {orderData.items.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                      className="px-5 py-4 flex items-center gap-4">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-9 object-cover rounded-lg flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-[12px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <code className="font-mono text-[13px] font-bold tracking-widest text-accent">{item.gameKey}</code>
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => copyKey(item.gameKey)}
                            className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                            style={{ color: copiedKey === item.gameKey ? '#10B981' : 'var(--text-faint)' }}>
                            {copiedKey === item.gameKey ? <Check size={13} /> : <Copy size={13} />}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-wrap justify-center gap-4">
              <Link to="/orders" className="btn-ghost text-[13px]"><Package size={16} /> {t('success.myPurchases')}</Link>
              <Link to="/catalog" className="btn-primary text-[13px]">{t('success.moreGames')} <ArrowRight size={16} /></Link>
            </motion.div>
          </>
        )}

      </div>
    </div></PageTransition>
  );
}
