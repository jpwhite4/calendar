import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], 
    settings: { "react": { "version": "detect" } },
    plugins: { js,       '@stylistic': stylistic }, extends: ["js/recommended"],
    rules: { 'indent': ['error', 2], 'no-unused-vars': 'off' },
    languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);
