import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import node from '@astrojs/node'

import solidJs from '@astrojs/solid-js'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
import robots from 'astro-robots'
import cloudflare from '@astrojs/cloudflare'

import metaTags from 'astro-meta-tags'

// https://astro.build/config
export default defineConfig({
  site: 'https://utils.angelo.fyi',
  prefetch: {
    prefetchAll: true
  },
  integrations: [solidJs({ devtools: import.meta.env.DEV }), sitemap(), robots(), metaTags()],
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile'
  }),
  // adapter: node({
  //   mode: 'standalone'
  // }),
  vite: {
    plugins: [tailwind()],
    esbuild: {
      target: 'es2022'
    },

    build: {
      sourcemap: import.meta.env.DEV,
      minify: 'terser',
      cssMinify: 'lightningcss',
      terserOptions: { compress: { passes: 2 } }
    }
  }
})
