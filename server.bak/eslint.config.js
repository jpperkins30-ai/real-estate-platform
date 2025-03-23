// eslint.config.js
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    ignores: ['node_modules/**', 'dist/**'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Override the interface-name rule to not force 'I' prefix
      '@typescript-eslint/interface-name-prefix': 'off',
      // Allow explicit any type
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unused vars with _ prefix
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_' 
      }],
      // Allow function expressions
      'func-style': 'off',
      // Enforce consistent return types
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Other custom rules
      'no-console': 'warn',
    },
  }
); 