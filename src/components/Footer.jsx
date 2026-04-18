import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Gamepad2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid var(--surface-border)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Gamepad2 size={14} className="text-white" />
              </div>
              <span className="font-display font-black text-lg"><span className="text-primary">4</span><span style={{ color: 'var(--text)' }}>Game</span></span>
            </Link>
            <p className="font-body text-[13px] leading-relaxed max-w-[240px]" style={{ color: 'var(--text-faint)' }}>
              Магазин лицензионных ключей. Честные цены, мгновенная доставка.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="label">Навигация</h4>
            <nav className="flex flex-col gap-2">
              {['/', '/catalog', '/about'].map((to, i) => (
                <Link key={to} to={to} className="font-body text-[13px] hover:text-primary transition-colors w-fit" style={{ color: 'var(--text-faint)' }}>
                  {['Главная', 'Каталог', 'О нас'][i]}
                </Link>
              ))}
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="label">Жанры</h4>
            <nav className="flex flex-col gap-2">
              {[['action','Экшен'],['shooter','Шутеры'],['rpg','RPG'],['strategy','Стратегии'],['sport','Спорт']].map(([id, name]) => (
                <Link key={id} to={`/catalog?genre=${id}`} className="font-body text-[13px] hover:text-primary transition-colors w-fit" style={{ color: 'var(--text-faint)' }}>{name}</Link>
              ))}
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="label">Контакты</h4>
            <div className="space-y-2.5">
              <a href="mailto:support@4game.com" className="flex items-center gap-2 font-body text-[13px] hover:text-primary transition-colors" style={{ color: 'var(--text-faint)' }}><Mail size={13} />support@4game.com</a>
              <a href="tel:+79242485393" className="flex items-center gap-2 font-body text-[13px] hover:text-primary transition-colors" style={{ color: 'var(--text-faint)' }}><Phone size={13} />+7 (924) 248-53-93</a>
              <div className="flex items-center gap-2 font-body text-[13px]" style={{ color: 'var(--text-faint)' }}><MapPin size={13} />Владивосток, Россия</div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>© {new Date().getFullYear()} 4Game. Дипломный проект.</p>
          <p className="font-body text-[11px]" style={{ color: 'var(--text-faint)' }}>ВСКК • 09.02.07</p>
        </div>
      </div>
    </footer>
  );
}
