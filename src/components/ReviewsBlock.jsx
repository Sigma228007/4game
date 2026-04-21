import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Send, X, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

/**
 * Блок отзывов на странице игры. Показывает рейтинг с распределением, список отзывов и форму.
 */
export default function ReviewsBlock({ gameId }) {
  const { user, isAuth } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('helpful');
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api.getReviews(gameId, sort)
      .then(data => { if (!cancelled) { setReviews(data.reviews || []); setStats(data.stats || null); } })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    if (isAuth) {
      api.canReview(gameId)
        .then(data => {
          if (cancelled) return;
          setCanReview(data.canReview);
          setMyReview(data.myReview);
          if (data.myReview) {
            setRating(data.myReview.rating);
            setText(data.myReview.text || '');
          }
        })
        .catch(() => {});
    }

    return () => { cancelled = true; };
  }, [gameId, sort, isAuth]);

  async function handleSubmit(e) {
    e?.preventDefault();
    if (rating < 1) return;
    setSubmitting(true);
    try {
      const saved = await api.createReview(gameId, rating, text.trim());
      toast(myReview ? 'Отзыв обновлён' : 'Отзыв опубликован', 'success');
      setMyReview(saved);
      setShowForm(false);
      // Перезагружаем список
      const data = await api.getReviews(gameId, sort);
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (err) { toast(err.message, 'error'); }
    setSubmitting(false);
  }

  async function handleDelete() {
    if (!myReview) return;
    if (!confirm('Удалить свой отзыв?')) return;
    try {
      await api.deleteReview(myReview.id);
      toast('Отзыв удалён', 'success');
      setMyReview(null);
      setRating(5);
      setText('');
      const data = await api.getReviews(gameId, sort);
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (err) { toast(err.message, 'error'); }
  }

  async function handleVoteHelpful(reviewId) {
    if (!isAuth) { toast('Войдите, чтобы голосовать', 'error'); return; }
    try {
      const res = await api.voteReviewHelpful(reviewId);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: r.helpful + (res.helpful ? 1 : -1) } : r));
    } catch (err) { toast(err.message, 'error'); }
  }

  const avg = stats?.avg ? Number(stats.avg).toFixed(1) : '—';
  const total = stats?.total || 0;

  return (
    <div className="glass-static p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <MessageSquare size={20} style={{ color: 'var(--text-muted)' }} />
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>
            Отзывы {total > 0 && <span style={{ color: 'var(--text-faint)' }}>({total})</span>}
          </h2>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(Number(stats.avg)) ? 'text-amber-400' : ''} style={i >= Math.round(Number(stats.avg)) ? { color: 'var(--text-faint)' } : {}} fill="currentColor" />
            ))}
            <span className="font-display font-bold text-[14px] ml-1" style={{ color: 'var(--text)' }}>{avg}</span>
          </div>
        )}
      </div>

      {/* Rating breakdown */}
      {total > 0 && (
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map(n => {
            const count = stats[`r${n}`] || 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-3">
                <span className="font-body text-[11px] w-6 text-right" style={{ color: 'var(--text-faint)' }}>{n} ★</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                  <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="font-body text-[11px] w-8 tabular-nums" style={{ color: 'var(--text-faint)' }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Form / CTA */}
      {isAuth ? (
        canReview ? (
          <div>
            {!showForm ? (
              myReview ? (
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className={i < myReview.rating ? 'text-amber-400' : ''} style={i >= myReview.rating ? { color: 'var(--text-faint)' } : {}} fill="currentColor" />
                      ))}
                    </div>
                    <span className="font-body text-[13px]" style={{ color: 'var(--text-muted)' }}>Ваш отзыв</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-display font-semibold uppercase tracking-wider transition-colors hover:bg-white/[0.05]" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                      <Edit3 size={11} /> Изменить
                    </button>
                    <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-display font-semibold uppercase tracking-wider transition-colors text-primary hover:bg-primary/10" style={{ background: 'var(--bg-elevated)' }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-xl font-display text-[13px] font-semibold uppercase tracking-wider transition-colors hover:bg-white/[0.05]" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}>
                  Написать отзыв
                </button>
              )
            ) : (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-[14px]" style={{ color: 'var(--text)' }}>{myReview ? 'Изменить отзыв' : 'Ваш отзыв'}</h3>
                  <button type="button" onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-white/5" style={{ color: 'var(--text-faint)' }}>
                    <X size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map(n => {
                    const active = (hoverRating || rating) >= n;
                    return (
                      <button key={n} type="button" onMouseEnter={() => setHoverRating(n)} onClick={() => setRating(n)} className="p-1 transition-transform hover:scale-110">
                        <Star size={24} className={active ? 'text-amber-400' : ''} style={!active ? { color: 'var(--text-faint)' } : {}} fill="currentColor" />
                      </button>
                    );
                  })}
                  <span className="font-display font-bold ml-2 text-[14px]" style={{ color: 'var(--text-secondary)' }}>{rating}/5</span>
                </div>
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Поделитесь впечатлениями от игры (необязательно)..." rows={4} className="input resize-none" maxLength={2000} />
                <div className="flex items-center gap-3">
                  <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={submitting} className="btn-primary py-2.5 text-[12px] disabled:opacity-50">
                    {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={14} /> {myReview ? 'Сохранить' : 'Опубликовать'}</>}
                  </motion.button>
                  <span className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>{text.length}/2000</span>
                </div>
              </motion.form>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
            <p className="font-body text-[13px]" style={{ color: 'var(--text-faint)' }}>Оставлять отзывы могут только покупатели этой игры</p>
          </div>
        )
      ) : (
        <div className="p-4 rounded-xl text-center" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
          <Link to="/login" className="font-body text-[13px] text-primary hover:underline">
            Войдите, чтобы оставить отзыв
          </Link>
        </div>
      )}

      {/* Sort controls */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>Сортировка:</span>
          {[{ v: 'helpful', l: 'Полезные' }, { v: 'newest', l: 'Свежие' }, { v: 'worst', l: 'Худшие' }].map(opt => (
            <button
              key={opt.v}
              onClick={() => setSort(opt.v)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-display font-semibold uppercase tracking-wider transition-colors"
              style={{
                background: sort === opt.v ? 'var(--bg-elevated)' : 'transparent',
                color: sort === opt.v ? 'var(--text)' : 'var(--text-faint)',
              }}
            >
              {opt.l}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[1, 2].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-6">
          <p className="font-body text-[14px]" style={{ color: 'var(--text-faint)' }}>Пока нет отзывов. Будьте первым!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {reviews.map((r, i) => {
              const isMyReview = user?.id === r.user_id;
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #9333EA, #6B21A8)' }}
                    >
                      <span className="text-white font-display text-[14px] font-bold">{r.username[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-[13px]" style={{ color: 'var(--text-secondary)' }}>{r.username}</span>
                        {isMyReview && <span className="badge text-[8px] bg-primary/15 text-primary">вы</span>}
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={11} className={i < r.rating ? 'text-amber-400' : ''} style={i >= r.rating ? { color: 'var(--text-faint)' } : {}} fill="currentColor" />
                          ))}
                        </div>
                        <span className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                          · {new Date(r.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {r.text && (
                        <p className="font-body text-[13px] mt-2 leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>
                          {r.text}
                        </p>
                      )}
                      {!isMyReview && (
                        <button
                          onClick={() => handleVoteHelpful(r.id)}
                          className="mt-3 flex items-center gap-1.5 text-[11px] font-body transition-colors hover:text-accent"
                          style={{ color: 'var(--text-faint)' }}
                        >
                          <ThumbsUp size={12} /> Полезно ({r.helpful})
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
