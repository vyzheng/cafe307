# NotesTab.jsx — Plain-English summary

This component is the content of the Notes tab: three cards stacked vertically. The first shows the chef's note for the given menu date (from getChefNote); the second shows the guest review (from getVipReview), in quotes; the third is the static "Next reservation" card. If a note or review is missing, we show "—". The parent passes the current menu's date so we look up the right note and review.

---

## Props

| Prop | Type | Purpose |
|------|------|---------|
| **menuDate** | `string` | The date string for the featured menu; we pass it to getChefNote and getVipReview and display it under each card. |

---

## What we render

- **NoteCard (Chef's Notes)** — Icon 👩‍🍳, title "Chef's Notes", subtitle "料理人の一言", then the chef note text and the date line.
- **NoteCard (Guest Review)** — Icon 🪑, title "Guest Review", subtitle "お客様の声", then the quoted review and "— Guest, {menuDate}".
- **NextReservationCard** — Static next reservation summary.

---

## Dependencies

- **theme (colors, fonts)** — Typography in the note content.
- **data/chefsNotes (getChefNote)** — Returns the chef note for the date or null.
- **data/vipReviews (getVipReview)** — Returns the guest review for the date or null.
- **NoteCard** — Reusable card for chef note and guest review.
- **NextReservationCard** — Static reservation card.

---

## Used by

- **MainView** — Renders `<NotesTab menuDate={currentMenu.date} />` when `tab === "notes"`, wrapped in `FadeIn delay={300}`.
