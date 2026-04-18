# 4Game — Backend (Express + PostgreSQL)

## Быстрый старт

### 1. Установить PostgreSQL
Скачай и установи: https://www.postgresql.org/download/windows/

При установке запомни пароль для пользователя `postgres`.

### 2. Создать базу данных
Открой pgAdmin (установился вместе с PostgreSQL) или терминал:

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
Отредактируй `.env` — подставь свой пароль от PostgreSQL:
```
DATABASE_URL=postgresql://postgres:ТВОЙ_ПАРОЛЬ@localhost:5432/4game
JWT_SECRET=любая_длинная_случайная_строка
PORT=5000
```

### 4. Установить зависимости
```bash
npm install
```

### 5. Запустить миграции (создать таблицы + заполнить играми)
```bash
npm run migrate
```

### 6. Запустить сервер
```bash
npm run dev
```

Сервер запустится на `http://localhost:5000`.

### 7. Запустить фронтенд (в другом терминале)
```bash
cd ..
npm run dev
```

Фронтенд на `http://localhost:3000` — все запросы `/api/*` автоматически проксируются на порт 5000.

## API Endpoints

| Метод  | Путь                  | Описание                  | Auth |
|--------|-----------------------|---------------------------|------|
| POST   | /api/auth/register    | Регистрация               | ❌   |
| POST   | /api/auth/login       | Вход                      | ❌   |
| GET    | /api/auth/me          | Текущий пользователь      | ✅   |
| PUT    | /api/auth/password    | Смена пароля              | ✅   |
| PUT    | /api/auth/avatar      | Смена аватара             | ✅   |
| GET    | /api/games            | Список игр (фильтры)     | ❌   |
| GET    | /api/games/genres     | Список жанров             | ❌   |
| GET    | /api/games/:id        | Одна игра                 | ❌   |
| GET    | /api/favorites        | Избранное                 | ✅   |
| GET    | /api/favorites/ids    | ID избранного             | ✅   |
| POST   | /api/favorites/:id    | Добавить в избранное      | ✅   |
| DELETE | /api/favorites/:id    | Удалить из избранного     | ✅   |
| GET    | /api/cart             | Корзина                   | ✅   |
| GET    | /api/cart/ids         | ID в корзине              | ✅   |
| POST   | /api/cart/:id         | Добавить в корзину        | ✅   |
| DELETE | /api/cart/:id         | Удалить из корзины        | ✅   |
| DELETE | /api/cart             | Очистить корзину          | ✅   |
| POST   | /api/orders/checkout  | Оформить заказ            | ✅   |
| GET    | /api/orders           | История заказов           | ✅   |
| POST   | /api/contact          | Отправить обращение       | ❌   |
| GET    | /api/contact          | Мои обращения             | ✅   |
