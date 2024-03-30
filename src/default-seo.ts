import type { Props as SEOProps } from 'astro-seo'

const defaultSEO: SEOProps = {
  titleDefault: "Angelo's Utils",
  titleTemplate: "%s | Angelo's Utils",

  description: 'A collection of utilities that I might find useful from time to time.',

  openGraph: {
    basic: {
      type: 'website',
      title: "Angelo's Utils",
      image: ''
    }
  },

  twitter: {
    card: 'summary_large_image',
    site: 'https://utils.angelo.fyi',
    image: 'https://utils.angelo.fyi/og.png'
  }
}

export default defaultSEO
