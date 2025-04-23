import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
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
        'pace-blue': { 500: '#36A6F6' },
        'pace-gray': {
          200: '#DDDDDD',
          500: '#222222',
          700: '#333333'
        },
        'pace-green': { 500: '#21734' },
        'pace-ivory': { 500: '#F9F6F3' },
        'pace-mint': { 500: '#3BC982' },
        'pace-navy': { 500: '#37446C' },
        'pace-orange': {
          500: '#FF9631',
          600: '#FF8236',
          700: '#FB773F',
          800: '#FF6F20'
        },
        'pace-pink': { 500: '#F96164' },
        'pace-purple': { 500: '#9F5BE7' },
        'pace-sand': { 500: '#E3CFBC' },
        'pace-stone': {
          500: '#666666',
          600: '#7E7E7E',
          700: '#888888',
          800: '#999999'
        },
        'pace-yellow': { 500: '#F6AD36' },
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

      fontSize: {
        'pace-link-16-lh16-reg': ['16px', { lineHeight: '16px' }],
        'pace-text-14-lh20-light': ['14px', { lineHeight: '20px' }],
        'pace-button-18-lh100-med': ['18px', { lineHeight: '1.0' }],
        'pace-button-18-lh18-med': ['18px', { lineHeight: '18px' }],
        'pace-button-18-lh140-reg': ['18px', { lineHeight: '1.4' }],
        'pace-button-16-lh16-reg': ['16px', { lineHeight: '16px' }],
        'pace-caption-16-lh150-reg': ['16px', { lineHeight: '1.5' }],
        'pace-heading-24-lh36-med': ['24px', { lineHeight: '36px' }],
        'pace-card-16-lh24-reg': ['16px', { lineHeight: '24px' }],
        'pace-footer-16-lh140-reg': ['16px', { lineHeight: '1.4' }],
        'pace-footer-14-lh140-reg': ['14px', { lineHeight: '1.4' }],
        'pace-heading-40-lh56-bold': ['40px', { lineHeight: '56px' }],
        'pace-heading-48-lh72-bold': ['48px', { lineHeight: '72px' }],
        'pace-heading-24-lh34-med': ['24px', { lineHeight: '34px' }],
        'pace-text-24-lh150-med': ['24px', { lineHeight: '1.5' }],
        'pace-heading-32-lh48-bold': ['32px', { lineHeight: '48px' }],
        'pace-text-32-lh150-reg': ['32px', { lineHeight: '1.5' }],
        'pace-label-18-lh140-med': ['18px', { lineHeight: '1.4' }],
        'pace-label-18-lh27-reg': ['18px', { lineHeight: '27px' }],
        'pace-label-14-lh140-reg': ['14px', { lineHeight: '1.4' }],
        'pace-link-18-lh18-reg': ['18px', { lineHeight: '18px' }],
        'pace-link-16-lh22-reg': ['16px', { lineHeight: '22px' }],
        'pace-text-30-lh100-xb': ['30px', { lineHeight: '1.0' }],
        'pace-logo-30-lh-auto-xb': ['30px', { lineHeight: 'auto' }],
        'pace-label-18-lh-auto-med': ['18px', { lineHeight: 'auto' }],
        'pace-tag-16-lh-auto-light': ['16px', { lineHeight: 'auto' }]
      }
    }
  },
  plugins: []
} satisfies Config;
