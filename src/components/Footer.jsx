import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Gamepad2, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useI18n } from '../utils/i18n.jsx';

export default function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [msg, setMsg] = useState('');

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error');
      setMsg('Введите корректный email');
      return;
    }
    setStatus('loading');
    try {
      await api.subscribeNewsletter(email.trim());
      setStatus('done');
      setMsg('Готово! Промокод WELCOME10 на почте.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMsg(err.message);
    }
  }

  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid var(--surface-border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14">

        {/* Newsletter banner */}
        <div className="mb-12 glass-static p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(232,16,46,0.1)' }} />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <span className="label block mb-2">{t('footer.subscribe')}</span>
              <h3 className="font-display text-xl md:text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {t('footer.subscribe')} <span className="text-primary">·</span>
              </h3>
              <p className="font-body text-[13px] mt-2" style={{ color: 'var(--text-muted)' }}>
                {t('footer.subscribeDesc')} <code className="font-mono font-bold text-accent">WELCOME10</code> {t('footer.onFirstOrder')}.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              {status === 'done' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-[13px] font-body flex-1">
                  <CheckCircle size={16} /> {msg}
                </motion.div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                    placeholder={t('footer.subscribe.placeholder')}
                    className="input flex-1"
                  />
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={status === 'loading'}
                    className="btn-primary px-4 py-3 text-[13px] disabled:opacity-50"
                  >
                    {status === 'loading' ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={14} /> {t('footer.subscribe.button')}</>}
                  </motion.button>
                </>
              )}
            </form>
            {status === 'error' && (
              <p className="font-body text-[12px] text-primary lg:col-span-2">{msg}</p>
            )}
          </div>
        </div>

        {/* Nav columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Gamepad2 size={14} className="text-white" />
              </div>
              <span className="font-display font-black text-lg"><span className="text-primary">4</span><span style={{ color: 'var(--text)' }}>Game</span></span>
            </Link>
            <p className="font-body text-[13px] leading-relaxed max-w-[240px]" style={{ color: 'var(--text-faint)' }}>
              Магазин лицензионных ключей. Честные цены, мгновенная доставка.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="label">{t('footer.nav')}</h4>
            <nav className="flex flex-col gap-2">
              {['/', '/catalog', '/about'].map((to, i) => (
                <Link key={to} to={to} className="font-body text-[13px] hover:text-primary transition-colors w-fit" style={{ color: 'var(--text-faint)' }}>
                  {[t('nav.home'), t('nav.catalog'), t('nav.about')][i]}
                </Link>
              ))}
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="label">{t('footer.genres')}</h4>
            <nav className="flex flex-col gap-2">
              {[['action','Экшен'],['shooter','Шутеры'],['rpg','RPG'],['strategy','Стратегии'],['sport','Спорт']].map(([id, name]) => (
                <Link key={id} to={`/catalog?genre=${id}`} className="font-body text-[13px] hover:text-primary transition-colors w-fit" style={{ color: 'var(--text-faint)' }}>{name}</Link>
              ))}
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="label">{t('footer.contacts')}</h4>
            <div className="space-y-2.5">
              <a href="mailto:support@4game.com" className="flex items-center gap-2 font-body text-[13px] hover:text-primary transition-colors" style={{ color: 'var(--text-faint)' }}><Mail size={13} />support@4game.com</a>
              <a href="tel:+79242485393" className="flex items-center gap-2 font-body text-[13px] hover:text-primary transition-colors" style={{ color: 'var(--text-faint)' }}><Phone size={13} />+7 (924) 248-53-93</a>
              <div className="flex items-center gap-2 font-body text-[13px]" style={{ color: 'var(--text-faint)' }}><MapPin size={13} />Владивосток, Россия</div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>© {new Date().getFullYear()} 4Game. Дипломный проект.</p>
          <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>ВСКК • 09.02.07</p>
        </div>
      </div>
    </footer>
  );
}
