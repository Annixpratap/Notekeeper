/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#0f0f0f',
        'off-white': '#f0ede6',
        amber: '#e8a045',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        'dm-mono': ['DM Mono', 'monospace'],
        lora: ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
}
