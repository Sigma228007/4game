import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Key, Copy, Check, ShoppingCart, ArrowRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { PageTransition, Reveal } from '../components/Motion';
import { generateReceipt } from '../utils/pdfReceipt';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const toast = useToast();

  useEffect(() => {
    api.getOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function copyKey(key) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast('Ключ скопирован', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <PageTransition><div className="min-h-screen"><div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14">
      <Reveal><div className="mb-10">
        <span className="label block mb-3">Ваши покупки</span>
        <h1 className="section-title text-4xl">История заказов</h1>
        <p className="font-body mt-2" style={{ color: 'var(--text-faint)' }}>{orders.length} {orders.length === 1 ? 'заказ' : orders.length < 5 ? 'заказа' : 'заказов'}</p>
      </div></Reveal>

      {orders.length === 0 ? (
        <div className="glass-static p-12 text-center">
          <ShoppingCart size={36} style={{ color: 'var(--text-faint)' }} className="mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Нет покупок</h3>
          <p className="font-body text-[14px] mb-6" style={{ color: 'var(--text-faint)' }}>Ваши заказы с ключами активации появятся здесь</p>
          <Link to="/catalog" className="btn-primary text-[13px]">В каталог <ArrowRight size={16} /></Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order, oi) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: oi * 0.05 }}
              className="glass-static overflow-hidden">
              {/* Order header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Package size={16} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-display text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                      Заказ #{order.id}
                    </p>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                      {new Date(order.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={async () => {
                      try { await generateReceipt(order); toast('Чек скачан', 'success'); }
                      catch { toast('Не удалось создать PDF', 'error'); }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-display font-semibold uppercase tracking-wider transition-colors hover:bg-white/[0.05]"
                    style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}
                    title="Скачать PDF-чек"
                  >
                    <Download size={12} /> PDF
                  </motion.button>
                  <div className="text-right">
                    <p className="price text-[18px]">{order.total?.toLocaleString('ru-RU')}&nbsp;₽</p>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>{order.items?.length} {order.items?.length === 1 ? 'игра' : 'игр'}</p>
                  </div>
                </div>
              </div>

              {/* Order items with keys */}
              <div className="divide-y" style={{ borderColor: 'var(--surface-border)' }}>
                {order.items?.map((item, ii) => (
                  <div key={ii} className="px-6 py-4 flex items-center gap-4">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-[13px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</p>
                      <p className="font-body text-[12px]" style={{ color: 'var(--text-faint)' }}>{item.price?.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    {/* Key */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                        <Key size={13} className="text-accent flex-shrink-0" />
                        <code className="font-mono text-[12px] font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          {item.gameKey || item.game_key}
                        </code>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copyKey(item.gameKey || item.game_key)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: 'var(--surface)', color: copiedKey === (item.gameKey || item.game_key) ? '#10B981' : 'var(--text-faint)' }}
                      >
                        {copiedKey === (item.gameKey || item.game_key) ? <Check size={14} /> : <Copy size={14} />}
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div></div></PageTransition>
  );
}
