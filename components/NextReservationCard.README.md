# NextReservationCard.jsx — Plain-English summary

This component is a small card showing the next reservation: "Next Reservation" label, "Thursday", "Party size: 2", and a green "✓ always confirmed" badge. It has no props; the content is static. Used at the bottom of the Notes tab.

---

## What we render

A centered card (mainView.card) with the reservation summary and a success-style badge. All text and layout are fixed.

---

## Dependencies

- **theme (colors, fonts, mainView)** — Card style and typography.

---

## Used by

- **NotesTab** — Renders this as the third card in the Notes tab column.
