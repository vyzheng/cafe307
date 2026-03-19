# Components

React components organized by feature area.

## Directory structure

```
components/
  MainView.jsx           Top-level dashboard: tab routing, data fetching, state
  RequestsTab.jsx        Dish request voting with inline Stripe payment

  auth/
    LoginPage.jsx        Full-screen login (reservation code input + validation)

  layout/
    FadeIn.jsx           Reusable fade-in + slide-up animation wrapper
    MainViewHeader.jsx   Header: logo, title, welcome badge
    SectionDivider.jsx   Decorative line-dot-line divider
    TabBar.jsx           Horizontal tab bar (Menu / Archive / Notes / Requests)

  menu/
    DinnerMenu.jsx       Renders a single dinner menu card (courses + items)
    AddMenuTab.jsx       Form to create/edit a menu (vivian only)
    ArchiveTab.jsx       Past menus list with expandable detail

  notes/
    NotesTab.jsx         Notes tab: renders per-date cards + reservation card
    DinnerDateNotes.jsx  Per-date card with chef's note + VIP review
    EditArea.jsx         Textarea with save/cancel for editing notes
    Actions.jsx          Edit/delete action links
    NextReservationCard.jsx  Upcoming reservation summary
    styles.js            Shared note component styles
```

## Component tree

```
App (src/cafe307.jsx)
 MusicProvider
   LoginPage                      (when not logged in)
   MainView                       (after login)
     MainViewHeader
     TabBar
     DinnerMenu                   (Menu tab)
     ArchiveTab                   (Archive tab)
       DinnerMenu                 (expanded row)
     NotesTab                     (Notes tab)
       DinnerDateNotes
       NextReservationCard
     RequestsTab                  (Requests tab)
     AddMenuTab                   (vivian only)
```

## Styling approach

Components use **inline styles** with shared design tokens from `data/config/theme.js`:
- `colors` -- palette (bg, card, pink, gold, ink, etc.)
- `fonts` -- font families (display, body, cn, jp)
- `mainView.card` -- shared card styling

Single-component styles live in the component file. Styles used across 2+ components are in `theme.js`.

## Payment flow (RequestsTab)

1. User types a dish name and clicks "Request $1"
2. `POST /api/requests/create-payment-intent` returns a `clientSecret`
3. Stripe `<Elements>` renders an inline payment form with Card / Link / Apple Pay tabs
4. User completes payment through any method
5. `POST /api/requests/confirm` records the request and sends an optional email receipt
6. The wish list re-fetches and shows updated rankings
