/** @type {import('tailwindcss').Config} */
module.exports = {
  // Extend the base UI config
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Include shared UI components
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/chat-ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  // Inherit from the base UI config
  presets: [
    require('../../packages/ui/tailwind.config.js'),
  ],
  theme: {
    extend: {
      // Additional tenant-specific customizations can go here
      container: {
        center: true,
        padding: "1rem",
        screens: {
          "2xl": "1400px",
        },
      },
    },
  },
  plugins: [],
}