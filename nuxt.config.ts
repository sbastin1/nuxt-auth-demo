// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@nuxt/eslint", "@nuxt/ui", "nuxt-auth-utils", "@nuxt/image"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    oauth: {
      // provider in lowercase (github, google, etc.)
      github: {
        clientId: "",
        clientSecret: "",
      },
    },
  },
  app: {
    head: {
      title: "Nuxt-Auth Demo",
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        {
          name: "description",
          content:
            "A demo of the nuxt-auth-utils library with DrizzleDB. Including TOTP, Passkeys, Rate Limiting etc.",
        },
      ],
    },
  },
});
