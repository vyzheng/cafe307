# src

Application entry point, root component, and shared providers.

## Files

- **main.jsx** — Vite entry point; mounts `<App />` into `#root`.
- **cafe307.jsx** — Root `App` component; handles login/logout routing and fade transition. Wraps everything in `MusicProvider`.
- **config.js** — Exports `API_BASE` from the `VITE_API_BASE` env var (empty string in production, `http://127.0.0.1:8001` in dev).
- **context/MusicContext.jsx** — React context for background music. One shared `Audio` element; `setTrack(key)` switches tracks, `tryPlay()` resumes after user gesture.
