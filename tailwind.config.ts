import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { hot: "#ff2d95", gold: "#ffd27a", aqua: "#19c3dc", deep: "#06344d" },
      fontFamily: {
        sans: ["'Outfit Variable'", "system-ui", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
