# currentMenu.js — Plain-English summary

This file defines the **featured / active menu**: the one menu object that MainView shows on the Menu tab and uses for the Notes tab (chef note and guest review by date). To show a different week, replace or edit this object.

---

## What we export (and how it’s used)

### 1. `currentMenu` (default export)
A single menu object with `date`, `lunarDate`, `label`, and `courses`. Each course has `cat` (e.g. `cn`, `en`) and `items`; each item has `cn`, `en`, `desc`, and optionally `tag` and `exp`.

**Effect in the app:** MainView imports it and does `<DinnerMenu menu={currentMenu} />` when the Menu tab is active, and uses `currentMenu.date` for `getChefNote` and `getVipReview` on the Notes tab. So this object is the only source for the “current” dinner menu and for which note/review is shown.

---

## In one sentence

This file exports the one menu we treat as current; MainView uses it for the Menu tab content and for looking up chef note and guest review by date on the Notes tab.
