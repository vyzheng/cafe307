/**
 * A single note block: icon + title/subtitle header, then content area.
 * Used for Chef's Notes and Guest Review in NotesTab; contentStyle customizes the inner box (e.g. left border).
 */

import PropTypes from "prop-types";
import { colors, fonts, mainView } from "../data/theme";

const defaultContentStyle = {
  padding: "16px 20px",
  background: "linear-gradient(135deg, #FFF8F3, rgba(252,238,242,0.5))",
  borderRadius: 14,
  borderLeft: "2px solid rgba(244,180,195,0.3)",
};

function NoteCard({ icon, title, subtitle, contentStyle, children }) {
  const mergedContentStyle = { ...defaultContentStyle, ...contentStyle };
  return (
    <div style={{ ...mainView.card, padding: "36px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FCEEF2, #FFF5E6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink, letterSpacing: 1 }}>{title}</div>
          <div style={{ fontFamily: fonts.jp, fontSize: 8, color: colors.gold, opacity: 0.7 }}>{subtitle}</div>
        </div>
      </div>
      <div style={mergedContentStyle}>{children}</div>
    </div>
  );
}

NoteCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  contentStyle: PropTypes.object,
  children: PropTypes.node.isRequired,
};

NoteCard.defaultProps = {
  contentStyle: {},
};

export default NoteCard;
