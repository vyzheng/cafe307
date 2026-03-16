# archivedMenus.js — Plain-English summary

This file holds the **past menus** shown in the Archive tab. MainView builds the archive list as `[currentMenu, ...archivedMenus]`, so the first row is always the featured menu and the rest come from this array. Add new menu objects here as they become past.

---

## What we export (and how it’s used)

### 1. `archivedMenus` (default export)
An array of menu objects. Each object should have the same shape as currentMenu (`date`, `lunarDate`, `label`, `courses`). The array can be empty.

**Effect in the app:** MainView does `allMenusForArchive = [currentMenu, ...archivedMenus]` and maps over it on the Archive tab to show one row per menu. So this array is the only source for “past” menus; the featured menu is always first in the list.

---

## In one sentence

This file exports the list of past menus; MainView concatenates it with the current menu and uses that list to render the Archive tab rows.
