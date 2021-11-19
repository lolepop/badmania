import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [
    preact(),
    visualizer()
  ],
  alias: {
    react: 'preact/compat',
    'react-dom': 'preact/compat'
  }
})
