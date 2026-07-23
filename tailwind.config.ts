import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#F3F7FC",
        panel: "#FFFFFF",
        line: "#D7E1EE",
        mist: "#667085",
        glow: "#1877F2",
        paper: "#1F2937",
        soft: "#4B5563",
        row: "#EEF5FF",
        thumb: "#E7F0FA",
      },
    },
  },
  plugins: [],
};

export default config;
