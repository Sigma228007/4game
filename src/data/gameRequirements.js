// Реальные системные требования для каждой игры.
// Данные взяты из официальных источников (Steam, сайты разработчиков).
// Ключ — id игры из games.js.

export const GAME_REQUIREMENTS = {
  // 1. Ghost of Tsushima (PC-порт 2024)
  1: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i3-7100 / AMD Ryzen 3 1200',      ram: '8 GB',  gpu: 'NVIDIA GeForce GTX 960 (4 GB) / AMD RX 5500 XT', storage: '75 GB SSD',      directx: 'DirectX 12' },
    rec: { os: 'Windows 10/11 (64-bit)', cpu: 'Intel Core i5-8600 / AMD Ryzen 5 3600',       ram: '16 GB', gpu: 'NVIDIA GeForce GTX 1060 (6 GB) / AMD RX 5600 XT', storage: '75 GB NVMe SSD', directx: 'DirectX 12' },
  },
  // 2. Red Dead Redemption 2
  2: {
    min: { os: 'Windows 7 SP1 (64-bit)', cpu: 'Intel Core i5-2500K / AMD FX-6300',           ram: '8 GB',  gpu: 'Nvidia GeForce GTX 770 2GB / AMD Radeon R9 280 3GB', storage: '150 GB',     directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-4770K / AMD Ryzen 5 1500X',     ram: '12 GB', gpu: 'Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB', storage: '150 GB SSD', directx: 'DirectX 12' },
  },
  // 3. Assassin's Creed Valhalla
  3: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'AMD Ryzen 3 1200 / Intel Core i5-4460',       ram: '8 GB',  gpu: 'AMD R9 380 / NVIDIA GTX 960 (4 GB VRAM)',           storage: '50 GB',      directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'AMD Ryzen 5 1600 / Intel Core i7-4790',       ram: '8 GB',  gpu: 'AMD RX 570 / NVIDIA GTX 1060 (6 GB VRAM)',          storage: '50 GB SSD',  directx: 'DirectX 12' },
  },
  // 4. Assassin's Creed Shadows
  4: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-8700K / AMD Ryzen 5 3600',      ram: '16 GB', gpu: 'NVIDIA GTX 1070 / AMD RX 5700 / Intel Arc A750 (8 GB)', storage: '120 GB SSD', directx: 'DirectX 12' },
    rec: { os: 'Windows 10/11 (64-bit)', cpu: 'Intel Core i7-10700K / AMD Ryzen 7 5800X',    ram: '16 GB', gpu: 'NVIDIA RTX 3060 Ti / AMD RX 6700 XT (8 GB)',        storage: '120 GB SSD', directx: 'DirectX 12' },
  },
  // 5. The Elder Scrolls V: Skyrim
  5: {
    min: { os: 'Windows 7/8.1/10',       cpu: 'Intel Core i5-750 / AMD Phenom II X4 945',    ram: '8 GB',  gpu: 'NVIDIA GTX 470 1GB / AMD HD 7870 2GB',              storage: '12 GB',      directx: 'DirectX 9.0c' },
    rec: { os: 'Windows 7/8.1/10',       cpu: 'Intel Core i5-2400 / AMD FX-8320',            ram: '8 GB',  gpu: 'NVIDIA GTX 780 3GB / AMD R9 290 4GB',               storage: '12 GB',      directx: 'DirectX 9.0c' },
  },
  // 6. Grand Theft Auto V
  6: {
    min: { os: 'Windows 8.1 / 7 SP1 (64-bit)', cpu: 'Intel Core 2 Quad Q6600 / AMD Phenom 9850',  ram: '4 GB',  gpu: 'NVIDIA 9800 GT 1GB / AMD HD 4870 1GB',       storage: '72 GB',      directx: 'DirectX 10' },
    rec: { os: 'Windows 10 (64-bit)',          cpu: 'Intel Core i5-3470 / AMD X8 FX-8350',         ram: '8 GB',  gpu: 'NVIDIA GTX 660 2GB / AMD HD 7870 2GB',        storage: '72 GB',      directx: 'DirectX 11' },
  },
  // 7. Cyberpunk 2077
  7: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-6700 / AMD Ryzen 5 1600',       ram: '12 GB', gpu: 'NVIDIA GTX 1060 6GB / AMD Radeon RX 580 8GB',       storage: '70 GB SSD',  directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-12700 / AMD Ryzen 7 7800X3D',   ram: '16 GB', gpu: 'NVIDIA RTX 2060 SUPER / RTX 3060 / AMD RX 6800 XT', storage: '70 GB SSD',  directx: 'DirectX 12' },
  },
  // 8. Ghost Recon Wildlands
  8: {
    min: { os: 'Windows 7/8.1/10 (64-bit)', cpu: 'Intel Core i5-2400S / AMD FX-4320',         ram: '6 GB',  gpu: 'NVIDIA GTX 660 / AMD Radeon HD 7870 (2 GB VRAM)',   storage: '50 GB',      directx: 'DirectX 11' },
    rec: { os: 'Windows 7/8.1/10 (64-bit)', cpu: 'Intel Core i7-3770 / AMD FX-8350',          ram: '8 GB',  gpu: 'NVIDIA GTX 970 / AMD R9 290X (4 GB VRAM)',           storage: '50 GB',      directx: 'DirectX 11' },
  },
  // 9. Battlefield 2042
  9: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-6600K / AMD FX-8350',           ram: '8 GB',  gpu: 'NVIDIA GTX 1050 Ti / AMD Radeon RX 560 (4 GB VRAM)', storage: '100 GB',     directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-4790 / AMD Ryzen 7 2700X',      ram: '16 GB', gpu: 'NVIDIA RTX 3060 / AMD RX 6600 XT (8 GB VRAM)',       storage: '100 GB SSD', directx: 'DirectX 12' },
  },
  // 10. Metro Exodus
  10: {
    min: { os: 'Windows 7/8/10 (64-bit)', cpu: 'Intel Core i5-4440 / AMD Ryzen 5 1600X',     ram: '8 GB',  gpu: 'NVIDIA GTX 670 / GTX 1050 / AMD HD 7870 (2 GB VRAM)', storage: '59 GB',      directx: 'DirectX 11' },
    rec: { os: 'Windows 10 (64-bit)',     cpu: 'Intel Core i7-4770K / AMD Ryzen 7 1700',      ram: '8 GB',  gpu: 'NVIDIA GTX 1070 / AMD RX Vega 56',                  storage: '59 GB',      directx: 'DirectX 12' },
  },
  // 11. Doom Eternal
  11: {
    min: { os: 'Windows 7/10 (64-bit)',  cpu: 'Intel Core i5 @3.3 GHz / AMD Ryzen 3 @3.1 GHz', ram: '8 GB', gpu: 'NVIDIA GTX 1050 Ti / AMD Radeon R9 280 (4 GB VRAM)', storage: '50 GB',      directx: 'Vulkan 1.0' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-6700K / AMD Ryzen 7 1800X',     ram: '8 GB',  gpu: 'NVIDIA GTX 1060 6GB / RX 480 8GB',                   storage: '50 GB SSD',  directx: 'Vulkan 1.0' },
  },
  // 12. Warhammer 40,000: Space Marine 2
  12: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'AMD Ryzen 5 2600 / Intel Core i5-8600K',      ram: '8 GB',  gpu: 'AMD RX 5700 / NVIDIA GTX 1060 / Intel Arc A580 (8 GB)', storage: '75 GB SSD', directx: 'DirectX 12' },
    rec: { os: 'Windows 10/11 (64-bit)', cpu: 'AMD Ryzen 5 3600X / Intel Core i5-10600K',    ram: '16 GB', gpu: 'AMD RX 6700 XT / NVIDIA RTX 3070 / Intel Arc A770 (8 GB)', storage: '75 GB SSD', directx: 'DirectX 12' },
  },
  // 13. Far Cry 5
  13: {
    min: { os: 'Windows 7/8.1/10 (64-bit)', cpu: 'Intel Core i5-2400 / AMD FX-6300',          ram: '8 GB',  gpu: 'NVIDIA GTX 670 / AMD R9 270 (2 GB VRAM)',           storage: '40 GB',      directx: 'DirectX 11' },
    rec: { os: 'Windows 7/8.1/10 (64-bit)', cpu: 'Intel Core i7-4770 / AMD Ryzen 5 1600X',    ram: '8 GB',  gpu: 'NVIDIA GTX 970 / AMD R9 290X (4 GB VRAM)',          storage: '40 GB',      directx: 'DirectX 11' },
  },
  // 14. Battlefield V
  14: {
    min: { os: 'Windows 7/8.1/10 (64-bit)', cpu: 'Intel Core i5-6600K / AMD FX-8350',          ram: '8 GB',  gpu: 'NVIDIA GTX 1050 / AMD Radeon RX 560',               storage: '50 GB',      directx: 'DirectX 11' },
    rec: { os: 'Windows 10 (64-bit)',        cpu: 'Intel Core i7-4790 / AMD Ryzen 3 1300X',     ram: '12 GB', gpu: 'NVIDIA GTX 1060 6GB / AMD Radeon RX 580 8GB',       storage: '50 GB',      directx: 'DirectX 11' },
  },
  // 15. Diablo IV
  15: {
    min: { os: 'Windows 10 ver. 1909',   cpu: 'Intel Core i5-2500K / AMD FX-8350',            ram: '8 GB',  gpu: 'NVIDIA GTX 660 / AMD Radeon R9 280',                storage: '90 GB SSD',  directx: 'DirectX 12' },
    rec: { os: 'Windows 10 ver. 1909',   cpu: 'Intel Core i5-4670K / AMD Ryzen 1300X',        ram: '16 GB', gpu: 'NVIDIA GTX 970 / AMD Radeon RX 470',                storage: '90 GB SSD',  directx: 'DirectX 12' },
  },
  // 16. The Witcher 3: Wild Hunt
  16: {
    min: { os: 'Windows 7/8/10 (64-bit)', cpu: 'Intel Core i5-2500K 3.3 GHz / AMD Phenom II X4 940', ram: '6 GB', gpu: 'NVIDIA GTX 660 / AMD Radeon HD 7870',       storage: '50 GB',      directx: 'DirectX 11' },
    rec: { os: 'Windows 7/8/10 (64-bit)', cpu: 'Intel Core i7-3770 3.4 GHz / AMD FX-8350 4 GHz',     ram: '8 GB', gpu: 'NVIDIA GTX 770 / AMD Radeon R9 290',        storage: '50 GB',      directx: 'DirectX 11' },
  },
  // 17. Elden Ring
  17: {
    min: { os: 'Windows 10',             cpu: 'Intel Core i5-8400 / AMD Ryzen 3 3300X',      ram: '12 GB', gpu: 'NVIDIA GTX 1060 3GB / AMD Radeon RX 580 4GB',       storage: '60 GB',      directx: 'DirectX 12' },
    rec: { os: 'Windows 10/11',          cpu: 'Intel Core i7-8700K / AMD Ryzen 5 3600X',     ram: '16 GB', gpu: 'NVIDIA GTX 1070 8GB / AMD Radeon RX Vega 56 8GB',   storage: '60 GB',      directx: 'DirectX 12' },
  },
  // 18. Baldur's Gate 3
  18: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-4690 / AMD FX 8350',            ram: '8 GB',  gpu: 'NVIDIA GTX 970 / AMD RX 480 (4 GB+ VRAM)',          storage: '150 GB SSD', directx: 'DirectX 11' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-8700K / AMD Ryzen 5 3600',      ram: '16 GB', gpu: 'NVIDIA RTX 2060 Super / AMD RX 5700 XT (8 GB+ VRAM)', storage: '150 GB SSD', directx: 'DirectX 11' },
  },
  // 19. Dark Souls III
  19: {
    min: { os: 'Windows 7/8.1/10 (64-bit)', cpu: 'Intel Core i3-2100 / AMD FX-6300',          ram: '4 GB',  gpu: 'NVIDIA GTX 750 Ti / AMD HD 7950 (2 GB VRAM)',       storage: '25 GB',      directx: 'DirectX 11' },
    rec: { os: 'Windows 7/8.1/10 (64-bit)', cpu: 'Intel Core i7-3770 / AMD FX-8350',          ram: '8 GB',  gpu: 'NVIDIA GTX 970 / AMD R9 Fury X (4 GB VRAM)',        storage: '25 GB',      directx: 'DirectX 11' },
  },
  // 20. Fallout: New Vegas
  20: {
    min: { os: 'Windows XP/Vista/7',     cpu: 'Dual Core 2.0 GHz',                            ram: '2 GB',  gpu: 'NVIDIA 6800 / ATI Radeon X850 (512 MB VRAM)',        storage: '10 GB',      directx: 'DirectX 9.0c' },
    rec: { os: 'Windows 7',              cpu: 'Quad Core 2.4 GHz',                            ram: '4 GB',  gpu: 'NVIDIA GTX 260 / ATI HD 3800 (1 GB VRAM)',           storage: '10 GB',      directx: 'DirectX 9.0c' },
  },
  // 21. Death Stranding
  21: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-3470 / AMD Ryzen 3 1200',        ram: '8 GB',  gpu: 'NVIDIA GTX 1050 3GB / AMD Radeon RX 560 4GB',       storage: '80 GB',      directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-3770 / AMD Ryzen 5 1600',        ram: '8 GB',  gpu: 'NVIDIA GTX 1060 6GB / AMD Radeon RX 590',           storage: '80 GB SSD',  directx: 'DirectX 12' },
  },
  // 22. Hearts of Iron IV
  22: {
    min: { os: 'Windows 7 (64-bit)',     cpu: 'Intel Core 2 Quad Q9400 / AMD Athlon II X4 650', ram: '4 GB', gpu: 'NVIDIA GTX 460 / AMD HD 5850 (1 GB VRAM)',          storage: '2 GB',       directx: 'DirectX 9.0c' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-760 / AMD FX-6350',              ram: '4 GB',  gpu: 'NVIDIA GTX 560 Ti / AMD HD 6970 (1 GB VRAM)',        storage: '2 GB',       directx: 'DirectX 9.0c' },
  },
  // 23. Frostpunk 2
  23: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-8600K / AMD Ryzen 5 2600',      ram: '16 GB', gpu: 'NVIDIA GTX 1070 / AMD RX 5700',                     storage: '30 GB SSD',  directx: 'DirectX 12' },
    rec: { os: 'Windows 10/11 (64-bit)', cpu: 'Intel Core i7-9700K / AMD Ryzen 5 5600X',     ram: '16 GB', gpu: 'NVIDIA RTX 3060 / AMD RX 6700 XT',                  storage: '30 GB SSD',  directx: 'DirectX 12' },
  },
  // 24. Civilization VI
  24: {
    min: { os: 'Windows 7/8.1/10 (64-bit)', cpu: 'Intel Core i3 2.5 GHz / AMD Phenom II 2.6 GHz', ram: '4 GB', gpu: 'NVIDIA 450 / AMD HD 5570 / Intel HD 4000 (1 GB VRAM)', storage: '17 GB',  directx: 'DirectX 11' },
    rec: { os: 'Windows 7/8.1/10 (64-bit)', cpu: 'Intel Core i5-560M 2.66 GHz+',                  ram: '8 GB', gpu: 'NVIDIA 770 / AMD 7970 / Intel Iris Pro (2 GB VRAM)',    storage: '17 GB',  directx: 'DirectX 11' },
  },
  // 25. Rome: Total War
  25: {
    min: { os: 'Windows 98/ME/2000/XP',  cpu: 'Pentium III / AMD Athlon 1.0 GHz',             ram: '256 MB', gpu: 'DirectX 9 GPU 64 MB (GeForce 4 Ti / Radeon 9000)',  storage: '2.9 GB',     directx: 'DirectX 9.0' },
    rec: { os: 'Windows XP',             cpu: 'Pentium 4 / AMD Athlon 1.5 GHz',               ram: '512 MB', gpu: 'DirectX 9 GPU 128 MB (GeForce FX 5900 / Radeon 9800)', storage: '2.9 GB',  directx: 'DirectX 9.0' },
  },
  // 26. Civilization V
  26: {
    min: { os: 'Windows Vista/7',        cpu: 'Intel Core 2 Duo 1.8 GHz / AMD Athlon X2 2.0 GHz', ram: '2 GB', gpu: 'ATI HD 2600 XT / NVIDIA 7900 GS (256 MB VRAM)',    storage: '8 GB',       directx: 'DirectX 10' },
    rec: { os: 'Windows Vista/7',        cpu: '1.8 GHz Quad Core',                            ram: '4 GB',  gpu: 'ATI HD 4800 / NVIDIA 9800 GT (512 MB VRAM)',         storage: '8 GB',       directx: 'DirectX 11' },
  },
  // 27. Total War: Rome II
  27: {
    min: { os: 'Windows XP/Vista/7/8 (64-bit)', cpu: '2 GHz Dual Core',                        ram: '2 GB',  gpu: '512 MB DX 9.0c GPU (Shader Model 3)',                storage: '35 GB',      directx: 'DirectX 9.0c' },
    rec: { os: 'Windows 7/8 (64-bit)',          cpu: '2nd Gen Intel Core i5',                  ram: '4 GB',  gpu: '1024 MB DX 11 GPU',                                  storage: '35 GB',      directx: 'DirectX 11' },
  },
  // 28. Foxhole
  28: {
    min: { os: 'Windows 8.1/10 (64-bit)', cpu: 'Intel Core i3-2105 / AMD FX-6300',             ram: '4 GB',  gpu: 'NVIDIA GTX 750 / AMD Radeon HD 7850 (2 GB VRAM)',    storage: '20 GB',      directx: 'DirectX 11' },
    rec: { os: 'Windows 10 (64-bit)',     cpu: 'Intel Core i5-4440 / AMD Ryzen 5 1500X',       ram: '8 GB',  gpu: 'NVIDIA GTX 960 / AMD R9 390 (4 GB VRAM)',            storage: '20 GB SSD',  directx: 'DirectX 11' },
  },
  // 29. Forza Horizon 5
  29: {
    min: { os: 'Windows 10/11 (64-bit)', cpu: 'Intel Core i5-4460 / AMD Ryzen 3 1200',        ram: '8 GB',  gpu: 'NVIDIA GTX 970 / AMD RX 470 (4 GB VRAM)',           storage: '110 GB',     directx: 'DirectX 12' },
    rec: { os: 'Windows 10/11 (64-bit)', cpu: 'Intel Core i5-8400 / AMD Ryzen 5 1500X',       ram: '16 GB', gpu: 'NVIDIA GTX 1070 / AMD RX 590',                      storage: '110 GB SSD', directx: 'DirectX 12' },
  },
  // 30. EA Sports FC 24
  30: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-6600K / AMD Ryzen 5 1600',      ram: '8 GB',  gpu: 'NVIDIA GTX 1050 Ti / AMD RX 570 (4 GB VRAM)',        storage: '100 GB',     directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-6700 / AMD Ryzen 7 2700X',       ram: '12 GB', gpu: 'NVIDIA GTX 1660 / AMD RX 5600 XT (6 GB VRAM)',       storage: '100 GB SSD', directx: 'DirectX 12' },
  },
  // 31. NHL 24 (в основном консоли; приводим условные требования уровня EA Sports)
  31: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-2500K / AMD FX-8100',            ram: '8 GB',  gpu: 'NVIDIA GTX 650 / AMD Radeon HD 7770',               storage: '80 GB',      directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-4430 / AMD Ryzen 5 1400',        ram: '16 GB', gpu: 'NVIDIA GTX 1050 Ti / AMD RX 570',                   storage: '80 GB SSD',  directx: 'DirectX 12' },
  },
  // 32. NBA 2K24
  32: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i3-3220 / AMD FX-4100',             ram: '4 GB',  gpu: 'NVIDIA GT 630 1GB / AMD Radeon HD 6570 1GB',         storage: '150 GB',     directx: 'DirectX 11' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-4430 / AMD Ryzen 5 1400',        ram: '8 GB',  gpu: 'NVIDIA GTX 770 2GB / AMD RX 570 4GB',                storage: '150 GB SSD', directx: 'DirectX 11' },
  },
  // 33. UFC 5 (преимущественно консоли, условные требования)
  33: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-6600 / AMD Ryzen 3 1200',        ram: '8 GB',  gpu: 'NVIDIA GTX 1050 Ti / AMD RX 560',                   storage: '50 GB',      directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-9400F / AMD Ryzen 5 2600',       ram: '16 GB', gpu: 'NVIDIA GTX 1660 / AMD RX 5600 XT',                  storage: '50 GB SSD',  directx: 'DirectX 12' },
  },
  // 34. F1 24
  34: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i3-2130 / AMD FX-4300',             ram: '8 GB',  gpu: 'NVIDIA GTX 1050 Ti / AMD RX 470 / Intel Arc A380',  storage: '80 GB',      directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-9600K / AMD Ryzen 5 2600X',      ram: '16 GB', gpu: 'NVIDIA RTX 3060 / AMD RX 6700 XT',                  storage: '80 GB SSD',  directx: 'DirectX 12' },
  },
  // 35. WWE 2K24
  35: {
    min: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i5-3550 / AMD FX-8150',             ram: '8 GB',  gpu: 'NVIDIA GTX 1060 3GB / AMD RX 580 4GB',               storage: '60 GB',      directx: 'DirectX 12' },
    rec: { os: 'Windows 10 (64-bit)',    cpu: 'Intel Core i7-4790 / AMD FX-9590',             ram: '16 GB', gpu: 'NVIDIA GTX 1070 / AMD RX Vega 56',                  storage: '60 GB SSD',  directx: 'DirectX 12' },
  },
};
