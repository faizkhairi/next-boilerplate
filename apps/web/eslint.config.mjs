import { globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Flat ESLint config (ESLint 9 defaults to flat config, and `next lint` is
 * gone as of Next.js 16). `eslint-config-next` ships ready-to-use flat config
 * arrays, so no compatibility shim is needed.
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  // Generated test reports, not source.
  globalIgnores(["coverage/**", "playwright-report/**", "test-results/**"]),
];

export default eslintConfig;
