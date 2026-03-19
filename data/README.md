# Data

Static configuration and API-fallback data used by the frontend.

## Structure

```
data/
  config/              Always used -- design tokens and UI constants
  fallback/            Used only when the API is unreachable
```

## config/

| File | Exports | Purpose |
|------|---------|---------|
| `theme.js` | `colors`, `fonts`, `mainView` | Design tokens: palette, font families, shared card style |
| `animation.js` | fade durations, stagger delays, slide distance | Timing constants for transitions |
| `tabs.js` | `TAB_IDS`, `mainViewTabs` | Tab identifiers and labels (Menu, Archive, Notes, Requests) |
| `roles.js` | `canEditChef`, `canEditReview`, `canAddMenu`, `canEditMenu` | Role-based permission checks |
| `login.js` | valid codes, error timing, login copy | Login screen configuration |
| `header.js` | icon, name, welcome text, badge | Main view header copy |

## fallback/

| File | Purpose |
|------|---------|
| `currentMenu.js` | Featured menu (date, lunar date, courses with items) |
| `archivedMenus.js` | Array of past menus |
| `chefsNotes.js` | Chef notes by menu date + `getChefNote()` lookup |
| `vipReviews.js` | VIP reviews by menu date + `getVipReview()` lookup |

## config/ vs fallback/

**config/** files are always imported -- they define how the UI looks and behaves regardless of backend availability.

**fallback/** files mirror what is in the database. Components fetch from the API first; on failure they fall back to these static exports. If you update seed data in the backend, keep these files in sync.
