/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'cyber': ['Orbitron', 'monospace'],
        'retro': ['VT323', 'monospace'],
      },
      backgroundImage: {
        'cyber-grid': `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)`,
        'scanlines': `linear-gradient(transparent 50%, rgba(0, 255, 255, 0.03) 50%)`,
      },
      boxShadow: {
        'neon': '0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor',
        'neon-lg': '0 0 20px currentColor, 0 0 40px currentColor, 0 0 80px currentColor',
        'cyber': '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), inset 0 0 20px rgba(0, 255, 255, 0.1)',
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
        "glitch": {
          "0%, 100%": {
            textShadow: "0.05em 0 0 rgba(255, 0, 0, 0.75), -0.05em -0.025em 0 rgba(0, 255, 0, 0.75), 0.025em 0.05em 0 rgba(0, 0, 255, 0.75)",
          },
          "15%": {
            textShadow: "-0.05em -0.025em 0 rgba(255, 0, 0, 0.75), 0.025em 0.025em 0 rgba(0, 255, 0, 0.75), -0.05em -0.05em 0 rgba(0, 0, 255, 0.75)",
          },
          "50%": {
            textShadow: "0.025em 0.05em 0 rgba(255, 0, 0, 0.75), 0.05em 0 0 rgba(0, 255, 0, 0.75), 0 -0.05em 0 rgba(0, 0, 255, 0.75)",
          },
        },
        "cyber-flicker": {
          "0%, 100%": { opacity: 1 },
          "33%": { opacity: 0.8 },
          "66%": { opacity: 0.9 },
        },
        "neon-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary))",
          },
          "50%": {
            boxShadow: "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary)), 0 0 60px hsl(var(--primary))",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glitch": "glitch 1s linear infinite",
        "cyber-flicker": "cyber-flicker 3s ease-in-out infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}