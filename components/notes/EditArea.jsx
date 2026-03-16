/**
 * Textarea + save/cancel buttons for editing notes and reviews.
 */
import { colors } from "../../data/config/theme";
import { textareaStyle, btnStyle, linkBtnStyle } from "./styles";

function EditArea({ draft, setDraft, saving, error, onSave, onCancel, placeholder }) {
  return (
    <>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        style={textareaStyle}
        rows={3}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="button" onClick={onSave} disabled={saving} style={btnStyle}>
          {saving ? "Saving…" : "Save"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ ...linkBtnStyle, textDecoration: "none", color: colors.inkLight }}>
            Cancel
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: colors.err, marginTop: 4 }}>{error}</div>}
    </>
  );
}

export default EditArea;
