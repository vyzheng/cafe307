# MainViewHeader.jsx — Plain-English summary

This component is the top bar of the main dashboard: logo (⛩️), "Cafe 307" and "Welcome back" on the left, and the badge "Table for 2 · Thursdays" on the right. It has no props; MainView renders it once at the top of the shell.

---

## What we render

- **Left:** Icon + two lines of text (display font for "Cafe 307", body font for "Welcome back").
- **Right:** A pill-shaped badge with Japanese-style font and pink accent, showing the reservation line.

---

## Dependencies

- **theme (colors, fonts)** — All typography and colors come from the shared theme so the header matches the rest of the app.

---

## Used by

- **MainView** — Wraps this in `FadeIn delay={100}` so the header fades in first, then the tab bar and content.
