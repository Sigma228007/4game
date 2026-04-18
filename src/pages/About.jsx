import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle, Shield, Clock, Headphones, Gamepad2, Star, MessageCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition, Reveal, StaggerContainer, StaggerItem } from '../components/Motion';
import PosterAccent from '../components/PosterAccent';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { useToast } from '../components/Toast';

// Карточки "ценностей" — цвет иконки + соответствующий тон свечения
const VALUES = [
  { icon: Gamepad2,   title: 'Каталог без воды',  desc: 'Только проверенные тайтлы — от инди до AAA.',  color: 'text-primary',         glow: 'rgba(232,16,46,0.16)'  },
  { icon: Shield,     title: 'Гарантия на ключ',  desc: 'Каждый ключ проверен. Проблема? Заменим.',     color: 'text-accent',          glow: 'rgba(16,185,129,0.16)' },
  { icon: Clock,      title: 'Без ожидания',      desc: 'Ключ на почту за секунды. Оплатил — играешь.', color: 'text-amber-400',       glow: 'rgba(245,158,11,0.16)' },
  { icon: Headphones, title: 'Живая поддержка',   desc: 'Чат с поддержкой прямо на сайте.',             color: 'text-secondary-light', glow: 'rgba(147,51,234,0.16)' },
];

export default function About() {
  const { isAuth } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    try {
      await api.createTicket(form.subject.trim(), form.message.trim());
      setSubmitted(true);
      toast('Обращение отправлено!', 'success');
    } catch { toast('Войдите чтобы отправить обращение', 'error'); }
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
              <span className="label block mb-2">О компании</span>
              <h1 className="section-title text-4xl md:text-5xl">Мы делаем игры доступнее</h1>
              <p className="font-body text-[17px] leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                4Game — пространство, где каждый геймер найдёт нужную игру по честной цене и получит её мгновенно.
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
                <span className="label">Почему выбирают нас</span>
                <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug" style={{ color: 'var(--text)' }}>
                  Простая формула: <span className="text-primary">честная цена</span> + <span className="text-accent">быстрая доставка</span>
                </h2>
                <p className="font-body text-[15px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Работаем напрямую с дистрибьюторами. Цены ниже Steam, каждый ключ проверен вручную.
                </p>
                <div className="flex gap-8 pt-2">
                  {[
                    { n: '0',   l: 'Нерабочих ключей' },
                    { n: '35+', l: 'Тайтлов в каталоге' },
                    { n: '<1м', l: 'Время выдачи' },
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
                  { icon: Star,     t: 'Рейтинг 4.8/5',  s: 'По отзывам',      color: 'text-amber-400',       glow: 'rgba(245,158,11,0.14)' },
                  { icon: Zap,      t: 'Выдача 30 сек',  s: 'Автоматически',   color: 'text-primary',         glow: 'rgba(232,16,46,0.14)'  },
                  { icon: Shield,   t: '100% лицензия',  s: 'Проверяем лично', color: 'text-accent',          glow: 'rgba(16,185,129,0.14)' },
                  { icon: Gamepad2, t: '35+ тайтлов',    s: 'Обновляем',       color: 'text-secondary-light', glow: 'rgba(147,51,234,0.14)' },
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
                      <p className="font-display text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>{c.t}</p>
                      <p className="font-body text-[10px]" style={{ color: 'var(--text-faint)' }}>{c.s}</p>
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
                  <span className="label block mb-3">Всегда на связи</span>
                  <h2 className="section-title text-3xl">Свяжитесь с нами</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { href: 'mailto:support@4game.com',  icon: Mail,   l: 'Email',   v: 'support@4game.com',       c: 'text-primary bg-primary/8' },
                    { href: 'tel:+79242485393',           icon: Phone,  l: 'Телефон', v: '+7 (924) 248-53-93',      c: 'text-accent bg-accent/8' },
                    { href: null,                         icon: MapPin, l: 'Адрес',   v: 'г. Владивосток, Россия',  c: 'text-secondary bg-secondary/8' },
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
                      <p className="font-display text-[13px] font-bold" style={{ color: 'var(--text-secondary)' }}>Чат с поддержкой</p>
                      <p className="font-body text-[12px]" style={{ color: 'var(--text-faint)' }}>Напишите нам — ответим в чате</p>
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
                    <h3 className="font-display text-xl font-bold" style={{ color: 'var(--text)' }}>Отправлено!</h3>
                    <p className="font-body text-[14px]" style={{ color: 'var(--text-muted)' }}>Мы ответим в разделе «Поддержка»</p>
                    <Link to="/support" className="btn-primary text-[13px]"><MessageCircle size={15} /> Перейти в чат</Link>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Написать в поддержку</h3>
                    {!isAuth && <p className="font-body text-[13px] text-primary">Войдите в аккаунт чтобы отправить обращение</p>}
                    <div className="space-y-2">
                      <label className="label">Тема</label>
                      <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="О чём ваш вопрос?" required className="input" disabled={!isAuth} />
                    </div>
                    <div className="space-y-2">
                      <label className="label">Сообщение</label>
                      <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Опишите подробно..." rows={4} required className="input resize-none" disabled={!isAuth} />
                    </div>
                    <motion.button type="submit" whileTap={{ scale: 0.97 }} className="btn-primary w-full py-4 text-[15px]" disabled={!isAuth}>
                      <Send size={15} /> Отправить
                    </motion.button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* VIDEO */}
          <Reveal>
            <div className="text-center space-y-8">
              <div>
                <span className="label block mb-3">Медиа</span>
                <h2 className="section-title text-3xl">Мир игр в одном месте</h2>
              </div>
              <div className="max-w-3xl mx-auto glass-static overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/oUFJJNQGwhk"
                    title="4Game промо"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  );
}
