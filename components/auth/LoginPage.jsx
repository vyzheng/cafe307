/**
 * Full-screen login view; validates reservation code and calls onLogin on success.
 * This is the first screen the user sees until they enter a valid code.
 */

/* State for values that change; effect for subscribing to window resize. */
import { useState, useEffect, useMemo } from "react";

/* We use this to document and check that the parent passes onLogin. */
import PropTypes from "prop-types";

/* The component that animates content in with a delay. */
import FadeIn from "../layout/FadeIn";

/* Shared colors and fonts. */
import { colors, fonts } from "../../data/config/theme";

/* The list of valid codes and how long the error message stays on screen. */
import { VALID_LOGIN_CODES, ERROR_DISPLAY_MS, LOGIN_COPY } from "../../data/config/login";
import { useMusic } from "../../src/context/MusicContext";

/* Login card layout and animation; only used by this component. */
const loginCardBaseWidth = 380;
const loginCardBaseHeight = 440;
const loginCardBase = {
  card: { maxWidth: 380, paddingV: 64, paddingH: 48, borderRadius: 28 },
  title: { blockMarginBottom: 40, iconFontSize: 36, iconMarginBottom: 16, cafe307FontSize: 32, cafe307MarginBottom: 6, cafe307LetterSpacing: 4, jpFontSize: 10, jpLetterSpacing: 4 },
  input: { blockMarginBottom: 32, labelFontSize: 11, labelLetterSpacing: 3, labelMarginBottom: 12, paddingV: 14, inputFontSize: 18, inputLetterSpacing: 4 },
  button: { paddingV: 14, borderRadius: 14, fontSize: 13, letterSpacing: 3 },
  error: { marginTop: 16, fontSize: 12 },
  footer: { marginTop: 36, fontSize: 9, letterSpacing: 3 },
};
const loginCardMinWidth = 320;
const loginCardMaxWidth = 960;
const loginCardMaxScale = 1.5;
const loginCardDesktopMaxWidth = 570;
const loginCardDesktopMaxHeight = 660;
const loginCardFadeDelays = {
  title: 100,
  input: 400,
  button: 600,
  footer: 800,
};

/**
 * Login screen: reservation code input and submit; calls onLogin on valid code.
 * The parent (App) passes onLogin so we can tell it when the user has logged
 * in successfully.
 */
function LoginPage({ onLogin }) {
  const { setTrack, tryPlay } = useMusic();
  /* Remember what the user has typed in the reservation code field. */
  const [code, setCode] = useState("");

  /* Remember whether to show the error message; we turn it on on bad submit and off after a few seconds or when they type. */
  const [err, setErr] = useState(false);

  /* Track viewport size so we can scale the card and on desktop enforce the same aspect ratio as mobile. */
  const [viewport, setViewport] = useState(() =>
    typeof window !== "undefined" ? { w: window.innerWidth, h: window.innerHeight } : { w: loginCardMinWidth, h: 600 }
  );
  useEffect(() => {
    setTrack("login");
  }, [setTrack]);
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const width = viewport.w;
  const height = viewport.h;

  /* If the code is valid, tell the parent we're logged in; otherwise show the error and hide it after a delay. */
  const handleSubmit = () => {
    const trimmed = code.toLowerCase().trim();
    if (VALID_LOGIN_CODES.includes(trimmed)) {
      onLogin(trimmed);
    } else {
      setErr(true);
      setTimeout(() => setErr(false), ERROR_DISPLAY_MS);
    }
  };

  const isDesktop = width >= loginCardMaxWidth;

  /* On desktop (width ≥ 960): use fixed max width/height matching mobile at 960px so there is no jump at the breakpoint. */
  const desktopCardWidth = isDesktop ? loginCardDesktopMaxWidth : null;
  const desktopCardHeight = isDesktop ? loginCardDesktopMaxHeight : null;
  const desktopScale = isDesktop ? loginCardDesktopMaxWidth / loginCardBaseWidth : null;

  /* Mobile: scale from 1x at 320px to loginCardMaxScale (1.5) at 960px; same proportions and font sizes across the range. */
  const mobileScale = Math.min(loginCardMaxScale, Math.max(1, 1 + (width - loginCardMinWidth) / (loginCardMaxWidth - loginCardMinWidth)));

  const scale = isDesktop && desktopScale != null ? desktopScale : mobileScale;

  const sizes = useMemo(() => {
    const scaleNum = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Math.round(v * scale)]));
    const card = scaleNum(loginCardBase.card);
    return {
      card: {
        ...card,
        padding: `${card.paddingV}px ${card.paddingH}px`,
      },
      title: scaleNum(loginCardBase.title),
      input: scaleNum(loginCardBase.input),
      button: scaleNum(loginCardBase.button),
      error: scaleNum(loginCardBase.error),
      footer: scaleNum(loginCardBase.footer),
    };
  }, [scale]);

  const cardMaxWidth = isDesktop && desktopCardWidth != null ? desktopCardWidth : sizes.card.maxWidth;
  const cardMaxHeight = isDesktop && desktopCardHeight != null ? desktopCardHeight : undefined;

  return (
    /* A full-height, centered container with the app background so the card floats in the middle; scrolls when the card is taller than the viewport so the full card is visible. */
    <div style={{
      minHeight: "100vh", overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "center",
      padding: "40px 16px", background: colors.bg,
      backgroundImage: "radial-gradient(circle at 20% 30%, rgba(244,180,195,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(253,220,204,0.1) 0%, transparent 50%)"
    }}>
      {/* The white card; its size scales with viewport so it's readable on desktop and compact on mobile. */}
      <div style={{
        background: colors.card, width: "100%", maxWidth: cardMaxWidth, maxHeight: cardMaxHeight, padding: sizes.card.padding,
        borderRadius: sizes.card.borderRadius, position: "relative",
        boxShadow: "0 2px 20px rgba(244,180,195,0.12), 0 8px 40px rgba(74,55,40,0.05)",
        overflow: "hidden",
      }}>
        {/* Animate this block in after 100ms. */}
        <FadeIn delay={loginCardFadeDelays.title}>
          <div style={{ textAlign: "center", marginBottom: sizes.title.blockMarginBottom }}>
            <div style={{ fontSize: sizes.title.iconFontSize, marginBottom: sizes.title.iconMarginBottom }}>{LOGIN_COPY.icon}</div>
            <div style={{ fontFamily: fonts.display, fontSize: sizes.title.cafe307FontSize, fontWeight: 300, color: colors.ink, letterSpacing: sizes.title.cafe307LetterSpacing, lineHeight: 1.2, marginBottom: sizes.title.cafe307MarginBottom }}>
              {LOGIN_COPY.title}
            </div>
            <div style={{ fontFamily: fonts.jp, fontSize: sizes.title.jpFontSize, fontWeight: 300, color: colors.pinkDeep, letterSpacing: sizes.title.jpLetterSpacing, opacity: 0.7 }}>
              {LOGIN_COPY.subtitle}
            </div>
          </div>
        </FadeIn>

        {/* Animate the input area in after 400ms. */}
        <FadeIn delay={loginCardFadeDelays.input}>
          <div style={{ marginBottom: sizes.input.blockMarginBottom }}>
            <label style={{
              display: "block", fontFamily: fonts.body, fontSize: sizes.input.labelFontSize, letterSpacing: sizes.input.labelLetterSpacing,
              color: colors.inkLight, textTransform: "uppercase", marginBottom: sizes.input.labelMarginBottom, textAlign: "center"
            }}>
              {LOGIN_COPY.inputLabel}
            </label>
            {/* The text field is driven by code state; typing updates state and clears the error; Enter submits. */}
            <input
              type="text" value={code}
              onChange={e => { setCode(e.target.value); setErr(false); }}
              onFocus={tryPlay}
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
              placeholder={LOGIN_COPY.placeholder}
              style={{
                width: "100%", padding: `${sizes.input.paddingV}px 0`, border: "none",
                borderBottom: `1px solid ${err ? colors.err : "rgba(232,152,171,0.3)"}`,
                background: "transparent", fontFamily: fonts.body, fontSize: sizes.input.inputFontSize,
                color: colors.ink, textAlign: "center", letterSpacing: sizes.input.inputLetterSpacing, outline: "none",
                transition: "border-color 0.3s", caretColor: colors.gold
              }}
            />
          </div>
        </FadeIn>

        {/* Animate the button in after 600ms; click runs handleSubmit. */}
        <FadeIn delay={loginCardFadeDelays.button}>
          <button onClick={handleSubmit} style={{
            display: "block", width: "100%", padding: `${sizes.button.paddingV}px 0`, border: "none",
            background: "linear-gradient(135deg, rgba(244,180,195,0.15), rgba(232,224,240,0.2))",
            borderRadius: sizes.button.borderRadius, fontFamily: fonts.body, fontSize: sizes.button.fontSize, letterSpacing: sizes.button.letterSpacing,
            color: colors.ink, cursor: "pointer", transition: "all 0.3s"
          }}>
            {LOGIN_COPY.buttonLabel}
          </button>
        </FadeIn>

        {/* Show the error message only when err is true. */}
        {err && (
          <div style={{
            textAlign: "center", marginTop: sizes.error.marginTop, fontFamily: fonts.body,
            fontStyle: "italic", fontSize: sizes.error.fontSize, color: colors.err, opacity: 0.8
          }}>
            {LOGIN_COPY.errorMessage}
          </div>
        )}

        {/* Animate the footer in after 800ms. */}
        <FadeIn delay={loginCardFadeDelays.footer}>
          <div style={{ textAlign: "center", marginTop: sizes.footer.marginTop }}>
            <div style={{ fontFamily: fonts.body, fontSize: sizes.footer.fontSize, letterSpacing: sizes.footer.letterSpacing, color: colors.inkLight, opacity: 0.4, textTransform: "uppercase" }}>
              {LOGIN_COPY.footer}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* Document that this component requires an onLogin function. */
LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default LoginPage;
