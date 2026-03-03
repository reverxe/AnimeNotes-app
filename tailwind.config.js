/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mal: {
          // switched from MAL blue to a warm crimson palette for the new MyAnimeNote branding
          primary: '#DC143C',   // crimson
          secondary: '#A50E2E'  // deeper red for hover/gradient
        }
      }
    },
  },
  plugins: [],
}
