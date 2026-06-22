module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'appear':    'appear 0.2s ease backwards',
        'pop':       'pop 0.2s ease backwards',
        'scroll-bg': 'scrollBg 15s linear infinite',
        'blink':     'blink 0.2s infinite',
      },
      keyframes: {
        appear: {
          '0%':   { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        scrollBg: {
          'from': { backgroundPosition: '0 0' },
          'to':   { backgroundPosition: '-400px 0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
