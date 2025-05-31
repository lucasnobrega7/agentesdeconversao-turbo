module.exports = {
  extends: [
    'eslint-config-turbo',
    'eslint-config-next'
  ].map(require.resolve),
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off'
  }
};