/**
 * "Next Reservation" card pinned to the top of the Notes tab. Shows the
 * upcoming dinner date (with full weekday), party size, and an
 * "always confirmed" badge. If no upcoming menu date is available, falls
 * back to "Some Thursday" so the card still renders rather than disappearing.
 */

import { colors, fonts, mainView } from "../../data/config/theme";

function formatDay(menuDate) {
  if (!menuDate) return "Some Thursday";
  const d = new Date(menuDate);
  if (isNaN(d.getTime())) return "Some Thursday";
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  return `${weekday}, ${menuDate}`;
}

function NextReservationCard({ menuDate }) {
  return (
    <div style={{ ...mainView.card, padding: "28px 36px", textAlign: "center" }}>
      <div style={{ fontFamily: fonts.body, fontSize: 10, letterSpacing: 3, color: colors.inkLight, textTransform: "uppercase", marginBottom: 12 }}>Next Reservation</div>
      <div style={{ fontFamily: fonts.display, fontSize: 18, color: colors.ink, letterSpacing: 2, marginBottom: 4 }}>{formatDay(menuDate)}</div>
      <div style={{ fontFamily: fonts.jp, fontSize: 9, color: colors.gold, letterSpacing: 1, marginBottom: 12 }}>Party size: 2</div>
      <div style={{ display: "inline-block", padding: "4px 16px", background: "rgba(144,200,144,0.1)", borderRadius: 20, fontFamily: fonts.body, fontStyle: "italic", fontSize: 10, color: colors.success, letterSpacing: 1 }}>
        ✓ always confirmed
      </div>
    </div>
  );
}

export default NextReservationCard;
