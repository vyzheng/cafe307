/**
 * Shared styles for notes components (DinnerDateNotes, EditArea, Actions).
 */
import { colors, fonts } from "../../data/config/theme";

export const sectionHeaderStyle = { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 };

export const iconBubbleStyle = {
  width: 24, height: 24, borderRadius: "50%",
  background: `linear-gradient(135deg, ${colors.pinkSoft}, ${colors.cream})`,
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
};

export const titleStyle = { fontFamily: fonts.body, fontSize: 13, color: colors.ink, letterSpacing: 1 };
export const subtitleStyle = { fontFamily: fonts.jp, fontSize: 8, color: colors.gold, opacity: 0.7 };

export const contentBoxReview = {
  padding: "16px 20px", borderRadius: 14,
  background: colors.bg, borderLeft: "2px solid rgba(212,169,106,0.3)",
};

export const contentBoxChef = {
  padding: "16px 20px", borderRadius: 14,
  background: `linear-gradient(135deg, ${colors.bg}, rgba(252,238,242,0.5))`,
  borderLeft: "2px solid rgba(244,180,195,0.3)",
};

export const textareaStyle = {
  width: "100%", padding: 10, border: `1px solid ${colors.inkLight}`, borderRadius: 8,
  fontFamily: fonts.body, fontSize: 13, minHeight: 60, resize: "vertical", boxSizing: "border-box",
};

export const btnStyle = {
  padding: "6px 14px", border: "none", borderRadius: 8,
  background: "linear-gradient(135deg, rgba(244,180,195,0.2), rgba(232,224,240,0.2))",
  fontFamily: fonts.body, fontSize: 11, color: colors.ink, cursor: "pointer",
};

export const linkBtnStyle = {
  background: "none", border: "none", padding: 0,
  fontFamily: fonts.body, fontSize: 11, color: colors.inkLight,
  cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2,
};

export const dividerStyle = {
  height: 1, margin: "24px 0",
  background: `linear-gradient(to right, transparent, ${colors.pink}, transparent)`,
  opacity: 0.3,
};
