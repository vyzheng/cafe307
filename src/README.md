# src

Application entry point, root component, config, and shared providers.

## Files

| File | Purpose |
|------|---------|
| `main.jsx` | Vite entry point; mounts `<App />` into `#root` |
| `cafe307.jsx` | Root `App` component; login/dashboard routing with fade transition. Wraps everything in `MusicProvider` |
| `config.js` | Exports `API_BASE` and `STRIPE_PUBLISHABLE_KEY` from Vite env vars |
| `context/MusicContext.jsx` | React context for background music |

## Entry flow

```
index.html  #root div
  main.jsx  createRoot + render
    cafe307.jsx  App component
      MusicProvider
        LoginPage   (loggedIn === false)
        MainView    (loggedIn === true)
```

## API layer (`api.js`)

Shared fetch wrapper used by all components. Located at the project root level (`src/api.js`).

- `apiFetch(path, options)` -- fetch JSON from `API_BASE`, throws with server `detail` on error
- `apiAuthFetch(path, method, body, code)` -- same as above but adds the `X-Reservation-Code` header

## Config (`config.js`)

| Export | Env var | Default | Notes |
|--------|---------|---------|-------|
| `API_BASE` | `VITE_API_BASE` | `""` | Empty in production (same-origin) |
| `STRIPE_PUBLISHABLE_KEY` | `VITE_STRIPE_PUBLISHABLE_KEY` | `""` | Required for dish requests |

## Music context

`MusicProvider` wraps the entire app and provides `setTrack(key)` and `tryPlay()` via React context. Each screen sets its own track key (login, menu, archive, notes, requests, add_menu). A single `Audio` element is reused; playback starts only after a user interaction to satisfy browser autoplay policies.

Track map:
| Key | Track |
|-----|-------|
| `login` | Ragnarok Online -- Title |
| `menu` | Ragnarok Online -- Prontera |
| `archive` / `requests` | Ragnarok Online -- Lutie |
| `add_menu` | Ragnarok Online -- Novice Ground |
| `notes` | Ragnarok Online -- Morroc |
