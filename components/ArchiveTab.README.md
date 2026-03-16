# ArchiveTab.jsx — Plain-English summary

This component is the content of the Archive tab: a card with the title "Past Menus" (and Japanese subtitle), then a list of menu rows. Each row shows the menu's date, lunar date, label, and a one-line summary of all dish names in Chinese. Clicking a row calls `onSelectMenu` (MainView uses this to switch back to the Menu tab). The list is built from the `menus` prop (typically featured menu first, then past menus).

---

## Props

| Prop | Type | Purpose |
|------|------|---------|
| **menus** | `Array<menu>` | List of menu objects; each must have `date`, `lunarDate`, `label`, and `courses` (for the summary). We use `menu.date` as the React key. |
| **onSelectMenu** | `function` | Called when the user clicks a menu row; the parent usually switches to the Menu tab. |

---

## What we render

- A card (using `mainView.card`) with a centered title block.
- One row per menu: date and lunar date on the left, label on the right, then a line of dish names (Chinese) joined by " · " via `getMenuSummary(menu)`.
- A footer line: "More menus coming every Thursday."

---

## Dependencies

- **theme (colors, fonts, mainView)** — Card style and typography.
- **utils/menuUtils (getMenuSummary)** — Builds the one-line dish summary from `menu.courses` and `items[].cn`.

---

## Used by

- **MainView** — Renders `<ArchiveTab menus={allMenusForArchive} onSelectMenu={() => setTab("menu")} />` when `tab === "archive"`, wrapped in `FadeIn delay={300}`.
