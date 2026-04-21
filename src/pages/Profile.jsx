import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Package, Settings, LogOut, Sun, Moon, Key, Clock, CheckCircle, Palette, BarChart3, Star, ChevronRight, MessageCircle, Smile, Mail, Globe, Coins, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/Toast';
import { PageTransition, Reveal } from '../components/Motion';
import { api } from '../api';
import PosterAccent from '../components/PosterAccent';
import { GENRES } from '../data/games';
import { useI18n } from '../utils/i18n.jsx';
import { CURRENCIES, getCurrency, setCurrency } from '../utils/currency';

// Градиенты для аватара
const AVATAR_COLORS = [
  ['#E8102E','#B50D24'], ['#9333EA','#6B21A8'], ['#10B981','#047857'],
  ['#F59E0B','#D97706'], ['#3B82F6','#1D4ED8'], ['#EC4899','#BE185D'],
  ['#06B6D4','#0891B2'], ['#8B5CF6','#7C3AED'],
];

// Набор эмодзи-иконок для аватара. null = показать инициал буквы
const AVATAR_ICONS = [
  { id: null,     label: 'Буква'      },
  { id: '🎮',     label: 'Геймпад'    },
  { id: '🗡️',     label: 'Меч'        },
  { id: '🏹',     label: 'Лук'        },
  { id: '🛡️',     label: 'Щит'        },
  { id: '👑',     label: 'Корона'     },
  { id: '🔥',     label: 'Огонь'      },
  { id: '⚡',     label: 'Молния'     },
  { id: '💀',     label: 'Череп'      },
  { id: '👾',     label: 'Пиксели'    },
  { id: '🐉',     label: 'Дракон'     },
  { id: '🦊',     label: 'Лис'        },
  { id: '🐺',     label: 'Волк'       },
  { id: '🎯',     label: 'Мишень'     },
  { id: '🚀',     label: 'Ракета'     },
  { id: '⭐',     label: 'Звезда'     },
];

const TAB_KEYS = [
  { id: 'overview', key: 'profile.overview', icon: BarChart3 },
  { id: 'settings', key: 'profile.settings', icon: Settings },
];

export default function Profile() {
  const { user, username, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: favCount, favItems } = useFavorites();
  const { toggle, isDark } = useTheme();
  const { t, lang, setLang, locales } = useI18n();
  const [currency, setCurrencyLocal] = useState(getCurrency());
  const toast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  const [avatarIdx, setAvatarIdx] = useState(() => parseInt(localStorage.getItem('avatarColor') || '0'));
  const [avatarIcon, setAvatarIcon] = useState(() => {
    const v = localStorage.getItem('avatarIcon');
    return v && v !== 'null' ? v : null;
  });
  const avatarGrad = AVATAR_COLORS[avatarIdx] || AVATAR_COLORS[0];

  useEffect(() => {
    api.getOrders().then(setOrders).catch(() => {});
    api.getTickets().then(setTickets).catch(() => {});
    api.getMyReviews().then(setMyReviews).catch(() => {});
  }, []);

  // Синхронизируем input email с данными пользователя
  useEffect(() => {
    if (user?.email) setEmailInput(user.email);
  }, [user?.email]);

  async function handleSaveEmail(e) {
    e.preventDefault();
    if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      toast('Неверный формат email', 'error');
      return;
    }
    setEmailSaving(true);
    try {
      await api.updateEmail(emailInput.trim() || null);
      toast('Email обновлён', 'success');
    } catch (err) { toast(err.message, 'error'); }
    setEmailSaving(false);
  }

  function pickAvatarColor(idx) {
    setAvatarIdx(idx);
    localStorage.setItem('avatarColor', String(idx));
    window.dispatchEvent(new Event('avatar-change'));
    api.updateAvatar(idx).catch(() => {});
    toast('Цвет аватара обновлён', 'success');
  }

  function pickAvatarIcon(icon) {
    setAvatarIcon(icon);
    localStorage.setItem('avatarIcon', icon === null ? 'null' : icon);
    window.dispatchEvent(new Event('avatar-change'));
    toast('Иконка аватара обновлена', 'success');
  }

  // Дата регистрации с фоллбэком на данные из localStorage (offline-режим)
  const memberDate = useMemo(() => {
    const raw = user?.createdAt;
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });
  }, [user]);

  const favGenres = useMemo(() => {
    const counts = {};
    favItems.forEach(g => {
      const genre = GENRES.find(gr => gr.id === g.genre);
      if (genre) counts[genre.name] = (counts[genre.name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [favItems]);

  async function handleChangePassword(e) {
    e.preventDefault(); setPassMsg(null);
    if (!oldPass || !newPass) { setPassMsg({ ok: false, text: 'Заполните все поля' }); return; }
    if (newPass.length < 4) { setPassMsg({ ok: false, text: 'Минимум 4 символа' }); return; }
    if (newPass !== confirmPass) { setPassMsg({ ok: false, text: 'Пароли не совпадают' }); return; }
    try {
      await api.changePassword(oldPass, newPass);
      setOldPass(''); setNewPass(''); setConfirmPass('');
      setPassMsg({ ok: true, text: 'Пароль изменён!' });
      toast('Пароль обновлён', 'success');
    } catch (err) { setPassMsg({ ok: false, text: err.message }); }
  }

  const initials = username ? username[0].toUpperCase() : '?';

  // Компонент аватара для переиспользования
  const Avatar = ({ size = 72 }) => (
    <div
      className="rounded-2xl flex items-center justify-center shadow-glow-sm flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${avatarGrad[0]}, ${avatarGrad[1]})`,
      }}
    >
      {avatarIcon ? (
        <span style={{ fontSize: size * 0.5 }} className="leading-none">{avatarIcon}</span>
      ) : (
        <span className="text-white font-display font-black" style={{ fontSize: size * 0.4 }}>{initials}</span>
      )}
    </div>
  );

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">

        {/* Атмосферные постеры */}
        <PosterAccent src="/images/game-18.jpg" side="left"  top={80}  height={720} opacity={0.4}  objectPosition="50% 35%" />
        <PosterAccent src="/images/game-16.jpg" side="right" top={80}  height={720} opacity={0.4}  objectPosition="50% 25%" />
        <PosterAccent src="/images/game-21.jpg" side="left"  top={900} height={650} opacity={0.35} objectPosition="32% 35%" />
        <div className="absolute top-[10%] left-[40%] w-[500px] h-[300px] bg-primary/[0.06] rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14 z-10">

          {/* Header */}
          <Reveal>
            <div className="relative glass-static overflow-hidden mb-8">
              {/* Декоративный градиент в цветах выбранного аватара */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(ellipse 70% 100% at 15% 50%, ${avatarGrad[0]}22 0%, transparent 60%),
                    radial-gradient(ellipse 50% 100% at 85% 50%, ${avatarGrad[1]}15 0%, transparent 60%)
                  `,
                }}
              />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 md:p-8">
                <Avatar size={72} />
                <div className="flex-1">
                  <h1 className="font-display text-2xl md:text-3xl font-bold" style={{ color: 'var(--text)' }}>{username}</h1>
                  <p className="font-body text-[14px] mt-1" style={{ color: 'var(--text-faint)' }}>
                    {memberDate ? `${t('profile.welcome')} ${memberDate}` : t('profile.newPlayer')}
                  </p>
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="btn-ghost text-[12px] gap-2"
                >
                  <LogOut size={15} /> Выйти
                </button>
              </div>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.05}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { icon: Package,       label: 'Покупок',    value: orders.length,  to: '/orders',    color: 'text-accent bg-accent/10' },
                { icon: Heart,         label: 'Избранное',  value: favCount,        to: '/favorites', color: 'text-pink-400 bg-pink-400/10' },
                { icon: ShoppingCart,  label: 'В корзине',  value: cartCount,       to: '/cart',      color: 'text-blue-400 bg-blue-400/10' },
                { icon: MessageCircle, label: 'Обращений',  value: tickets.length,  to: '/support',   color: 'text-amber-400 bg-amber-400/10' },
              ].map(s => (
                <Link key={s.label} to={s.to} className="glass p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>

          {/* Tabs */}
          <Reveal delay={0.1}>
            <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: 'var(--surface)' }}>
              {TAB_KEYS.map(tab_ => (
                <button
                  key={tab_.id}
                  onClick={() => setTab(tab_.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-display font-semibold transition-all"
                  style={{
                    background: tab === tab_.id ? 'var(--bg-elevated)' : 'transparent',
                    color:      tab === tab_.id ? 'var(--text)'        : 'var(--text-faint)',
                  }}
                >
                  <tab_.icon size={15} /> {t(tab_.key)}
                </button>
              ))}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="glass-static p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package size={17} style={{ color: 'var(--text-faint)' }} />
                        <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Последние покупки</h3>
                      </div>
                      <Link to="/orders" className="font-body text-[12px] text-primary hover:underline">Все →</Link>
                    </div>
                    {orders.length > 0 ? orders.slice(0, 3).map(o => (
                      <Link
                        to="/orders"
                        key={o.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Key size={14} className="text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-[12px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>
                            Заказ #{o.id} · {o.items?.length} игр
                          </p>
                          <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                            {new Date(o.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <span className="price text-[13px]">{o.total?.toLocaleString('ru-RU')}&nbsp;₽</span>
                      </Link>
                    )) : (
                      <div className="text-center py-6">
                        <p className="font-body text-[13px]" style={{ color: 'var(--text-faint)' }}>Нет покупок</p>
                        <Link to="/catalog" className="font-body text-[12px] text-primary hover:underline">В каталог →</Link>
                      </div>
                    )}
                  </div>

                  <div className="glass-static p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Star size={17} style={{ color: 'var(--text-faint)' }} />
                      <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Быстрые действия</h3>
                    </div>
                    {[
                      { icon: ShoppingCart,  label: 'Каталог игр', desc: 'Найти новые игры',                      to: '/catalog' },
                      { icon: Package,       label: 'Мои покупки', desc: `${orders.length} заказов с ключами`,    to: '/orders' },
                      { icon: MessageCircle, label: 'Поддержка',   desc: `${tickets.length} обращений`,           to: '/support' },
                      { icon: Heart,         label: 'Избранное',   desc: `${favCount} сохранённых игр`,           to: '/favorites' },
                      { icon: Star,          label: 'Достижения',  desc: 'Твой игровой прогресс',                 to: '/achievements' },
                      { icon: BarChart3,     label: 'Wishlist',    desc: 'Следить за скидками',                   to: '/wishlist' },
                      { icon: Smile,         label: 'Рефералы',    desc: 'Приглашай и получай бонусы',            to: '/referral' },
                    ].map(a => (
                      <Link
                        key={a.label}
                        to={a.to}
                        className="flex items-center gap-4 p-3 rounded-xl transition-colors"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface)' }}>
                          <a.icon size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-display text-[12px] font-bold" style={{ color: 'var(--text-secondary)' }}>{a.label}</p>
                          <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>{a.desc}</p>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                      </Link>
                    ))}
                  </div>

                  {/* Fav genres — мини-статистика интересов */}
                  {favGenres.length > 0 && (
                    <div className="glass-static p-6 space-y-4 lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <Heart size={17} style={{ color: 'var(--text-faint)' }} />
                        <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Твои любимые жанры
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {favGenres.map(([name, count]) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-display font-semibold"
                            style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}
                          >
                            {name}
                            <span className="text-primary tabular-nums">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* My reviews */}
                  {myReviews.length > 0 && (
                    <div className="glass-static p-6 space-y-4 lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={17} style={{ color: 'var(--text-faint)' }} />
                        <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Мои отзывы ({myReviews.length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {myReviews.slice(0, 5).map(r => (
                          <Link
                            key={r.id}
                            to={`/game/${r.game_id}`}
                            className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.03]"
                            style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
                          >
                            <img src={r.game_image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-[12px] font-bold truncate" style={{ color: 'var(--text-secondary)' }}>
                                {r.game_name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={10} className={i < r.rating ? 'text-amber-400' : ''} style={i >= r.rating ? { color: 'var(--text-faint)' } : {}} fill="currentColor" />
                                ))}
                                <span className="font-body text-[10px] ml-1" style={{ color: 'var(--text-faint)' }}>
                                  {new Date(r.created_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                              {r.text && (
                                <p className="font-body text-[11px] mt-1 line-clamp-1" style={{ color: 'var(--text-faint)' }}>{r.text}</p>
                              )}
                            </div>
                            <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Live avatar preview */}
                  <div className="glass-static p-6 space-y-5 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <Smile size={17} style={{ color: 'var(--text-faint)' }} />
                      <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Мой аватар
                      </h3>
                    </div>
                    <div className="flex items-center gap-5 flex-wrap">
                      <Avatar size={96} />
                      <div>
                        <p className="font-display text-[16px] font-bold" style={{ color: 'var(--text)' }}>{username}</p>
                        <p className="font-body text-[12px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                          Это то, что видят другие в чате поддержки и профиле
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Avatar color */}
                  <div className="glass-static p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <Palette size={17} style={{ color: 'var(--text-faint)' }} />
                      <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Цвет
                      </h3>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {AVATAR_COLORS.map((c, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => pickAvatarColor(i)}
                          className={`relative w-11 h-11 rounded-xl transition-all ${i === avatarIdx ? 'scale-110' : 'hover:scale-105'}`}
                          style={{
                            background: `linear-gradient(135deg, ${c[0]}, ${c[1]})`,
                            boxShadow: i === avatarIdx ? `0 0 0 2px var(--bg), 0 0 0 4px ${c[0]}` : 'none',
                          }}
                          aria-label={`Цвет ${i + 1}`}
                        >
                          {i === avatarIdx && <CheckCircle size={18} className="text-white absolute inset-0 m-auto" strokeWidth={2.5} />}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar icon */}
                  <div className="glass-static p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <Smile size={17} style={{ color: 'var(--text-faint)' }} />
                      <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Иконка
                      </h3>
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                      {AVATAR_ICONS.map((ic) => {
                        const active = ic.id === avatarIcon;
                        return (
                          <motion.button
                            key={ic.id ?? '__letter'}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => pickAvatarIcon(ic.id)}
                            className="aspect-square rounded-xl flex items-center justify-center transition-all hover:scale-105"
                            style={{
                              background: active ? 'var(--bg-elevated)' : 'var(--surface)',
                              border: active ? `1px solid ${avatarGrad[0]}60` : '1px solid var(--surface-border)',
                              boxShadow: active ? `0 0 0 2px ${avatarGrad[0]}30` : 'none',
                            }}
                            title={ic.label}
                            aria-label={ic.label}
                          >
                            {ic.id ? (
                              <span className="text-[18px] leading-none">{ic.id}</span>
                            ) : (
                              <span className="font-display text-[14px] font-black" style={{ color: 'var(--text-secondary)' }}>Aa</span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>
                      «Aa» — первая буква твоего логина
                    </p>
                  </div>

                  {/* Language & Currency */}
                  <div className="glass-static p-6 space-y-5 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <Globe size={17} style={{ color: 'var(--text-faint)' }} />
                      <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        {t('profile.language')} / {t('profile.currency')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Language */}
                      <div className="space-y-2">
                        <span className="label text-[10px] flex items-center gap-1.5">
                          <Globe size={10} /> {t('profile.language')}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.values(locales).map(l => {
                            const active = lang === l.code;
                            return (
                              <button
                                key={l.code}
                                onClick={() => setLang(l.code)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.01]"
                                style={{
                                  background: active ? 'var(--bg-elevated)' : 'var(--surface)',
                                  border: active ? '1px solid var(--accent)' : '1px solid var(--surface-border)',
                                  color: active ? 'var(--text)' : 'var(--text-muted)',
                                }}
                              >
                                <span className="text-[18px]">{l.flag}</span>
                                <span className="font-body text-[13px] font-medium flex-1 text-left">{l.label}</span>
                                {active && <Check size={13} className="text-accent" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Currency */}
                      <div className="space-y-2">
                        <span className="label text-[10px] flex items-center gap-1.5">
                          <Coins size={10} /> {t('profile.currency')}
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.values(CURRENCIES).map(c => {
                            const active = currency === c.code;
                            return (
                              <button
                                key={c.code}
                                onClick={() => { setCurrency(c.code); setCurrencyLocal(c.code); }}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:scale-[1.01]"
                                style={{
                                  background: active ? 'var(--bg-elevated)' : 'var(--surface)',
                                  border: active ? '1px solid var(--accent)' : '1px solid var(--surface-border)',
                                  color: active ? 'var(--text)' : 'var(--text-muted)',
                                }}
                              >
                                <span className="font-display font-bold text-[14px] w-4">{c.symbol}</span>
                                <span className="font-body text-[13px] flex-1 text-left">{c.name}</span>
                                {active && <Check size={13} className="text-accent" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email settings */}
                  <div className="glass-static p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail size={17} style={{ color: 'var(--text-faint)' }} />
                      <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Email для уведомлений
                      </h3>
                    </div>
                    <p className="font-body text-[12px]" style={{ color: 'var(--text-faint)' }}>
                      На этот email будут приходить чеки с ключами и уведомления о тикетах
                    </p>
                    <form onSubmit={handleSaveEmail} className="flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="your@email.com"
                        className="input text-[13px] py-2.5 flex-1"
                      />
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        disabled={emailSaving}
                        className="btn-primary px-4 py-2.5 text-[12px] disabled:opacity-50"
                      >
                        {emailSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Сохранить'}
                      </motion.button>
                    </form>
                  </div>

                  {/* Theme */}
                  <div className="glass-static p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isDark ? <Moon size={17} style={{ color: 'var(--text-muted)' }} /> : <Sun size={17} style={{ color: 'var(--text-muted)' }} />}
                        <div>
                          <p className="font-body text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>Тема</p>
                          <p className="font-body text-[12px]" style={{ color: 'var(--text-faint)' }}>{isDark ? 'Тёмная' : 'Светлая'}</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={toggle}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-7 rounded-full relative"
                        style={{ background: isDark ? 'rgba(232,16,46,0.25)' : 'rgba(16,185,129,0.25)' }}
                      >
                        <motion.div
                          animate={{ left: isDark ? '2px' : '22px' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow"
                          style={{ background: isDark ? '#E8102E' : '#10B981' }}
                        >
                          {isDark ? <Moon size={11} className="text-white" /> : <Sun size={11} className="text-white" />}
                        </motion.div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="glass-static p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <Key size={17} style={{ color: 'var(--text-faint)' }} />
                      <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Сменить пароль
                      </h3>
                    </div>
                    {passMsg && (
                      <div className={`px-3 py-2.5 rounded-xl text-[12px] font-body border ${passMsg.ok ? 'bg-accent/10 text-accent border-accent/15' : 'bg-primary/10 text-primary border-primary/15'}`}>
                        {passMsg.text}
                      </div>
                    )}
                    <form onSubmit={handleChangePassword} className="space-y-3">
                      <input type="password" value={oldPass}     onChange={e => setOldPass(e.target.value)}     placeholder="Текущий пароль"  className="input text-[13px] py-2.5" />
                      <input type="password" value={newPass}     onChange={e => setNewPass(e.target.value)}     placeholder="Новый пароль"    className="input text-[13px] py-2.5" />
                      <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Повторите пароль" className="input text-[13px] py-2.5" />
                      <motion.button type="submit" whileTap={{ scale: 0.97 }} className="btn-primary w-full py-2.5 text-[12px]">
                        Обновить пароль
                      </motion.button>
                    </form>
                  </div>
                  {/* Security & Data */}
                  {(user?.role === 'admin' || user?.role === 'support') && (
                    <div className="glass-static p-6 space-y-3 lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 size={17} style={{ color: 'var(--text-faint)' }} />
                        <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Безопасность и данные
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link to="/2fa" className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.04]" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Key size={15} className="text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="font-display text-[12px] font-bold" style={{ color: 'var(--text-secondary)' }}>Двухфакторка</p>
                            <p className="font-body text-[10px]" style={{ color: 'var(--text-faint)' }}>TOTP для защиты</p>
                          </div>
                          <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                        </Link>
                        <button
                          onClick={async () => {
                            try {
                              const data = await api.exportData();
                              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `4game-data-${Date.now()}.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                              toast('Данные скачаны', 'success');
                            } catch (err) { toast(err.message, 'error'); }
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.04] text-left"
                          style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
                        >
                          <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                            <Package size={15} className="text-secondary-light" />
                          </div>
                          <div className="flex-1">
                            <p className="font-display text-[12px] font-bold" style={{ color: 'var(--text-secondary)' }}>Выгрузка данных</p>
                            <p className="font-body text-[10px]" style={{ color: 'var(--text-faint)' }}>GDPR-экспорт в JSON</p>
                          </div>
                          <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Для обычных пользователей — только экспорт */}
                  {user?.role === 'user' && (
                    <div className="glass-static p-6 space-y-3 lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <Package size={17} style={{ color: 'var(--text-faint)' }} />
                        <h3 className="font-display text-[13px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Мои данные
                        </h3>
                      </div>
                      <p className="font-body text-[12px]" style={{ color: 'var(--text-faint)' }}>
                        Вы можете скачать все свои данные (заказы, отзывы, избранное, тикеты) в JSON-файле — согласно требованиям GDPR.
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            const data = await api.exportData();
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `4game-data-${Date.now()}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast('Данные скачаны', 'success');
                          } catch (err) { toast(err.message, 'error'); }
                        }}
                        className="btn-ghost text-[12px]"
                      >
                        <Package size={13} /> Скачать все данные
                      </button>
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
