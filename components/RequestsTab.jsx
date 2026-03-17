/**
 * Dish Requests tab: users pay $1 via Stripe to request a dish.
 * Most-requested dishes rise to the top.
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import FadeIn from "./FadeIn";
import SectionDivider from "./SectionDivider";
import { colors, fonts, mainView } from "../data/theme";
import { API_BASE } from "../src/config";

function RequestsTab({ userCode }) {
  const [dishName, setDishName] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = () => {
    fetch(`${API_BASE}/api/requests`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => setRequests(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* Handle return from Stripe Checkout */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      fetchRequests();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("status") === "cancelled") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleRequest = async () => {
    const trimmed = dishName.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/requests/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Reservation-Code": userCode,
        },
        body: JSON.stringify({ dishName: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to create checkout");
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ ...mainView.card, padding: "48px 36px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>🌟</div>
        <div style={{
          fontFamily: fonts.display, fontSize: 20, fontWeight: 300,
          color: colors.ink, letterSpacing: 2,
        }}>
          Dish Requests
        </div>
        <div style={{
          fontFamily: fonts.jp, fontSize: 9, color: colors.pinkDeep,
          opacity: 0.7, letterSpacing: 2, marginTop: 4,
        }}>
          心願料理
        </div>
        <div style={{
          fontFamily: fonts.body, fontSize: 12, color: colors.inkLight,
          marginTop: 10, fontStyle: "italic", lineHeight: 1.5,
        }}>
          Make a wish — the most popular rise to the top
        </div>
      </div>

      <SectionDivider />

      {/* Input + Button */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleRequest(); }}
          placeholder="e.g. Mapo Tofu, Char Siu Bao..."
          style={{
            width: "100%", padding: "14px 0", border: "none",
            borderBottom: `1px solid rgba(232,152,171,0.3)`,
            background: "transparent", fontFamily: fonts.body, fontSize: 16,
            color: colors.ink, textAlign: "center", letterSpacing: 1,
            outline: "none", boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleRequest}
          disabled={loading || !dishName.trim()}
          style={{
            display: "block", width: "100%", marginTop: 16,
            padding: "14px 0", border: "none",
            background: dishName.trim()
              ? "linear-gradient(135deg, rgba(244,180,195,0.2), rgba(232,224,240,0.25))"
              : "rgba(200,200,200,0.1)",
            borderRadius: 14, fontFamily: fonts.body, fontSize: 14,
            letterSpacing: 2.5, color: dishName.trim() ? colors.ink : colors.inkLight,
            cursor: dishName.trim() ? "pointer" : "default",
            transition: "all 0.3s",
          }}
        >
          {loading ? "Redirecting..." : "Request · $1"}
        </button>
        {error && (
          <div style={{
            textAlign: "center", marginTop: 8, fontFamily: fonts.body,
            fontSize: 11, color: colors.err,
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{
        height: 1, margin: "4px 0 20px",
        background: `linear-gradient(to right, transparent, ${colors.pink}, transparent)`,
        opacity: 0.3,
      }} />

      {/* Section header */}
      <div style={{
        fontFamily: fonts.body, fontSize: 11, letterSpacing: 3,
        color: colors.inkLight, textTransform: "uppercase",
        textAlign: "center", marginBottom: 16,
      }}>
        Wishes
      </div>

      {/* Ranked list */}
      {requests.length === 0 ? (
        <div style={{
          textAlign: "center", fontFamily: fonts.body, fontSize: 13,
          color: colors.inkLight, fontStyle: "italic", padding: "16px 0",
        }}>
          No wishes yet. Be the first!
        </div>
      ) : (
        requests.map((r, i) => (
          <FadeIn key={r.dishName} delay={100 + i * 100}>
            <div style={{
              textAlign: "center", padding: "20px 0",
              borderBottom: i < requests.length - 1
                ? "1px solid rgba(232,152,171,0.1)" : "none",
            }}>
              <div style={{
                fontFamily: fonts.body, fontStyle: "italic", fontSize: 15,
                fontWeight: 300, color: colors.ink, letterSpacing: 2, lineHeight: 1.4,
              }}>
                {r.dishName}
              </div>
              <div style={{
                display: "inline-block", marginTop: 8,
                padding: "3px 10px", fontSize: 8, fontFamily: fonts.jp,
                color: colors.pinkDeep,
                border: "1px solid rgba(232,152,171,0.2)", borderRadius: 10,
                letterSpacing: 1, opacity: 0.8,
              }}>
                {r.count} {r.count === 1 ? "request" : "requests"}
              </div>
            </div>
          </FadeIn>
        ))
      )}
    </div>
  );
}

RequestsTab.propTypes = {
  userCode: PropTypes.string.isRequired,
};

export default RequestsTab;
