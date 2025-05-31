module.exports = {
  extends: [
    'eslint-config-turbo'
  ].map(require.resolve),
  rules: {
    'no-unused-vars': 'error',
    'no-console': 'warn'
  }
};