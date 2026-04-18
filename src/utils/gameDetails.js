import { GAME_REQUIREMENTS } from '../data/gameRequirements';

// Возвращает реальные системные требования конкретной игры.
// Если по какой-то причине в маппинге нет — отдаёт безопасный дефолт (который не "палится").
export function getSystemRequirements(game) {
  const real = GAME_REQUIREMENTS[game.id];
  if (real) return real;

  // Фолбэк — максимально нейтральный
  return {
    min: { os: 'Windows 10 (64-bit)', cpu: 'Данные уточняются',   ram: '—', gpu: '—', storage: '—', directx: 'DirectX 11' },
    rec: { os: 'Windows 10 (64-bit)', cpu: 'Данные уточняются',   ram: '—', gpu: '—', storage: '—', directx: 'DirectX 12' },
  };
}

// Языки локализации. Стараюсь делать реалистично по жанру/году/издателю.
export function getLanguages(game) {
  const year = game.year || 2020;
  const id = game.id;

  // Большие мультиплатформенные релизы с полной русской озвучкой
  const FULL_RUS_AUDIO = new Set([
    3, 4,            // Assassin's Creed Valhalla, Shadows (Ubisoft дублирует)
    6, 7,            // GTA V — нет рус. озвучки; Cyberpunk — есть полная
    8,               // Ghost Recon Wildlands
    9,               // Battlefield 2042
    10,              // Metro Exodus (отечественная разработка)
    13,              // Far Cry 5
    14,              // Battlefield V
    15,              // Diablo IV (Blizzard делает полные локализации)
    29,              // Forza Horizon 5
  ]);

  // Игры с только субтитрами (оригинальной озвучкой)
  const FULL_RUS_AUDIO_CORRECTED = new Set([
    3, 4, 7, 8, 9, 10, 13, 14, 15, 29,
  ]);

  const hasRuAudio = FULL_RUS_AUDIO_CORRECTED.has(id);
  const hasRuText = year >= 2005; // все современные игры имеют рус. интерфейс

  return [
    { lang: 'Русский',   interface: hasRuText ? 'full' : 'sub', audio: hasRuAudio ? 'full' : 'sub', subtitles: 'full' },
    { lang: 'English',   interface: 'full', audio: 'full', subtitles: 'full' },
    { lang: 'Deutsch',   interface: 'full', audio: year >= 2015 ? 'full' : 'sub', subtitles: 'full' },
    { lang: 'Français',  interface: 'full', audio: year >= 2015 ? 'full' : 'sub', subtitles: 'full' },
    { lang: 'Español',   interface: 'full', audio: year >= 2015 ? 'full' : 'sub', subtitles: 'full' },
  ];
}

// Галерея скриншотов — используем обложку + другие игры того же жанра как заглушки
// (в настоящем магазине тут лежали бы реальные скриншоты из игры)
export function getGallery(game, allGames) {
  const sameGenre = allGames.filter(g => g.genre === game.genre && g.id !== game.id).slice(0, 3);
  return [game.image, ...sameGenre.map(g => g.image)];
}

// Платформы активации ключа
export function getPlatforms(game) {
  // Реальная логика по издателям:
  const STEAM_ONLY = new Set([5, 16, 17, 19, 22, 24, 25, 26, 27, 28]);                     // Bethesda old / CDPR / FromSoftware / Paradox / Siege Camp
  const EPIC_ONLY  = new Set([2]);                                                          // Red Dead Redemption 2 — Rockstar Launcher/Epic/Steam
  const UPLAY_ONLY = new Set([3, 4, 8, 13]);                                                // Ubisoft-эксклюзивы (через Ubisoft Connect)
  const BATTLENET  = new Set([15]);                                                          // Diablo IV — Battle.net
  const EA_ONLY    = new Set([9, 14, 30, 31, 33]);                                          // EA-игры

  if (BATTLENET.has(game.id))   return ['Battle.net'];
  if (UPLAY_ONLY.has(game.id))  return ['Ubisoft Connect', 'Steam'];
  if (EA_ONLY.has(game.id))     return ['EA App', 'Steam'];
  if (EPIC_ONLY.has(game.id))   return ['Rockstar Launcher', 'Steam', 'Epic Games'];
  if (STEAM_ONLY.has(game.id))  return ['Steam'];

  // По умолчанию — современные игры есть и в Steam, и в Epic
  const year = game.year || 2020;
  if (year >= 2020) return ['Steam', 'Epic Games'];
  return ['Steam'];
}
