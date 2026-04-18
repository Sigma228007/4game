// Декоративный постер-"персонаж" на краю страницы.
// objectPosition позволяет сдвинуть видимую часть изображения так, чтобы в кадр
// попал именно герой (лицо/фигура), а логотип/низ ушли под градиентную маску.
export default function PosterAccent({
  src,
  side = 'right',
  opacity = 0.6,
  top = 0,
  height = 700,
  width = 'min(40vw, 560px)',
  objectPosition = '50% 50%',
}) {
  const mask = side === 'right'
    ? 'linear-gradient(to left, black 0%, black 18%, transparent 90%)'
    : 'linear-gradient(to right, black 0%, black 18%, transparent 90%)';

  const sideStyle = side === 'right' ? { right: 0 } : { left: 0 };

  return (
    <div
      className="poster-accent absolute pointer-events-none hidden lg:block"
      aria-hidden="true"
      style={{
        ...sideStyle,
        top,
        width,
        height,
        opacity,
        zIndex: 0,
      }}
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover"
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          objectPosition,
        }}
      />
      {/* Верх и низ тоже растушёвываем, чтобы постер не рубил секции */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, var(--bg) 0%, transparent 12%, transparent 88%, var(--bg) 100%)',
        }}
      />
    </div>
  );
}
