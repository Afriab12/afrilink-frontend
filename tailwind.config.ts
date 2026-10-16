import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
    },
  },
  plugins: [],
};
export default config;
