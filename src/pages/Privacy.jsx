import { PageTransition, Reveal } from '../components/Motion';
import { ShieldCheck } from 'lucide-react';

/**
 * Страница политики конфиденциальности / обработки персональных данных.
 */
export default function Privacy() {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-12 md:py-16">
        <Reveal>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <ShieldCheck size={24} className="text-accent" />
            </div>
            <div>
              <span className="label block mb-1">Документ</span>
              <h1 className="section-title text-3xl">Политика конфиденциальности</h1>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="glass-static p-6 md:p-8 space-y-6 font-body" style={{ color: 'var(--text-secondary)' }}>
            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>1. Общие положения</h2>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Настоящая политика описывает, как сайт 4Game собирает, использует и защищает данные пользователей.
                Используя сайт, вы соглашаетесь с условиями обработки персональных данных.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>2. Какие данные собираются</h2>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                При регистрации и оформлении заказа мы собираем: логин, адрес электронной почты, историю заказов.
                Платёжные данные обрабатываются платёжной системой ЮKassa и на сайте не хранятся.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>3. Использование cookies</h2>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Сайт использует файлы cookie для авторизации, сохранения настроек (тема, язык, валюта)
                и корректной работы корзины. Вы можете отключить cookie в настройках браузера, однако
                это может повлиять на работу некоторых функций.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>4. Защита данных</h2>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Пароли хранятся в зашифрованном виде (bcrypt). Передача данных защищена протоколом HTTPS.
                Доступ к административной панели защищён двухфакторной аутентификацией.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>5. Права пользователя</h2>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Вы можете в любой момент выгрузить все свои данные в формате JSON в личном кабинете
                или запросить их удаление, обратившись в поддержку.
              </p>
            </section>

            <p className="text-[12px] pt-4" style={{ color: 'var(--text-faint)', borderTop: '1px solid var(--surface-border)' }}>
              Документ носит ознакомительный характер в рамках учебного проекта.
            </p>
          </div>
        </Reveal>
      </div>
    </PageTransition>
  );
}
