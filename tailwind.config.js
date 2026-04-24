/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // These resolve at runtime via CSS vars, so they flip with the theme automatically
        accent:          'var(--accent)',
        'accent-dim':    'var(--accent-dim)',
        'accent-border': 'var(--accent-border)',
      },
      fontFamily: {
        mono: ["'SF Mono'", "'Fira Code'", "'Cascadia Code'", 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(109,90,248,0.06)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
      },
    },
  },
  plugins: [],
};