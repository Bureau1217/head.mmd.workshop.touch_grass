export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/__main.scss'],
  modules: [
    '@nuxt/content',
  ],
  content: {
    renderer: {
      anchorLinks: false,
    },
  },
  nitro: {
    preset: 'github-pages',
    output: {
      publicDir: 'docs',
    },
  },
})
