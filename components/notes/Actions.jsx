/**
 * Edit/delete action links for notes and reviews.
 */
import { colors } from "../../data/config/theme";
import { linkBtnStyle } from "./styles";

function Actions({ onEdit, onDelete, saving }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 10, justifyContent: "flex-end" }}>
      <button type="button" onClick={onEdit} disabled={saving} style={linkBtnStyle}>Edit</button>
      <button type="button" onClick={onDelete} disabled={saving} style={{ ...linkBtnStyle, color: colors.err }}>Delete</button>
    </div>
  );
}

export default Actions;
