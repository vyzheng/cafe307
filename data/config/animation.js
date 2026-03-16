/**
 * Animation and transition timing constants.
 * Keeping these in one place makes it easy to tune the feel of the app
 * (fade durations, stagger delays, slide distance) without hunting
 * through components.
 */

/*
  LOGIN_FADE_DURATION_MS — The number of milliseconds we wait after the user submits a valid code before we set loggedIn to true and show MainView.
  The login wrapper fades out over this time (see the div's transition in cafe307.jsx), so the value should match how long that fade looks.
  How long the login screen fades out before we show the dashboard.
*/
export const LOGIN_FADE_DURATION_MS = 600;

/*
  FADE_STAGGER_MS — The delay in ms between each course's fade-in on the dinner menu.
  DinnerMenu uses delay={300 + ci * FADE_STAGGER_MS}, so the first course appears at 300ms, the second at 500ms, etc.
  How many ms to wait before animating the next course in.
*/
export const FADE_STAGGER_MS = 200;

/*
  SLIDE_DISTANCE_PX — How many pixels the FadeIn component starts below its final position.
  When isVisible is false we set transform to translateY(SLIDE_DISTANCE_PX); when it becomes true we set translateY(0).
  The transition makes the content slide up as it fades in.
  How far down the content sits before it slides up into place.
*/
export const SLIDE_DISTANCE_PX = 8;
