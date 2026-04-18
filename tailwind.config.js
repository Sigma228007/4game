/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#E8102E', light: '#FF2D4A', dark: '#B50D24' },
        secondary: { DEFAULT: '#9333EA', light: '#A855F7' },
        accent: { DEFAULT: '#10B981', light: '#34D399' },
        // Theme-aware colors via CSS vars
        bg: {
          DEFAULT: 'var(--bg)',
          secondary: 'var(--bg-secondary)',
          elevated: 'var(--bg-elevated)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
          border: 'var(--surface-border)',
        },
        txt: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          faint: 'var(--text-faint)',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        body: ['Exo 2', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        glow: { '0%': { opacity: '0.4' }, '100%': { opacity: '0.7' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 20px -3px rgba(232,16,46,0.25)',
        'glow-md': '0 0 40px -5px rgba(232,16,46,0.35)',
      },
    },
  },
  plugins: [],
}
