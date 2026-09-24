module.exports = {
        content: ["./*.html", "./script.js"],
        theme: {
          extend: {
            colors: {
              ink: "#16201c",
              paper: "#fbf6ec",
              brand: { DEFAULT: "#c0282d", dark: "#7d1117" },
              gold: "#e8a93a",
              forest: "#1d6848",
            },
            fontFamily: {
              display: ['Fraunces', 'Georgia', 'serif'],
              sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
              card: "0 18px 50px rgba(22, 32, 28, 0.12)",
              soft: "0 10px 30px rgba(22, 32, 28, 0.08)",
            },
          },
        },
      };
