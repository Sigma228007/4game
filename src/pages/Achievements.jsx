import { useState, useEffect } from 'react';
import { Trophy, Lock, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { PageTransition, Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';

const TIER_STYLES = {
  bronze:   { bg: 'from-amber-700/20 to-amber-900/10',    border: 'border-amber-700/30',    text: 'text-amber-500',    label: 'Бронза'   },
  silver:   { bg: 'from-slate-400/20 to-slate-600/10',    border: 'border-slate-400/30',    text: 'text-slate-300',    label: 'Серебро'  },
  gold:     { bg: 'from-amber-400/25 to-yellow-600/10',   border: 'border-amber-400/30',    text: 'text-amber-300',    label: 'Золото'   },
  platinum: { bg: 'from-cyan-300/20 to-blue-500/10',      border: 'border-cyan-300/30',     text: 'text-cyan-300',     label: 'Платина'  },
};

export default function Achievements() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAchievements()
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const earned = list.filter(a => a.earned);
  const locked = list.filter(a => !a.earned);
  const percent = list.length > 0 ? Math.round((earned.length / list.length) * 100) : 0;

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <PosterAccent src="/images/game-11.jpg" side="left"  top={80} height={720} opacity={0.4} objectPosition="50% 30%" />
        <PosterAccent src="/images/game-17.jpg" side="right" top={80} height={720} opacity={0.4} objectPosition="50% 85%" />
        <div className="absolute top-[10%] left-1/3 w-[500px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ background: 'rgba(245,158,11,0.06)' }} />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 z-10">
          <Reveal>
            <div className="mb-10">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 flex items-center justify-center">
                  <Trophy size={24} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <span className="label block mb-2">Игровой прогресс</span>
                  <h1 className="section-title text-4xl">Достижения</h1>
                </div>
              </div>

              <div className="mt-8 glass-static p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-[13px]" style={{ color: 'var(--text-muted)' }}>Открыто</span>
                  <span className="font-display font-bold text-[15px]" style={{ color: 'var(--text)' }}>
                    {earned.length} / {list.length} <span className="text-accent">({percent}%)</span>
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-400 to-accent"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {earned.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
                Открытые ({earned.length})
              </h2>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {earned.map(a => {
                  const tier = TIER_STYLES[a.tier] || TIER_STYLES.bronze;
                  return (
                    <StaggerItem key={a.id}>
                      <div className={`glass p-5 flex items-start gap-4 bg-gradient-to-br ${tier.bg} ${tier.border}`} style={{ borderWidth: 1 }}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl`} style={{ background: 'rgba(0,0,0,0.3)' }}>
                          {a.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-display font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tier.text}`} style={{ background: 'rgba(0,0,0,0.3)' }}>
                              {tier.label}
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-[14px]" style={{ color: 'var(--text)' }}>{a.title}</h3>
                          <p className="font-body text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>{a.description}</p>
                          {a.earned_at && (
                            <p className="font-body text-[10px] mt-2" style={{ color: 'var(--text-faint)' }}>
                              Получено {new Date(a.earned_at).toLocaleDateString('ru-RU')}
                            </p>
                          )}
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          )}

          {locked.length > 0 && (
            <div>
              <h2 className="font-display text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-faint)' }}>
                Закрытые ({locked.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locked.map(a => (
                  <div key={a.id} className="glass p-5 flex items-start gap-4 opacity-50">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface)' }}>
                      <Lock size={18} style={{ color: 'var(--text-faint)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-[14px]" style={{ color: 'var(--text-secondary)' }}>{a.title}</h3>
                      <p className="font-body text-[12px] mt-1" style={{ color: 'var(--text-faint)' }}>{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
