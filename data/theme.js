/**
 * Shared design tokens: colors, fonts, and mainView.card.
 * Only styling used by 2+ components lives here; single-component styling
 * (login card, main shell, tab bar) lives in those components.
 */

// --- Entire app (colors and fonts used across login, dashboard, and all components) ---

/* A named palette: bg is the page background, card is white, pink/gold/ink are accents and text, err is for errors, success for checkmarks. */
export const colors = {
  bg: "#FFF8F3",
  card: "#FFFFFF",
  pink: "#F4B4C3",
  pinkSoft: "#FCEEF2",
  pinkDeep: "#E898AB",
  cream: "#FFF5E6",
  gold: "#D4A96A",
  ink: "#4A3728",
  inkLight: "#9B8B7A",
  lavender: "#E8E0F0",
  err: "#E898AB",
  success: "#7BA67B",
};

/* Which font family to use for titles, body, Chinese, and Japanese. */
export const fonts = {
  display: "'Cormorant Garamond', serif",
  body: "'Cormorant Garamond', serif",
  cn: "'Noto Serif SC', serif",
  jp: "'Zen Maru Gothic', sans-serif",
};

// --- Main dashboard shared (card style used by ArchiveTab, NoteCard, NextReservationCard) ---

/* Card style for dashboard cards; shared by ArchiveTab, NoteCard, NextReservationCard. */
export const mainView = {
  card: {
    background: colors.card,
    borderRadius: 28,
    boxShadow: "0 2px 24px rgba(244,180,195,0.08), 0 8px 48px rgba(74,55,40,0.03)",
  },
};
