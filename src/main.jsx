/**
 * Entry point: mounts the App root component to the DOM.
 * This file is what the browser loads first; it finds the #root div and
 * renders our React app inside it.
 */

/*
  import { createRoot } from "react-dom/client" — createRoot is the React 18 API that attaches a React tree to a real DOM node.
  We need it so we can "mount" our App component into the page.
  Give me the function that connects React to the DOM.
*/
import { createRoot } from "react-dom/client";

/*
  import App from "./cafe307" — App is our root component (the function that returns either LoginPage or MainView).
  We import it so we can pass it to render.
  Our top-level component lives in cafe307.jsx.
*/
import App from "./cafe307";

/*
  createRoot(document.getElementById("root")).render(<App />);
  document.getElementById("root") — Finds the one HTML element whose id is "root" (that div is in index.html).
  That's the empty box where we want our app to live.
  createRoot(...) — Creates a React "root" for that DOM node; the root is the bridge between React and that part of the page.
  .render(<App />) — Tells React to render the App component inside that root.
  From now on, everything the user sees in #root is controlled by React.
  Find the #root div, create a React root for it, and draw the App component there.
*/
createRoot(document.getElementById("root")).render(<App />);
