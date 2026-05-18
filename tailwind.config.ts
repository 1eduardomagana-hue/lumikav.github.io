import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        estate: { green: '#12372a', deep: '#071f1a', gold: '#c9a45c', cream: '#f7f1e6', charcoal: '#1f2523' }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'Arial', 'sans-serif']
      },
      boxShadow: { premium: '0 24px 80px rgba(7, 31, 26, 0.18)' }
    }
  },
  plugins: []
};
export default config;
