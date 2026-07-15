/**
 * postcss.config.js
 * =================
 * Purpose:
 *   PostCSS pipeline configuration.
 *   PostCSS processes CSS through a chain of plugins before outputting
 *   the final stylesheet.
 *
 * Plugins:
 *   - tailwindcss: Scans source files and generates utility classes.
 *   - autoprefixer: Adds vendor prefixes (e.g. -webkit-) for browser compatibility.
 *     This is especially important for `backdrop-filter` (glassmorphism) which
 *     still requires `-webkit-backdrop-filter` in some browsers.
 */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
