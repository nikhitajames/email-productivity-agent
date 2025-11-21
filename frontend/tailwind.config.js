/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enables the toggle
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Inter"', "sans-serif"],
      },
      colors: {
        // The Exact Vercel "Warm Beige" Palette
        background: "#faf9f6", // Cream
        foreground: "#1a1a1a", // Soft Black
        sidebar: "#f5f4f0", // Sidebar Beige
        border: "#e6e4dd", // Subtle Border
        primary: "#1a1a1a", // Primary Actions (Black)
        "primary-foreground": "#ffffff",
        secondary: "#e8e6e1", // Secondary Actions (Darker Beige)
        muted: "#71717a", // Muted Text
        accent: "#eae9e5", // Hover states
      },
    },
  },
  plugins: [],
};
