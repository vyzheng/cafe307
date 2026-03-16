# animationConstants.js — Plain-English summary

This file holds **animation and transition timing constants**. Keeping them in one place makes it easy to tune fade durations, stagger delays, and slide distance without editing multiple components.

---

## What we export (and how it’s used)

### 1. `LOGIN_FADE_DURATION_MS` (600)
How many milliseconds we wait after the user submits a valid code before we set `loggedIn` to true and show MainView. The login wrapper in `cafe307.jsx` fades out over this time.

**Effect in the app:** Used in `cafe307.jsx` inside `handleSubmitLogin`: we call `setTimeout(..., LOGIN_FADE_DURATION_MS)` before flipping `loggedIn` and `fade`. So this value controls how long the login screen stays visible while fading out.

---

### 2. `FADE_STAGGER_MS` (200)
The delay in ms between each course’s fade-in on the dinner menu. DinnerMenu uses `delay={300 + ci * FADE_STAGGER_MS}` so courses appear one after another.

**Effect in the app:** Imported in `DinnerMenu.jsx` and used in the FadeIn delay for each course. So it controls how “spread out” the course animations feel.

---

### 3. `SLIDE_DISTANCE_PX` (8)
How many pixels the FadeIn component starts below its final position. When not visible we use `translateY(SLIDE_DISTANCE_PX)`; when visible we use `translateY(0)`.

**Effect in the app:** Imported in `FadeIn.jsx` and used in the wrapper div’s `transform`. So it controls how far content slides up when it fades in.

---

## In one sentence

This file exports three numbers that control the login fade duration, the stagger between menu course animations, and the slide distance for FadeIn; the components that use them stay in sync by importing from here.
