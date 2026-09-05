import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff", 100: "#d9ecff", 200: "#bcdcff", 300: "#8ec6ff",
          400: "#59a5ff", 500: "#2f82ff", 600: "#1761f5", 700: "#104ce1",
          800: "#143fb6", 900: "#16398f", 950: "#0d2257",
        },
        ink: { 900: "#05070f", 800: "#0a0e1a", 700: "#111726", 600: "#1a2233" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        shimmer: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "fade-up": "fade-up .6s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
