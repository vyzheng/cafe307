# NoteCard.jsx — Plain-English summary

This component is a reusable card for a single "note" block: an icon in a circle, a title and subtitle (e.g. "Chef's Notes" / "料理人の一言"), and a content area below. NotesTab uses it twice (Chef's Notes and Guest Review). The content area can be styled via `contentStyle` so the guest review card can use a different background and border (gold instead of pink).

---

## Props

| Prop | Type | Purpose |
|------|------|---------|
| **icon** | `node` | Emoji or character shown in the small circle (e.g. 👩‍🍳, 🪑). |
| **title** | `string` | Main heading (e.g. "Chef's Notes", "Guest Review"). |
| **subtitle** | `string` | Japanese or secondary line under the title. |
| **contentStyle** | `object` | Optional. Merged with the default content box style; use to override background or border (e.g. for the guest review card). |
| **children** | `node` | The main content (quote text, date line, etc.). |

---

## What we render

A card (mainView.card) with padding. Top: icon circle + title + subtitle. Bottom: a content box with default pink-tinted style (or overridden by contentStyle), containing the children.

---

## Dependencies

- **theme (colors, fonts, mainView)** — Card and typography.

---

## Used by

- **NotesTab** — Renders two NoteCards: one for the chef's note (with getChefNote) and one for the guest review (with getVipReview), each with a different icon and contentStyle for the second.
