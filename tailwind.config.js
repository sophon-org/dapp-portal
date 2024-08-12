/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./views/**/*.vue",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./utils/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "2px 4px 12px rgba(0, 0, 0, 0.04)",
        "inner-glow": "inset 0 0 7px #ffffff90",
      },
      colors: {
        black: "#131313",
        blue: "#0071e3",
        "blue-lightest": "#f5f5f7",
        gray: "#6e6e73",
        "gray-2": "#888",
        secondary: "#0071e3",
        "error-red": "#ff4f00",
        error: {
          300: "#f66",
          500: "#f00",
        },
        warning: {
          400: "#ffc81a",
          600: "#e5af00",
        },
        success: {
          400: "#3f9",
          600: "#0c6",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
        ],
      },
      fontSize: {
        "2xs": "0.5rem",
      },
      spacing: {
        "block-padding": "32px",
        "block-padding-1/2": "16px",
        "block-padding-1/4": "8px",
        "block-gap": "24px",
        "block-gap-2/3": "16px",
        "block-gap-1/2": "12px",
      },
    },
    screens: {
      xxs: "320px",
      xs: "480px",
      sm: "640px",
      md: "720px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1920px",
    },
  },
  plugins: [
    plugin(function ({ addBase, addUtilities, theme }) {
      addBase({
        ".h1": {
          fontSize: "36px",
          fontWeight: "400",
          lineHeight: "1.15",
          marginBottom: theme("spacing.block-gap-2/3"),
        },
        "@screen sm": {
          ".h1": {
            fontSize: "40px",
            lineHeight: "1.4",
            marginBottom: theme("spacing.block-gap"),
          },
        },
        ".h2": {
          fontSize: "26px",
          fontWeight: theme("fontWeight.bold"),
          lineHeight: theme("lineHeight.tight"),
          paddingTop: theme("padding.5"),
        },
      });
      addUtilities({
        ".wrap-balance": {
          textWrap: "balance",
        },
      });
    }),
  ],
};
