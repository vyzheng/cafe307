# mainViewHeader.js — Plain-English summary

This file holds **copy for the main dashboard header**: the logo icon, venue name, welcome line, and the badge text. MainViewHeader imports it and renders all four values so you can change header copy in one place.

---

## What we export (and how it's used)

### `mainViewHeader`
An object with four keys: `icon`, `name`, `welcomeMessage`, `badge`. MainViewHeader imports it and uses each key in the header layout.

- **icon** — Emoji or character shown next to the venue name (e.g. "⛩️").
- **name** — Main title (e.g. "Cafe 307").
- **welcomeMessage** — Line under the name (e.g. "Welcome back").
- **badge** — Text in the pill on the right (e.g. "Table for 2 · Thursdays").

**Effect in the app:** MainViewHeader renders these four values instead of hardcoded strings; changing a value here updates the header text everywhere.

---

## In one sentence

This file exports the header copy (icon, name, welcome message, badge); MainViewHeader imports it and uses it for all visible text in the main dashboard header.
