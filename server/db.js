import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Проверяем подключение при старте
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL подключён'))
  .catch(err => {
    console.error('❌ Ошибка подключения к PostgreSQL:', err.message);
    console.error('   Убедись, что PostgreSQL запущен и DATABASE_URL в .env правильный');
  });

export default pool;
