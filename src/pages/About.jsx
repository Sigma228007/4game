import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle, Shield, Clock, Headphones, Gamepad2, Star, MessageCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition, Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { useToast } from '../components/Toast';
import { useI18n } from '../utils/i18n.jsx';
import { useSEO } from '../hooks/useSEO';

export default function About() {
  useSEO({
    title: 'О магазине и контакты',
    description: 'О магазине 4Game — лицензионные ключи для PC, контакты, гарантии, поддержка 24/7. Свяжитесь с нами — мы во Владивостоке.',
    path: '/about',
  });
  const { isAuth } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const VALUES = [
    { icon: Gamepad2,   title: t('about.f1.title'), desc: t('about.f1.desc'), color: 'text-primary',         glow: 'rgba(232,16,46,0.16)'  },
    { icon: Shield,     title: t('about.f2.title'), desc: t('about.f2.desc'), color: 'text-accent',          glow: 'rgba(16,185,129,0.16)' },
    { icon: Clock,      title: t('about.f3.title'), desc: t('about.f3.desc'), color: 'text-amber-400',       glow: 'rgba(245,158,11,0.16)' },
    { icon: Headphones, title: t('about.f4.title'), desc: t('about.f4.desc'), color: 'text-secondary-light', glow: 'rgba(147,51,234,0.16)' },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    try {
      await api.createTicket(form.subject.trim(), form.message.trim());
      setSubmitted(true);
      toast(t('about.sent'), 'success');
    } catch { toast(t('about.writeTo'), 'error'); }
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">

        {/* ── ПЕРСОНАЖИ ВДОЛЬ СТРАНИЦЫ ── */}
        {/* Джин Сакай — верхняя часть обложки Ghost of Tsushima */}
        <PosterAccent src="/images/game-1.jpg"  side="left"  top={80}   height={720} opacity={0.55} objectPosition="50% 18%" />
        {/* Артур Морган — центр обложки RDR2 */}
        <PosterAccent src="/images/game-2.jpg"  side="right" top={320}  height={700} opacity={0.5}  objectPosition="50% 28%" />
        {/* V из Cyberpunk 2077 */}
        <PosterAccent src="/images/game-7.jpg"  side="left"  top={900}  height={680} opacity={0.5}  objectPosition="22% 50%" />
        {/* Doomslayer */}
        <PosterAccent src="/images/game-11.jpg" side="right" top={1150} height={700} opacity={0.5}  objectPosition="50% 30%" />
        {/* Рыцарь из Elden Ring */}
        <PosterAccent src="/images/game-17.jpg" side="left"  top={1750} height={650} opacity={0.45} objectPosition="50% 85%" />

        {/* Цветные свечения для глубины */}
        <div className="absolute top-[15%] left-[8%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none" style={{ background: 'rgba(232,16,46,0.06)' }} />
        <div className="absolute bottom-[15%] right-[8%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none" style={{ background: 'rgba(147,51,234,0.05)' }} />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-20 z-10">

          {/* HEADER */}
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-20 space-y-6">
              <span className="label block mb-2">{t('about.title')}</span>
              <h1 className="section-title text-4xl md:text-5xl">{t('about.subtitle')}</h1>
              <p className="font-body text-[17px] leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                {t('about.desc')}
              </p>
            </div>
          </Reveal>

          {/* VALUE CARDS: одинаковая высота + glow только ВНУТРИ карточки */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-24">
            {VALUES.map(v => (
              <StaggerItem key={v.title}>
                <div
                  className="group relative glass-static p-6 flex flex-col h-full overflow-hidden isolate"
                  style={{ minHeight: 210 }}
                >
                  {/* Свечение при hover — radial-gradient ВНУТРИ карточки, физически не может вылезти */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 90% 0%, ${v.glow} 0%, transparent 55%)` }}
                  />
                  <div className="relative flex flex-col h-full gap-4 z-10">
                    <div className={`w-11 h-11 rounded-xl bg-white/[0.03] flex items-center justify-center ${v.color} flex-shrink-0`}>
                      <v.icon size={21} />
                    </div>
                    <h3 className="font-display text-[12px] font-bold uppercase tracking-wider flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {v.title}
                    </h3>
                    <p className="font-body text-[14px] leading-relaxed flex-1" style={{ color: 'var(--text-muted)' }}>
                      {v.desc}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* WHY US */}
          <Reveal>
            <div className="relative glass-static p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-24 overflow-hidden">
              <div className="relative space-y-6 z-10">
                <span className="label">{t('about.why')}</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug" style={{ color: 'var(--text)' }}>
                  {t('about.formula')} <span className="text-primary">{t('about.price')}</span> + <span className="text-accent">{t('about.fast')}</span>
                </h2>
                <p className="font-body text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {t('about.whyDesc')}
                </p>
                <div className="flex gap-8 pt-2">
                  {[
                    { n: '0',   l: t('about.stat1') },
                    { n: '35+', l: t('about.stat2') },
                    { n: '<1м', l: t('about.stat3') },
                  ].map(s => (
                    <div key={s.l}>
                      <div className="font-display font-black text-2xl" style={{ color: 'var(--text-secondary)' }}>{s.n}</div>
                      <div className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative grid grid-cols-2 gap-3 z-10">
                {[
                  { icon: Star,     label: t('about.stat4'),    sub: t('about.stat4sub'),  color: 'text-amber-400',       glow: 'rgba(245,158,11,0.14)' },
                  { icon: Zap,      label: t('about.stat3sub'), sub: t('about.stat3sub2'), color: 'text-primary',         glow: 'rgba(232,16,46,0.14)'  },
                  { icon: Shield,   label: t('about.license'),  sub: t('about.licenseDesc'), color: 'text-accent',        glow: 'rgba(16,185,129,0.14)' },
                  { icon: Gamepad2, label: `35+ ${t('about.titles')}`, sub: t('about.update'), color: 'text-secondary-light', glow: 'rgba(147,51,234,0.14)' },
                ].map(c => (
                  <div
                    key={c.t}
                    className="group relative rounded-xl p-4 space-y-2 overflow-hidden isolate"
                    style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: `radial-gradient(circle at 85% 15%, ${c.glow} 0%, transparent 60%)` }}
                    />
                    <div className="relative z-10 space-y-2">
                      <c.icon size={17} className={c.color} />
                      <p className="font-display text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>{c.label}</p>
                      <p className="font-body text-[10px]" style={{ color: 'var(--text-faint)' }}>{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* CONTACT + SUPPORT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
            <Reveal>
              <div className="space-y-8">
                <div>
                  <span className="label block mb-3">{t('about.online')}</span>
                  <h2 className="section-title text-3xl">{t('about.contacts')}</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { href: 'mailto:support@4game.com',  icon: Mail,   l: 'Email',   v: 'support@4game.com',       c: 'text-primary bg-primary/8' },
                    { href: 'tel:+79242485393',           icon: Phone,  l: 'Tel',     v: '+7 (924) 248-53-93',      c: 'text-accent bg-accent/8' },
                    { href: null,                         icon: MapPin, l: 'Addr',    v: t('about.address'),        c: 'text-secondary bg-secondary/8' },
                  ].map(c => {
                    const T = c.href ? 'a' : 'div';
                    return (
                      <T key={c.l} href={c.href || undefined} className="glass-static flex items-center gap-4 p-5 hover:bg-white/[0.04] transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.c}`}><c.icon size={18} /></div>
                        <div>
                          <p className="label text-[10px]">{c.l}</p>
                          <p className="font-body text-[15px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.v}</p>
                        </div>
                      </T>
                    );
                  })}
                </div>
                {isAuth && (
                  <Link to="/support" className="glass flex items-center gap-4 p-5 hover:border-primary/15">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><MessageCircle size={18} /></div>
                    <div className="flex-1">
                      <p className="font-display text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>{t('about.chat')}</p>
                      <p className="font-body text-[12px]" style={{ color: 'var(--text-faint)' }}>{t('about.chatDesc')}</p>
                    </div>
                  </Link>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="glass-static p-6 md:p-8">
                {submitted ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-8">
                    <CheckCircle size={36} className="text-accent mx-auto" />
                    <h3 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>{t('about.sent')}</h3>
                    <p className="font-body text-[14px]" style={{ color: 'var(--text-muted)' }}>{t('about.sentDesc')}</p>
                    <Link to="/support" className="btn-primary text-[13px]"><MessageCircle size={15} /> {t('about.toChat')}</Link>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>{t('about.writeTo')}</h3>
                    {!isAuth && <p className="font-body text-[13px] text-primary">{t('about.writeTo')}</p>}
                    <div className="space-y-2">
                      <label className="label">{t('support.subject')}</label>
                      <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder={t('about.formSubject')} required className="input" disabled={!isAuth} />
                    </div>
                    <div className="space-y-2">
                      <label className="label">{t('about.formMsg')}</label>
                      <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder={t('about.formPlaceholder')} rows={4} required className="input resize-none" disabled={!isAuth} />
                    </div>
                    <motion.button type="submit" whileTap={{ scale: 0.97 }} className="btn-primary w-full py-4 text-[15px]" disabled={!isAuth}>
                      <Send size={15} /> {t('about.send')}
                    </motion.button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* MAP */}
          <Reveal>
            <div className="space-y-8">
              <div className="text-center">
                <span className="label block mb-3">Адрес компании</span>
                <h2 className="section-title text-3xl">г. Владивосток, ул. Светланская, д. 22</h2>
              </div>
              <div className="glass-static overflow-hidden" style={{ borderRadius: 16 }}>
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Info panel */}
                  <div className="p-6 md:p-8 space-y-5 flex flex-col justify-center" style={{ borderRight: '1px solid var(--surface-border)' }}>
                    <div className="space-y-1">
                      <p className="label text-[10px]">Адрес компании</p>
                      <p className="font-body text-[15px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                        г. Владивосток, ул. Светланская, д. 22, офис 310
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="label text-[10px]">Email</p>
                      <a href="mailto:support@4game.com" className="font-body text-[14px] text-primary hover:underline">support@4game.com</a>
                    </div>
                    <div className="space-y-1">
                      <p className="label text-[10px]">Tel</p>
                      <a href="tel:+79242485393" className="font-body text-[14px]" style={{ color: 'var(--text-secondary)' }}>+7 (924) 248-53-93</a>
                    </div>
                    <div className="space-y-1">
                      <p className="label text-[10px]">Время работы</p>
                      <p className="font-body text-[13px]" style={{ color: 'var(--text-muted)' }}>Пн–Пт: 10:00 – 20:00</p>
                    </div>
                    <a
                      href="https://2gis.ru/vladivostok/search/Светланская%2022?m=131.8854%2C43.1148%2F16"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-display font-semibold transition-colors hover:bg-white/[0.05] w-fit"
                      style={{ border: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}
                    >
                      <MapPin size={13} className="text-primary" />
                      Открыть в 2ГИС
                    </a>
                  </div>
                  {/* Map — OpenStreetMap (no VPN issues) */}
                  <div className="lg:col-span-2 h-72 lg:h-96">
                    <iframe
                      src="https://www.openstreetmap.org/export/embed.html?bbox=131.877%2C43.110%2C131.894%2C43.120&layer=mapnik&marker=43.1148%2C131.8854"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title="4Game Office — Vladivostok"
                      style={{ display: 'block', filter: 'invert(0.9) hue-rotate(180deg) brightness(0.85) contrast(0.9)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  );
}
