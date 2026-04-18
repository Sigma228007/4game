import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Plus, Clock, CheckCircle, AlertCircle, Send, X, Headphones, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { PageTransition, Reveal } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';

const STATUS = {
  open:     { label: 'Открыт',   color: 'text-amber-400 bg-amber-400/10', icon: AlertCircle },
  answered: { label: 'Отвечен',  color: 'text-accent bg-accent/10',        icon: CheckCircle },
  closed:   { label: 'Закрыт',   color: 'bg-white/5',                       icon: Clock, textColor: 'var(--text-faint)' },
};

export default function Support() {
  const { isAuth, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const isStaff = user?.role === 'admin' || user?.role === 'support';

  useEffect(() => {
    if (!isAuth) return;
    api.getTickets().then(setTickets).catch(() => {}).finally(() => setLoading(false));
  }, [isAuth]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      const ticket = await api.createTicket(subject.trim(), message.trim());
      toast('Обращение создано', 'success');
      setShowForm(false);
      setSubject(''); setMessage('');
      setTickets(prev => [{ ...ticket, message_count: 1 }, ...prev]);
    } catch (err) { toast(err.message, 'error'); }
    setSending(false);
  }

  if (!isAuth) { navigate('/login'); return null; }

  // Счётчики по статусам
  const openCount = tickets.filter(t => t.status === 'open').length;
  const answeredCount = tickets.filter(t => t.status === 'answered').length;
  const closedCount = tickets.filter(t => t.status === 'closed').length;

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">

        {/* Персонажи: Геральт слева и Сэм Портер справа — созерцательные сюжетные герои */}
        <PosterAccent src="/images/game-16.jpg" side="left"  top={80}  height={720} opacity={0.45} objectPosition="50% 25%" />
        <PosterAccent src="/images/game-21.jpg" side="right" top={80}  height={720} opacity={0.5}  objectPosition="32% 35%" />
        <PosterAccent src="/images/game-18.jpg" side="left"  top={850} height={600} opacity={0.4}  objectPosition="50% 35%" />

        <div className="absolute top-[15%] right-[15%] w-[400px] h-[300px] bg-amber-400/[0.05] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 z-10">

          {/* Header с иконкой и счётчиками статусов */}
          <Reveal>
            <div className="mb-10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Headphones size={24} className="text-primary" />
                  </div>
                  <div>
                    <span className="label block mb-2">{isStaff ? 'Панель поддержки' : 'Центр помощи'}</span>
                    <h1 className="section-title text-4xl">Поддержка</h1>
                  </div>
                </div>
                {!isStaff && (
                  <button onClick={() => setShowForm(!showForm)} className="btn-primary text-[13px]">
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Отмена' : 'Новое обращение'}
                  </button>
                )}
              </div>

              {/* Status strip */}
              {tickets.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-8">
                  {[
                    { icon: AlertCircle, label: 'В работе',   count: openCount,     color: 'text-amber-400', bg: 'rgba(245,158,11,0.08)' },
                    { icon: CheckCircle, label: 'Отвечено',   count: answeredCount, color: 'text-accent',    bg: 'rgba(16,185,129,0.08)' },
                    { icon: Clock,       label: 'Закрыто',    count: closedCount,   color: 'text-faint',     bg: 'rgba(255,255,255,0.02)' },
                  ].map(s => (
                    <div key={s.label} className="glass-static p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                        <s.icon size={16} className={s.color === 'text-faint' ? '' : s.color} style={s.color === 'text-faint' ? { color: 'var(--text-faint)' } : {}} />
                      </div>
                      <div>
                        <p className="font-display text-xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>{s.count}</p>
                        <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* Create form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8">
                <form onSubmit={handleCreate} className="glass-static p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={15} className="text-primary" />
                    <h3 className="font-display text-[15px] font-bold" style={{ color: 'var(--text)' }}>Новое обращение</h3>
                  </div>
                  <p className="font-body text-[12px]" style={{ color: 'var(--text-faint)' }}>
                    Опишите проблему — обычно отвечаем за 10–30 минут.
                  </p>
                  <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Тема обращения" required className="input" />
                  <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Опишите вашу проблему подробно..." rows={4} required className="input resize-none" />
                  <motion.button type="submit" disabled={sending} whileTap={{ scale: 0.97 }} className="btn-primary py-3 text-[13px]">
                    {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={15} /> Отправить</>}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tickets list */}
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
          ) : tickets.length === 0 ? (
            <div className="glass-static p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
                <MessageCircle size={28} className="text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                {isStaff ? 'Пока тихо' : 'Обращений пока нет'}
              </h3>
              <p className="font-body text-[14px] max-w-sm mx-auto" style={{ color: 'var(--text-faint)' }}>
                {isStaff ? 'Как только кто-то напишет — тикет появится здесь' : 'Нажмите «Новое обращение», если нужна помощь'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t, i) => {
                const s = STATUS[t.status] || STATUS.open;
                const SIcon = s.icon;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={`/support/${t.id}`} className="glass flex items-center gap-4 p-5 group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                        <SIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-[13px] font-bold truncate group-hover:text-white transition-colors" style={{ color: 'var(--text-secondary)' }}>
                            {isStaff && t.username && <span className="text-primary mr-2">@{t.username}</span>}
                            {t.subject}
                          </h3>
                        </div>
                        <p className="font-body text-[12px] mt-1" style={{ color: 'var(--text-faint)' }}>
                          #{t.id} · {t.message_count} сообщ. · {new Date(t.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <span className={`badge text-[10px] ${s.color}`} style={s.textColor ? { color: s.textColor } : {}}>
                        {s.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
