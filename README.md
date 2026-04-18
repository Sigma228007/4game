# 4Game — Магазин цифровых игр

Дипломный проект. Онлайн-магазин компьютерных игр на React + Tailwind CSS.

## Стек технологий

- **Frontend:** React 18 + Vite
- **Стили:** Tailwind CSS 3
- **Роутинг:** React Router DOM 6
- **Иконки:** Lucide React
- **Анимации:** Framer Motion + CSS
- **Шрифты:** Orbitron (заголовки) + Exo 2 (текст)

## Быстрый старт

```bash
# 1. Перейдите в папку проекта
cd 4game

# 2. Установите зависимости
npm install

# 3. Запустите dev-сервер
npm run dev

# 4. Откройте http://localhost:3000
```

## Структура проекта

```
4game/
├── src/
│   ├── components/       # Переиспользуемые компоненты
│   │   ├── Header.jsx    # Шапка с навигацией
│   │   ├── Footer.jsx    # Подвал
│   │   ├── GameCard.jsx  # Карточка игры
│   │   └── ProtectedRoute.jsx  # Защита маршрутов
│   ├── context/          # React Context (состояние)
│   │   ├── AuthContext.jsx      # Авторизация
│   │   ├── CartContext.jsx      # Корзина
│   │   └── FavoritesContext.jsx # Избранное
│   ├── data/
│   │   └── games.js      # База данных игр (35 игр)
│   ├── pages/            # Страницы
│   │   ├── Home.jsx      # Главная
│   │   ├── Catalog.jsx   # Каталог с фильтрами
│   │   ├── Favorites.jsx # Избранное
│   │   ├── Cart.jsx      # Корзина
│   │   ├── Login.jsx     # Вход / Регистрация
│   │   ├── Success.jsx   # Успешная оплата
│   │   └── About.jsx     # О нас + форма обратной связи
│   ├── App.jsx           # Главный компонент
│   ├── main.jsx          # Точка входа
│   └── index.css         # Глобальные стили
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Реализованные требования диплома

- [x] Сайт БЕЗ конструктора и CMS (React + Vite)
- [x] Адаптивная вёрстка (mobile-first, Tailwind breakpoints)
- [x] Рабочий контент и ссылки
- [x] Форма обратной связи с отображением данных
- [x] Интерактивные UI-эффекты (анимации, hover, transitions)
- [x] Ограничение прав для незарегистрированных (ProtectedRoute)
- [x] Мультимедиа (видео на странице «О нас»)
- [ ] Бэкенд + PostgreSQL (следующий этап)
- [ ] Хостинг + домен + SSL (следующий этап)

## Следующие шаги

1. **Бэкенд:** Node.js + Express + PostgreSQL
2. **Деплой:** Vercel (фронт) + Render (бэк + БД)
3. **Домен:** Регистрация на reg.ru + привязка
4. **Локальные картинки:** Скачать и заменить URL на локальные
