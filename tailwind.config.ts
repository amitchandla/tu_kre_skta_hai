import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        paper: "#FAFAF8",
        brand: {
          50: "#EEF4FF",
          100: "#D9E6FF",
          400: "#3E6AE1",
          500: "#2A4FCB",
          600: "#1F3EA6",
          700: "#16307F",
        },
        accent: {
          400: "#12B886",
          500: "#0E9E73",
        },
        warn: "#D97706",
        danger: "#DC2626",
        line: "#E4E4E1",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
