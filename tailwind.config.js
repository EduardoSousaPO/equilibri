/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#6FA590',        
        brandSecondary: '#8AA1B1',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'background-secondary': 'var(--background-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          light: 'rgba(78, 205, 196, 0.2)',
        },
        error: {
          DEFAULT: 'var(--error)',
          light: 'rgba(255, 107, 107, 0.2)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          light: 'rgba(255, 209, 102, 0.2)',
          dark: '#E8B000',
        },
        info: {
          DEFAULT: 'var(--info)',
          light: 'rgba(58, 151, 212, 0.2)',
        },
        forest: {
          900: 'var(--forest-900)',
          800: 'var(--forest-800)',
        },
        gold: {
          500: 'var(--gold-500)',
          400: 'var(--gold-400)',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
        display: ['Lexend', 'sans-serif'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        metallic: '0 4px 12px rgba(156, 138, 90, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn var(--transition) ease-in-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      backgroundImage: {
        'metallic-gold': 'var(--metallic-gold)',
        'metallic-silver': 'var(--metallic-silver)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'var(--text-primary)',
            maxWidth: '65ch',
            a: {
              color: 'var(--primary)',
              '&:hover': {
                color: 'var(--primary-light)',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
} 