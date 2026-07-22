export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#C4275C",
          pinkDark: "#a81f4d",
          blush: "#FBE4E9",
          cream: "#FBF3F0",
          ink: "#211A1D",
          gold: "#B9944B",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
