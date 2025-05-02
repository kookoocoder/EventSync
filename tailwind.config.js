/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    'shadow-medium',
    'hover:shadow-medium'
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          light: 'rgb(var(--primary-light))',
          dark: 'rgb(var(--primary-dark))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary))',
          light: 'rgb(var(--secondary-light))',
          dark: 'rgb(var(--secondary-dark))',
        },
        accent: 'rgb(var(--accent))',
        
        // UI Colors
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        
        // Status Colors
        success: "rgb(var(--success))",
        warning: "rgb(var(--warning))",
        error: "rgb(var(--error))",
        info: "rgb(var(--info))",
        
        // Component Colors
        card: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "rgb(var(--popover))",
          foreground: "rgb(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--muted))",
          foreground: "rgb(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive))",
          foreground: "rgb(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 20px 0 rgba(0,0,0,0.05)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'intense': '0 10px 50px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.6s ease-out forwards',
        'slide-left': 'slideLeft 0.6s ease-out forwards', 
        'slide-right': 'slideRight 0.6s ease-out forwards',
        'bounce-soft': 'bounceSoft 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-border': 'pulseBorder 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        pulseBorder: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(var(--primary), 0.4)' },
          '50%': { boxShadow: '0 0 0 4px rgba(var(--primary), 0.2)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.5, 0, 0.1, 1.4)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} 