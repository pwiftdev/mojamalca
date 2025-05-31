/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          },
        },
        'energy-1': {
          '0%': { transform: 'translate(-50%, -50%) translate(0px, 0px)' },
          '25%': { transform: 'translate(-50%, -50%) translate(40px, -30px)' },
          '50%': { transform: 'translate(-50%, -50%) translate(-30px, 50px)' },
          '75%': { transform: 'translate(-50%, -50%) translate(50px, 30px)' },
          '100%': { transform: 'translate(-50%, -50%) translate(0px, 0px)' },
        },
        'energy-2': {
          '0%': { transform: 'translate(-50%, -50%) translate(0px, 0px)' },
          '25%': { transform: 'translate(-50%, -50%) translate(-50px, 30px)' },
          '50%': { transform: 'translate(-50%, -50%) translate(30px, -40px)' },
          '75%': { transform: 'translate(-50%, -50%) translate(-40px, -30px)' },
          '100%': { transform: 'translate(-50%, -50%) translate(0px, 0px)' },
        },
        'energy-3': {
          '0%': { transform: 'translate(-50%, -50%) translate(0px, 0px)' },
          '25%': { transform: 'translate(-50%, -50%) translate(30px, 40px)' },
          '50%': { transform: 'translate(-50%, -50%) translate(-40px, -30px)' },
          '75%': { transform: 'translate(-50%, -50%) translate(40px, -40px)' },
          '100%': { transform: 'translate(-50%, -50%) translate(0px, 0px)' },
        },
        'orbit-1': {
          '0%': { transform: 'rotate(0deg) translateX(200px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(200px) rotate(-360deg)' }
        },
        'orbit-2': {
          '0%': { transform: 'rotate(0deg) translateX(250px) rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg) translateX(250px) rotate(360deg)' }
        },
        'orbit-3': {
          '0%': { transform: 'rotate(0deg) translateX(180px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(180px) rotate(-360deg)' }
        }
      },
      animation: {
        'gradient-x': 'gradient-x 3s ease infinite',
        'energy-1': 'energy-1 6s ease-in-out infinite',
        'energy-2': 'energy-2 7s ease-in-out infinite',
        'energy-3': 'energy-3 8s ease-in-out infinite',
        'orbit-1': 'orbit-1 20s linear infinite',
        'orbit-2': 'orbit-2 25s linear infinite',
        'orbit-3': 'orbit-3 30s linear infinite'
      },
    },
  },
  plugins: [],
} 