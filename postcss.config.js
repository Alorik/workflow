/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {}, // ✅ use this instead of "tailwindcss"
    autoprefixer: {},
  },
};
