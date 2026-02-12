import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierConfig from "eslint-config-prettier";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default [
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "dist/**", "public/**"],
  },
  eslint.configs.recommended,
  ...pluginQuery.configs["flat/recommended"],
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "@tanstack/query/exhaustive-deps": "warn",
    },
  },
  prettierConfig,
];
