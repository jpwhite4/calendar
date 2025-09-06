import js from "@eslint/js";
import stylistic from '@stylistic/eslint-plugin'
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    { 
        files: ["**/*.{js,mjs,cjs}"], 
        plugins: { js,  '@stylistic': stylistic },
        rules: { '@stylistic/indent': ['error', 4] },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.node }
    },
    { 
        files: ["**/*.js"], 
        languageOptions: { sourceType: "script" } 
    },
]);
