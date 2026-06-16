import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Tailwind's default opacity scale only covers multiples of 5, so color
      // opacity modifiers such as `bg-white/14` or `text-white/72` silently emit
      // no CSS. Expand the scale to every integer 0-100 so those utilities (used
      // for the active nav item, header and auth surfaces) actually render.
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, value) => [value, `${value / 100}`]),
      ),
      colors: {
        background: "var(--surface-page)",
        foreground: "var(--text-primary)",
        card: "var(--surface-card)",
        "card-foreground": "var(--text-primary)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-on-primary)",
          hover: "var(--color-primary-hover)",
          subtle: "var(--color-primary-subtle)",
          border: "var(--color-primary-border)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-on-secondary)",
          subtle: "var(--color-secondary-subtle)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--green-900)",
        },
        muted: {
          DEFAULT: "var(--surface-sunken)",
          foreground: "var(--text-secondary)",
        },
        border: "var(--border-subtle)",
        input: "var(--border-default)",
        ring: "var(--border-focus)",
        success: {
          DEFAULT: "var(--color-success)",
          subtle: "var(--color-success-subtle)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          subtle: "var(--color-warning-subtle)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          subtle: "var(--color-error-subtle)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          subtle: "var(--color-info-subtle)",
        },
        petrol: {
          DEFAULT: "var(--petrol-500)",
          700: "var(--petrol-700)",
          800: "var(--petrol-800)",
        },
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        primary: "var(--shadow-primary)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      maxWidth: {
        content: "var(--container-max)",
      },
    },
  },
  plugins: [],
};

export default config;
