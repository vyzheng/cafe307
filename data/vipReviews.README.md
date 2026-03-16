# vipReviews.js — Plain-English summary

This file holds **VIP / guest reviews** keyed by menu date. Reviews are independent of menu objects; we look them up by `menuDate` (e.g. `"March 12, 2026"`). Use `getVipReview(menuDate)` to get the review for a given menu. If you add a new menu, add a matching entry here if you want a guest review on the Notes tab.

---

## What we define and export (and how it’s used)

### 1. `vipReviews` (internal array)
An array of objects. Each has `menuDate` (string matching a menu’s date) and `review` (the guest’s text). Same idea as chefsNotes: we look up by date so the Notes tab can show the review for the current menu.

**Effect in the app:** Only `getVipReview` uses this array. It’s the data source for the lookup.

---

### 2. `getVipReview(menuDate)` (exported)
Finds the entry in `vipReviews` whose `menuDate` equals the argument. Returns `entry.review` if found, otherwise `null`.

**Effect in the app:** MainView calls `getVipReview(currentMenu.date)` on the Notes tab and displays the result in quotes (or "—" if null). So this function is the only way the app gets guest review text for the current menu.

---

### 3. Default export
The file also exports `vipReviews` as the default. MainView only uses the named export `getVipReview`.

---

## In one sentence

This file stores date–review pairs and exports `getVipReview(menuDate)`; MainView uses it with `currentMenu.date` to show the guest review on the Notes tab.
