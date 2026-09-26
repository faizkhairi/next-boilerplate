import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Flat ESLint config (ESLint 10 requires flat config; the old .eslintrc.json
 * format and `next lint` are both gone as of Next.js 16). `eslint-config-next`
 * ships ready-to-use flat config arrays, so no compatibility shim is needed.
 */
const eslintConfig = [...nextCoreWebVitals, ...nextTypescript];

export default eslintConfig;
