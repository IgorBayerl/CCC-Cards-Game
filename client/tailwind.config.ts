import { type Config } from "tailwindcss";

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  options: {
    prefix: 'tw-',
  },
}

export default config