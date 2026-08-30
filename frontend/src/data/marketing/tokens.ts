/**
 * Marketing Website Design Tokens (Source of Truth)
 * Conforms to Level 1 of the Responsive & Light Theme Build Process.
 */

export const DESIGN_TOKENS = {
  // Breakpoint definitions (as reference guidelines)
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1440px',
    large: '1920px',
  },

  // Color theme classes (Tailwind utility mappings for 100% Light Theme)
  colors: {
    bg: 'bg-[#F8FAFC]',
    surface: 'bg-white border border-slate-200 shadow-sm shadow-slate-100',
    border: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textMuted: 'text-slate-600',
    accentCyan: 'text-cyan-600',
    accentRose: 'text-rose-600',
    accentEmerald: 'text-emerald-600',
  },

  // Spacing scales mapping pixels to Tailwind styles
  spacing: {
    xs: '4px',    // Tailwind equivalent: 1 (4px) / space-1 / p-1
    sm: '8px',    // Tailwind equivalent: 2 (8px) / space-2 / p-2
    md: '12px',   // Tailwind equivalent: 3 (12px) / space-3 / p-3
    lg: '16px',   // Tailwind equivalent: 4 (16px) / space-4 / p-4
    xl: '24px',   // Tailwind equivalent: 6 (24px) / space-6 / p-6
    xxl: '32px',  // Tailwind equivalent: 8 (32px) / space-8 / p-8
    xxxl: '48px', // Tailwind equivalent: 12 (48px) / space-12 / p-12
    huge: '64px', // Tailwind equivalent: 16 (64px) / space-16 / p-16
  },

  // Fluid typography scale clamp templates
  typography: {
    // Scales fluidly from 2rem (32px) at 375px viewport to 4.5rem (72px) at 1440px viewport
    heroTitle: 'clamp(2rem, 3.5vw + 1.2rem, 4.5rem)',
    
    // Scales fluidly from 1.5rem (24px) at 375px viewport to 3rem (48px) at 1440px viewport
    sectionTitle: 'clamp(1.5rem, 2.5vw + 1rem, 3rem)',
    
    // Scales fluidly from 0.95rem (15px) to 1.15rem (18px)
    bodyCopy: 'clamp(0.95rem, 0.5vw + 0.8rem, 1.15rem)',
  }
};
