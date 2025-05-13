/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pink-100': 'var(--color-pink-100)',
        'pink-200': 'var(--color-pink-200)',
        'pink-300': 'var(--color-pink-300)',
        'pink-400': 'var(--color-pink-400)',
        'lavender-100': 'var(--color-lavender-100)',
        'lavender-200': 'var(--color-lavender-200)',
        'lavender-300': 'var(--color-lavender-300)',
        'mint-100': 'var(--color-mint-100)',
        'mint-200': 'var(--color-mint-200)',
        'mint-300': 'var(--color-mint-300)',
        'blue-100': 'var(--color-blue-100)',
        'blue-200': 'var(--color-blue-200)',
        'blue-300': 'var(--color-blue-300)',
        'cream': 'var(--color-cream)',
      },
      fontFamily: {
        'heading': ['Playfair Display', 'serif'],
        'handwritten': ['Caveat', 'cursive'],
        'body': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        jujutheme: {
          primary: "#f5a8b9",
          secondary: "#c2c0ff",
          accent: "#b5dfc0",
          neutral: "#fefae0",
          "base-100": "#ffffff",
          "base-content": "#4a4a4a",
        },
      },
      "light",
      "cupcake",
    ],
  },
}
