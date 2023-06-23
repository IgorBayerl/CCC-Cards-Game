import { type Config } from "tailwindcss";

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#a991f7',
          secondary: '#f6d860',
          accent: '#37cdbe',
          neutral: '#3d4451',
          'base-100': '#ffffff',
          '.btn-outline': {
            'background-color': 'transparent',
            'border-color': '#e5e7eb',
            color: '#e5e7eb',
          },
          '.btn-outline:hover': {
            'background-color': '#e5e7eb30',
            'border-color': '#ffffff00',
          },
          // '.btn.btn-select.btn-select-active': { // usar isso aqui nos "safe for stream" e language selctor
          //   'background-color': '#e5e7eb30',
          //   'border-color': '#ffffff00',
          // },
          // '.tab-control': {
          //   '&.active': {
          //     'border-color': '#ffffff',
          //   },
          //   '&:not(.active)': {
          //     'border-color': 'var(--border-color-tab)',
          //   },
          // },
          '.tab-bordered': {
            'border-color': '#e5e7eb30',
          },
          '.tab-bordered.tab-active': {
            'border-color': '#e5e7eb !important',
          },
          '.divider:before , .divider:after': {
            'background-color': '#e5e7eb50',
          },
          '--rounded-btn': '0.5rem', // border radius rounded-btn utility class, used in buttons and similar element
          '--rounded-badge': '1.9rem', // border radius rounded-badge utility class, used in badges and similar
          '--animation-btn': '0.25s', // duration of animation when you click on button
          '--animation-input': '0.2s', // duration of animation for inputs like checkbox, toggle, radio, etc
          '--btn-text-case': 'uppercase', // set default text transform for buttons
          '--btn-focus-scale': '0.95', // scale transform of button when you focus on it
          '--border-btn': '2px', // border width of buttons
          '--tab-border': '4px', // border width of tabs
          '--tab-radius': '0.5rem', // border radius of tabs
        },
      },
      'light',
    ],
  },
}

export default config