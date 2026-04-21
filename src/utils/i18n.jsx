import { createContext, useContext, useState, useEffect } from 'react';

// ═══════════════════════════════════════════════════════
// i18n: мультиязычность RU / EN
// Прямые переводы без внешних библиотек.
// Вызов: const { t, lang, setLang } = useI18n();
// Использование: {t('nav.home')} или t('nav.home', 'Home') с фолбэком.
// ═══════════════════════════════════════════════════════

const TRANSLATIONS = {
  ru: {
    // Nav / Header
    'nav.home': 'Главная',
    'nav.catalog': 'Каталог',
    'nav.about': 'О нас',
    'nav.favorites': 'Избранное',
    'nav.cart': 'Корзина',
    'nav.support': 'Поддержка',
    'nav.admin': 'Админ',
    'nav.profile': 'Профиль',
    'nav.login': 'Войти',
    'nav.logout': 'Выйти',
    'nav.register': 'Регистрация',
    'nav.orders': 'Мои заказы',
    'nav.search': 'Поиск',

    // Common
    'common.loading': 'Загрузка...',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.delete': 'Удалить',
    'common.edit': 'Изменить',
    'common.confirm': 'Подтвердить',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.close': 'Закрыть',
    'common.yes': 'Да',
    'common.no': 'Нет',
    'common.email': 'Email',
    'common.password': 'Пароль',
    'common.apply': 'Применить',
    'common.total': 'Итого',
    'common.required': 'Обязательно',

    // Home
    'home.hero.badge': 'Лицензионный магазин',
    'home.hero.title.line1': 'Играй больше.',
    'home.hero.title.line2': 'Плати',
    'home.hero.title.line3': 'меньше',
    'home.hero.subtitle': 'Тысячи игр. Честные цены. Мгновенная доставка ключей на почту.',
    'home.hero.cta': 'Открыть каталог',
    'home.hero.howItWorks': 'Как это работает',

    // Catalog
    'catalog.title': 'Каталог игр',
    'catalog.search.placeholder': 'Найти игру, жанр, тег...',
    'catalog.filter': 'Фильтр',
    'catalog.reset': 'Сбросить',
    'catalog.price': 'Цена',
    'catalog.year': 'Год выпуска',
    'catalog.onSale': 'Только со скидкой',
    'catalog.sort.default': 'По умолчанию',
    'catalog.sort.priceAsc': 'Сначала дешёвые',
    'catalog.sort.priceDesc': 'Сначала дорогие',
    'catalog.sort.rating': 'По рейтингу',
    'catalog.sort.year': 'По новизне',
    'catalog.empty': 'Ничего не нашлось',
    'catalog.found': 'Найдено',

    // Cart
    'cart.title': 'Корзина',
    'cart.empty': 'Корзина пуста',
    'cart.emptyDesc': 'Добавьте игры из каталога',
    'cart.browse': 'В каталог',
    'cart.remove': 'Удалить',
    'cart.clear': 'Очистить',
    'cart.promoCode': 'Промокод',
    'cart.promoPlaceholder': 'WELCOME10',
    'cart.savings': 'Экономия',
    'cart.checkout': 'Оплатить',
    'cart.secure': 'Безопасная оплата',

    // Favorites
    'fav.title': 'Избранное',
    'fav.empty': 'Пусто',
    'fav.emptyDesc': 'Добавляй понравившиеся игры и находи их здесь',

    // Profile
    'profile.overview': 'Обзор',
    'profile.settings': 'Настройки',
    'profile.welcome': 'С нами с',
    'profile.newPlayer': 'Новый игрок',
    'profile.stats.purchases': 'Покупок',
    'profile.stats.favorites': 'Избранное',
    'profile.stats.inCart': 'В корзине',
    'profile.stats.tickets': 'Обращений',
    'profile.quickActions': 'Быстрые действия',
    'profile.favGenres': 'Твои любимые жанры',
    'profile.avatarColor': 'Цвет аватара',
    'profile.avatarIcon': 'Иконка аватара',
    'profile.emailHeader': 'Email для уведомлений',
    'profile.emailDesc': 'На этот email будут приходить чеки с ключами и уведомления о тикетах',
    'profile.theme': 'Тема',
    'profile.themeDark': 'Тёмная',
    'profile.themeLight': 'Светлая',
    'profile.changePassword': 'Сменить пароль',
    'profile.oldPassword': 'Текущий пароль',
    'profile.newPassword': 'Новый пароль',
    'profile.confirmPassword': 'Повторите пароль',
    'profile.updatePassword': 'Обновить пароль',
    'profile.language': 'Язык интерфейса',
    'profile.currency': 'Валюта',
    'profile.security': 'Безопасность и данные',
    'profile.twoFA': 'Двухфакторка',
    'profile.twoFADesc': 'TOTP для защиты',
    'profile.export': 'Выгрузка данных',
    'profile.exportDesc': 'GDPR-экспорт в JSON',
    'profile.downloadData': 'Скачать все данные',
    'profile.myReviews': 'Мои отзывы',

    // Login / Register
    'login.welcome': 'С возвращением',
    'login.welcomeDesc': 'Войдите, чтобы продолжить',
    'login.registerTitle': 'Создать аккаунт',
    'login.registerDesc': 'Зарегистрируйся за минуту',
    'login.username': 'Логин',
    'login.usernamePlaceholder': 'Придумайте логин',
    'login.emailDesc': 'для чеков и восстановления пароля',
    'login.passwordPlaceholder': 'Ваш пароль',
    'login.passwordPlaceholderNew': 'Минимум 4 символа',
    'login.submit': 'Войти',
    'login.submitRegister': 'Зарегистрироваться',
    'login.noAccount': 'Нет аккаунта?',
    'login.haveAccount': 'Уже есть аккаунт?',
    'login.forgotPassword': 'Забыли пароль?',
    'login.refBanner': 'Вас пригласили! Реф-код',

    // Order / Checkout
    'order.history': 'История заказов',
    'order.noOrders': 'Нет покупок',
    'order.noOrdersDesc': 'Ваши заказы с ключами активации появятся здесь',
    'order.number': 'Заказ',
    'order.downloadPDF': 'Скачать PDF-чек',

    // Support
    'support.title': 'Поддержка',
    'support.new': 'Новое обращение',
    'support.newPlaceholder': 'Тема обращения',
    'support.messagePlaceholder': 'Опишите ситуацию подробно',
    'support.create': 'Создать обращение',
    'support.inWork': 'В работе',
    'support.answered': 'Отвечено',
    'support.closed': 'Закрыто',

    // Footer
    'footer.rights': 'Все права защищены',
    'footer.nav': 'Навигация',
    'footer.genres': 'Жанры',
    'footer.contacts': 'Контакты',
    'footer.subscribe': 'Получай скидки первым',
    'footer.subscribeDesc': 'Подпишись и получи промокод',
    'footer.onFirstOrder': 'на первую покупку',
    'footer.subscribe.placeholder': 'your@email.com',
    'footer.subscribe.button': 'Подписаться',
    'footer.subscribe.success': 'Готово! Промокод на почте.',
  },
  en: {
    // Nav / Header
    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.about': 'About',
    'nav.favorites': 'Favorites',
    'nav.cart': 'Cart',
    'nav.support': 'Support',
    'nav.admin': 'Admin',
    'nav.profile': 'Profile',
    'nav.login': 'Log in',
    'nav.logout': 'Log out',
    'nav.register': 'Sign up',
    'nav.orders': 'My orders',
    'nav.search': 'Search',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.close': 'Close',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.apply': 'Apply',
    'common.total': 'Total',
    'common.required': 'Required',

    // Home
    'home.hero.badge': 'Licensed store',
    'home.hero.title.line1': 'Play more.',
    'home.hero.title.line2': 'Pay',
    'home.hero.title.line3': 'less',
    'home.hero.subtitle': 'Thousands of games. Fair prices. Instant key delivery to your email.',
    'home.hero.cta': 'Browse catalog',
    'home.hero.howItWorks': 'How it works',

    // Catalog
    'catalog.title': 'Game catalog',
    'catalog.search.placeholder': 'Find a game, genre, tag...',
    'catalog.filter': 'Filter',
    'catalog.reset': 'Reset',
    'catalog.price': 'Price',
    'catalog.year': 'Release year',
    'catalog.onSale': 'On sale only',
    'catalog.sort.default': 'Default',
    'catalog.sort.priceAsc': 'Price: low to high',
    'catalog.sort.priceDesc': 'Price: high to low',
    'catalog.sort.rating': 'By rating',
    'catalog.sort.year': 'Newest first',
    'catalog.empty': 'Nothing found',
    'catalog.found': 'Found',

    // Cart
    'cart.title': 'Cart',
    'cart.empty': 'Cart is empty',
    'cart.emptyDesc': 'Add games from the catalog',
    'cart.browse': 'Browse catalog',
    'cart.remove': 'Remove',
    'cart.clear': 'Clear',
    'cart.promoCode': 'Promo code',
    'cart.promoPlaceholder': 'WELCOME10',
    'cart.savings': 'Savings',
    'cart.checkout': 'Checkout',
    'cart.secure': 'Secure payment',

    // Favorites
    'fav.title': 'Favorites',
    'fav.empty': 'Empty',
    'fav.emptyDesc': 'Add games you like and find them here',

    // Profile
    'profile.overview': 'Overview',
    'profile.settings': 'Settings',
    'profile.welcome': 'Member since',
    'profile.newPlayer': 'New player',
    'profile.stats.purchases': 'Purchases',
    'profile.stats.favorites': 'Favorites',
    'profile.stats.inCart': 'In cart',
    'profile.stats.tickets': 'Tickets',
    'profile.quickActions': 'Quick actions',
    'profile.favGenres': 'Your favorite genres',
    'profile.avatarColor': 'Avatar color',
    'profile.avatarIcon': 'Avatar icon',
    'profile.emailHeader': 'Notification email',
    'profile.emailDesc': 'Receipts and ticket notifications will be sent here',
    'profile.theme': 'Theme',
    'profile.themeDark': 'Dark',
    'profile.themeLight': 'Light',
    'profile.changePassword': 'Change password',
    'profile.oldPassword': 'Current password',
    'profile.newPassword': 'New password',
    'profile.confirmPassword': 'Confirm password',
    'profile.updatePassword': 'Update password',
    'profile.language': 'Interface language',
    'profile.currency': 'Currency',
    'profile.security': 'Security & Data',
    'profile.twoFA': 'Two-factor auth',
    'profile.twoFADesc': 'TOTP protection',
    'profile.export': 'Data export',
    'profile.exportDesc': 'GDPR export to JSON',
    'profile.downloadData': 'Download all data',
    'profile.myReviews': 'My reviews',

    // Login / Register
    'login.welcome': 'Welcome back',
    'login.welcomeDesc': 'Log in to continue',
    'login.registerTitle': 'Create account',
    'login.registerDesc': 'Sign up in a minute',
    'login.username': 'Username',
    'login.usernamePlaceholder': 'Choose a username',
    'login.emailDesc': 'for receipts and password recovery',
    'login.passwordPlaceholder': 'Your password',
    'login.passwordPlaceholderNew': 'At least 4 characters',
    'login.submit': 'Log in',
    'login.submitRegister': 'Sign up',
    'login.noAccount': "Don't have an account?",
    'login.haveAccount': 'Already have an account?',
    'login.forgotPassword': 'Forgot password?',
    'login.refBanner': 'You were invited! Referral code',

    // Order / Checkout
    'order.history': 'Order history',
    'order.noOrders': 'No purchases',
    'order.noOrdersDesc': 'Your orders with activation keys will appear here',
    'order.number': 'Order',
    'order.downloadPDF': 'Download PDF receipt',

    // Support
    'support.title': 'Support',
    'support.new': 'New ticket',
    'support.newPlaceholder': 'Ticket subject',
    'support.messagePlaceholder': 'Describe the issue in detail',
    'support.create': 'Create ticket',
    'support.inWork': 'In progress',
    'support.answered': 'Answered',
    'support.closed': 'Closed',

    // Footer
    'footer.rights': 'All rights reserved',
    'footer.nav': 'Navigation',
    'footer.genres': 'Genres',
    'footer.contacts': 'Contacts',
    'footer.subscribe': 'Get discounts first',
    'footer.subscribeDesc': 'Subscribe and get a promo code',
    'footer.onFirstOrder': 'for your first order',
    'footer.subscribe.placeholder': 'your@email.com',
    'footer.subscribe.button': 'Subscribe',
    'footer.subscribe.success': 'Done! Check your email.',
  },
};

const LOCALES = {
  ru: { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  en: { code: 'en', label: 'English',  flag: '🇬🇧' },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('lang');
      return saved && TRANSLATIONS[saved] ? saved : 'ru';
    } catch { return 'ru'; }
  });

  useEffect(() => {
    try { localStorage.setItem('lang', lang); } catch {}
    document.documentElement.setAttribute('lang', lang);
    // Emit global event so components outside context tree can react
    window.dispatchEvent(new CustomEvent('lang-change', { detail: lang }));
  }, [lang]);

  function setLang(code) {
    if (TRANSLATIONS[code]) setLangState(code);
  }

  function t(key, fallback) {
    return TRANSLATIONS[lang]?.[key] || fallback || key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, locales: LOCALES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be inside I18nProvider');
  return ctx;
}

export { LOCALES };
