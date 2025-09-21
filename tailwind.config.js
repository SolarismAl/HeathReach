/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          patient: '#2196F3',
          'health-worker': '#4CAF50',
          admin: '#D32F2F',
        },
        secondary: {
          light: '#F8F9FA',
          dark: '#333333',
        },
      },
    },
  },
  plugins: [],
};
