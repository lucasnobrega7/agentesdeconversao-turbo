/** @type {import("eslint").Linter.Config} */
export const nextJsConfig = {
  extends: [
    'turbo',
    'next/core-web-vitals'
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off'
  }
};