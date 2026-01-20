import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          primary: '#9945FF',
          accent: '#14F195',
          peach: '#FEF9F5',
          text: {
            primary: '#121212',
            secondary: '#121212CC', // 80% opacity
            muted: '#12121299',    // 60% opacity
          }
        },
        // Semantic Colors
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
          DEFAULT: '#9945FF',
          foreground: '#FFFFFF',
          50: '#F0E6FF',
          100: '#E1CCFF',
          200: '#C399FF',
          300: '#A566FF',
          400: '#9945FF',
          500: '#7F1AED',
          600: '#6B0FDB',
          700: '#5705C9',
          800: '#4300B7',
          900: '#2F0099',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: '#14F195',
          foreground: '#000000',
          50: '#E6FFF5',
          100: '#CCFFEB',
          200: '#99FFD7',
          300: '#66FFC3',
          400: '#33FFAF',
          500: '#14F195',
          600: '#0FC778',
          700: '#0A9E5B',
          800: '#06753E',
          900: '#034C21',
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
        // Status Colors
        success: {
          50: '#E8F5E8',
          100: '#D1E7D1',
          500: '#4CAF50',
          600: '#388E3C',
        },
        warning: {
          50: '#FFF8E1',
          100: '#FFF1C3',
          500: '#FF9800',
          600: '#F57C00',
        },
        error: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          500: '#F44336',
          600: '#D32F2F',
        },
      },
      fontSize: {
        'display-lg': ['4rem', { lineHeight: '1', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'heading-xl': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-lg': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        'section-y': '6rem',     // 96px
        'section-x': '2rem',     // 32px
        'card-gap': '1.5rem',    // 24px
        'content-gap': '1rem',   // 16px
        'element-gap': '0.5rem', // 8px
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'xl': '0.75rem',        // 12px
        '2xl': '1rem',          // 16px
        '3xl': '1.5rem',        // 24px
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glow-primary': '0 0 20px rgba(153, 69, 255, 0.15)',
        'glow-accent': '0 0 20px rgba(20, 241, 149, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

