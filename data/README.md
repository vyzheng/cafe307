# Data

Static configuration and API-fallback data.

## Structure

```
data/
  config/          ← constants and design tokens (always used)
    theme.js       ← colors, fonts, shared card style
    animation.js   ← fade durations, stagger delays, slide distance
    login.js       ← valid login codes, error display timing, login copy
    tabs.js        ← tab IDs and labels (Menu, Archive, Notes)
    header.js      ← main view header copy (icon, name, welcome, badge)
  fallback/        ← static data shown only when the API is unreachable
    currentMenu.js ← featured menu (date, courses, items)
    archivedMenus.js ← past menus array
    chefsNotes.js  ← chef notes by menu date + getChefNote() lookup
    vipReviews.js  ← VIP reviews by menu date + getVipReview() lookup
```

## config/ vs fallback/

**config/** files define design tokens and UI constants that are always used regardless of the backend.

**fallback/** files contain menu and note data that mirrors what's in the database. Components fetch from the API first; on failure they fall back to these static exports. If you update seed data in the backend, keep these files in sync.
