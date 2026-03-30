import type { Config } from "tailwindcss";

const config: Config = {
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
        gold: {
          DEFAULT: "#C9A84C",
          dark: "#B8942E",
          light: "#e8d48b",
        },
        navy: {
          DEFAULT: "#1B2A4A",
          light: "#2a3f6a",
          dark: "#0c1220",
        },
        cream: {
          DEFAULT: "#FAF7F0",
          dark: "#f3f0e8",
        },
        surface: "var(--surface)",
        "surface-alt": "var(--surface-alt)",
        border: "var(--border)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "card-bg": "var(--card-bg)",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px var(--card-shadow)",
        "card-hover": "0 8px 24px var(--card-shadow)",
      },
    },
  },
  plugins: [],
};
export default config;
