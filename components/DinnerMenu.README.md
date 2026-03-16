# DinnerMenu.jsx — Plain-English summary

This component renders a single dinner menu as a card: header (branding + date), courses with items, and dividers between sections. The parent (MainView) passes one `menu` object. There is no local state—everything comes from the `menu` prop and imports.

---

## What we define / use (and how it affects the return)

### 1. `menu` (prop)
The single menu object. It must have `date`, `lunarDate`, `label`, and `courses`. Each course has `cat` (e.g. `cn`, `en`) and `items`; each item can have `cn`, `en`, `desc`, `tag`, `exp`.

**Effect on return:** We read `menu.date`, `menu.lunarDate` in the header; we loop over `menu.courses` and for each course we show `course.cat` and map over `course.items` for dish names, descriptions, optional tag pill, and optional “Chef’s Experience” block. So the whole card is a visual representation of this one object.

---

### 2. Imports used in the return
- **FadeIn** — Wraps each course block. Delay is `300 + ci * FADE_STAGGER_MS` so courses stagger in. Affects only the animation timing.
- **SectionDivider** — Rendered once after the header and between courses (not after the last). Purely visual.
- **colors, fonts** — Theme; used in all inline styles.
- **FADE_STAGGER_MS** — Used in the FadeIn delay formula so each course appears after the previous one by that many ms.

---

### 3. `DinnerMenu.propTypes`
We declare the shape of `menu`: required `date`, optional `lunarDate`/`label`, and `courses` as an array of the expected shape (cat, items with cn, en, desc, tag, exp). Wrong shape produces a dev warning.

**Effect on return:** PropTypes don’t change the JSX; they document and validate the `menu` contract.

---

## The return in one sentence

A white rounded card contains a centered header (icon, “Cafe 307”, “Dinner Menu”, Japanese line, then `menu.date` and `menu.lunarDate`), a SectionDivider, then each course in a FadeIn with staggered delay—each course shows its category and all items (name, translation, description, optional tag, optional “Chef’s Experience” block), with SectionDivider between courses—and a footer (heart + “Cafe 307 · Sawtelle”).
