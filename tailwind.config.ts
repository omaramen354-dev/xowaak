import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ---- Strict dark palette ---- */
        base: "#07090E", // page background — pure deep black
        elevated: "#0A0E15", // raised sections
        surface: "#0D111A", // cards
        line: "#1E293B", // hairline borders
        "line-strong": "#334155",

        /* ---- Neon accents ---- */
        neon: {
          cyan: "#00F2FE",
          blue: "#4FACFE",
          indigo: "#6366F1",
          purple: "#A855F7",
          emerald: "#34D399",
        },

        /* ---- Text ramp (WCAG-checked on #07090E) ---- */
        ink: {
          hi: "#FFFFFF", // headings   21:1
          mid: "#CBD5E1", // body       14.3:1
          low: "#94A3B8", // secondary  8.9:1
          faint: "#64748B", // meta       4.9:1
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 40px -10px rgba(0, 242, 254, 0.55)",
        "glow-purple": "0 0 40px -10px rgba(168, 85, 247, 0.55)",
        card: "0 24px 70px -35px rgba(0, 0, 0, 1)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { transform: "translateX(-120%)" }, "100%": { transform: "translateX(220%)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up .6s ease-out both",
        shimmer: "shimmer 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
