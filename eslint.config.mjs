import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextCoreWebVitals,
  globalIgnores([".next/**", ".next-build/**", "out/**", "build/**", "next-env.d.ts"]),

  /**
   * React Compiler rules, scoped to the WebGL scenes only.
   *
   * These files mutate three.js objects inside `useFrame`, which runs on the
   * render loop rather than during React render — the compiler cannot see
   * that and flags it as impurity/mutation. `Math.random()` inside `useMemo`
   * is likewise deliberate: the particle field is randomised once on mount.
   * Scoped to these paths so the rules keep protecting the rest of the app.
   */
  {
    files: ["components/ui/scene-3d.tsx", "components/public/hero-orb.tsx"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
]);
