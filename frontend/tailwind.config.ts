import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        sand: "#efe8da",
        moss: "#375046",
        clay: "#b35c3d",
        fog: "#f7f4ee"
      },
      boxShadow: {
        soft: "0 24px 60px rgba(23, 23, 23, 0.08)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

export default config;

