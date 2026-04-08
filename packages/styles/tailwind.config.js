/** @type {import('tailwindcss').Config} */
export default {
  content: ['../../apps/portal/src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
  },
  theme: {
    extend: {},
  },
};
