import { useEffect } from 'react';

const DEFAULTS = {
  title: '4Game — Магазин лицензионных игр для ПК | Ключи Steam, Epic, GOG',
  description: '4Game — магазин цифровых игр. Лицензионные ключи для Steam, Epic Games и GOG. Мгновенная выдача на email, цены ниже официальных магазинов, живая поддержка 24/7.',
};

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

export function useSEO({ title, description, path } = {}) {
  useEffect(() => {
    const finalTitle = title ? `${title} | 4Game` : DEFAULTS.title;
    const finalDesc = (description || DEFAULTS.description).slice(0, 160);

    document.title = finalTitle.slice(0, 60);
    setMeta('description', finalDesc);

    if (path) setCanonical(`https://4game.store${path}`);

    return () => {
      document.title = DEFAULTS.title;
      setMeta('description', DEFAULTS.description);
    };
  }, [title, description, path]);
}
