module.exports = {
  darkMode: 'class',
  content: ['./client/index.html', './client/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glass: '0 24px 80px rgba(0, 0, 0, 0.28)',
        soft: '0 18px 50px rgba(15, 23, 42, 0.12)'
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      },
      animation: {
        floatIn: 'floatIn 260ms ease-out both'
      }
    }
  },
  plugins: []
};
