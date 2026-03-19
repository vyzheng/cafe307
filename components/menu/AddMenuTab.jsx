/**
 * Add/edit menu tab (vivian only). Accordion-style form with 3 collapsible
 * course sections (Appetizer, Main, Dessert). Each section supports:
 *   - Add/delete dishes
 *   - Drag-and-drop reorder (native HTML5 DnD, no libraries)
 *   - Per-section "Save & Next" that collapses and advances
 *   - Final section submits the full menu payload to the API
 */

import { useState } from "react";
import { colors, fonts, mainView } from "../../data/config/theme";
import { apiAuthFetch } from "../../src/api";

/* Three fixed courses — order here = order on the menu */
const COURSES = [
  { label: "Appetizer", cat: { cn: "前菜", en: "APPETIZER" } },
  { label: "Main Course", cat: { cn: "主菜", en: "MAIN" } },
  { label: "Dessert", cat: { cn: "甜品", en: "DESSERT" } },
];

const emptyDish = () => ({ cn: "", en: "", desc: "" });

function getDefaultRows() {
  return COURSES.map((c) => ({ cat: c.cat, items: [emptyDish()] }));
}

/* Convert API menu format → form state (pre-populate when editing) */
function menuToRows(menu) {
  if (!menu?.courses?.length) return getDefaultRows();
  return COURSES.map((c, i) => {
    const course = menu.courses[i];
    const items = (course?.items || []).map((item) => ({
      cn: item.cn ?? "", en: item.en ?? "", desc: item.desc ?? "",
    }));
    return { cat: c.cat, items: items.length ? items : [emptyDish()] };
  });
}

/* --- Shared styles --- */
const labelStyle = {
  display: "block", fontFamily: fonts.body, fontSize: 11,
  color: colors.inkLight, marginBottom: 4, letterSpacing: 0.5,
};
const inputStyle = {
  width: "100%", padding: "8px 10px", border: `1px solid rgba(232,152,171,0.3)`,
  borderRadius: 8, fontFamily: fonts.body, fontSize: 13, color: colors.ink,
  boxSizing: "border-box", outline: "none", background: "rgba(255,255,255,0.6)",
};

function AddMenuTab({ currentMenu, editingMenu, userCode, onSuccess }) {
  const [date, setDate] = useState(currentMenu?.date ?? "");
  const [lunarDate, setLunarDate] = useState(currentMenu?.lunarDate ?? "");
  const [label, setLabel] = useState(currentMenu?.label ?? "");
  const [rows, setRows] = useState(() => menuToRows(currentMenu));
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  /* Accordion state */
  const [openSection, setOpenSection] = useState(0);
  const [savedSections, setSavedSections] = useState([false, false, false]);

  /* Drag-and-drop state */
  const [dragState, setDragState] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  /* --- Row/item helpers (immutable updates) --- */
  const setRow = (ri, nextRow) => {
    setRows((prev) => { const out = [...prev]; out[ri] = nextRow; return out; });
  };
  const setItem = (ri, ii, field, value) => {
    const row = rows[ri];
    const nextItems = [...row.items];
    nextItems[ii] = { ...nextItems[ii], [field]: value };
    setRow(ri, { ...row, items: nextItems });
  };
  const addDish = (ri) => {
    setRow(ri, { ...rows[ri], items: [...rows[ri].items, emptyDish()] });
  };
  const deleteDish = (ri, ii) => {
    if (rows[ri].items.length <= 1) return;
    setRow(ri, { ...rows[ri], items: rows[ri].items.filter((_, i) => i !== ii) });
  };
  const reorderDish = (ri, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const nextItems = [...rows[ri].items];
    const [moved] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, moved);
    setRow(ri, { ...rows[ri], items: nextItems });
  };

  /* --- Accordion --- */
  const toggleSection = (i) => {
    if (openSection === i) {
      setOpenSection(null);
    } else {
      setOpenSection(i);
      // Re-opening a saved section resets its saved state
      setSavedSections((prev) => { const n = [...prev]; n[i] = false; return n; });
    }
  };

  /* --- Submit logic --- */
  const submitMenu = () => {
    setStatus(null);
    setError(null);
    const courses = rows
      .map((row) => {
        const items = row.items
          .filter((item) => (item.cn || "").trim() || (item.en || "").trim() || (item.desc || "").trim())
          .map((item) => ({ cn: (item.cn || "").trim(), en: (item.en || "").trim(), desc: (item.desc || "").trim() }));
        if (!items.length) return null;
        return { cat: { cn: row.cat.cn.trim(), en: row.cat.en.trim() }, items };
      })
      .filter(Boolean);
    const menu = { date, lunarDate, label, courses };
    const isEdit = editingMenu?.id != null;
    const path = isEdit ? `/api/menus/${editingMenu.id}` : "/api/menus/current";
    const method = isEdit ? "PATCH" : "PUT";
    apiAuthFetch(path, method, menu, userCode)
      .then((data) => { setStatus("Saved."); onSuccess(data); })
      .catch((err) => {
        const isNet = err?.message === "Failed to fetch" || String(err?.message).toLowerCase().includes("fetch");
        setError(isNet ? "Could not reach the server." : err.message || "Request failed");
      });
  };

  const handleSectionSave = (i) => {
    setSavedSections((prev) => { const n = [...prev]; n[i] = true; return n; });
    if (i < 2) {
      setOpenSection(i + 1);
    } else {
      setOpenSection(null);
      submitMenu();
    }
  };

  /* --- Drag-and-drop handlers --- */
  const handleDragStart = (ri, ii, e) => {
    setDragState({ sectionIndex: ri, fromIndex: ii });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(ii));
  };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = (ri, ii, e) => {
    e.preventDefault();
    if (dragState && dragState.sectionIndex === ri) {
      reorderDish(ri, dragState.fromIndex, ii);
    }
    setDragState(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { setDragState(null); setDragOverIndex(null); };

  /* Count non-empty dishes in a section */
  const dishCount = (ri) => rows[ri].items.filter(
    (d) => (d.cn || "").trim() || (d.en || "").trim() || (d.desc || "").trim()
  ).length;

  return (
    <div style={{ ...mainView.card, padding: "32px 24px" }}>
      {/* Title */}
      <div style={{
        fontFamily: fonts.display, fontSize: 18, color: colors.ink,
        letterSpacing: 2, marginBottom: 20,
      }}>
        {editingMenu?.id != null ? "Edit menu" : "Add / Edit menu"}
      </div>

      {/* Always-visible top fields */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Date</label>
        <input type="text" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Lunar date</label>
        <input type="text" value={lunarDate} onChange={(e) => setLunarDate(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Label</label>
        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle} />
      </div>

      {/* Accordion course sections */}
      {rows.map((row, ri) => {
        const isOpen = openSection === ri;
        const isSaved = savedSections[ri];
        const count = dishCount(ri);
        return (
          <div key={ri} style={{ marginBottom: 8 }}>
            {/* Accordion header */}
            <div
              onClick={() => toggleSection(ri)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", cursor: "pointer", userSelect: "none",
                border: `1px solid rgba(232,152,171,0.3)`,
                borderRadius: isOpen ? "12px 12px 0 0" : 12,
                background: isOpen
                  ? "linear-gradient(135deg, rgba(244,180,195,0.15), rgba(232,224,240,0.2))"
                  : "rgba(255,255,255,0.6)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Chevron */}
                <span style={{
                  fontSize: 10, color: colors.inkLight,
                  transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s", display: "inline-block",
                }}>▶</span>
                <span style={{
                  fontFamily: fonts.body, fontSize: 13, color: colors.ink,
                  letterSpacing: 1, fontWeight: 500,
                }}>
                  {COURSES[ri].label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontFamily: fonts.body, fontSize: 10, color: colors.inkLight,
                  fontStyle: "italic",
                }}>
                  {count} {count === 1 ? "dish" : "dishes"}
                </span>
                {isSaved && (
                  <span style={{ color: colors.success, fontSize: 12 }}>✓</span>
                )}
              </div>
            </div>

            {/* Accordion body */}
            {isOpen && (
              <div style={{
                padding: "16px 16px 12px",
                border: `1px solid rgba(232,152,171,0.3)`,
                borderTop: "none",
                borderRadius: "0 0 12px 12px",
                background: "rgba(255,255,255,0.4)",
                overflow: "hidden",
              }}>
                {row.items.map((item, ii) => {
                  const isDragging = dragState?.sectionIndex === ri && dragState?.fromIndex === ii;
                  const isDropTarget = dragState?.sectionIndex === ri && dragOverIndex === ii && dragState?.fromIndex !== ii;
                  return (
                    <div
                      key={ii}
                      onDragOver={handleDragOver}
                      onDragEnter={() => setDragOverIndex(ii)}
                      onDrop={(e) => handleDrop(ri, ii, e)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 8,
                        marginBottom: 14, padding: "10px 8px",
                        borderLeft: `3px solid ${colors.pinkSoft}`,
                        borderRadius: 6, position: "relative",
                        opacity: isDragging ? 0.4 : 1,
                        borderTop: isDropTarget ? `2px solid ${colors.pink}` : "2px solid transparent",
                        transition: "opacity 0.15s",
                        background: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {/* Drag handle */}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(ri, ii, e)}
                        onDragEnd={handleDragEnd}
                        style={{
                          width: 18, flexShrink: 0, cursor: "grab",
                          color: colors.inkLight, fontSize: 14, textAlign: "center",
                          paddingTop: 6, userSelect: "none",
                        }}
                      >⋮⋮</div>

                      {/* Inputs */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: 6 }}>
                          <label style={labelStyle}>中文</label>
                          <input type="text" value={item.cn}
                            onChange={(e) => setItem(ri, ii, "cn", e.target.value)}
                            style={inputStyle} />
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <label style={labelStyle}>English</label>
                          <input type="text" value={item.en}
                            onChange={(e) => setItem(ri, ii, "en", e.target.value)}
                            style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Description</label>
                          <textarea value={item.desc}
                            onChange={(e) => setItem(ri, ii, "desc", e.target.value)}
                            rows={2}
                            style={{ ...inputStyle, resize: "vertical" }} />
                        </div>
                      </div>

                      {/* Delete button (hidden when only 1 dish) */}
                      {row.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteDish(ri, ii)}
                          style={{
                            width: 22, height: 22, flexShrink: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "none", background: "transparent",
                            color: colors.inkLight, fontSize: 16, cursor: "pointer",
                            borderRadius: 4, marginTop: 4,
                          }}
                          onMouseEnter={(e) => { e.target.style.color = colors.err; }}
                          onMouseLeave={(e) => { e.target.style.color = colors.inkLight; }}
                          title="Remove dish"
                        >×</button>
                      )}
                    </div>
                  );
                })}

                {/* Add dish + Save section buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => addDish(ri)}
                    style={{
                      padding: "5px 12px", border: `1px solid rgba(232,152,171,0.3)`,
                      borderRadius: 8, background: "transparent",
                      fontFamily: fonts.body, fontSize: 11, color: colors.inkLight,
                      cursor: "pointer", letterSpacing: 0.5,
                    }}
                  >
                    + Add dish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSectionSave(ri)}
                    style={{
                      padding: "6px 16px", border: "none", borderRadius: 10,
                      background: "linear-gradient(135deg, rgba(244,180,195,0.25), rgba(232,224,240,0.3))",
                      fontFamily: fonts.body, fontSize: 12, color: colors.ink,
                      cursor: "pointer", letterSpacing: 1,
                    }}
                  >
                    {ri < 2 ? "Save & Next ›" : "Save Menu"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Status/error messages */}
      {error && (
        <div style={{ marginTop: 16, fontFamily: fonts.body, fontSize: 12, color: colors.err }}>
          {error}
        </div>
      )}
      {status && (
        <div style={{ marginTop: 16, fontFamily: fonts.body, fontSize: 12, color: colors.success }}>
          {status}
        </div>
      )}
    </div>
  );
}

export default AddMenuTab;
