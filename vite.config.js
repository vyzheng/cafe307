/*
  import { defineConfig } from 'vite' — defineConfig is a helper that wraps our config object so tools (and the editor) can provide autocomplete and type checking.
  A wrapper so the editor knows what keys (e.g. plugins) are valid.
*/
import { defineConfig } from 'vite'

/*
  import react from '@vitejs/plugin-react' — The Vite plugin for React. It compiles JSX and enables Fast Refresh (so when you save a file, the browser updates without a full reload).
  Without this plugin, Vite wouldn't know how to handle .jsx files.
  The plugin that makes Vite understand React and JSX.
*/
import react from '@vitejs/plugin-react'

/*
  export default defineConfig({ plugins: [react()] }) — We export the config object.
  plugins is an array; we put react() in it so Vite uses the React plugin.
  When you run npm run dev or npm run build, Vite reads this file.
  Our Vite config: use the React plugin so JSX works and Fast Refresh works.
*/
export default defineConfig({
  plugins: [react()],
})
