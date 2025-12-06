import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0046be',
        secondary: '#003494',
        accent: '#ffef02',
        text: '#313a4b',
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial'],
        heading: ['Helvetica', 'Arial'],
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    // line-clamp plugin removed; included by default in Tailwind 3.3+
  ],
}
export default config 