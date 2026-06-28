import globals from 'globals';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'no-throw-literal': 'error',
    },
  },
  {
    ignores: ['node_modules/', 'coverage/'],
  },
];
