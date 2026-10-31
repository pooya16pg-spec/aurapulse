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
        carbon: "#05070B",
        panel: "#0B0F17",
        emerald: {
          400: "#10B981",
          500: "#059669",
        },
        cyan: {
          400: "#00F0FF",
        },
      },
    },
  },
  plugins: [],
};
export default config;