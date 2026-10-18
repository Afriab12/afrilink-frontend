import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Phase 1A: 6-Layer Depth Surface System
        surface: {
          0: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
          4: "var(--surface-4)",
          5: "var(--surface-5)",
        },
        "surface-0": "var(--surface-0)",
        "surface-1": "var(--surface-1)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        "surface-4": "var(--surface-4)",
        "surface-5": "var(--surface-5)",
        afroDark: {
          DEFAULT: "#0B130E",
          surface: "#0F1A13",
          card: "#131F17",
          border: "#1F3327",
          text: "#F5F7F6",
        },
        afrilink: {
          green: {
            DEFAULT: "#087443",
            dark: "#065833",
            light: "#0e9357",
            subtle: "#e6f4ed",
          },
          gold: {
            DEFAULT: "#D9A441",
            dark: "#b8872b",
            light: "#e7bb5e",
            subtle: "#fdf8ee",
          },
          dark: {
            DEFAULT: "#111827",
            card: "#182235",
            border: "#243247",
          },
          neutral: {
            DEFAULT: "#F5F7F6",
            border: "#E2E8E5",
            muted: "#6B7280",
          },
        },
      },
      fontFamily: {
        sora: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(8, 116, 67, 0.06)",
        cardHover: "0 6px 20px rgba(8, 116, 67, 0.12)",
        goldGlow: "0 0 15px rgba(217, 164, 65, 0.35)",
      },
      keyframes: {
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.06' },
          '50%': { opacity: '0.12' },
        },
        'toast-enter': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-exit': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
        'toast-progress': {
          '0%': { transform: 'scaleX(1)' },
          '100%': { transform: 'scaleX(0)' },
        },
      },
      animation: {
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        'toast-enter': 'toast-enter 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-exit': 'toast-exit 200ms cubic-bezier(0.4, 0, 1, 1) forwards',
        'toast-progress': 'toast-progress linear forwards',
      },
    },
  },
  plugins: [],
};
export default config;
