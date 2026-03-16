# MainView.jsx — Plain-English summary

This component is the main authenticated view: header, tab bar (Menu / Archive / Notes), and the content for the selected tab. One state variable (`tab`) controls which content is shown. It has no props; all data comes from imports and local state.

---

## What we define before the return (and how it affects the return)

### 1. `tab` (and `setTab`)
We remember which tab is selected. It starts as `TAB_IDS.MENU` ("menu"); allowed values are `TAB_IDS.MENU`, `TAB_IDS.ARCHIVE`, and `TAB_IDS.NOTES`.

**Effect on return:** TabBar receives `activeTab={tab}` and `onTabChange={setTab}`. The content below is conditional on `tab`: we render DinnerMenu when Menu is selected, ArchiveTab when Archive is selected, and NotesTab when Notes is selected.

---

### 2. `allMenusForArchive`
An array built as `[currentMenu, ...archivedMenus]`: the featured (current) menu first, then every past menu.

**Effect on return:** We pass this to ArchiveTab as the `menus` prop when the Archive tab is active.

---

### 3. Imports used in the return
- **FadeIn** — Wraps header, tab bar, and each tab’s content so they animate in with delays.
- **MainViewHeader** — Logo, "Cafe 307", "Welcome back", and badge.
- **TabBar** — The three tab buttons; takes `mainViewTabs`, `tab`, and `setTab`.
- **DinnerMenu** — Rendered when `tab === TAB_IDS.MENU`; we pass `currentMenu` as the `menu` prop.
- **ArchiveTab** — Rendered when `tab === TAB_IDS.ARCHIVE`; we pass `allMenusForArchive` and `onSelectMenu={() => setTab(TAB_IDS.MENU)}`.
- **NotesTab** — Rendered when `tab === TAB_IDS.NOTES`; we pass `currentMenu.date` as `menuDate`.
- **mainView** — Theme tokens for the shell (background, gradient).
- **currentMenu, archivedMenus** — Data for the menu and archive list.
- **mainViewTabs, TAB_IDS** — Tab config and id constants from `data/mainViewTabs.js`.

---

## The return in one sentence

A full-height centered container (using `mainView.shell`) holds a narrow column: a header (MainViewHeader), a tab bar (TabBar) that sets `tab` on click, then either the dinner menu (DinnerMenu), the archive list (ArchiveTab), or the notes block (NotesTab), each wrapped in FadeIn; plus a bottom spacer for scroll padding.
