import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        brand: {
          light: '#F8FAFC',
          skyBg: '#F0F9FF',
          skyBorder: '#BAE6FD',
          primary: '#0EA5E9',
          primaryHover: '#0284C7',
          accent: '#38BDF8',
          darkText: '#0F172A',
          mutedText: '#64748B',
        }
      },
      backgroundImage: {
        'sky-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 50%, #E0F2FE 100%)',
        'button-gradient': 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.8) 100%)',
      },
      boxShadow: {
        'sky-glow': '0 4px 20px -2px rgba(14, 165, 233, 0.25)',
        'sky-card': '0 10px 30px -5px rgba(14, 165, 233, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
};
export default config;
