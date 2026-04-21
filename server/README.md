# 4Game — Backend (Express + PostgreSQL + Nodemailer)

## Быстрый старт

### 1. Установить PostgreSQL
Скачай и установи: https://www.postgresql.org/download/windows/

При установке запомни пароль для пользователя `postgres`.

### 2. Создать базу данных
```bash
psql -U postgres
CREATE DATABASE "4game";
\q
```

### 3. Настроить .env
```bash
cd server
cp .env.example .env
```

Отредактируй `.env`:
```
DATABASE_URL=postgresql://postgres:ТВОЙ_ПАРОЛЬ@localhost:5432/4game
JWT_SECRET=любая_длинная_случайная_строка
PORT=5000
FRONTEND_URL=https://4game-blush.vercel.app

# Email (опционально - если не настроено, письма пишутся в консоль)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=4Game <noreply@4game.com>
```

### 4. Установить зависимости
```bash
npm install
```

### 5. Запустить миграции
```bash
npm run migrate
```

Миграции выполняются по алфавиту: `001_schema.sql` → `002_seed.sql` → `003_features.sql` (reviews, password_resets).

### 6. Запустить сервер
```bash
npm run dev
```

Сервер запустится на `http://localhost:5000`.

## Настройка Email (Gmail)

1. Включи 2FA на Google-аккаунте (myaccount.google.com/security)
2. Создай "Пароль приложения": https://myaccount.google.com/apppasswords
3. Вставь в `.env` `SMTP_PASS=xxxx xxxx xxxx xxxx` (16-значный пароль приложения)
4. Перезапусти сервер. В консоли появится: "📧 Email-сервис готов (SMTP настроен)"

**Альтернатива — Resend** (рекомендуется для продакшена):
```
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxx  (API-ключ с resend.com)
EMAIL_FROM=4Game <no-reply@твой-домен.com>
```
Бесплатно 3000 писем/месяц. Требует верификацию домена, но хорошо работает.

## API Endpoints

### Auth
| Метод | Путь                        | Описание              | Auth |
|-------|-----------------------------|-----------------------|------|
| POST  | /api/auth/register          | Регистрация (+ email) | ❌   |
| POST  | /api/auth/login             | Вход                  | ❌   |
| GET   | /api/auth/me                | Текущий пользователь  | ✅   |
| PUT   | /api/auth/password          | Смена пароля          | ✅   |
| PUT   | /api/auth/avatar            | Смена аватара         | ✅   |
| PUT   | /api/auth/email             | Смена email           | ✅   |
| POST  | /api/auth/forgot-password   | Запрос на восст.      | ❌   |
| POST  | /api/auth/reset-password    | Установка нового пароля | ❌ |

### Games / Cart / Favorites / Orders — без изменений

### Reviews
| Метод  | Путь                        | Описание              | Auth |
|--------|-----------------------------|-----------------------|------|
| GET    | /api/reviews/game/:id       | Отзывы на игру        | ❌   |
| GET    | /api/reviews/can-review/:id | Можно ли оставить?    | ✅   |
| POST   | /api/reviews                | Создать/обновить      | ✅   |
| DELETE | /api/reviews/:id            | Удалить свой          | ✅   |
| POST   | /api/reviews/:id/helpful    | Голос "полезно"       | ✅   |
| GET    | /api/reviews/my             | Мои отзывы            | ✅   |

### Tickets / Admin — без изменений

## Что отправляется на email

- **При регистрации** (если указан email) — приветственное письмо + промокод WELCOME10
- **При оформлении заказа** — чек с ключами активации
- **При ответе в тикет от поддержки/админа** — уведомление владельцу тикета
- **При запросе восстановления пароля** — ссылка на сброс (действительна 30 мин)

Если SMTP не настроен — всё продолжает работать, только письма идут в консоль (удобно для разработки).
