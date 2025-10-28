/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#E8F1FF",
          DEFAULT: "#3B82F6",
          dark: "#1D4ED8",
        },
      },
      boxShadow: {
        soft: "0 20px 45px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
