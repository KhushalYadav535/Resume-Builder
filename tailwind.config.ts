import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            DEFAULT: "#101B3B",
            light: "#1A2B5E",
            dark: "#0A1124",
          },
          amber: {
            DEFAULT: "#F59E0B",
            hover: "#D97706",
            light: "#FBBF24",
            soft: "rgba(245, 158, 11, 0.12)",
          },
        },
        uprole: {
          blue: {
            DEFAULT: "#2563EB",
            light: "#60A5FA",
            soft: "rgba(37, 99, 235, 0.12)",
          },
          teal: {
            DEFAULT: "#14B8A6",
            light: "#2DD4BF",
            soft: "rgba(20, 184, 166, 0.12)",
          },
          purple: {
            DEFAULT: "#7C3AED",
            light: "#A855F7",
            soft: "rgba(124, 58, 237, 0.12)",
          },
          neutral: "#F8F9FC",
        },
        discover: "#2563EB",
        develop: "#14B8A6",
        pursue: "#F59E0B",
        achieve: "#F59E0B",
        ai: "#7C3AED",
      },
    },
  },
  plugins: [],
};
export default config;
