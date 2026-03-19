/**
 * Per-date card rendered inside the Notes accordion. Shows VIP Review and
 * Chef's Notes sections for one menu date. Data is fetched from the API on
 * mount; on failure, falls back to the static data in data/fallback/.
 * Authorized users see inline Edit/Delete actions (role checks via roles.js).
 */
import { useState, useEffect, useCallback } from "react";
import { colors, fonts, mainView } from "../../data/config/theme";
import { getChefNote } from "../../data/fallback/chefsNotes";
import { getVipReview } from "../../data/fallback/vipReviews";
import { apiFetch, apiAuthFetch } from "../../src/api";
import { canEditChef as checkCanEditChef, canEditReview as checkCanEditReview } from "../../data/config/roles";
import EditArea from "./EditArea";
import Actions from "./Actions";
import {
  sectionHeaderStyle, iconBubbleStyle, titleStyle, subtitleStyle,
  contentBoxReview, contentBoxChef, dividerStyle,
} from "./styles";

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

  const canEditChef = checkCanEditChef(userCode);
  const canEditReview = checkCanEditReview(userCode);

  const fetchChefNote = useCallback(() => {
    if (!menuDate) return;
    apiFetch(`/api/notes/chef?menuDate=${encodeURIComponent(menuDate)}`)
      .then((d) => { const v = d.note || ""; setChefNote(v); setChefMode(v ? "view" : "empty"); })
      .catch(() => { const v = getChefNote(menuDate) ?? ""; setChefNote(v); setChefMode(v ? "view" : "empty"); });
  }, [menuDate]);

  const fetchVipReview = useCallback(() => {
    if (!menuDate) return;
    apiFetch(`/api/notes/vip-review?menuDate=${encodeURIComponent(menuDate)}`)
      .then((d) => { const v = d.review || ""; setVipReview(v); setReviewMode(v ? "view" : "empty"); })
      .catch(() => { const v = getVipReview(menuDate) ?? ""; setVipReview(v); setReviewMode(v ? "view" : "empty"); });
  }, [menuDate]);

  useEffect(() => { fetchChefNote(); }, [fetchChefNote]);
  useEffect(() => { fetchVipReview(); }, [fetchVipReview]);

  const handleSaveChef = async () => {
    setChefError(null); setChefSaving(true);
    try {
      const d = await apiAuthFetch("/api/notes/chef", "PUT", { menuDate, note: chefDraft }, userCode);
      const v = d.note || ""; setChefNote(v); setChefDraft(""); setChefMode(v ? "view" : "empty");
    } catch (e) { setChefError(e.message); }
    finally { setChefSaving(false); }
  };

  const handleDeleteChef = async () => {
    setChefError(null); setChefSaving(true);
    try {
      await apiAuthFetch("/api/notes/chef", "DELETE", { menuDate }, userCode);
      setChefNote(""); setChefDraft(""); setChefMode("empty");
    } catch (e) { setChefError(e.message); }
    finally { setChefSaving(false); }
  };

  const handleSaveReview = async () => {
    setReviewError(null); setReviewSaving(true);
    try {
      const d = await apiAuthFetch("/api/notes/vip-review", "PUT", { menuDate, review: reviewDraft }, userCode);
      const v = d.review || ""; setVipReview(v); setReviewDraft(""); setReviewMode(v ? "view" : "empty");
    } catch (e) { setReviewError(e.message); }
    finally { setReviewSaving(false); }
  };

  const handleDeleteReview = async () => {
    setReviewError(null); setReviewSaving(true);
    try {
      await apiAuthFetch("/api/notes/vip-review", "DELETE", { menuDate }, userCode);
      setVipReview(""); setReviewDraft(""); setReviewMode("empty");
    } catch (e) { setReviewError(e.message); }
    finally { setReviewSaving(false); }
  };

  return (
    <div style={{
      ...mainView.card, padding: 36,
      borderRadius: "0 0 20px 20px",
      boxShadow: "0 2px 12px rgba(244,180,195,0.06), 0 4px 24px rgba(74,55,40,0.02)",
    }}>

      {/* VIP Review */}
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

      <div style={dividerStyle} />

      {/* Chef's Notes */}
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

export default DinnerDateNotes;
