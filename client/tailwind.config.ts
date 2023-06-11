import { type Config } from "tailwindcss";

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  // darkMode: 'class', //'media' or 'class
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
  options: {
    prefix: 'tw-',
  },
}

export default config