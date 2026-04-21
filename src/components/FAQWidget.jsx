import { useState } from 'react';
import { MessageCircle, X, HelpCircle, ChevronRight, ArrowLeft, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * FAQ-виджет в правом нижнем углу. Простые правила, без AI.
 * Показывает типовые вопросы, разворачивает ответы, предлагает создать тикет.
 */

const FAQ = [
  {
    q: 'Как активировать ключ?',
    a: 'Откройте клиент Steam / Epic / GOG → «Активировать продукт» → вставьте ключ из письма. Ключ можно также найти в разделе «История заказов» в вашем профиле.',
  },
  {
    q: 'Что делать, если ключ не работает?',
    a: 'Напишите нам в поддержку. Если ключ действительно нерабочий — мы заменим его в течение 24 часов. Укажите номер заказа и скриншот ошибки.',
  },
  {
    q: 'Какие способы оплаты?',
    a: 'Банковские карты (Visa, Mastercard, МИР), СБП, электронные кошельки. Оплата проходит через ЮKassa — полностью безопасно, мы не получаем данные вашей карты.',
  },
  {
    q: 'Сколько ждать ключ после оплаты?',
    a: 'Обычно 30 секунд. Ключ приходит на email (если указан) и появляется в разделе «История заказов» в вашем профиле.',
  },
  {
    q: 'Можно ли вернуть деньги?',
    a: 'Да, в течение 24 часов после покупки — если ключ ещё не был активирован. После активации возврат невозможен (это правило всех цифровых магазинов).',
  },
  {
    q: 'Как работают промокоды?',
    a: 'Промокод вводится в корзине перед оплатой. Доступные: WELCOME10 (−10%), NEWBIE500 (−500 ₽), GAMER25 (−25% от 3000 ₽), SUMMER2026 (−15% на лето).',
  },
  {
    q: 'Что делать, если забыл пароль?',
    a: 'На странице входа есть ссылка «Забыли пароль?». Введите email — мы отправим ссылку для сброса. Ссылка действует 30 минут.',
  },
];

export default function FAQWidget() {
  const [open, setOpen] = useState(false);
  const [activeQ, setActiveQ] = useState(null);
  const { isAuth } = useAuth();

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-[90] w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #E8102E, #B50D24)',
              boxShadow: '0 10px 40px rgba(232,16,46,0.4)',
            }}
            aria-label="Открыть помощь"
          >
            <MessageCircle size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full ring-2" style={{ ringColor: '#07070E' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-5 right-5 z-[90] w-[calc(100vw-2.5rem)] max-w-[360px] rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--surface-border)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
              maxHeight: 'calc(100vh - 3rem)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ background: 'linear-gradient(135deg, rgba(232,16,46,0.15), rgba(232,16,46,0.05))', borderColor: 'var(--surface-border)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                  <HelpCircle size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-display text-[13px] font-bold" style={{ color: 'var(--text)' }}>Помощь 4Game</p>
                  <p className="font-body text-[10px]" style={{ color: 'var(--text-faint)' }}>Быстрые ответы</p>
                </div>
              </div>
              <button
                onClick={() => { setOpen(false); setActiveQ(null); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Закрыть"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto">
              {activeQ === null ? (
                <div className="p-3">
                  <p className="font-body text-[12px] px-2 py-2 mb-1" style={{ color: 'var(--text-faint)' }}>
                    Выберите вопрос:
                  </p>
                  {FAQ.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveQ(i)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-left transition-colors hover:bg-white/[0.04] group"
                    >
                      <span className="font-body text-[13px] flex-1" style={{ color: 'var(--text-secondary)' }}>
                        {item.q}
                      </span>
                      <ChevronRight size={14} className="flex-shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--text-faint)' }} />
                    </button>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  <button
                    onClick={() => setActiveQ(null)}
                    className="flex items-center gap-1.5 text-[11px] font-display font-semibold mb-4 transition-colors hover:text-white"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    <ArrowLeft size={12} /> К списку
                  </button>
                  <h3 className="font-display font-bold text-[14px] mb-3" style={{ color: 'var(--text)' }}>
                    {FAQ[activeQ].q}
                  </h3>
                  <p className="font-body text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {FAQ[activeQ].a}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface)' }}>
              <Link
                to={isAuth ? '/support' : '/login'}
                onClick={() => { setOpen(false); setActiveQ(null); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-display font-semibold uppercase tracking-wider transition-all hover:bg-primary hover:text-white"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--surface-border)' }}
              >
                <Headphones size={13} /> {isAuth ? 'Написать в поддержку' : 'Войти для поддержки'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
