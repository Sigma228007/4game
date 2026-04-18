import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Select({ value, onChange, options, icon: Icon, placeholder = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const current = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input text-left cursor-pointer flex items-center justify-between"
        style={{ paddingLeft: Icon ? '2.75rem' : '1rem', paddingRight: '2.5rem' }}
      >
        {Icon && (
          <Icon
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-faint)' }}
          />
        )}
        <span
          className="truncate font-body text-[14px]"
          style={{ color: current ? 'var(--text-secondary)' : 'var(--text-faint)' }}
        >
          {current ? current.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-faint)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 rounded-xl overflow-hidden py-1.5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--surface-border)',
              boxShadow: '0 20px 60px var(--shadow), 0 0 0 1px rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full px-4 py-2.5 text-left font-body text-[14px] flex items-center justify-between transition-colors group"
                  style={{
                    color: active ? 'var(--text)' : 'var(--text-muted)',
                    background: active ? 'var(--surface-hover)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{opt.label}</span>
                  {active && <Check size={14} className="text-primary" strokeWidth={2.5} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
