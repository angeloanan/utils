/** @type {import('tailwindcss/types').Config} */
const extendedTheme = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {},
  plugins: [import('@tailwindcss/forms')]
}

export default extendedTheme
