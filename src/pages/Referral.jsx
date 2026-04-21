import { useState, useEffect } from 'react';
import { Users, Copy, Check, Gift, Share2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { PageTransition, Reveal } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';

export default function Referral() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    api.getReferral()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function copy(text, field) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      toast('Скопировано в буфер', 'success');
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => toast('Не удалось скопировать', 'error'));
  }

  async function share() {
    if (!navigator.share) { copy(data.link, 'link'); return; }
    try {
      await navigator.share({
        title: '4Game — магазин игр',
        text: 'Присоединяйся к 4Game по моей ссылке и получи скидку на первую покупку!',
        url: data.link,
      });
    } catch {}
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  const claimedRewards = data.rewards.filter(r => !r.claimed);
  const activeRewards = claimedRewards.length;

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <PosterAccent src="/images/game-18.jpg" side="left"  top={80} height={720} opacity={0.4} objectPosition="50% 35%" />
        <PosterAccent src="/images/game-21.jpg" side="right" top={80} height={720} opacity={0.4} objectPosition="32% 35%" />
        <div className="absolute top-[10%] right-1/3 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(147,51,234,0.06)' }} />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 z-10">
          <Reveal>
            <div className="mb-10">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 border border-secondary/30 flex items-center justify-center">
                  <Users size={24} className="text-secondary-light" />
                </div>
                <div className="flex-1">
                  <span className="label block mb-2">Партнёрская программа</span>
                  <h1 className="section-title text-4xl">Приглашай друзей</h1>
                  <p className="font-body text-[14px] mt-3" style={{ color: 'var(--text-muted)' }}>
                    За каждого друга, совершившего первую покупку, вы получите <strong className="text-accent">промокод 10%</strong> на следующий заказ
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Code + link */}
          <Reveal delay={0.05}>
            <div className="glass-static p-6 md:p-8 mb-6 space-y-5">
              <div>
                <span className="label block mb-3">Твой реферальный код</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-5 py-4 rounded-xl font-mono text-2xl font-bold tracking-wider text-center" style={{ background: 'var(--surface)', color: 'var(--text)', border: '2px dashed var(--surface-border)' }}>
                    {data.code}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => copy(data.code, 'code')}
                    className="btn-primary px-4 py-4"
                    title="Скопировать код"
                  >
                    {copiedField === 'code' ? <Check size={18} /> : <Copy size={18} />}
                  </motion.button>
                </div>
              </div>

              <div>
                <span className="label block mb-3">Ссылка для друзей</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={data.link}
                    readOnly
                    className="input flex-1 text-[12px] font-mono"
                  />
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => copy(data.link, 'link')}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px] font-display font-semibold uppercase tracking-wider transition-colors hover:bg-white/[0.05]"
                    style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}
                  >
                    {copiedField === 'link' ? <Check size={14} /> : <Copy size={14} />}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={share}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-[12px] font-display font-semibold uppercase tracking-wider transition-colors hover:bg-white/[0.05]"
                    style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}
                  >
                    <Share2 size={14} />
                  </motion.button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.1}>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass p-5 text-center">
                <UserPlus size={20} className="text-secondary-light mx-auto mb-2" />
                <p className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>{data.referredUsers.length}</p>
                <p className="font-body text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>Приглашённых</p>
              </div>
              <div className="glass p-5 text-center">
                <Gift size={20} className="text-accent mx-auto mb-2" />
                <p className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>{activeRewards}</p>
                <p className="font-body text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>Активных бонусов</p>
              </div>
              <div className="glass p-5 text-center">
                <Check size={20} className="text-amber-400 mx-auto mb-2" />
                <p className="font-display text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  {data.referredUsers.filter(u => u.order_count > 0).length}
                </p>
                <p className="font-body text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>Совершили покупку</p>
              </div>
            </div>
          </Reveal>

          {/* Rewards */}
          {data.rewards.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
                Твои бонусы
              </h2>
              <div className="space-y-2">
                {data.rewards.map(r => (
                  <div key={r.id} className="glass p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Gift size={16} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <code className="font-mono text-[13px] font-bold text-accent">{r.promo_code}</code>
                      <p className="font-body text-[11px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        −{r.reward_percent}% · {r.claimed ? 'Использовано' : 'Активно'}
                      </p>
                    </div>
                    {!r.claimed && (
                      <button onClick={() => copy(r.promo_code, `reward-${r.id}`)} className="btn-ghost text-[11px]">
                        {copiedField === `reward-${r.id}` ? <><Check size={12} /> OK</> : <><Copy size={12} /> Копировать</>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invited users */}
          <div>
            <h2 className="font-display text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
              Приглашённые ({data.referredUsers.length})
            </h2>
            {data.referredUsers.length === 0 ? (
              <div className="glass-static p-8 text-center">
                <p className="font-body text-[13px]" style={{ color: 'var(--text-faint)' }}>
                  Пока никто не зарегистрировался по твоей ссылке. Поделись ей с друзьями!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.referredUsers.map(u => (
                  <div key={u.id} className="glass p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/5 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-display font-bold text-[12px]">{u.username[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-[13px]" style={{ color: 'var(--text-secondary)' }}>@{u.username}</p>
                      <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                        Присоединился {new Date(u.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <span className={`badge text-[10px] ${u.order_count > 0 ? 'bg-accent/15 text-accent' : 'bg-white/5'}`} style={u.order_count === 0 ? { color: 'var(--text-faint)' } : {}}>
                      {u.order_count > 0 ? `${u.order_count} заказов` : 'Ещё не покупал'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
