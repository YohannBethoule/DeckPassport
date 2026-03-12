// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/image'],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      script: [
        {
          'src': '/stats/script.js',
          'defer': true,
          'data-website-id': '4435c17c-b344-4038-8d08-9537caaf234e',
          'data-host-url': '/api/analytics'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/stats/**': { proxy: 'https://cloud.umami.is/**' },
    '/api/analytics/**': { proxy: 'https://api-gateway.umami.dev/**' }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
