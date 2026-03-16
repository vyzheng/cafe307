# Components

React components organized by feature.

## Structure

```
components/
  MainView.jsx              ← top-level dashboard (tab routing, data fetching)
  auth/
    LoginPage.jsx            ← full-screen login (reservation code input)
  layout/
    FadeIn.jsx               ← reusable fade-in + slide-up animation wrapper
    SectionDivider.jsx       ← decorative line-dot-line divider
    TabBar.jsx               ← horizontal tab bar (Menu / Archive / Notes)
    MainViewHeader.jsx       ← header with logo, title, welcome badge
  menu/
    DinnerMenu.jsx           ← renders a single dinner menu card (courses + items)
    AddMenuTab.jsx           ← form to create/edit a menu (vivian only)
    ArchiveTab.jsx           ← past menus list with expandable detail
  notes/
    NotesTab.jsx             ← notes tab: renders per-date cards + reservation card
    DinnerDateNotes.jsx      ← per-date card with VIP review + chef's notes
    EditArea.jsx             ← textarea + save/cancel for editing notes
    Actions.jsx              ← edit/delete action links
    NextReservationCard.jsx  ← upcoming reservation summary
```

## Component tree

```
App (src/cafe307.jsx)
└── MusicProvider
    ├── LoginPage
    └── MainView
        ├── MainViewHeader
        ├── TabBar
        ├── DinnerMenu        (Menu tab)
        ├── ArchiveTab         (Archive tab)
        │   └── DinnerMenu     (expanded row)
        ├── NotesTab           (Notes tab)
        │   ├── DinnerDateNotes (one per menu date)
        │   └── NextReservationCard
        └── AddMenuTab         (vivian only)
```
