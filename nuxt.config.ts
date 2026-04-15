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
          'src': '/stats/metrics.js',
          'defer': true,
          'data-website-id': 'f3e30d58-ab90-4749-b1e4-db6e83af12bb',
          'data-host-url': '/api/analytics'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/stats/**': { proxy: 'https://umami.yohannbethoule.com/**' },
    '/api/analytics/**': { proxy: 'https://umami.yohannbethoule.com/**' }
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
