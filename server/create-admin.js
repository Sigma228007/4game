// Создание admin и support аккаунтов
// Запуск: node create-admin.js

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  const accounts = [
    { username: 'admin', password: 'admin123', email: 'admin@4game.com', role: 'admin' },
    { username: 'support', password: 'support123', email: 'support@4game.com', role: 'support' },
  ];

  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, 10);
    try {
      await pool.query(
        'INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) ON CONFLICT (username) DO UPDATE SET password = $2, role = $4',
        [acc.username, hash, acc.email, acc.role]
      );
      console.log(`✅ ${acc.role}: ${acc.username} / ${acc.password}`);
    } catch (err) {
      console.error(`❌ ${acc.username}:`, err.message);
    }
  }

  await pool.end();
  console.log('\nГотово! Можно войти на сайт.');
}

main();
