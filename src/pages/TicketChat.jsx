import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Lock, Shield, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { PageTransition } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';
import { useI18n } from '../utils/i18n.jsx';

const ROLE_COLORS = { admin: 'text-primary', support: 'text-accent', user: '' };

export default function TicketChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useI18n();

  const ROLE_LABELS = { admin: t('ticket.roleAdmin'), support: t('ticket.roleSupport'), user: t('ticket.roleUser') };
  const STATUS_LABELS = {
    open:     { label: t('ticket.open'),     dot: 'bg-amber-400' },
    answered: { label: t('ticket.answered'), dot: 'bg-accent'    },
    closed:   { label: t('ticket.closed'),   dot: 'bg-white/20'  },
  };
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const scrollAreaRef = useRef(null);

  const AVATAR_PALETTE = [
    ['#E8102E','#B50D24'], ['#9333EA','#6B21A8'], ['#10B981','#047857'],
    ['#F59E0B','#D97706'], ['#3B82F6','#1D4ED8'], ['#EC4899','#BE185D'],
    ['#06B6D4','#0891B2'], ['#8B5CF6','#7C3AED'],
  ];
  const myAvatarIcon = (() => { try { const v = localStorage.getItem('avatarIcon'); return v && v !== 'null' ? v : null; } catch { return null; } })();
  const myAvatarGrad = AVATAR_PALETTE[parseInt(localStorage.getItem('avatarColor') || '0')] || AVATAR_PALETTE[0];

  async function loadTicket() {
    try {
      const data = await api.getTicket(id);
      setTicket(data);
      setMessages(data.messages || []);
    } catch (err) { toast(err.message || 'Error', 'error'); navigate('/support'); }
    setLoading(false);
  }

  useEffect(() => { loadTicket(); }, [id]);

  // Polling каждые 5 секунд для новых сообщений
  useEffect(() => {
    if (!ticket || ticket.status === 'closed') return;
    const interval = setInterval(async () => {
      try {
        const data = await api.getTicket(id);
        if (data.messages.length > messages.length) {
          setMessages(data.messages);
          setTicket(data);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [id, messages.length, ticket?.status]);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      const msg = await api.sendMessage(id, newMsg.trim());
      setMessages(prev => [...prev, msg]);
      setNewMsg('');
      if (msg.senderRole !== 'user') setTicket(prev => ({ ...prev, status: 'answered' }));
      else setTicket(prev => ({ ...prev, status: 'open' }));
    } catch (err) { toast(err.message, 'error'); }
    setSending(false);
  }

  async function handleClose() {
    try {
      await api.closeTicket(id);
      setTicket(prev => ({ ...prev, status: 'closed' }));
      toast(t('ticket.closed'), 'success');
    } catch (err) { toast(err.message, 'error'); }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isStaff = user?.role === 'admin' || user?.role === 'support';
  const isClosed = ticket?.status === 'closed';
  const status = STATUS_LABELS[ticket?.status] || STATUS_LABELS.open;

  return (
    <PageTransition>
      <div
        className="relative flex flex-col overflow-hidden"
        style={{ height: 'calc(100vh - 72px)' }}
      >

        {/* Атмосфера по краям */}
        <PosterAccent src="/images/game-21.jpg" side="left"  top={0} height={700} opacity={0.35} objectPosition="32% 35%" />
        <PosterAccent src="/images/game-16.jpg" side="right" top={0} height={700} opacity={0.35} objectPosition="50% 25%" />
        <div className="absolute top-[10%] left-[40%] w-[500px] h-[300px] bg-primary/[0.04] rounded-full blur-[140px] pointer-events-none" />

        {/* Header тикета */}
        <div className="relative flex-shrink-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(7,7,14,0.85)', borderColor: 'var(--surface-border)' }}>
          <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-3">
            <button
              onClick={() => navigate('/support')}
              className="p-2 rounded-xl transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Назад"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Аватарка тикета */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center flex-shrink-0">
              <Headphones size={16} className="text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-[15px] font-bold truncate" style={{ color: 'var(--text)' }}>
                {ticket?.subject}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                  #{id} · {isStaff && ticket?.username && `@${ticket.username} · `}{status.label}
                </p>
              </div>
            </div>

            {!isClosed && (
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-display font-semibold uppercase tracking-wider transition-colors hover:bg-white/5"
                style={{ background: 'var(--surface)', color: 'var(--text-faint)' }}
              >
                <Lock size={12} /> {t('ticket.close')}
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollAreaRef} className="relative flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-5 py-6 space-y-4 z-10">
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id || msg.senderid === user?.id;
            const role = msg.sender_role || msg.senderRole || 'user';
            const initial = (msg.username || '?')[0].toUpperCase();

            const bubbleAvatarGrad =
              role === 'admin'   ? 'from-primary/30 to-primary/5' :
              role === 'support' ? 'from-accent/30 to-accent/5' :
                                   'from-white/10 to-white/0';

            return (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* Аватар не-меня (слева) */}
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${bubbleAvatarGrad} flex items-center justify-center flex-shrink-0 border border-white/5`}>
                    <span className="font-display text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>{initial}</span>
                  </div>
                )}

                <div className={`max-w-[75%] ${isMe ? 'order-2' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'justify-end' : ''}`}>
                    <span className={`font-display text-[11px] font-bold ${ROLE_COLORS[role] || ''}`} style={!ROLE_COLORS[role] ? { color: 'var(--text-faint)' } : {}}>
                      {msg.username || 'Пользователь'}
                    </span>
                    {role !== 'user' && (
                      <span className={`badge text-[8px] py-0.5 px-1.5 ${role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'}`}>
                        <Shield size={8} /> {ROLE_LABELS[role]}
                      </span>
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl text-[14px] font-body leading-relaxed break-words ${
                      isMe
                        ? 'bg-gradient-to-br from-primary/20 to-primary/10 text-white rounded-br-md border border-primary/15'
                        : 'rounded-bl-md'
                    }`}
                    style={!isMe ? { background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' } : {}}
                  >
                    {msg.message}
                  </div>
                  <p className={`font-body text-[10px] mt-1.5 ${isMe ? 'text-right' : ''}`} style={{ color: 'var(--text-faint)' }}>
                    {new Date(msg.created_at || msg.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Аватар меня (справа) */}
                {isMe && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10 order-3"
                    style={{ background: `linear-gradient(135deg, ${myAvatarGrad[0]}, ${myAvatarGrad[1]})` }}
                  >
                    {myAvatarIcon
                      ? <span className="leading-none" style={{ fontSize: '14px' }}>{myAvatarIcon}</span>
                      : <span className="text-white font-display text-[11px] font-bold">{(user?.username || '?')[0].toUpperCase()}</span>
                    }
                  </div>
                )}
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!isClosed ? (
          <div className="relative flex-shrink-0 backdrop-blur-xl border-t z-10" style={{ background: 'rgba(7,7,14,0.85)', borderColor: 'var(--surface-border)' }}>
            <form onSubmit={handleSend} className="max-w-4xl mx-auto px-5 py-4 flex gap-3">
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder={t('ticket.placeholder')}
                className="input flex-1"
              />
              <motion.button
                type="submit"
                disabled={sending || !newMsg.trim()}
                whileTap={{ scale: 0.95 }}
                className="btn-primary px-5 disabled:opacity-40"
              >
                <Send size={16} />
              </motion.button>
            </form>
          </div>
        ) : (
          <div className="relative text-center py-6 z-10" style={{ background: 'var(--surface)' }}>
            <p className="font-body text-[14px]" style={{ color: 'var(--text-faint)' }}>
              {t('ticket.closedMsg')}
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
