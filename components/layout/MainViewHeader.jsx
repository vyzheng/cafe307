/**
 * Header for the main dashboard: logo, "Cafe 307", "Welcome back", badge,
 * and a speaker icon to mute/unmute background music (via MusicContext).
 * No props; reads header copy from config and music state from context.
 */

import { colors, fonts } from "../../data/config/theme";
import { mainViewHeader } from "../../data/config/header";
import { useMusic } from "../../src/context/MusicContext";

function MainViewHeader() {
  const { toggleMute, muted } = useMusic();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "0 4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{mainViewHeader.icon}</span>
        <div>
          <div style={{ fontFamily: fonts.display, fontSize: 16, color: colors.ink, letterSpacing: 2 }}>{mainViewHeader.name}</div>
          <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.inkLight, letterSpacing: 2 }}>{mainViewHeader.welcomeMessage}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ padding: "6px 14px", background: "rgba(232,224,240,0.3)", borderRadius: 20, fontFamily: fonts.jp, fontSize: 9, color: colors.pinkDeep, letterSpacing: 1 }}>
          {mainViewHeader.badge}
        </div>
        {/* Sound toggle: speaker icon next to badge; muted state dims opacity.
            Placed in header so it's accessible from any tab. */}
        <span
          onClick={toggleMute}
          style={{
            fontSize: 14, cursor: "pointer", opacity: muted ? 0.35 : 0.7,
            transition: "opacity 0.2s", userSelect: "none",
          }}
          title={muted ? "Sound on" : "Sound off"}
        >
          {muted ? "🔇" : "🔊"}
        </span>
      </div>
    </div>
  );
}

export default MainViewHeader;
