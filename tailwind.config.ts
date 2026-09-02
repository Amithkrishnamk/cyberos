import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "var(--cyber-bg)",
          surface: "var(--cyber-surface)",
          border: "var(--cyber-border)",
          accent: "var(--cyber-accent)",
          accentGlow: "var(--cyber-accent-glow)",
          muted: "var(--cyber-muted)",
          text: "var(--cyber-text)",
          heading: "var(--cyber-heading)",
        },
      },
      fontFamily: {
        mono: ["Consolas", "Monaco", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
