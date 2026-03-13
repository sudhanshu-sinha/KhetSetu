/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium Forest Green palette
        primary: {
          50:  '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b', 950: '#022c22',
        },
        // Golden Harvest accent
        gold: {
          50:  '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f', 950: '#451a03',
        },
        // Slate dark mode
        slate: {
          750: '#1e293b', 850: '#111827', 925: '#0d1117', 950: '#0a0f1a',
        },
        // Earth tones
        earth:     { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12' },
        terracotta:{ 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12' },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-gold':  '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-sm':    '0 0 15px -3px rgba(16, 185, 129, 0.3)',
        'premium':    '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
        'premium-dark': '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 25px 50px -12px rgba(16, 185, 129, 0.15)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #10b981 0%, #059669 25%, #047857 50%, #065f46 75%, #064e3b 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        'gradient-hero': 'linear-gradient(160deg, #ecfdf5 0%, #f8fafc 30%, #fffbeb 70%, #fef3c7 100%)',
        'gradient-hero-dark': 'linear-gradient(160deg, #022c22 0%, #0a0f1a 30%, #0a0f1a 70%, #1a0f00 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
      },
      animation: {
        'fade-in':        'fadeIn 0.6s ease-out',
        'slide-up':       'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'bounce-soft':    'bounceSoft 0.6s ease-out',
        'pulse-soft':     'pulseSoft 2s infinite',
        'float':          'float 6s ease-in-out infinite',
        'shimmer':        'shimmer 2s infinite',
        'glow-pulse':     'glowPulse 3s ease-in-out infinite',
        'count-up':       'countUp 1s ease-out',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'spin-slow':      'spin 8s linear infinite',
        'tilt':           'tilt 10s ease-in-out infinite',
        'scale-in':       'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:      { '0%': { transform: 'translateY(30px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        bounceSoft:   { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        pulseSoft:    { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        float:        { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        shimmer:      { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glowPulse:    { '0%, 100%': { boxShadow: '0 0 20px -5px rgba(16, 185, 129, 0.3)' }, '50%': { boxShadow: '0 0 30px -2px rgba(16, 185, 129, 0.5)' } },
        countUp:      { '0%': { transform: 'scale(0.5)', opacity: '0' }, '50%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        gradientShift:{ '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        tilt:         { '0%, 100%': { transform: 'rotate(-1deg)' }, '50%': { transform: 'rotate(1deg)' } },
        scaleIn:      { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
