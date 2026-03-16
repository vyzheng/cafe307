# cafe307.jsx — Plain-English summary

This file defines the root **App** component. It decides whether to show the login screen or the main dashboard and runs a one-time setup (fonts, console message).

---

## What we define before the return (and how it affects the return)

### 1. `loggedIn` (and `setLoggedIn`)
We remember whether the user has logged in. It starts as **false**.

**Effect on return:** The ternary uses `!loggedIn` to decide what to show. When `loggedIn` is false we render the login page; when it becomes true we render the main view. So this value is what actually switches the screen.

---

### 2. `fade` (and `setFade`)
We remember whether we're in the middle of the "logging in" fade-out. It starts as **false**.

**Effect on return:** The wrapper div's opacity is `fade ? 0 : 1`. When `fade` is true the div fades to invisible; when it's false the div is fully visible. So this value controls the fade animation of whatever is inside the div (login page or main view).

---

### 3. `useEffect` (fonts + console)
When the app first loads we inject the Google Fonts stylesheet and log a styled message in the browser console. We only run this once (empty dependency array).

**Effect on return:** It doesn't change what the return renders. It's a side effect that runs once and affects the page (fonts) and the dev console. The return doesn't reference it.

---

### 4. `handleSubmitLogin`
This is the function we run when the user successfully logs in (LoginPage calls it as `onLogin`). It turns on the fade, then after a delay sets the user as logged in and turns the fade off.

**Effect on return:** We pass `handleSubmitLogin` to `LoginPage` as `onLogin`. So the return both decides to show `LoginPage` when not logged in and gives it the function it needs to tell App "login succeeded."

---

### 5. `LOGIN_FADE_DURATION_MS` (imported)
A number (600): how many milliseconds we wait during the login fade before switching to the main view.

**Effect on return:** The return doesn't use it directly. Only `handleSubmitLogin` uses it for the delay. So it indirectly affects *when* the screen switches after the fade.

---

## The return in one sentence

We wrap everything in a div whose opacity fades when `fade` is true; inside we show either the login page (and pass `handleSubmitLogin` so it can tell us when login succeeds) or the main dashboard, depending on `loggedIn`.
