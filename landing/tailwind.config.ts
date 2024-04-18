import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        main: "#CC5A3C",
        "gray-dark": "#273444",
        "custom-blue": "#020055",
      },
      boxShadow: {
        custom: "rgba(13, 38, 76, 0.19) 0px 9px 20px",
      },
    },
  },
  plugins: [],
};
export default config;
