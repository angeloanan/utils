import { defineConfig, squooshImageService } from 'astro/config'
import tailwind from '@astrojs/tailwind'

import solidJs from '@astrojs/solid-js'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
import robots from 'astro-robots'
import cloudflare from '@astrojs/cloudflare'

// https://astro.build/config
export default defineConfig({
  site: 'https://utils.angelo.fyi',
  prefetch: {
    prefetchAll: true
  },
  integrations: [solidJs(), tailwind(), sitemap(), robots()],
  output: 'hybrid',
  image: {
    service: squooshImageService()
  },
  adapter: cloudflare({
    imageService: 'compile'
  }),
  vite: {
    esbuild: {
      target: 'es2022'
    },
    build: {
      minify: 'terser',
      cssMinify: 'lightningcss',
      terserOptions: { compress: { passes: 2 } }
    }
  }
})
