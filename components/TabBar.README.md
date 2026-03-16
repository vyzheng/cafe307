# TabBar.jsx — Plain-English summary

This component renders the three tab buttons (Menu, Archive, Notes) in a single row. Each button shows an English label and a Chinese label. The active tab is highlighted with a gradient background and stronger text color. It does not own state; the parent passes which tab is active and a callback when the user clicks a tab.

---

## Props

| Prop | Type | Purpose |
|------|------|---------|
| **tabs** | `Array<{ id, label, cn }>` | Data for each tab: `id` is the value stored in parent state, `label` and `cn` are the visible text. |
| **activeTab** | `string` | The id of the currently selected tab; the matching button gets the active style. |
| **onTabChange** | `(id: string) => void` | Called when the user clicks a tab; the parent (MainView) sets its `tab` state to this id. |

---

## What we render

A horizontal bar with one button per tab. Each button shows two lines (English, then Chinese). The button whose `id` equals `activeTab` gets the gradient background and full-opacity accent color; the others are subtle. Clicking a button calls `onTabChange(t.id)`.

---

## Dependencies

- **theme (colors, fonts, mainView)** — Uses `mainView.tabBar.container` and `mainView.tabBar.activeBackground` so the bar matches the rest of the dashboard.

---

## Used by

- **MainView** — Passes `mainViewTabs`, `tab` as `activeTab`, and `setTab` as `onTabChange`. Wraps TabBar in `FadeIn delay={200}`.
