module.exports = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      maxHeight: {
        "3/4": "75%",
        unset: "unset",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
