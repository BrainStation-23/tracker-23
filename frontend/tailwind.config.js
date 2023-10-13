/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1D1D1D",
        secondary: "#7E7E7E",
        third: "#E7E7E7",
        thirdLight: "#F9F9F9",
      },
    },
  },
  plugins: [],
};
