/**
 * Notes tab: one card per dinner date with VIP Review and Chef's Notes sections.
 * Fetches from API; falls back to static data. Vlad edits reviews, vivian edits chef notes.
 */

import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { colors, fonts, mainView } from "../data/theme";
import { getChefNote } from "../data/chefsNotes";
import { getVipReview } from "../data/vipReviews";
import NextReservationCard from "./NextReservationCard";
import { API_BASE } from "../src/config";

/* ─── shared styles ─── */

const sectionHeaderStyle = { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 };
const iconBubbleStyle = {
  width: 24, height: 24, borderRadius: "50%",
  background: "linear-gradient(135deg, #FCEEF2, #FFF5E6)",
  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
};
const titleStyle = { fontFamily: fonts.body, fontSize: 13, color: colors.ink, letterSpacing: 1 };
const subtitleStyle = { fontFamily: fonts.jp, fontSize: 8, color: colors.gold, opacity: 0.7 };
const contentBoxReview = {
  padding: "16px 20px", borderRadius: 14,
  background: colors.bg, borderLeft: "2px solid rgba(212,169,106,0.3)",
};
const contentBoxChef = {
  padding: "16px 20px", borderRadius: 14,
  background: "linear-gradient(135deg, #FFF8F3, rgba(252,238,242,0.5))",
  borderLeft: "2px solid rgba(244,180,195,0.3)",
};
const textareaStyle = {
  width: "100%", padding: 10, border: `1px solid ${colors.inkLight}`, borderRadius: 8,
  fontFamily: fonts.body, fontSize: 13, minHeight: 60, resize: "vertical", boxSizing: "border-box",
};
const btnStyle = {
  padding: "6px 14px", border: "none", borderRadius: 8,
  background: "linear-gradient(135deg, rgba(244,180,195,0.2), rgba(232,224,240,0.2))",
  fontFamily: fonts.body, fontSize: 11, color: colors.ink, cursor: "pointer",
};
const linkBtnStyle = {
  background: "none", border: "none", padding: 0,
  fontFamily: fonts.body, fontSize: 11, color: colors.inkLight,
  cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2,
};
const dividerStyle = {
  height: 1, margin: "24px 0",
  background: `linear-gradient(to right, transparent, ${colors.pink}, transparent)`,
  opacity: 0.3,
};

/* ─── shared helpers ─── */

async function apiCall(url, method, body, reservationCode) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "X-Reservation-Code": reservationCode ?? "" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j.detail || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

function renderBulletList(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return null;
  return (
    <ul style={{ margin: 0, paddingLeft: 18, listStyleType: "disc" }}>
      {lines.map((line, i) => (
        <li key={i} style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink, lineHeight: 1.8 }}>
          {line.replace(/^[-•]\s*/, "")}
        </li>
      ))}
    </ul>
  );
}

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

function Actions({ onEdit, onDelete, saving }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 10, justifyContent: "flex-end" }}>
      <button type="button" onClick={onEdit} disabled={saving} style={linkBtnStyle}>Edit</button>
      <button type="button" onClick={onDelete} disabled={saving} style={{ ...linkBtnStyle, color: colors.err }}>Delete</button>
    </div>
  );
}

/* ─── per-date card ─── */

function DinnerDateNotes({ menuDate, userCode }) {
  const [chefNote, setChefNote] = useState("");
  const [vipReview, setVipReview] = useState("");

  const [chefMode, setChefMode] = useState("view");
  const [reviewMode, setReviewMode] = useState("view");

  const [chefDraft, setChefDraft] = useState("");
  const [reviewDraft, setReviewDraft] = useState("");

  const [chefSaving, setChefSaving] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [chefError, setChefError] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const canEditChef = userCode === "vivian";
  const canEditReview = userCode === "vlad";

  const fetchChefNote = useCallback(() => {
    if (!menuDate) return;
    fetch(`${API_BASE}/api/notes/chef?menuDate=${encodeURIComponent(menuDate)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => { const v = d.note || ""; setChefNote(v); setChefMode(v ? "view" : "empty"); })
      .catch(() => { const v = getChefNote(menuDate) ?? ""; setChefNote(v); setChefMode(v ? "view" : "empty"); });
  }, [menuDate]);

  const fetchVipReview = useCallback(() => {
    if (!menuDate) return;
    fetch(`${API_BASE}/api/notes/vip-review?menuDate=${encodeURIComponent(menuDate)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => { const v = d.review || ""; setVipReview(v); setReviewMode(v ? "view" : "empty"); })
      .catch(() => { const v = getVipReview(menuDate) ?? ""; setVipReview(v); setReviewMode(v ? "view" : "empty"); });
  }, [menuDate]);

  useEffect(() => { fetchChefNote(); }, [fetchChefNote]);
  useEffect(() => { fetchVipReview(); }, [fetchVipReview]);

  const handleSaveChef = async () => {
    setChefError(null); setChefSaving(true);
    try {
      const d = await apiCall(`${API_BASE}/api/notes/chef`, "PUT", { menuDate, note: chefDraft }, userCode);
      const v = d.note || ""; setChefNote(v); setChefDraft(""); setChefMode(v ? "view" : "empty");
    } catch (e) { setChefError(e.message); }
    finally { setChefSaving(false); }
  };

  const handleDeleteChef = async () => {
    setChefError(null); setChefSaving(true);
    try {
      await apiCall(`${API_BASE}/api/notes/chef`, "DELETE", { menuDate }, userCode);
      setChefNote(""); setChefDraft(""); setChefMode("empty");
    } catch (e) { setChefError(e.message); }
    finally { setChefSaving(false); }
  };

  const handleSaveReview = async () => {
    setReviewError(null); setReviewSaving(true);
    try {
      const d = await apiCall(`${API_BASE}/api/notes/vip-review`, "PUT", { menuDate, review: reviewDraft }, userCode);
      const v = d.review || ""; setVipReview(v); setReviewDraft(""); setReviewMode(v ? "view" : "empty");
    } catch (e) { setReviewError(e.message); }
    finally { setReviewSaving(false); }
  };

  const handleDeleteReview = async () => {
    setReviewError(null); setReviewSaving(true);
    try {
      await apiCall(`${API_BASE}/api/notes/vip-review`, "DELETE", { menuDate }, userCode);
      setVipReview(""); setReviewDraft(""); setReviewMode("empty");
    } catch (e) { setReviewError(e.message); }
    finally { setReviewSaving(false); }
  };

  return (
    <div style={{ ...mainView.card, padding: 36 }}>
      {/* Date header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontFamily: fonts.body, fontSize: 11, letterSpacing: 2, color: colors.inkLight, textTransform: "uppercase" }}>
          {menuDate}
        </div>
      </div>

      {/* --- VIP Review section --- */}
      <div style={sectionHeaderStyle}>
        <div style={iconBubbleStyle}>🪑</div>
        <div>
          <div style={titleStyle}>VIP Review</div>
          <div style={subtitleStyle}>お客様の声</div>
        </div>
      </div>

      <div style={contentBoxReview}>
        {reviewMode === "view" && (
          <>
            {renderBulletList(vipReview) || <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink, lineHeight: 1.8 }}>{vipReview || "—"}</div>}
            {canEditReview && <Actions onEdit={() => { setReviewDraft(vipReview); setReviewMode("edit"); }} onDelete={handleDeleteReview} saving={reviewSaving} />}
          </>
        )}
        {reviewMode === "edit" && canEditReview && (
          <EditArea draft={reviewDraft} setDraft={setReviewDraft} saving={reviewSaving} error={reviewError}
            onSave={handleSaveReview} onCancel={() => { setReviewMode(vipReview ? "view" : "empty"); setReviewError(null); }}
            placeholder="One bullet per line…" />
        )}
        {reviewMode === "empty" && (
          canEditReview
            ? <EditArea draft={reviewDraft} setDraft={setReviewDraft} saving={reviewSaving} error={reviewError}
                onSave={handleSaveReview} onCancel={null} placeholder="One bullet per line…" />
            : <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkLight }}>—</div>
        )}
      </div>

      {/* Thin divider */}
      <div style={dividerStyle} />

      {/* --- Chef's Notes section --- */}
      <div style={sectionHeaderStyle}>
        <div style={iconBubbleStyle}>👩‍🍳</div>
        <div>
          <div style={titleStyle}>Chef's Notes</div>
          <div style={subtitleStyle}>料理人の一言</div>
        </div>
      </div>

      <div style={contentBoxChef}>
        {chefMode === "view" && (
          <>
            {renderBulletList(chefNote) || <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink, lineHeight: 1.8 }}>{chefNote}</div>}
            {canEditChef && <Actions onEdit={() => { setChefDraft(chefNote); setChefMode("edit"); }} onDelete={handleDeleteChef} saving={chefSaving} />}
          </>
        )}
        {chefMode === "edit" && canEditChef && (
          <EditArea draft={chefDraft} setDraft={setChefDraft} saving={chefSaving} error={chefError}
            onSave={handleSaveChef} onCancel={() => { setChefMode(chefNote ? "view" : "empty"); setChefError(null); }}
            placeholder="One bullet per line…" />
        )}
        {chefMode === "empty" && (
          canEditChef
            ? <EditArea draft={chefDraft} setDraft={setChefDraft} saving={chefSaving} error={chefError}
                onSave={handleSaveChef} onCancel={null} placeholder="One bullet per line…" />
            : <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkLight }}>—</div>
        )}
      </div>
    </div>
  );
}

/* ─── Notes tab (renders one card per menu date) ─── */

function NotesTab({ menuDates, userCode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {menuDates.map((date) => (
        <DinnerDateNotes key={date} menuDate={date} userCode={userCode} />
      ))}
      <NextReservationCard />
    </div>
  );
}

NotesTab.propTypes = {
  menuDates: PropTypes.arrayOf(PropTypes.string).isRequired,
  userCode: PropTypes.string,
};

export default NotesTab;
