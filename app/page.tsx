@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
}
body { min-height: 100vh; background: #f7f1e6; color: #1f2523; font-family: var(--font-sans); }
input, textarea, select { outline: none; }
@layer components {
  .field-label { @apply text-xs font-semibold uppercase tracking-[0.18em] text-estate-green/70; }
  .field-input { @apply w-full rounded-2xl border border-estate-green/15 bg-white/80 px-4 py-3 text-sm text-estate-charcoal shadow-sm transition focus:border-estate-gold focus:ring-2 focus:ring-estate-gold/20; }
  .premium-card { @apply rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-premium backdrop-blur; }
  .gold-button { @apply inline-flex items-center justify-center gap-2 rounded-full bg-estate-gold px-5 py-3 text-sm font-bold text-estate-deep transition hover:bg-[#b68f44] disabled:cursor-not-allowed disabled:opacity-50; }
  .green-button { @apply inline-flex items-center justify-center gap-2 rounded-full bg-estate-green px-5 py-3 text-sm font-bold text-white transition hover:bg-estate-deep disabled:cursor-not-allowed disabled:opacity-50; }
  .ghost-button { @apply inline-flex items-center justify-center gap-2 rounded-full border border-estate-green/20 px-4 py-2 text-sm font-semibold text-estate-green transition hover:border-estate-gold hover:text-estate-deep disabled:cursor-not-allowed disabled:opacity-50; }
}
