/**
 * Notes tab: renders one card per menu date and the next reservation card.
 */
import PropTypes from "prop-types";
import DinnerDateNotes from "./DinnerDateNotes";
import NextReservationCard from "./NextReservationCard";

function NotesTab({ menuDates, userCode, upcomingMenuDate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {menuDates.map((date) => (
        <DinnerDateNotes key={date} menuDate={date} userCode={userCode} />
      ))}
      <NextReservationCard menuDate={upcomingMenuDate} />
    </div>
  );
}

NotesTab.propTypes = {
  menuDates: PropTypes.arrayOf(PropTypes.string).isRequired,
  userCode: PropTypes.string,
  upcomingMenuDate: PropTypes.string,
};

export default NotesTab;
