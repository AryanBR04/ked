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
        soft: "0 24px 60px -12px rgba(23, 23, 23, 0.08)",
        elevated: "0 32px 64px -16px rgba(23, 23, 23, 0.12)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        shimmer: "shimmer 2s infinite"
      }
    }
  },
  plugins: []
};

export default config;

