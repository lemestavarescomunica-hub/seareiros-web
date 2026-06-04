import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D4764E",
          dark: "#B85A35",
          light: "#F0C4A8",
          50: "#FFF5EE",
          100: "#FFE8D6",
          200: "#F0C4A8",
          300: "#E8A87C",
          400: "#D4764E",
          500: "#B85A35",
          600: "#9C4528",
          700: "#7A351F",
          800: "#5C2817",
          900: "#3B1A0F",
        },
        secondary: {
          DEFAULT: "#5B8C5A",
          dark: "#3D6B3C",
          light: "#A8D5A7",
          50: "#F0F7F0",
          100: "#DCE9DC",
          200: "#A8D5A7",
          300: "#7BBF7A",
          400: "#5B8C5A",
          500: "#3D6B3C",
          600: "#2E5530",
          700: "#224024",
          800: "#172C18",
          900: "#0C190D",
        },
        accent: {
          DEFAULT: "#E8C547",
          dark: "#C9A825",
          light: "#F5E6A3",
        },
        background: "#FFF9F2",
        surface: "#FFFFFF",
        text: {
          primary: "#3B2F2F",
          secondary: "#7A6B6B",
        },
        border: "#E8DDD5",
        success: "#2E7D32",
        warning: "#F57F17",
        error: "#C62828",
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        xl2: "20px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(59, 47, 47, 0.08)",
        "card-hover": "0 4px 16px rgba(59, 47, 47, 0.12)",
        "card-md": "0 4px 12px rgba(59, 47, 47, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
