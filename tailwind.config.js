/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your Custom Brand Colors
        brand: {
          yellow: '#FEFCE8', // Light Lemon Yellow (Background)
          green: '#064E3B',  // Deep Forest Green (Text/Buttons)
          gold: '#D4AF37',   // Luxury Accent
          lightGreen: '#10B981' // For Success Messages
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'], // For Headings
        sans: ['Montserrat', 'sans-serif'],   // For Body text
      }
    },
  },
  plugins: [],
}