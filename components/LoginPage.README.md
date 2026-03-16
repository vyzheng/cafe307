# LoginPage.jsx — Plain-English summary

This component is the full-screen login view. The user sees it until they enter a valid reservation code. It validates the code against a list and calls the parent’s `onLogin` on success; on failure it shows an error message for a few seconds.

---

## What we define before the return (and how it affects the return)

### 1. `code` (and `setCode`)
We remember whatever the user has typed in the reservation code field. It starts as an empty string.

**Effect on return:** The input is controlled: `value={code}`. Typing updates `code` via `onChange`; when the user presses Enter we read `code` in `handleSubmit` to validate it. So this state is what we actually check and what the user sees in the field.

---

### 3. `err` (and `setErr`)
We remember whether to show the “No reservation found” message. It starts as false.

**Effect on return:** When `err` is true we render the error div; the input’s bottom border uses `err` to turn red. We set `err` true on bad submit and false after a delay (or when the user types again). So this state controls both the error text and the red border.

---

### 4. `viewport` (and `setViewport`) + resize `useEffect`
We remember the current viewport size (`w` and `h`). On mount we set it from `window.innerWidth` / `window.innerHeight` (or theme's `loginCardMinWidth` and 600 if `window` isn't available) and add a `resize` listener that updates viewport when the user resizes the window; we remove the listener on unmount. We use `viewport.w` as `width` for the scale logic.

**Effect on return:** `width` (from viewport) feeds into the scale formula; when the user resizes, viewport and width change, scale and all derived values update, and the card and content re-render at the new size. So the card scales smoothly with the window.

---

### 5. `handleSubmit`
Runs when the user clicks Enter or the Enter button. We lowercase and trim `code`, check if it’s in the valid-codes list: if yes we call `onLogin()`; if no we set `err` true and schedule `setErr(false)` after a few seconds.

**Effect on return:** The button’s `onClick` and the input’s `onKeyDown` (Enter) both call `handleSubmit`. So the return wires the only way to “submit” into this logic.

---

### 6. `scale` and derived style values
`scale` is computed from `width`: on mobile (width < 960) it goes from 1 at 320px to loginCardMaxScale (1.5) at 960px, linear in between; on desktop (width ≥ 960) we use a fixed scale so the card stays at the same size as mobile at 960px (570×660), with no jump at the breakpoint. Every card and content dimension (maxWidth, padding, fontSize, margins, borderRadius, letterSpacing) is the base (mobile) value × scale, rounded.

**Effect on return:** All card and content inline styles use these variables instead of hardcoded numbers. So the return renders a card whose size and typography scale smoothly with viewport, and stay consistent when crossing the 960px breakpoint.

---

### 7. Imports used in the return
- **LOGIN_COPY** (loginConstants) — All visible copy: title, subtitle, input label, placeholder, button label, error message, footer, icon. The return uses these instead of hardcoded strings.
- **loginCardFadeDelays** (theme) — FadeIn delay in ms for each section (title, input, button, footer); we pass them to the four FadeIn components for staggered reveal.
- **FadeIn** — Wraps each block; delay comes from loginCardFadeDelays. Affects how the card appears, not the logic.
- **colors, fonts** — Shared theme; used in all inline styles so the page matches the rest of the app.
- **VALID_LOGIN_CODES, ERROR_DISPLAY_MS** — Used only in `handleSubmit` (validation and error timeout). They indirectly affect what the return shows by controlling when we call `onLogin` and how long the error stays.

---

### 8. `LoginPage.propTypes`
We declare that the parent must pass `onLogin` (a function). If it’s missing or wrong type, we get a dev warning.

**Effect on return:** The return uses `onLogin` by passing it to `handleSubmit` (we call it when the code is valid). PropTypes don’t change the JSX; they document and check the contract.

---

## The return in one sentence

A full-height centered container with the app background holds a white card whose size and text scale smoothly with viewport (from base size at 320px to 1.5× at 960px, then fixed at that size on wider screens so there is no jump); inside we show title, a controlled input driven by `code` (with red border when `err`), an Enter button, the error message when `err`, and a footer—each block wrapped in `FadeIn` with staggered delays, and submit (Enter or button) runs `handleSubmit` which either calls `onLogin()` or shows the error.
