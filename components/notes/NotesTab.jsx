/**
 * Notes tab: next reservation info at top, then a collapsible accordion of
 * per-date note cards. The latest date starts expanded; older dates are
 * collapsed with a "tap to expand" hint. Only one date can be open at a
 * time (clicking a second header closes the first), keeping the view tidy
 * as the number of past menus grows.
 */
import { useState } from "react";
import PropTypes from "prop-types";
import DinnerDateNotes from "./DinnerDateNotes";
import NextReservationCard from "./NextReservationCard";
import { colors, fonts } from "../../data/config/theme";

function NotesTab({ menuDates, userCode, upcomingMenuDate }) {
  /* Accordion state: only one date open at a time.
     Latest date (first in list) starts expanded so the user sees
     current notes immediately. Clicking the same header collapses it. */
  const [openDate, setOpenDate] = useState(menuDates[0] ?? null);

  const toggleDate = (date) => {
    setOpenDate((prev) => (prev === date ? null : date));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Next reservation — always at the top */}
      <NextReservationCard menuDate={upcomingMenuDate} />

      {/* Per-date notes cards */}
      {menuDates.map((date) => {
        const isOpen = openDate === date;
        return (
          <div key={date}>
            {/* Collapsible header */}
            <div
              onClick={() => toggleDate(date)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", cursor: "pointer", userSelect: "none",
                background: "rgba(255,255,255,0.8)",
                borderRadius: isOpen ? "20px 20px 0 0" : 20,
                boxShadow: "0 2px 12px rgba(244,180,195,0.06), 0 4px 24px rgba(74,55,40,0.02)",
                transition: "border-radius 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 10, color: colors.inkLight,
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s", display: "inline-block",
                }}>▶</span>
                <span style={{
                  fontFamily: fonts.body, fontSize: 12, letterSpacing: 2,
                  color: colors.ink, textTransform: "uppercase",
                }}>
                  {date}
                </span>
              </div>
              <span style={{
                fontFamily: fonts.body, fontSize: 10, color: colors.inkLight,
                fontStyle: "italic",
              }}>
                {isOpen ? "" : "tap to expand"}
              </span>
            </div>

            {/* Expanded content */}
            {isOpen && (
              <DinnerDateNotes menuDate={date} userCode={userCode} />
            )}
          </div>
        );
      })}
    </div>
  );
}

NotesTab.propTypes = {
  menuDates: PropTypes.arrayOf(PropTypes.string).isRequired,
  userCode: PropTypes.string,
  upcomingMenuDate: PropTypes.string,
};

export default NotesTab;
