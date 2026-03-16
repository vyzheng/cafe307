/**
 * Add/edit menu tab (vivian only). Form to update the current menu via PUT /api/menus/current.
 * Three fixed courses: Appetizer, Main Course, Dessert; Add dish to add more dishes per course.
 */

import { useState } from "react";
import { colors, fonts, mainView } from "../../data/config/theme";
import { apiAuthFetch } from "../../src/api";

const COURSE_1 = { label: "Appetizer", cat: { cn: "前菜", en: "APPETIZER" } };
const COURSE_2 = { label: "Main Course", cat: { cn: "主菜", en: "MAIN" } };
const COURSE_3 = { label: "Dessert", cat: { cn: "甜品", en: "DESSERT" } };

const COURSE_LABELS = [COURSE_1.label, COURSE_2.label, COURSE_3.label];

const emptyDish = () => ({ cn: "", en: "", desc: "" });

function getDefaultRows() {
  return [
    { cat: COURSE_1.cat, items: [emptyDish()] },
    { cat: COURSE_2.cat, items: [emptyDish()] },
    { cat: COURSE_3.cat, items: [emptyDish()] },
  ];
}

function menuToRows(menu) {
  if (!menu?.courses?.length) return getDefaultRows();
  const rows = [
    { cat: COURSE_1.cat, items: [] },
    { cat: COURSE_2.cat, items: [] },
    { cat: COURSE_3.cat, items: [] },
  ];
  menu.courses.slice(0, 3).forEach((course, i) => {
    const items = (course.items || []).map((item) => ({
      cn: item.cn ?? "",
      en: item.en ?? "",
      desc: item.desc ?? "",
    }));
    rows[i].items = items.length ? items : [emptyDish()];
  });
  return rows;
}

const labelStyle = { display: "block", fontFamily: fonts.body, fontSize: 11, color: colors.inkLight, marginBottom: 4 };
const inputStyle = { width: "100%", padding: 10, border: `1px solid ${colors.inkLight}`, borderRadius: 8, fontFamily: fonts.body };
const courseCardStyle = {
  border: `1px solid ${colors.inkLight}`,
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  background: "rgba(255,255,255,0.6)",
};

function AddMenuTab({ currentMenu, editingMenu, userCode, onSuccess }) {
  const [date, setDate] = useState(currentMenu?.date ?? "");
  const [lunarDate, setLunarDate] = useState(currentMenu?.lunarDate ?? "");
  const [label, setLabel] = useState(currentMenu?.label ?? "");
  const [rows, setRows] = useState(() => menuToRows(currentMenu));
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const setRow = (rowIndex, nextRow) => {
    setRows((prev) => {
      const out = [...prev];
      out[rowIndex] = nextRow;
      return out;
    });
  };

  const setItem = (rowIndex, itemIndex, field, value) => {
    const row = rows[rowIndex];
    const nextItems = [...row.items];
    nextItems[itemIndex] = { ...nextItems[itemIndex], [field]: value };
    setRow(rowIndex, { ...row, items: nextItems });
  };

  const addDish = (rowIndex) => {
    setRow(rowIndex, {
      ...rows[rowIndex],
      items: [...rows[rowIndex].items, emptyDish()],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    const courses = rows
      .map((row) => {
        const items = row.items
          .filter((item) => {
            const cn = (item.cn ?? "").trim();
            const en = (item.en ?? "").trim();
            const desc = (item.desc ?? "").trim();
            return cn !== "" || en !== "" || desc !== "";
          })
          .map((item) => ({
            cn: (item.cn ?? "").trim(),
            en: (item.en ?? "").trim(),
            desc: (item.desc ?? "").trim(),
          }));
        if (items.length === 0) return null;
        return { cat: { cn: row.cat.cn.trim(), en: row.cat.en.trim() }, items };
      })
      .filter(Boolean);

    const menu = { date, lunarDate, label, courses };
    const isEdit = editingMenu?.id != null;
    const path = isEdit ? `/api/menus/${editingMenu.id}` : "/api/menus/current";
    const method = isEdit ? "PATCH" : "PUT";
    apiAuthFetch(path, method, menu, userCode)
      .then((data) => {
        setStatus("Saved.");
        onSuccess(data);
      })
      .catch((err) => {
        const isNetworkError = err?.message === "Failed to fetch" || (err?.name === "TypeError" && String(err?.message).toLowerCase().includes("fetch"));
        setError(
          isNetworkError
            ? "Could not reach the server. Start the backend (e.g. uvicorn backend.app:app --host 0.0.0.0 --port 8001)."
            : err.message || "Request failed"
        );
      });
  };

  return (
    <div style={{ ...mainView.card, padding: "32px 24px" }}>
      <div style={{ fontFamily: fonts.display, fontSize: 18, color: colors.ink, letterSpacing: 2, marginBottom: 20 }}>
        {editingMenu?.id != null ? "Edit menu" : "Add / Edit menu"}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Date</label>
          <input type="text" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Lunar date</label>
          <input type="text" value={lunarDate} onChange={(e) => setLunarDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Label</label>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle} />
        </div>

        {rows.map((row, ri) => (
          <div key={ri} style={courseCardStyle}>
            <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.ink, marginBottom: 12, letterSpacing: 1 }}>
              {COURSE_LABELS[ri]}
            </div>
            {row.items.map((item, ii) => (
              <div key={ii} style={{ marginBottom: 16, paddingLeft: 8, borderLeft: `3px solid ${colors.pinkSoft}` }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Dish (中文)</label>
                  <input
                    type="text"
                    value={item.cn}
                    onChange={(e) => setItem(ri, ii, "cn", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Dish (English)</label>
                  <input
                    type="text"
                    value={item.en}
                    onChange={(e) => setItem(ri, ii, "en", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={item.desc}
                    onChange={(e) => setItem(ri, ii, "desc", e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addDish(ri)}
              style={{
                padding: "6px 14px",
                border: `1px solid ${colors.inkLight}`,
                borderRadius: 8,
                background: "transparent",
                fontFamily: fonts.body,
                fontSize: 11,
                color: colors.inkLight,
                cursor: "pointer",
              }}
            >
              Add dish
            </button>
          </div>
        ))}

        {error && <div style={{ marginTop: 24, marginBottom: 12, fontFamily: fonts.body, fontSize: 12, color: colors.err }}>{error}</div>}
        {status && <div style={{ marginTop: 24, marginBottom: 12, fontFamily: fonts.body, fontSize: 12, color: colors.success }}>{status}</div>}
        <button
          type="submit"
          style={{
            marginTop: 24,
            padding: "10px 24px",
            border: "none",
            borderRadius: 12,
            background: "linear-gradient(135deg, rgba(244,180,195,0.2), rgba(212,169,106,0.1))",
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.ink,
            cursor: "pointer",
          }}
        >
          Save menu
        </button>
      </form>
    </div>
  );
}

export default AddMenuTab;
