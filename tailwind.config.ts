import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        mint: {
          50: "#D2FEF4",
          100: "#CDF8EE",
          200: "#C7F3E9",
          300: "#B9E4DA",
          400: "#96C0B7",
          500: "#79A299",
          600: "#517870",
          700: "#3D645C",
          800: "#1E453E",
          900: "#00241E",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
