// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const typescriptParser = require("@typescript-eslint/parser");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const unusedImportsPlugin = require("eslint-plugin-unused-imports");

module.exports = defineConfig([
  ...expoConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "unused-imports": unusedImportsPlugin,
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      // Disable the base ESLint no-unused-vars rule
      "no-unused-vars": "off",

      // Enable TypeScript specific unused vars rule
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Enable unused imports detection and auto-fixing
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: ["dist/*", "node_modules/*", ".expo/*"],
  },
]);
