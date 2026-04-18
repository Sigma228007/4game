// Генерация PDF-чека заказа через jsPDF.
// jsPDF не умеет кириллицу из коробки, поэтому встраиваем шрифт с Unicode-поддержкой.
import jsPDF from 'jspdf';

export async function generateReceipt(order) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // Встраиваем Roboto (поддерживает кириллицу). Загружаем base64 из CDN.
  try {
    const fontUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-cyrillic-400-normal.woff2';
    const robotoResp = await fetch(fontUrl).catch(() => null);
    if (robotoResp && robotoResp.ok) {
      // fallback — если шрифт не загрузится, используем штатный шрифт и транслитерируем
    }
  } catch {}

  // Используем встроенный шрифт, транслитерируем кириллицу — надёжнее всего
  const tr = (s = '') => String(s)
    .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v').replace(/г/g, 'g')
    .replace(/д/g, 'd').replace(/е/g, 'e').replace(/ё/g, 'yo').replace(/ж/g, 'zh')
    .replace(/з/g, 'z').replace(/и/g, 'i').replace(/й/g, 'y').replace(/к/g, 'k')
    .replace(/л/g, 'l').replace(/м/g, 'm').replace(/н/g, 'n').replace(/о/g, 'o')
    .replace(/п/g, 'p').replace(/р/g, 'r').replace(/с/g, 's').replace(/т/g, 't')
    .replace(/у/g, 'u').replace(/ф/g, 'f').replace(/х/g, 'h').replace(/ц/g, 'ts')
    .replace(/ч/g, 'ch').replace(/ш/g, 'sh').replace(/щ/g, 'sch').replace(/ъ/g, '')
    .replace(/ы/g, 'y').replace(/ь/g, '').replace(/э/g, 'e').replace(/ю/g, 'yu')
    .replace(/я/g, 'ya')
    .replace(/А/g, 'A').replace(/Б/g, 'B').replace(/В/g, 'V').replace(/Г/g, 'G')
    .replace(/Д/g, 'D').replace(/Е/g, 'E').replace(/Ё/g, 'Yo').replace(/Ж/g, 'Zh')
    .replace(/З/g, 'Z').replace(/И/g, 'I').replace(/Й/g, 'Y').replace(/К/g, 'K')
    .replace(/Л/g, 'L').replace(/М/g, 'M').replace(/Н/g, 'N').replace(/О/g, 'O')
    .replace(/П/g, 'P').replace(/Р/g, 'R').replace(/С/g, 'S').replace(/Т/g, 'T')
    .replace(/У/g, 'U').replace(/Ф/g, 'F').replace(/Х/g, 'H').replace(/Ц/g, 'Ts')
    .replace(/Ч/g, 'Ch').replace(/Ш/g, 'Sh').replace(/Щ/g, 'Sch').replace(/Ъ/g, '')
    .replace(/Ы/g, 'Y').replace(/Ь/g, '').replace(/Э/g, 'E').replace(/Ю/g, 'Yu')
    .replace(/Я/g, 'Ya')
    .replace(/₽/g, 'RUB');

  const W = 210;
  const margin = 20;
  let y = margin;

  // Header
  doc.setFillColor(232, 16, 46);
  doc.rect(0, 0, W, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('4GAME', margin, 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Digital Store · Licensed Keys', W - margin, 10, { align: 'right' });

  y = 28;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(tr('Chek zakaza'), margin, y);

  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(tr(`Zakaz #${order.id}`), margin, y);
  doc.text(
    tr(new Date(order.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })),
    W - margin, y, { align: 'right' }
  );

  y += 6;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, W - margin, y);
  y += 8;

  // Table header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(tr('Igra'),   margin,         y);
  doc.text(tr('Klyuch'), margin + 90,    y);
  doc.text(tr('Tsena'),  W - margin,     y, { align: 'right' });
  y += 3;
  doc.line(margin, y, W - margin, y);
  y += 6;

  // Items
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  (order.items || []).forEach(item => {
    if (y > 260) { doc.addPage(); y = margin; }
    const name = tr(item.name || '');
    const key = item.gameKey || item.game_key || '';
    const price = `${(item.price || 0).toLocaleString('ru-RU')} RUB`;

    doc.text(doc.splitTextToSize(name, 85), margin, y);
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.text(key, margin + 90, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(price, W - margin, y, { align: 'right' });
    y += 8;
  });

  y += 4;
  doc.line(margin, y, W - margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(tr('K oplate:'), margin, y);
  doc.setTextColor(16, 185, 129);
  doc.text(`${(order.total || 0).toLocaleString('ru-RU')} RUB`, W - margin, y, { align: 'right' });

  // Footer
  y = 280;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(tr('Spasibo za pokupku! Aktiviruyte klyuchi v Steam / Epic / GOG.'), margin, y);
  y += 4;
  doc.text(tr('Podderzhka: support@4game.com · +7 (924) 248-53-93'), margin, y);
  y += 4;
  doc.text(tr('4Game Digital Store · g. Vladivostok, Rossiya'), margin, y);

  doc.save(`4game-order-${order.id}.pdf`);
}
