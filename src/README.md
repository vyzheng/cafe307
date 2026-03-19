# src

Application entry point, root component, config, and shared providers.

## Files

| File | Purpose |
|------|---------|
| `main.jsx` | Vite entry point; mounts `<App />` into `#root` |
| `cafe307.jsx` | Root `App` component; login/dashboard routing with fade transition. Wraps everything in `MusicProvider` |
| `config.js` | Exports `API_BASE` and `STRIPE_PUBLISHABLE_KEY` from Vite env vars |
| `api.js` | Shared fetch wrapper with JSON parsing and error handling |
| `context/MusicContext.jsx` | React context + hook for background music and sound toggle |

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

Shared fetch wrapper used by all components.

- `apiFetch(path, options)` -- fetch JSON from `API_BASE`, throws with server `detail` on error
- `apiAuthFetch(path, method, body, code)` -- same as above but adds the `X-Reservation-Code` header for role-based auth

## Config (`config.js`)

| Export | Env var | Default | Notes |
|--------|---------|---------|-------|
| `API_BASE` | `VITE_API_BASE` | `""` | Empty in production (same-origin) |
| `STRIPE_PUBLISHABLE_KEY` | `VITE_STRIPE_PUBLISHABLE_KEY` | `""` | Required for dish requests payment form |

## Music context (`context/MusicContext.jsx`)

`MusicProvider` wraps the entire app and provides a `useMusic()` hook with:

| Method | Purpose |
|--------|---------|
| `setTrack(key)` | Switch background music by screen name |
| `tryPlay()` | Resume playback after a user gesture (satisfies autoplay policy) |
| `toggleMute()` | Pause/resume audio and flip the muted flag |
| `muted` | Boolean indicating current mute state |

Sound toggle buttons in both `LoginPage` (next to subtitle) and `MainViewHeader` (next to badge) call `toggleMute` so the user can silence music from either screen.

A single `Audio` element is reused across the app lifetime. Each screen sets its own track key; playback only starts after a user interaction.

Track map:

| Key | Track |
|-----|-------|
| `login` | Ragnarok Online -- Title |
| `menu` | Ragnarok Online -- Prontera |
| `archive` / `requests` | Ragnarok Online -- Lutie |
| `add_menu` | Ragnarok Online -- Novice Ground |
| `notes` | Ragnarok Online -- Morroc |
