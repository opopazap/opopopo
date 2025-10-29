/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'handwriting': ['Kalam', 'cursive'],
        'display': ['Orbitron', 'monospace'],
        'playfair': ['Playfair Display', 'serif'],
        'fira': ['Fira Code', 'monospace'],
        'dancing': ['Dancing Script', 'cursive'],
        'roboto-slab': ['Roboto Slab', 'serif'],
        'caveat': ['Caveat', 'cursive'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
        'crimson': ['Crimson Text', 'serif'],
        'pacifico': ['Pacifico', 'cursive'],
        'righteous': ['Righteous', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
