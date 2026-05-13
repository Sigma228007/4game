/**
 * Скрипт для скачивания всех картинок игр в папку public/images/
 * Скачивает: обложки (game-N.jpg) + скриншоты (game-N-shot-1.jpg, ...)
 *
 * Запуск: node download-images.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// Обложки (id → url) — Steam library_600x900.jpg (официальный портретный формат)
const STEAM = id => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`;
const COVERS = {
  1:  STEAM(2215430),  // Ghost of Tsushima Director's Cut
  2:  STEAM(1174180),  // Red Dead Redemption 2
  3:  STEAM(2208920),  // Assassin's Creed Valhalla
  4:  STEAM(2971450),  // Assassin's Creed Shadows
  5:  STEAM(489830),   // Skyrim Special Edition
  6:  STEAM(271590),   // Grand Theft Auto V
  7:  STEAM(1091500),  // Cyberpunk 2077
  8:  STEAM(460930),   // Ghost Recon Wildlands
  9:  STEAM(1517290),  // Battlefield 2042
  10: STEAM(412020),   // Metro Exodus
  11: STEAM(782330),   // Doom Eternal
  12: STEAM(2183900),  // Warhammer 40,000: Space Marine 2
  13: STEAM(552520),   // Far Cry 5
  14: STEAM(1238810),  // Battlefield V
  15: STEAM(2344520),  // Diablo IV
  16: STEAM(292030),   // The Witcher 3: Wild Hunt
  17: STEAM(1245620),  // Elden Ring
  18: STEAM(1086940),  // Baldur's Gate 3
  19: STEAM(374320),   // Dark Souls III
  20: STEAM(22380),    // Fallout: New Vegas
  21: STEAM(1850570),  // Death Stranding Director's Cut
  22: STEAM(394360),   // Hearts of Iron IV
  23: STEAM(1601580),  // Frostpunk 2
  24: STEAM(289070),   // Civilization VI
  25: STEAM(877330),   // Rome: Total War — Remastered
  26: STEAM(8930),     // Civilization V
  27: STEAM(214950),   // Total War: Rome II
  28: STEAM(505460),   // Foxhole
  29: STEAM(1551360),  // Forza Horizon 5
  30: STEAM(2195250),  // EA Sports FC 24
  31: STEAM(1905910),  // NHL 24
  32: STEAM(2338770),  // NBA 2K24
  33: STEAM(1899590),  // EA Sports UFC 5
  34: STEAM(2108330),  // F1 24
  35: STEAM(2315690),  // WWE 2K24
};

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const SHOTS_DIR  = path.join(IMAGES_DIR, 'screenshots');

[IMAGES_DIR, SHOTS_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const attempt = (currentUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      const proto = currentUrl.startsWith('https') ? https : http;
      proto.get(currentUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return attempt(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
        file.on('error', reject);
      }).on('error', reject);
    };
    attempt(url);
  });
}

async function downloadOne(url, filepath, label) {
  if (fs.existsSync(filepath)) {
    console.log(`  ✅ ${label} — уже есть`);
    return true;
  }
  try {
    process.stdout.write(`  ⏳ ${label}...`);
    await download(url, filepath);
    const size = (fs.statSync(filepath).size / 1024).toFixed(0);
    console.log(` ✅ (${size} KB)`);
    return true;
  } catch (err) {
    console.log(` ❌ ${err.message}`);
    return false;
  }
}

async function main() {
  // ── 1. Обложки ──────────────────────────────────────────
  console.log(`\n🎮 Обложки (${Object.keys(COVERS).length} шт.)...\n`);
  let ok = 0, fail = 0;
  for (const [id, url] of Object.entries(COVERS)) {
    const fp = path.join(IMAGES_DIR, `game-${id}.jpg`);
    (await downloadOne(url, fp, `game-${id}.jpg`)) ? ok++ : fail++;
    await new Promise(r => setTimeout(r, 150));
  }
  console.log(`\n  Обложки: ${ok} ок, ${fail} ошибок\n`);

  // ── 2. Скриншоты из games.js ────────────────────────────
  const gamesPath = path.join(process.cwd(), 'src', 'data', 'games.js');
  let gamesContent = fs.readFileSync(gamesPath, 'utf-8');

  // Вытаскиваем все внешние URL из массивов screenshots
  const urlRegex = /screenshots:\s*\[([\s\S]*?)\]/g;
  const allShots = []; // { gameId, shotIdx, url }

  // Парсим id + screenshots блоки
  const gameBlocks = [...gamesContent.matchAll(/id:\s*(\d+),[\s\S]*?screenshots:\s*\[([\s\S]*?)\]/g)];
  for (const match of gameBlocks) {
    const gameId = match[1];
    const block = match[2];
    const urls = [...block.matchAll(/'([^']+)'/g)].map(m => m[1]).filter(u => u.startsWith('http'));
    urls.forEach((url, i) => allShots.push({ gameId, shotIdx: i + 1, url }));
  }

  console.log(`🖼️  Скриншоты (${allShots.length} шт.)...\n`);
  ok = 0; fail = 0;
  const urlToLocal = {};

  for (const { gameId, shotIdx, url } of allShots) {
    const filename = `game-${gameId}-shot-${shotIdx}.jpg`;
    const fp = path.join(SHOTS_DIR, filename);
    const localPath = `/images/screenshots/${filename}`;
    urlToLocal[url] = localPath;
    (await downloadOne(url, fp, filename)) ? ok++ : fail++;
    await new Promise(r => setTimeout(r, 150));
  }
  console.log(`\n  Скриншоты: ${ok} ок, ${fail} ошибок\n`);

  // ── 3. Обновляем games.js ───────────────────────────────
  console.log('📝 Обновляю пути в games.js...');
  for (const [url, local] of Object.entries(urlToLocal)) {
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    gamesContent = gamesContent.replace(new RegExp(escaped, 'g'), local);
  }
  fs.writeFileSync(gamesPath, gamesContent, 'utf-8');
  console.log('✅ games.js обновлён — все скриншоты локальные!\n');
  console.log('🚀 Запусти: git add -A && git commit -m "chore: download screenshots locally" && git push\n');
}

main().catch(console.error);
