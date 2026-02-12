/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        anime: {
          onepiece: "#FF6B00",
          naruto: "#F5A623",
          bleach: "#9B59B6",
        },
      },
    },
  },
  plugins: [],
};
