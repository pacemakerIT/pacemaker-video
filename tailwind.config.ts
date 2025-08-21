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
        // custom
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
          200: '#F0F0F0',
          500: '#666666',
          600: '#7E7E7E',
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
        background: 'var(--background)',
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
        sans: ['Pretendard', 'sans-serif']
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
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
