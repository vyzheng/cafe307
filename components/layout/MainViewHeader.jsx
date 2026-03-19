/**
 * Header for the main dashboard: logo, "Cafe 307", "Welcome back", and badge.
 * No props; used at the top of MainView.
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
        {/* Sound toggle */}
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
        <div style={{ padding: "6px 14px", background: "rgba(232,224,240,0.3)", borderRadius: 20, fontFamily: fonts.jp, fontSize: 9, color: colors.pinkDeep, letterSpacing: 1 }}>
          {mainViewHeader.badge}
        </div>
      </div>
    </div>
  );
}

export default MainViewHeader;
