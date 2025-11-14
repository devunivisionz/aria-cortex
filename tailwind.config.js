/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: { DEFAULT: "#00F5A0", 600:"#00D9A3" },
        bg: "#000000",
        bg2: "#001B16",
      },
      boxShadow: {
        emerald: "0 0 24px rgba(0,245,160,0.15)",
      }
    },
    fontFamily: {
      sans: ["Inter","Manrope","system-ui","sans-serif"]
    }
  },
  plugins: []
}
