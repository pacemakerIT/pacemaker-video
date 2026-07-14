import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx,css}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // custom from main.html
        navy: '#00263b',
        teal: '#00adbd',
        orange: '#ff4f02',
        'orange-hover': '#e04400',
        'gray-soft': '#f2f4f7',
        'on-error': '#ffffff',
        'surface-container-high': '#e6e8eb',
        'inverse-surface': '#2d3133',
        'surface-container-highest': '#e0e3e6',
        tertiary: '#210400',
        'on-background': '#191c1e',
        outline: '#73787d',
        'primary-fixed-dim': '#abcae5',
        'on-primary': '#ffffff',
        'on-tertiary': '#ffffff',
        'on-secondary': '#ffffff',
        secondary: '#006973',
        'secondary-fixed-dim': '#54d8e8',
        'primary-container': '#00263b',
        'on-primary-container': '#6f8ea7',
        'on-primary-fixed': '#001e2f',
        'on-surface': '#191c1e',
        'surface-container-lowest': '#ffffff',
        'inverse-on-surface': '#eff1f4',
        'on-secondary-fixed': '#001f23',
        'on-primary-fixed-variant': '#2b4a60',
        'error-container': '#ffdad6',
        'on-surface-variant': '#42474c',
        'secondary-container': '#6cecfc',
        'surface-container': '#eceef1',
        'inverse-primary': '#abcae5',
        'on-secondary-fixed-variant': '#004f57',
        background: '#ffffff',
        'outline-variant': '#c2c7cd',
        'on-tertiary-fixed-variant': '#842500',
        primary: '#00263b',
        'surface-tint': '#436279',
        'surface-bright': '#f7f9fc',
        'surface-dim': '#d8dadd',
        'primary-fixed': '#cae6ff',
        'on-error-container': '#93000a',
        'secondary-fixed': '#91f1ff',
        'tertiary-fixed-dim': '#ffb59e',
        'on-tertiary-fixed': '#3a0b00',
        'on-tertiary-container': '#fa4d00',
        'tertiary-fixed': '#ffdbd0',
        'surface-container-low': '#f2f4f7',
        'surface-variant': '#e0e3e6',
        surface: '#f7f9fc',
        'tertiary-container': '#470f00',
        'on-secondary-container': '#006974',
        error: '#ba1a1a',
        'body-text': '#475467',

        // pace custom
        'pace-beige': { 500: '#F0E8E0' },
        'pace-black': {
          400: '#1F1F1D',
          500: '#1F1F1F',
          900: '#000000'
        },
        'pace-blue': {
          500: '#36A6F6',
          700: '#1577E6'
        },
        'pace-gray': {
          100: '#EEEEEE',
          200: '#DDDDDD',
          500: '#222222',
          700: '#333333'
        },
        'pace-ivory': { 500: '#F9F6F3' },
        'pace-mint': {
          50: '#ECFDF5',
          500: '#3BC982',
          600: '#32B875'
        },
        'pace-navy': {
          500: '#37446C',
          700: '#021734'
        },
        'pace-orange': {
          50: '#FFF3E6',
          500: '#FF9631',
          600: '#FF8236',
          650: '#ED642D',
          700: '#FB773F',
          800: '#FF6F20',
          900: '#ff7e00'
        },
        'pace-pink': { 500: '#F96164' },
        'pace-purple': { 500: '#9F5BE7' },
        'pace-sand': { 500: '#E3CFBC' },
        'pace-stone': {
          100: '#FAFAFA',
          200: '#F0F0F0',
          500: '#666666',
          550: '#EEEEEE',
          600: '#7E7E7E',
          650: '#777777',
          700: '#888888',
          800: '#999999'
        },
        'pace-teal': {
          500: '#00A1A1'
        },
        'pace-yellow': {
          100: '#FEF9C3',
          500: '#F6AD36'
        },
        'pace-white': { 500: '#FFFFFF' },

        // basic
        foreground: 'var(--foreground)',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },

      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
        headline: ['Poppins', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
        label: ['Poppins', 'sans-serif']
      },

      // fontWeight는 Tailwind 기본 디자인 시스템 (font-normal, font-medium, font-bold 등) 사용
      fontSize: {
        'pace-2xs': ['10px', { lineHeight: '1.5' }], // extra small text
        'pace-xs': ['12px', { lineHeight: '1.5' }],
        'pace-sm': ['14px', { lineHeight: '1.4' }], // small text
        'pace-base': ['16px', { lineHeight: '1.5' }], // base text
        'pace-lg': ['18px', { lineHeight: '1.4' }], // large text
        'pace-xl': ['24px', { lineHeight: '1.5' }], // extra large text
        'pace-2xl': ['30px', { lineHeight: '1.3' }], // 2x large
        'pace-3xl': ['32px', { lineHeight: '1.5' }], // 3x large
        'pace-4xl': ['40px', { lineHeight: '1.4' }], // 4x large
        'pace-5xl': ['48px', { lineHeight: '1.5' }] // 5x large
      },

      boxShadow: {
        card: '0 10px 30px rgba(0,38,59,0.08)'
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '16px',
        full: '9999px'
      },
      keyframes: {
        'services-hero-photo-pan': {
          '0%': {
            transform: 'translate3d(-4%, -3%, 0) rotate(-2.5deg) scale(1.2)'
          },
          '50%': {
            transform: 'translate3d(3%, 5%, 0) rotate(-1deg) scale(1.24)'
          },
          '100%': {
            transform: 'translate3d(-4%, -3%, 0) rotate(-2.5deg) scale(1.2)'
          }
        },
        'services-hero-gradient-flow': {
          '0%': { backgroundPosition: '0% 0%, 100% 0%, 0% 50%' },
          '25%': { backgroundPosition: '34% 10%, 82% 34%, 40% 60%' },
          '50%': { backgroundPosition: '60% 30%, 48% 56%, 100% 50%' },
          '75%': { backgroundPosition: '22% 56%, 10% 70%, 60% 40%' },
          '100%': { backgroundPosition: '0% 0%, 100% 0%, 0% 50%' }
        },
        'services-hero-glow-drift': {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)', opacity: '0.86' },
          '50%': {
            transform: 'translate3d(-9%, 10%, 0) scale(1.14)',
            opacity: '1'
          },
          '100%': {
            transform: 'translate3d(0, 0, 0) scale(1)',
            opacity: '0.86'
          }
        },
        'services-hero-glow-drift-reverse': {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)', opacity: '0.78' },
          '50%': {
            transform: 'translate3d(12%, -11%, 0) scale(1.12)',
            opacity: '0.96'
          },
          '100%': {
            transform: 'translate3d(0, 0, 0) scale(1)',
            opacity: '0.78'
          }
        },
        'services-hero-scroll-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'footer-cta-exclaim-bounce': {
          '0%, 100%': { transform: 'translateY(0) scale(1, 1)' },
          '2.5%': { transform: 'translateY(-7px) scale(1.12, 1.25)' },
          '5%': { transform: 'translateY(0) scale(1, 1)' },
          '7.5%': { transform: 'translateY(-4px) scale(1.08, 1.12)' },
          '10%': { transform: 'translateY(0) scale(1, 1)' },
          '10.01%, 99.99%': { transform: 'translateY(0) scale(1, 1)' }
        }
      },
      animation: {
        'services-hero-photo-pan':
          'services-hero-photo-pan 36s linear infinite',
        'services-hero-gradient-flow':
          'services-hero-gradient-flow 20s ease-in-out infinite',
        'services-hero-glow-drift':
          'services-hero-glow-drift 11s ease-in-out infinite',
        'services-hero-glow-drift-reverse':
          'services-hero-glow-drift-reverse 13s ease-in-out infinite',
        'services-hero-scroll-float':
          'services-hero-scroll-float 2.2s ease-in-out infinite',
        'footer-cta-exclaim':
          'footer-cta-exclaim-bounce 7s cubic-bezier(0.34, 1.45, 0.64, 1) infinite'
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
