import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Vercel-design ink palette
        ink: {
          DEFAULT: "#171717",
          body: "#4d4d4d",
          mute: "#888888",
        },
        // Vercel-design canvas palette
        canvas: {
          DEFAULT: "#ffffff",
          soft: "#fafafa",
          "soft-2": "#f5f5f5",
        },
        // Vercel-design hairline
        hairline: {
          DEFAULT: "#ebebeb",
          strong: "#a1a1a1",
        },
        // Vercel-design link
        link: {
          DEFAULT: "#0070f3",
          deep: "#0761d1",
          "bg-soft": "#d3e5ff",
        },
        // Brand gradient colors
        mesh: {
          cyan: "#50e3c2",
          blue: "#007cf0",
          magenta: "#ff0080",
          violet: "#7928ca",
          amber: "#f9cb28",
          teal: "#00dfd8",
        },
        // Semantic
        success: "#0070f3",
        error: {
          DEFAULT: "#ee0000",
          soft: "#f7d4d6",
          deep: "#c50000",
        },
        warning: {
          DEFAULT: "#f5a623",
          soft: "#ffefcf",
          deep: "#ab570a",
        },
        // Brand accent helpers
        "highlight-pink": "#ff0080",
        "highlight-magenta": "#eb367f",
        "gradient-develop-start": "#007cf0",
        "gradient-develop-end": "#00dfd8",
        "gradient-preview-start": "#7928ca",
        "gradient-preview-end": "#ff0080",
        "gradient-ship-start": "#ff4d4d",
        "gradient-ship-end": "#f9cb28",
      },
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "pill-sm": "64px",
        pill: "100px",
        full: "9999px",
      },
      fontFamily: {
        display: [
          "Geist",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        sans: [
          "Geist",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "Geist Mono",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "monospace",
        ],
      },
      fontSize: {
        // Vercel display typography scale
        "display-xl": [
          "48px",
          { lineHeight: "48px", fontWeight: "600", letterSpacing: "-2.4px" },
        ],
        "display-lg": [
          "32px",
          { lineHeight: "40px", fontWeight: "600", letterSpacing: "-1.28px" },
        ],
        "display-md": [
          "24px",
          { lineHeight: "32px", fontWeight: "600", letterSpacing: "-0.96px" },
        ],
        "display-sm": [
          "20px",
          { lineHeight: "28px", fontWeight: "600", letterSpacing: "-0.6px" },
        ],
        // Vercel body scale
        "body-lg": [
          "18px",
          { lineHeight: "28px", fontWeight: "400", letterSpacing: "0px" },
        ],
        "body-md": [
          "16px",
          { lineHeight: "24px", fontWeight: "400" },
        ],
        "body-md-strong": [
          "16px",
          { lineHeight: "24px", fontWeight: "500" },
        ],
        "body-sm": [
          "14px",
          { lineHeight: "20px", fontWeight: "400", letterSpacing: "-0.28px" },
        ],
        "body-sm-strong": [
          "14px",
          { lineHeight: "20px", fontWeight: "500", letterSpacing: "-0.28px" },
        ],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "caption-mono": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "400",
          },
        ],
        code: [
          "13px",
          {
            lineHeight: "20px",
            fontWeight: "400",
          },
        ],
        "button-md": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "button-lg": ["16px", { lineHeight: "24px", fontWeight: "500" }],
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "40px",
        "3xl": "48px",
        "4xl": "64px",
        "5xl": "96px",
        "6xl": "128px",
        section: "192px",
      },
      boxShadow: {
        // Vercel stacked shadow system
        "level-1": "0 0 0 1px #00000014",
        "level-2":
          "0px 1px 1px #00000005, 0px 2px 2px #0000000a, 0 0 0 1px #00000014",
        "level-3":
          "0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a, 0 0 0 1px #00000014",
        "level-4":
          "0px 2px 2px #0000000a, 0px 8px 16px -4px #0000000a, 0 0 0 1px #00000014",
        "level-5":
          "0px 1px 1px #00000005, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f, 0 0 0 1px #00000014",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate") as any],
} satisfies Config;