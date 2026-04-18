import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('\n🗄️  Запускаю миграции...\n');

    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf-8');
      console.log(`  ⏳ ${file}...`);
      await pool.query(sql);
      console.log(`  ✅ ${file}`);
    }

    console.log('\n✅ Все миграции выполнены!\n');
  } catch (err) {
    console.error('\n❌ Ошибка миграции:', err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

migrate();
