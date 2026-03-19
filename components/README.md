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
    MainViewHeader.jsx   Header: logo, title, welcome badge, sound toggle
    SectionDivider.jsx   Decorative line-dot-line divider
    TabBar.jsx           Horizontal tab bar (Menu / Archive / Notes / Requests / Add)

  menu/
    DinnerMenu.jsx       Renders a single dinner menu card (courses + items)
    AddMenuTab.jsx       Accordion form to create/edit a menu (vivian only)
    ArchiveTab.jsx       Past menus list with expandable detail + edit button

  notes/
    NotesTab.jsx         Notes tab: collapsible accordion of per-date cards
    DinnerDateNotes.jsx  Per-date card with chef's note + VIP review
    EditArea.jsx         Textarea with save/cancel for editing notes
    Actions.jsx          Edit/delete action links
    NextReservationCard.jsx  Upcoming reservation summary (pinned at top)
    styles.js            Shared note component styles
```

## Component tree

```
App (src/cafe307.jsx)
 MusicProvider
   LoginPage                      (when not logged in)
     SoundToggle (inline)           speaker icon next to subtitle
   MainView                       (after login)
     MainViewHeader                 logo, badge, sound toggle
     TabBar
     DinnerMenu                   (Menu tab)
     ArchiveTab                   (Archive tab)
       DinnerMenu                   expanded row
     NotesTab                     (Notes tab)
       NextReservationCard          pinned at top
       DinnerDateNotes              one per menu date, accordion
         EditArea
         Actions
     RequestsTab                  (Requests tab)
       PaymentForm                  inline Stripe payment
     AddMenuTab                   (Add tab, vivian only)
```

## Recent changes

- **LoginPage** -- sound toggle (speaker icon) next to the Japanese subtitle, allowing mute/unmute before login
- **MainViewHeader** -- sound toggle icon next to the badge (right side of header)
- **MainView** -- "Add menu" tab label shortened to "Add"; background music switches per tab via MusicContext
- **NotesTab** -- collapsible accordion for multiple menu dates; next reservation info card pinned at top
- **RequestsTab** -- star toggle for granting wishes (vivian/vlad), optional email for receipt, auto-trigger Link tab for one-tap Stripe checkout

## Styling approach

Components use **inline styles** with shared design tokens from `data/config/theme.js`:
- `colors` -- palette (bg, card, pink, gold, ink, etc.)
- `fonts` -- font families (display, body, cn, jp)
- `mainView.card` -- shared card styling

Single-component styles live in the component file. Styles used across 2+ components are in `theme.js`. Notes sub-components share styles via `notes/styles.js`.

## Payment flow (RequestsTab)

1. User types a dish name and clicks "Request $1"
2. `POST /api/requests/create-payment-intent` returns a `clientSecret`
3. Stripe `<Elements>` renders an inline payment form with Card / Link / Apple Pay tabs
4. User completes payment through any method
5. `POST /api/requests/confirm` records the request and sends an optional email receipt
6. The wish list re-fetches and shows updated rankings

## Wish granting (RequestsTab)

Vivian and Vlad see a star icon next to each wish. Clicking it calls `POST /api/requests/grant` to toggle the granted state. Granted wishes display a corner ribbon and a gold star.
