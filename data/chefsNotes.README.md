# chefsNotes.js — Plain-English summary

This file holds **chef’s notes** keyed by menu date. Notes are independent of menu objects; we look them up by `menuDate` (e.g. `"March 12, 2026"`). Use `getChefNote(menuDate)` to get the note for a given menu. If you add a new menu, add a matching entry here if you want a chef note on the Notes tab.

---

## What we define and export (and how it’s used)

### 1. `chefsNotes` (internal array)
An array of objects. Each has `menuDate` (string matching a menu’s date) and `note` (the chef’s text). We don’t store the note inside the menu; we look it up by date so notes and menus can be edited separately.

**Effect in the app:** Only `getChefNote` uses this array. It’s the data source for the lookup.

---

### 2. `getChefNote(menuDate)` (exported)
Finds the entry in `chefsNotes` whose `menuDate` equals the argument. Returns `entry.note` if found, otherwise `null`.

**Effect in the app:** MainView calls `getChefNote(currentMenu.date)` on the Notes tab and displays the result (or "—" if null). So this function is the only way the app gets chef note text for the current menu.

---

### 3. Default export
The file also exports `chefsNotes` as the default. MainView only uses the named export `getChefNote`.

---

## In one sentence

This file stores date–note pairs and exports `getChefNote(menuDate)`; MainView uses it with `currentMenu.date` to show the chef’s note on the Notes tab.
