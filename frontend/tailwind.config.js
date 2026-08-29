/** @type {import('tailwindcss').Config} */
export default {
  content: [
<<<<<<< Updated upstream
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
=======
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/*.{js,ts,jsx,tsx,mdx}",
>>>>>>> Stashed changes
  ],
  theme: {
<<<<<<< Updated upstream
    extend: {},
=======
    extend: {
      colors: {
        // Run-sheet paper (base background)
        paper: '#f7f3ea',
        // Ink navy (primary text)
        ink: '#142433',
        // Scrub green (success, stable)
        scrub: '#cfe5da',
        // Paramedic blue (primary action, trust)
        paramedic: '#245b73',
        // Triage red (critical, alert)
        triage: '#c84a3d',
        // Monitor amber (warning, active)
        monitor: '#d99a32',
        // Muted slate
        muted: '#64717c',
        // Borders
        border: '#ddd4c4',
        'border-strong': '#d8d0c0',
        // Card surface
        card: '#fbf8f0',
      },
      fontFamily: {
        display: ['Archivo Narrow', 'IBM Plex Sans Condensed', 'sans-serif'],
        body: ['Atkinson Hyperlegible', 'Source Sans 3', 'sans-serif'],
        data: ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ripple': 'ripple 2.5s ease-out infinite',
        'lifeline-pulse': 'lifeline-pulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'lifeline-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 4px rgba(217, 154, 50, 0.2)' },
          '50%': { boxShadow: '0 0 0 8px rgba(217, 154, 50, 0)' },
        },
      },
    },
>>>>>>> Stashed changes
  },
  plugins: [],
}
