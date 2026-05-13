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

// Обложки (id → url)
const COVERS = {
  1: 'https://avatars.mds.yandex.net/get-altay/4043748/2a000001756a46f78c00b7fdb979fdb8bbf2/L_height',
  2: 'https://avatars.mds.yandex.net/i?id=8bb2caaa69e877c1d194ef4ee46ad9ae_l-3788222-images-thumbs&n=13',
  3: 'https://avatars.mds.yandex.net/i?id=55a11fd49bb3e69a942d9d24596d207e_l-8210619-images-thumbs&n=13',
  4: 'https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_66450e556da671658f09ad02_66450e5c5046aa1f39e7ea96/scale_1200',
  5: 'https://yt3.googleusercontent.com/ytc/AIdro_lhetmJH0sONcEeq-3tKfjA9FbVUMV0dnXfsu39kbtA=s900-c-k-c0x00ffffff-no-rj',
  6: 'https://avatars.mds.yandex.net/i?id=da42c7d09759fffbde3069b45f60f333_l-5294324-images-thumbs&n=13',
  7: 'https://avatars.mds.yandex.net/i?id=26e89a1761bd142562a803f2c5a16df1_l-7755611-images-thumbs&n=13',
  8: 'https://avatars.mds.yandex.net/i?id=3ab7ea5b1dd9e8a7248eceb651ba400f40c13331-10638416-images-thumbs&n=13',
  9: 'https://avatars.mds.yandex.net/i?id=2320a15e3bd40eb0159584361efda0da9b9b4888-10247323-images-thumbs&n=13',
  10: 'https://avatars.mds.yandex.net/i?id=9cb96d613407fad8be6a3d20cdf5567d_l-8182659-images-thumbs&n=13',
  11: 'https://avatars.mds.yandex.net/i?id=7f73c1fb761cd385535fc3afdfe221a9_l-6438015-images-thumbs&n=13',
  12: 'https://avatars.mds.yandex.net/i?id=c4c3bde66d680f7c4bbd8331a8d19c24_l-5130535-images-thumbs&n=13',
  13: 'https://avatars.mds.yandex.net/get-mpic/1861069/2a00000193653297c6c63b41e4ede5dc9ebc/orig',
  14: 'https://avatars.mds.yandex.net/i?id=2eafcf0c8f582887a6d7664f21a08773_l-4011233-images-thumbs&n=13',
  15: 'https://tse4.mm.bing.net/th/id/OIP.jFuh3FC2-1smft-DQRcOgAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
  16: 'https://avatars.mds.yandex.net/get-marketpic/1710031/pic95e407d7dd04e8356aecf5f27d12a06a/orig',
  17: 'https://i.pinimg.com/originals/24/40/4d/24404d0281de48c41b737719e4bd9dd1.jpg',
  18: 'https://avatars.mds.yandex.net/i?id=5dbea2e916ecddbfcce3899269b2295e_l-4408821-images-thumbs&n=13',
  19: 'https://avatars.mds.yandex.net/i?id=34f249d93707f267e02c0d308d965eb6_l-8982254-images-thumbs&n=13',
  20: 'https://avatars.mds.yandex.net/i?id=640c3da8953288166f1c1ac3cede3820_l-5235020-images-thumbs&n=13',
  21: 'https://avatars.mds.yandex.net/get-mpic/5221004/2a00000191be2c424e29f846269dbcaf26d9/orig',
  22: 'https://steamuserimages-a.akamaihd.net/ugc/2202884666998373284/A679B5647E5C76C6F5E0C13C4BA2E8CE8D6BE3F7/?imw=512&imh=288&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=true',
  23: 'https://avatars.mds.yandex.net/i?id=9ea4178d87f65bdeb259fa9bbab94293_l-5025854-images-thumbs&n=13',
  24: 'https://avatars.mds.yandex.net/i?id=cf39d2f1d55f4dfd378d75ff3aeb9666_l-5353188-images-thumbs&n=13',
  25: 'https://img.ixbt.site/live/images/original/31/75/24/2023/09/19/ca3b9a2aca.jpg',
  26: 'https://digital-basket-01.wbbasket.ru/vol3/835/fc4e838b1ac598c556038b333714533c/1920.jpg',
  27: 'https://avatars.mds.yandex.net/i?id=3e0ceafc84c292d605f7df18283da5cb_l-4079525-images-thumbs&n=13',
  28: 'https://i.pinimg.com/originals/fe/a0/e1/fea0e15a3173f15dceb86f17dca5de75.jpg',
  29: 'https://pic.rutubelist.ru/video/ea/d2/ead2104eac605eb85477aa21bc9d6be7.jpg',
  30: 'https://foto.haberler.com/haber/2022/12/03/fifa-24-ne-zaman-cikacak-ea-sports-fc-ne-zaman-15469905_2473_amp.jpg',
  31: 'https://drop-assets.ea.com/images/3xardbzcbQbVnFuvw6GBnh/40901023973a40c55dcae6def227089e/nhl24-std-key-art-16x9.jpg?im=AspectCrop=(16,9),xPosition=0.5,yPosition=0.5',
  32: 'https://avatars.mds.yandex.net/get-mpic/12554399/2a0000018d024b401274b181aa2514a66f5c/orig',
  33: 'https://avatars.mds.yandex.net/get-mpic/1525999/2a00000191be8d060e254e84823e837ff383/orig',
  34: 'https://avatars.mds.yandex.net/get-mpic/7144437/2a00000191ce8f5ddc7a79550d12ce1113db/orig',
  35: 'https://www.charlieintel.com/cdn-image/wp-content/uploads/2024/01/22/WWE-2K24-all-game-modes-explained.jpg?width=1200&quality=75&format=auto',
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
