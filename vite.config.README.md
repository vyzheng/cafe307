# vite.config.js — Plain-English summary

This file is the **Vite build and dev-server config**. It doesn’t render anything; it tells Vite how to handle the project (e.g. that we use React and JSX). When you run `npm run dev` or `npm run build`, Vite reads this file.

---

## What we have (and what it does)

### 1. `defineConfig` (imported from `'vite'`)
A helper that wraps our config object so tools (and the editor) can provide autocomplete and type checking for the config shape.

**Effect:** We use it so the editor knows what keys (e.g. `plugins`) are valid. It doesn’t change runtime behavior by itself.

---

### 2. `react` (imported from `'@vitejs/plugin-react'`)
The Vite plugin for React. It compiles JSX and enables Fast Refresh so when you save a file, the browser can update without a full reload. Without this plugin, Vite wouldn’t know how to handle `.jsx` files.

**Effect:** Makes Vite understand React and JSX and enables hot updates during development.

---

### 3. `export default defineConfig({ plugins: [react()] })`
We export the config object. `plugins` is an array; we put `react()` in it so Vite uses the React plugin.

**Effect:** When you run `npm run dev` or `npm run build`, Vite reads this file and applies the React plugin, so JSX is compiled and Fast Refresh works. No config means no React plugin and the app wouldn’t build or run as a React app.

---

## In one sentence

This file exports the Vite config with the React plugin enabled, so Vite compiles JSX and supports Fast Refresh; the app’s entry (main.jsx) is then served and built correctly.
