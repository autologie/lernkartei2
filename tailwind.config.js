module.exports = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      maxHeight: {
        "2/3": "67%",
        unset: "unset",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
