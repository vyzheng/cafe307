# main.jsx — Plain-English summary

This file is the **entry point** of the React app. The browser loads it first; it finds the `#root` div and renders the App component inside it. There is no component function or return—just one line that mounts the app.

---

## What we have (and what it does)

### 1. `createRoot` (imported from "react-dom/client")
The React 18 API that attaches a React tree to a real DOM node. We need it so we can "mount" our App component into the page.

**Effect:** We call it in the last line with the `#root` element.

---

### 2. `App` (imported from "./cafe307")
Our root component—the function that returns either LoginPage or MainView depending on login state.

**Effect:** We pass it to `.render(<App />)` so React draws that component tree inside the root.

---

### 3. The single line: `createRoot(document.getElementById("root")).render(<App />);`

- **document.getElementById("root")** — Finds the one HTML element whose id is "root" (that div is in index.html). That's the empty box where we want our app to live.

- **createRoot(...)** — Creates a React "root" for that DOM node; the root is the bridge between React and that part of the page.

- **.render(<App />)** — Tells React to render the App component inside that root. From now on, everything the user sees in `#root` is controlled by React.

**In one sentence:** Find the `#root` div, create a React root for it, and draw the App component there.
