import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  globalIgnores(['components/ui/**', '.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
]);
