import { portal as portalMeta } from "./data/meta";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
        },
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
          content: "2400",
        },
        {
          property: "og:image:height",
          content: "1260",
        },
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
      ["NODE_TYPE", "WALLET_CONNECT_PROJECT_ID", "ANKR_TOKEN", "SCREENING_API_URL", "RUDDER_KEY", "DATAPLANE_URL"].map(
        (key) => [`process.env.${key}`, JSON.stringify(process.env[key])]
      )
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
});
