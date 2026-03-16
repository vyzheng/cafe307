# theme.js — Plain-English summary

This file holds **shared** design tokens only: colors, fonts, and the main dashboard card style. Styling used by only one component (login card, main shell, tab bar) lives in those components; theme holds only what is used by 2+ components.

---

## What we export (and how it's used)

### Entire app

#### 1. `colors`
An object of named color strings: `bg`, `card`, `pink`, `pinkSoft`, `pinkDeep`, `cream`, `gold`, `ink`, `inkLight`, `lavender`, `err`, `success`.

**Effect in the app:** Components use `colors.bg`, `colors.card`, `colors.ink`, etc. in inline styles instead of hardcoding hex codes.

#### 2. `fonts`
An object of CSS `font-family` strings: `display`, `body`, `cn`, `jp`. Display and body use Cormorant Garamond; `cn` is Noto Serif SC (Chinese); `jp` is Zen Maru Gothic (Japanese).

**Effect in the app:** Components set `fontFamily: fonts.display` or `fonts.body`, etc., so typography can be changed app-wide from this file.

---

### Main dashboard (shared)

#### 3. `mainView.card`
Card style (background, borderRadius, boxShadow) shared by ArchiveTab, NoteCard, and NextReservationCard. Each component spreads it and may add padding or other overrides.

**Effect in the app:** ArchiveTab, NoteCard, and NextReservationCard import `mainView` from theme and use `mainView.card` so dashboard cards look consistent.

---

## In one sentence

This file exports only shared design tokens—colors and fonts (app-wide) and mainView.card (dashboard cards)—so components that need them import from here; single-component styling lives in the component.
