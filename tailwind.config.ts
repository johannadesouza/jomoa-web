import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // JOMOA Brand Colors
        "soft-pink": "#FFFBF7",
        terracotta: "#D96D46",
        sand: "#FEE7AB",
        plum: "#462324",
        mauve: "#BA8E90",
        "pink-light": "#F0D6D7",
        "mauve-dark": "#976568",
        "terracotta-light": "#FDB499",
        // JOMOA Premium Colors
        sage: "#5A6B5D",
        cream: "#FEFCF8",
        "text-primary": "#5A6B5D",
        "text-muted": "rgba(90, 107, 93, 0.7)",
        "text-muted-light": "rgba(90, 107, 93, 0.6)",
        accent: {
          DEFAULT: "#8B6F47",
          hover: "#7A5F3D",
        },
        "accent-hover": "#7A5F3D",
        "border-soft": "rgba(232, 229, 224, 0.4)",
        // shadcn/ui colors (using CSS variables)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        card: "20px",
        hero: "24px",
        large: "28px",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0, 0, 0, 0.04)",
        medium: "0 4px 20px rgba(0, 0, 0, 0.08)",
        large: "0 8px 32px rgba(0, 0, 0, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        "league-spartan": ["var(--font-league-spartan)", "system-ui", "-apple-system", "sans-serif"],
        "the-seasons": ["var(--font-the-seasons)", "Georgia", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

