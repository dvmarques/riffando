import { defineConfig } from 'eslint/config';
import expo from 'eslint-config-expo/flat.js';
import architecture from './scripts/eslint-architecture.mjs';
export default defineConfig([
  expo,
  { ignores: ['android/**', 'ios/**', 'dist/**', '.expo/**', 'coverage/**', 'artifacts/**', 'node_modules/**'] },
  { files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'], plugins: { architecture }, rules: {
    'architecture/boundaries': 'error', 'import/no-cycle': 'error', '@typescript-eslint/no-explicit-any': 'error',
  } },
]);
