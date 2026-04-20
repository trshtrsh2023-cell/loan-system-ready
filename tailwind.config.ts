import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Tajawal', 'sans-serif'] },
      colors: {
        primary: { DEFAULT: '#1a56db', dark: '#1e429f', light: '#e8f0fe' },
        surface: '#f8fafc',
        card: '#ffffff',
      }
    },
  },
  plugins: [],
}
export default config
