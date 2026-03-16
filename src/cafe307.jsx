/**
 * Cafe 307 — Private dining menu app.
 * Enter a reservation code to view the dinner menu, archive, and notes.
 * Root App component and login/main-view routing.
 */

/*
  import { useState, useEffect } — We pull two things from React: useState (so we can "remember" values that change, like loggedIn and fade) and useEffect (so we can run code once when the component first appears, like loading fonts).
  Give me the tools to hold changing state and to run setup code on mount.
*/
import { useState, useEffect } from "react";

/*
  import LoginPage — We load the component that shows the reservation-code input and Enter button; the browser will render it when we're not logged in.
  The login screen lives in this file.
*/
import LoginPage from "../components/LoginPage";

/*
  import MainView — We load the component that shows the dashboard (header, Menu/Archive/Notes tabs, and the content for each tab); we render it after a successful login.
  The main screen after login lives in this file.
*/
import MainView from "../components/MainView";

/*
  import LOGIN_FADE_DURATION_MS — The number of milliseconds we wait after the user logs in before we switch from the login screen to the main view; the login wrapper fades out over this time so the swap doesn't feel abrupt.
  How long the fade-out lasts before we show the dashboard.
*/
import { LOGIN_FADE_DURATION_MS } from "../data/animationConstants";
import { MusicProvider } from "./context/MusicContext";

/**
 * Root component: shows LoginPage when not logged in, MainView when logged in.
 * This is the top-level "App" that decides which screen to show.
 */
export default function App() {
  /*
    const [loggedIn, setLoggedIn] = useState(false);
    useState(false) — React's hook for "remembering" a value that can change.
    The false is the initial value: the first time the component runs, this piece of state is false.
    [loggedIn, setLoggedIn] — useState returns an array of two things; we destructure them: loggedIn is the current value (right now false); setLoggedIn is the function to update it (e.g. setLoggedIn(true)).
    When we call setLoggedIn, React re-renders and loggedIn becomes the new value.
    Remember a value that starts as false. Call the value loggedIn and the updater setLoggedIn. When it's false we show the login screen; when it becomes true we show the main dashboard.
  */
  const [loggedIn, setLoggedIn] = useState(false);
  const [userCode, setUserCode] = useState(null);

  /*
    const [fade, setFade] = useState(false);
    Same pattern as loggedIn: we remember a value that starts as false.
    Here fade means "we are currently fading out the login screen."
    The wrapper div uses fade to set opacity: when fade is true the div goes to opacity 0.
    After LOGIN_FADE_DURATION_MS we set loggedIn to true and set fade back to false.
    Remember whether we're in the middle of the fade-out; the div uses it to animate opacity.
  */
  const [fade, setFade] = useState(false);

  /*
    useEffect(() => { ... }, []);
    useEffect runs a function when the component mounts (or when a dependency changes).
    The first argument: we create a <link> for Google Fonts, set href and rel, append to document.head, and log a welcome message.
    The second argument [] is the dependency array; empty means "run only once when the component first appears."
    When the app first loads, inject the font stylesheet and print a welcome message; do it once.
  */
  useEffect(() => {
    const fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Serif+SC:wght@200;300;400;600&family=Zen+Maru+Gothic:wght@300;400;500&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
    console.log("%cWelcome to Cafe 307. Your table is ready.", "color: #D4A96A; font-family: serif; font-size: 14px; font-style: italic;");
  }, []);

  /*
    handleSubmitLogin — LoginPage calls this when the user submits a valid code.
    We do two things: 
    setFade(true) so the wrapper div starts fading out; 
    then setTimeout runs after LOGIN_FADE_DURATION_MS and calls setLoggedIn(true) and setFade(false).
    Start the fade-out, then after the fade duration switch to the main view and clear the fade flag.
  */
  const handleSubmitLogin = (code) => {
    setUserCode(code ?? null);
    setFade(true);
    setTimeout(() => { setLoggedIn(true); setFade(false); }, LOGIN_FADE_DURATION_MS);
  };

  /*
    return — We wrap everything in a div.
    The div's style: opacity is 0 when fade is true (so we see the fade-out), 1 otherwise; 
    transition animates the opacity over 0.5s.
    Inside we use a ternary: 
    if !loggedIn we show LoginPage and pass handleSubmitLogin as onLogin; 
    if loggedIn we show MainView.
    A wrapper that fades out when we're logging in; 
    inside we show either the login screen or the main dashboard.
  */
  return (
    <MusicProvider>
      <div style={{ opacity: fade ? 0 : 1, transition: "opacity 0.5s ease" }}>
        {!loggedIn ? <LoginPage onLogin={handleSubmitLogin} /> : <MainView userCode={userCode} />}
      </div>
    </MusicProvider>
  );
}
