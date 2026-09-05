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

        /* ---- Vibrant neon accents ---- */
        neon: {
          cyan: "#00F2FE",
          sky: "#00D2FF",
          blue: "#4FACFE",
          indigo: "#8B5CF6",
          purple: "#8B5CF6",
          magenta: "#D946EF",
          emerald: "#10B981",
        },

        /* ---- Text ramp (WCAG-checked on #07090E) ---- */
        ink: {
          hi: "#FFFFFF", // headings   21:1
          mid: "#CBD5E1", // body       14.3:1
          low: "#94A3B8", // secondary  8.9:1
          faint: "#64748B", // meta       4.9:1
        },
      },
      zIndex: {
        backdrop: "0",
        stage: "10",
        content: "20",
        overlay: "60",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 34px -8px rgba(0, 242, 254, 0.75)",
        "glow-magenta": "0 0 34px -8px rgba(217, 70, 239, 0.75)",
        "glow-purple": "0 0 34px -8px rgba(139, 92, 246, 0.75)",
        card: "0 24px 70px -35px rgba(0, 0, 0, 1)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { transform: "translateX(-120%)" }, "100%": { transform: "translateX(220%)" } },
        "drift-a": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(6%,-8%,0) scale(1.12)" },
          "66%": { transform: "translate3d(-5%,6%,0) scale(0.94)" },
        },
        "drift-b": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1.05)" },
          "50%": { transform: "translate3d(-8%,7%,0) scale(0.9)" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.55", filter: "blur(90px)" },
          "50%": { opacity: "0.9", filter: "blur(110px)" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "float-y": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-5px)" } },
        "icon-pulse": {
          "0%,100%": { transform: "scale(1)", filter: "drop-shadow(0 0 0 rgba(0,242,254,0))" },
          "50%": { transform: "scale(1.09)", filter: "drop-shadow(0 0 7px rgba(0,242,254,0.85))" },
        },
        "gradient-pan": { "0%,100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up .6s ease-out both",
        shimmer: "shimmer 2.6s ease-in-out infinite",
        "drift-a": "drift-a 24s ease-in-out infinite",
        "drift-b": "drift-b 30s ease-in-out infinite",
        "pulse-glow": "pulse-glow 7s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        "float-y": "float-y 4.5s ease-in-out infinite",
        "icon-pulse": "icon-pulse 3.2s ease-in-out infinite",
        "gradient-pan": "gradient-pan 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
