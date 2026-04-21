import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Menu, X, LogIn, LogOut, Gamepad2, Sun, Moon, MessageCircle, ShieldCheck, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../utils/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { user, username, logout, isAuth } = useAuth();
  const { count: cartCount } = useCart();
  const { count: favCount } = useFavorites();
  const { toggle, isDark } = useTheme();
  const { t } = useI18n();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Читаем персонализацию аватара из localStorage (обновляется из Profile)
  const [avatarIcon, setAvatarIcon] = useState(() => {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem('avatarIcon') : null;
    return v && v !== 'null' ? v : null;
  });
  const [avatarColorIdx, setAvatarColorIdx] = useState(() => {
    return typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem('avatarColor') || '0') : 0;
  });
  const AVATAR_PALETTE = [
    ['#E8102E','#B50D24'], ['#9333EA','#6B21A8'], ['#10B981','#047857'],
    ['#F59E0B','#D97706'], ['#3B82F6','#1D4ED8'], ['#EC4899','#BE185D'],
    ['#06B6D4','#0891B2'], ['#8B5CF6','#7C3AED'],
  ];
  const avatarGrad = AVATAR_PALETTE[avatarColorIdx] || AVATAR_PALETTE[0];

  // Слушаем изменения (когда меняешь аватар в /profile на той же вкладке)
  useEffect(() => {
    const handler = () => {
      const v = localStorage.getItem('avatarIcon');
      setAvatarIcon(v && v !== 'null' ? v : null);
      setAvatarColorIdx(parseInt(localStorage.getItem('avatarColor') || '0'));
    };
    window.addEventListener('storage', handler);
    window.addEventListener('avatar-change', handler);
    handler();
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('avatar-change', handler);
    };
  }, [location.pathname]);

  // Пульс fly-target при прилёте
  useEffect(() => {
    const handler = (e) => {
      const el = e.target.closest('.fly-target');
      if (!el) return;
      el.classList.remove('fly-bumping');
      void el.offsetWidth; // рестарт анимации
      el.classList.add('fly-bumping');
      setTimeout(() => el.classList.remove('fly-bumping'), 600);
    };
    document.addEventListener('fly-arrive', handler);
    return () => document.removeEventListener('fly-arrive', handler);
  }, []);

  const role = user?.role || 'user';
  const isStaff = role === 'admin' || role === 'support';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const nav = [
    { to: '/', label: t('nav.home') },
    { to: '/catalog', label: t('nav.catalog') },
    { to: '/about', label: t('nav.about') },
  ];
  const authNav = isAuth ? [
    { to: '/favorites', label: t('nav.favorites'), icon: Heart,        badge: favCount,  flyTarget: 'favorites' },
    { to: '/cart',      label: t('nav.cart'),      icon: ShoppingCart, badge: cartCount, flyTarget: 'cart' },
    { to: '/support',   label: t('nav.support'),   icon: MessageCircle },
    ...(role === 'admin' ? [{ to: '/admin', label: t('nav.admin'), icon: ShieldCheck }] : []),
  ] : [];

  const active = (p) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p));

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-2xl shadow-lg border-b' : 'bg-transparent'}`}
      style={{ backgroundColor: scrolled ? (isDark ? 'rgba(7,7,14,0.9)' : 'rgba(240,240,245,0.9)') : 'transparent', borderColor: scrolled ? 'var(--surface-border)' : 'transparent' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-500">
                <Gamepad2 size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2" style={{ borderColor: 'var(--bg)' }} />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-black text-[20px] tracking-tight">
                <span className="text-primary">4</span><span style={{ color: 'var(--text)' }}>Game</span>
              </span>
              <span className="block font-body text-[9px] -mt-0.5 tracking-[0.2em] uppercase" style={{ color: 'var(--text-faint)' }}>Digital Store</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {[...nav, ...authNav].map(link => (
              <Link
                key={link.to}
                to={link.to}
                data-fly-target={link.flyTarget || undefined}
                className="fly-target relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-body font-medium transition-all duration-300"
                style={{ color: active(link.to) ? 'var(--text)' : 'var(--text-muted)', background: active(link.to) ? 'var(--surface-hover)' : 'transparent' }}
              >
                {link.icon && <link.icon size={15} />}
                {link.label}
                {link.badge > 0 && <span className="min-w-[17px] h-[17px] bg-primary rounded-full text-[9px] font-display font-bold flex items-center justify-center text-white px-1">{link.badge}</span>}
              </Link>
            ))}
            <div className="w-px h-5 mx-1.5" style={{ background: 'var(--surface-border)' }} />
            <motion.button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              whileTap={{ scale: 0.94 }}
              className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-xl text-[12px] font-body"
              style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}
              title={t("nav.search")}
            >
              <Search size={14} />
              <span style={{ color: 'var(--text-faint)' }}>{t("nav.search")}</span>
              <kbd className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-display font-bold" style={{ background: 'var(--bg)', color: 'var(--text-faint)' }}>
                ⌘K
              </kbd>
            </motion.button>
            <motion.button onClick={toggle} whileTap={{ scale: 0.9, rotate: 180 }} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </motion.button>
            {isAuth ? (
              <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-body transition-all" style={{ color: active('/profile') ? 'var(--text)' : 'var(--text-muted)' }}>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${avatarGrad[0]}, ${avatarGrad[1]})` }}
                >
                  {avatarIcon
                    ? <span className="text-[13px] leading-none">{avatarIcon}</span>
                    : <span className="text-white text-[10px] font-display font-bold">{username?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <span className="hidden lg:inline">{username}</span>
                {isStaff && <span className="badge text-[7px] py-0 px-1.5 bg-primary/15 text-primary">{role === 'admin' ? 'ADM' : 'SUP'}</span>}
              </Link>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-display font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <LogIn size={15} /> {t("nav.login")}
              </Link>
            )}
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <motion.button onClick={toggle} whileTap={{ scale: 0.9 }} className="p-2 rounded-xl" style={{ color: 'var(--text-muted)' }}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
            {isAuth && cartCount > 0 && (
              <Link to="/cart" data-fly-target="cart" className="fly-target relative p-2" style={{ color: 'var(--text-muted)' }}>
                <ShoppingCart size={20} />
                <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] bg-primary rounded-full text-[8px] font-bold flex items-center justify-center text-white">{cartCount}</span>
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2.5 rounded-xl transition-all" style={{ color: 'var(--text-muted)' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="md:hidden backdrop-blur-2xl border-t overflow-hidden" style={{ background: isDark ? 'rgba(13,13,25,0.98)' : 'rgba(240,240,245,0.98)', borderColor: 'var(--surface-border)' }}>
            <nav className="max-w-7xl mx-auto px-5 py-5 space-y-1">
              {[...nav, ...authNav].map(link => (
                <Link key={link.to} to={link.to} className="flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-body font-medium transition-all"
                  style={{ color: active(link.to) ? 'var(--text)' : 'var(--text-muted)', background: active(link.to) ? 'var(--surface-hover)' : 'transparent' }}>
                  <div className="flex items-center gap-3">{link.icon && <link.icon size={18} />}{link.label}</div>
                  {link.badge > 0 && <span className="min-w-[20px] h-5 bg-primary rounded-full text-[10px] font-bold flex items-center justify-center text-white">{link.badge}</span>}
                </Link>
              ))}
              <div className="divider my-3" />
              {isAuth ? (
                <>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-body" style={{ color: 'var(--text-muted)' }}>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${avatarGrad[0]}, ${avatarGrad[1]})` }}
                    >
                      {avatarIcon
                        ? <span className="text-[13px] leading-none">{avatarIcon}</span>
                        : <span className="text-white text-[10px] font-display font-bold">{username?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    Профиль
                  </Link>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-body text-primary"><LogOut size={18} /> {t("nav.logout")}</button>
                </>
              ) : (
                <Link to="/login" className="btn-primary w-full py-3.5 text-[15px] mt-2"><LogIn size={18} /> {t("nav.login")}</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
