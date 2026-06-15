import type { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "24px", screens: { "2xl": "1200px" } },
    extend: {
      fontFamily: {
        sans: ["AmpleSoft", "Open Sans", "sans-serif"],
        display: ["AmpleSoft", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        brand: { red: "#E3000F", blue: "#0F1A2C", navy: "hsl(var(--brand-navy))", "navy-dark": "hsl(var(--brand-navy-dark))" },
        fb: { red: "#E3000F", "red-dark": "#C2000D", blue: "#0F1A2C", white: "#FFFFFF", "light-gray": "#F4F5F7", "mid-gray": "#E0E0E0", "dark-gray": "#333333", "slate-gray": "#666666", success: "#28A745", warning: "#FFC107", error: "#DC3545", info: "#17A2B8" },
      },
      borderRadius: { none: "0px", sm: "4px", md: "8px", lg: "16px", pill: "9999px", DEFAULT: "var(--radius)" },
      boxShadow: { "fb-sm": "0 2px 4px rgba(0,0,0,0.05)", "fb-md": "0 4px 8px rgba(0,0,0,0.10)", "fb-lg": "0 8px 16px rgba(0,0,0,0.15)", "fb-floating": "0 10px 30px rgba(0,0,0,0.20)" },
      keyframes: { "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } }, "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } } },
      animation: { "accordion-down": "accordion-down 0.2s ease-out", "accordion-up": "accordion-up 0.2s ease-out" },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
