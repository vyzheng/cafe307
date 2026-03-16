# index.html — Plain-English summary

This file is the **single HTML page** the browser loads. It provides the `#root` div and the script that loads the React entry file. There is no React or JSX here—only the minimal HTML that Vite serves and that React then takes over.

---

## What we have (and what it does)

### 1. `<div id="root"></div>`
The only element we need in the body for React. main.jsx does `document.getElementById("root")` to find this div, then `createRoot(...).render(<App />)` so React draws the whole app inside it.

**Effect:** The empty box where the React app lives; the script finds it by id and renders App there. Everything the user sees (login or main view) is rendered inside this div.

---

### 2. `<script type="module" src="/src/main.jsx"></script>`
`type="module"` means the browser loads this as an ES module (so we can use `import`). `src` is the path to our entry file; Vite’s dev server serves it and compiles JSX. When the page loads, the browser runs main.jsx, which mounts the App component into `#root`.

**Effect:** Loading and running main.jsx is what mounts the React app into the div above. Without this script, the page would be an empty root div.

---

### 3. Head: charset, viewport, title
Standard setup: UTF-8, mobile-friendly viewport, and the page title “Cafe 307.”

**Effect:** Affects how the page is decoded, how it scales on small screens, and what appears in the browser tab. No direct effect on what React renders.

---

## In one sentence

This HTML file provides the `#root` div and the script that loads main.jsx; the script mounts the React app into that div, so the whole UI is driven by React from then on.
