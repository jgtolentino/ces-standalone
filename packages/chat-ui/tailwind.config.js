/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tbwa: {
          primary: '#00B5AD',      // TBWA turquoise
          'primary-10': '#E6FFFA', // 10% tint
          'primary-20': '#CCFFF5', // 20% tint
          secondary: '#333333',     // deep charcoal
          neutral: '#FAFAFA',       // light grey background
        },
      },
    },
  },
  plugins: [],
}