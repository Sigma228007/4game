import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Key, Copy, Check, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../components/Motion';
import { useState } from 'react';
import { useToast } from '../components/Toast';

export default function Success() {
  const location = useLocation();
  const orderData = location.state; // { orderId, total, items, createdAt }
  const toast = useToast();
  const [copiedKey, setCopiedKey] = useState(null);

  function copyKey(key) {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast('Ключ скопирован', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <PageTransition><div className="min-h-[85vh] flex items-center justify-center px-5 py-10">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative w-full max-w-lg space-y-8">
        {/* Icon */}
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shadow-lg">
          <CheckCircle size={36} className="text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-3">
          <h1 className="font-display text-3xl font-black" style={{ color: 'var(--text)' }}>Оплата прошла!</h1>
          {orderData && (
            <p className="font-body text-[15px]" style={{ color: 'var(--text-muted)' }}>
              Заказ #{orderData.orderId} · {orderData.total?.toLocaleString('ru-RU')} ₽
            </p>
          )}
        </motion.div>

        {/* Keys */}
        {orderData?.items && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-static overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--surface-border)' }}>
              <Key size={15} className="text-accent" />
              <span className="font-display text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Ваши ключи активации</span>
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

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-wrap justify-center gap-4">
          <Link to="/orders" className="btn-ghost text-[13px]"><Package size={16} /> Мои покупки</Link>
          <Link to="/catalog" className="btn-primary text-[13px]">Ещё игры <ArrowRight size={16} /></Link>
        </motion.div>
      </div>
    </div></PageTransition>
  );
}
