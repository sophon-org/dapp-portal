import { portal as portalMeta } from "./data/meta";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "icon", type: "image/png", href: "/favicon-logo@1x.png", sizes: "16x16" },
        { rel: "icon", type: "image/png", href: "/favicon-logo@2x.png", sizes: "32x32" },
        { rel: "icon", type: "image/png", href: "/favicon-logo@3x.png", sizes: "48x48" },
        { rel: "icon", type: "image/png", href: "/favicon-logo@4x.png", sizes: "64x64" },
      ],
      meta: [
        {
          property: "og:image",
          content: portalMeta.previewImg.src,
        },
        {
          property: "og:image:alt",
          content: portalMeta.previewImg.alt,
        },
        {
          property: "og:image:type",
          content: "image/jpeg",
        },
        {
          property: "og:image:width",
          content: "1200",
        },
        {
          property: "og:image:height",
          content: "675",
        },
      ],
      script: [
        {
          src: "/config.js",
        },
        process.env.RUDDER_KEY
          ? {
              hid: "Rudder-JS",
              src: "https://cdn.rudderlabs.com/v1.1/rudder-analytics.min.js",
              defer: true,
            }
          : undefined,
      ],
    },
  },

  plugins: [],

  modules: [
    "@kevinmarrec/nuxt-pwa",
    "@pinia/nuxt", // https://pinia.vuejs.org/ssr/nuxt.html
    "@nuxtjs/eslint-module", // https://nuxt.com/modules/eslint
    "@nuxtjs/tailwindcss", // https://nuxt.com/modules/tailwindcss
  ],

  css: ["@/assets/css/tailwind.css", "@/assets/css/style.scss", "web3-avatar-vue/dist/style.css"],
  ssr: false,
  nitro: {
    preset: "static",
    output: {
      publicDir: "dist",
    },
  },

  pinia: {
    storesDirs: ["./store/**"],
  },

  pwa: {
    meta: {
      name: portalMeta.title,
      description: portalMeta.description,
    },
    manifest: {
      name: portalMeta.title,
      short_name: "Portal",
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  vite: {
    // Make listed envs public and accessible in the runtime
    define: Object.fromEntries(
      [
        "NODE_TYPE",
        "WALLET_CONNECT_PROJECT_ID",
        "ALCHEMY_API_KEY",
        "SCREENING_API_URL",
        "RUDDER_KEY",
        "DATAPLANE_URL",
      ].map((key) => [`process.env.${key}`, JSON.stringify(process.env[key])])
    ),
    css: {
      preprocessorOptions: {
        scss: {
          // eslint-disable-next-line quotes
          additionalData: '@use "@/assets/css/_mixins.scss" as *;',
        },
      },
    },
  },

  devtools: { enabled: true },
  nitro: {
    preset: "static",
    output: {
      publicDir: "dist",
    },
    routeRules: {
      "/**": {
        headers: {
          // Prevents site from being embedded within frames/iframes on other domains
          "Content-Security-Policy": "frame-ancestors 'none';",

          // Prevents site from being displayed in frames/iframes (legacy header)
          "X-Frame-Options": "DENY",

          // Prevents MIME type sniffing which could lead to security vulnerabilities
          "X-Content-Type-Options": "nosniff",

          // Controls how much referrer information is included with requests
          "Referrer-Policy": "strict-origin-when-cross-origin",

          // Restricts which browser features and APIs the site can use
          "Permissions-Policy": "camera=(), microphone=(), geolocation=()",

          // Forces browsers to use HTTPS for all future requests
          // max-age is set to 1 year, includes all subdomains
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        },
      },
    },
  },
});
