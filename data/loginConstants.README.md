# loginConstants.js — Plain-English summary

This file holds **login-page configuration**: the list of valid reservation codes and how long the error message stays on screen. The login page checks the user’s input (lowercased and trimmed) against the codes and uses the duration for the error timeout.

---

## What we export (and how it’s used)

### 1. `VALID_LOGIN_CODES`
An array of strings (e.g. `"vlad"`, `"mushu"`, `"vivian"`, …). LoginPage takes the user’s input, runs `.toLowerCase().trim()`, and checks if the result is in this array with `.includes()`.

**Effect in the app:** Used in `LoginPage.jsx` inside `handleSubmit`. If the trimmed, lowercased input is in this list we call `onLogin()`; otherwise we show the error and start the timeout. So this array is the only source of “who can log in.”

---

### 2. `ERROR_DISPLAY_MS` (3000)
How many milliseconds we show “No reservation found” before we call `setErr(false)` and hide it. LoginPage uses `setTimeout(() => setErr(false), ERROR_DISPLAY_MS)` when the user submits an invalid code.

**Effect in the app:** Used in `LoginPage.jsx` inside `handleSubmit`. So this value controls how long the error message stays visible before it disappears.

---

### 3. `LOGIN_COPY`
An object of all user-visible copy on the login screen: `icon`, `title`, `subtitle`, `inputLabel`, `placeholder`, `buttonLabel`, `errorMessage`, `footer`. LoginPage imports it and uses these keys so copy can be changed in one place.

**Effect in the app:** LoginPage renders `LOGIN_COPY.title`, `LOGIN_COPY.subtitle`, `LOGIN_COPY.inputLabel`, etc., instead of hardcoded strings; changing a value here updates the login card text everywhere.

---

## In one sentence

This file exports the list of accepted reservation codes, the error display duration, and all login-screen copy; LoginPage imports them for validation, error UX, and visible text.
