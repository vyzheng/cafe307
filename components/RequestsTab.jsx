/**
 * Dish Requests tab: users pay $1 via inline Stripe payment to request a dish.
 * Most-requested dishes rise to the top.
 *
 * Payment flow:
 *   1. User types a dish name and clicks "Request · $1"
 *   2. Frontend calls POST /api/requests/create-payment-intent → gets a clientSecret
 *   3. Stripe <Elements> renders the inline payment form (Card / Link / Wallet tabs)
 *   4. User completes payment via one of the three methods
 *   5. On success, frontend calls POST /api/requests/confirm to record the dish
 *      request in the database and send an optional email receipt
 *   6. The wishes list re-fetches and the new request appears, ranked by count
 */

import { useState, useEffect, useMemo, Component } from "react";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements, CardElement,
  PaymentRequestButtonElement, useStripe, useElements,
} from "@stripe/react-stripe-js";
import FadeIn from "./layout/FadeIn";
import SectionDivider from "./layout/SectionDivider";
import { colors, fonts, mainView } from "../data/config/theme";
import { API_BASE, STRIPE_PUBLISHABLE_KEY } from "../src/config";

/*
  loadStripe is called once at module level so the Stripe.js script is loaded
  only once, no matter how many times RequestsTab re-renders.
*/
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

/*
  PaymentErrorBoundary — React error boundaries MUST be class components.
  React does not support getDerivedStateFromError or componentDidCatch in
  function components, so we use a class here. If the Stripe iframe or any
  child throws during render, we catch it and show a fallback message instead
  of crashing the whole app.
*/
class PaymentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, color: "#C0392B", marginBottom: 8 }}>
            Payment form failed to load. Please try again.
          </div>
          <button
            onClick={() => { this.setState({ hasError: false }); this.props.onCancel(); }}
            style={{
              padding: "10px 20px", border: "none", background: "rgba(200,200,200,0.15)",
              borderRadius: 14, fontFamily: "'Cormorant Garamond', serif", fontSize: 13,
              color: "#9B8B7A", cursor: "pointer",
            }}
          >
            Dismiss
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* Divider between payment sections */
function OrDivider() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, margin: "14px 0",
    }}>
      <div style={{ flex: 1, height: 1, background: "rgba(232,152,171,0.2)" }} />
      <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.inkLight, letterSpacing: 1 }}>or</span>
      <div style={{ flex: 1, height: 1, background: "rgba(232,152,171,0.2)" }} />
    </div>
  );
}

/*
  Three payment method tabs:
    - Card:   manual card number entry via Stripe CardElement
    - Link:   Stripe Link — selecting this tab shows the LinkAuthenticationElement
              which auto-triggers a popup for saved payment methods, providing a
              one-tap checkout experience for returning Stripe Link users
    - Wallet: Apple Pay / Google Pay via the Payment Request API; only shown
              when the browser/device supports it (canMakePayment check)
*/
const TABS = [
  { id: "card", label: "Card" },
  { id: "wallet", label: " Pay" },
];

/*
  PaymentForm must be rendered inside <Elements> because useStripe() and
  useElements() read from the Elements context. Stripe provides no other way
  to access the card input or confirm a payment — so this component can never
  be lifted above the <Elements> wrapper.
*/
function PaymentForm({ clientSecret, email, setEmail, onSuccess, onCancel, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("card");

  /*
    Apple Pay / Google Pay setup via the Payment Request API.
    stripe.paymentRequest creates a browser-native payment sheet. We call
    canMakePayment() to check if the user's device supports it (e.g. Safari
    with a card in Wallet, or Chrome with Google Pay configured). If not
    supported, the wallet tab is hidden entirely.

    The "paymentmethod" event fires when the user authenticates with Face ID /
    fingerprint; we then confirm the payment server-side with handleActions:false
    so the native sheet stays in control of the UX.
  */
  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: "Dish Request", amount: amount || 100 },
      requestPayerName: false,
      requestPayerEmail: false,
    });
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });
    pr.on("paymentmethod", async (ev) => {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false },
      );
      if (confirmError) {
        ev.complete("fail");
        setPayError(confirmError.message);
      } else {
        ev.complete("success");
        onSuccess(paymentIntent.id);
      }
    });
  }, [stripe, clientSecret, onSuccess]);

  /*
    cardStyle — Stripe's CardElement renders inside an iframe, so normal CSS
    can't reach it. Instead we pass a style object that Stripe applies inside
    the iframe. We match the font, size, and color of the email <input> above
    so the two fields look like a single unified form.
  */
  const cardStyle = {
    base: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "13px",
      fontWeight: "400",
      color: "#4A3728",
      letterSpacing: "0.5px",
      "::placeholder": { color: "#9B8B7A" },
    },
    invalid: { color: "#C0392B" },
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setPayError(null);
    const card = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });
    if (error) {
      setPayError(error.message);
      setPaying(false);
    } else {
      onSuccess(paymentIntent.id);
    }
  };

  /* Which tabs to show — hide wallet tab if not available */
  const visibleTabs = paymentRequest
    ? TABS
    : TABS.filter((t) => t.id !== "wallet");

  return (
    <div style={{ marginTop: 16 }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", borderRadius: 12, overflow: "hidden",
        border: "1px solid rgba(232,152,171,0.2)", marginBottom: 16,
      }}>
        {visibleTabs.map((tab, i) => {
          const isActive = tab.id === activeTab;
          return (
            <div
              key={tab.id}
              onClick={() => {
                if (paying) return;
                setActiveTab(tab.id);
              }}
              style={{
                flex: 1, padding: "11px 0", textAlign: "center",
                fontFamily: fonts.body, fontSize: 12, letterSpacing: 1.2,
                cursor: paying ? "default" : "pointer",
                transition: "all 0.25s ease",
                background: isActive
                  ? "linear-gradient(135deg, rgba(244,180,195,0.25), rgba(232,224,240,0.3))"
                  : "rgba(255,255,255,0.4)",
                color: isActive ? colors.ink : colors.inkLight,
                fontWeight: isActive ? 500 : 400,
                borderRight: i < visibleTabs.length - 1
                  ? "1px solid rgba(232,152,171,0.15)" : "none",
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      {/* Tab content: Apple Pay / Google Pay */}
      {activeTab === "wallet" && paymentRequest && (
        <div style={{ marginBottom: 16 }}>
          <PaymentRequestButtonElement options={{ paymentRequest, style: {
            paymentRequestButton: { type: "default", theme: "light-outline", height: "48px" },
          } }} />
        </div>
      )}
      {activeTab === "wallet" && !paymentRequest && (
        <div style={{
          textAlign: "center", padding: "20px 12px",
          fontFamily: fonts.body, fontSize: 12, color: colors.inkLight,
          fontStyle: "italic",
        }}>
          Apple Pay / Google Pay not available in this browser.
          <br />Try Safari on macOS or Chrome on Android.
        </div>
      )}

      {/* Tab content: Card */}
      {activeTab === "card" && (
        <form onSubmit={handlePay}>
          <div style={{
            borderRadius: 14,
            border: "1px solid rgba(232,152,171,0.15)",
            background: "rgba(255,255,255,0.5)",
          }}>
            {/* Email field moved to top of form — persisted in localStorage */}
            <div style={{ padding: "14px 14px" }}>
              <CardElement options={{ style: cardStyle, hidePostalCode: true, disableLink: true }} />
            </div>
          </div>
          <button
            type="submit"
            disabled={paying || !stripe}
            style={{
              display: "block", width: "100%", marginTop: 14,
              padding: "13px 0", border: "none",
              background: "linear-gradient(135deg, #F4B4C3, #E8E0F0)",
              borderRadius: 12, fontFamily: fonts.body, fontSize: 13,
              letterSpacing: 2, color: colors.ink, cursor: "pointer",
              transition: "all 0.3s", opacity: paying ? 0.6 : 1,
            }}
          >
            {paying ? "Processing..." : `Pay $${(amount || 100) / 100}`}
          </button>
        </form>
      )}

      {payError && (
        <div style={{
          textAlign: "center", marginTop: 8, fontFamily: fonts.body,
          fontSize: 11, color: colors.err,
        }}>
          {payError}
        </div>
      )}
    </div>
  );
}

PaymentForm.propTypes = {
  clientSecret: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  amount: PropTypes.number,
};

function RequestsTab({ userCode }) {
  const [dishName, setDishName] = useState("");
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem("cafe307_email") || ""; } catch { return ""; }
  });
  const [customNote, setCustomNote] = useState("");
  const [nudge, setNudge] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // dish name pending delete

  const fetchRequests = () => {
    fetch(`${API_BASE}/api/requests`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => setRequests(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Persist email to localStorage
  useEffect(() => {
    try { localStorage.setItem("cafe307_email", email); } catch {}
  }, [email]);

  // Derived: is this a micromanage request?
  const hasMicromanage = customNote.trim().length > 0;

  const handleRequest = async () => {
    const trimmed = dishName.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setNudge(false);
    try {
      const res = await fetch(`${API_BASE}/api/requests/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Reservation-Code": userCode,
        },
        body: JSON.stringify({
          dishName: trimmed,
          isCustom: hasMicromanage,
          customNote: hasMicromanage ? customNote.trim() : undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create payment");
      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /*
    handlePaymentSuccess — called after Stripe confirms the payment on the
    client side. We POST to /api/requests/confirm so the backend can:
      1. Verify the PaymentIntent actually succeeded (server-side check)
      2. Record the dish request in the database
      3. Send an email receipt if the user provided an email address
    Even if the confirm call fails (e.g. network error), the payment already
    went through, so we show a softer success message in that case.
  */
  const handlePaymentSuccess = async (paymentIntentId) => {
    let confirmOk = false;
    try {
      const res = await fetch(`${API_BASE}/api/requests/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Reservation-Code": userCode,
        },
        body: JSON.stringify({ paymentIntentId, email: email.trim() || undefined }),
      });
      confirmOk = res.ok;
    } catch { /* network error */ }
    setClientSecret(null);
    setDishName("");
    setEmail("");
    setCustomNote("");
    setNudge(false);
    if (confirmOk) {
      setSuccessMsg(`✨ ${dishName.trim()} requested!`);
    } else {
      setSuccessMsg(`✨ Payment received — your wish will appear shortly.`);
    }
    fetchRequests();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCancel = () => {
    setClientSecret(null);
  };

  /*
    handleGrant — toggles the "granted" flag on a wish. Only vivian/vlad
    can see the star icon; clicking it calls POST /api/requests/grant which
    flips the granted boolean. A granted wish shows a corner ribbon and a
    filled gold star instead of the dimmed outline.
  */
  const handleGrant = async (dishName) => {
    try {
      await fetch(`${API_BASE}/api/requests/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Reservation-Code": userCode,
        },
        body: JSON.stringify({ dishName }),
      });
      fetchRequests();
    } catch { /* ignore */ }
  };

  const handleDelete = async (dishName) => {
    try {
      await fetch(`${API_BASE}/api/requests/dish`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Reservation-Code": userCode,
        },
        body: JSON.stringify({ dishName }),
      });
      setConfirmDelete(null);
      fetchRequests();
    } catch { /* ignore */ }
  };

  /*
    elementsOptions — passed to <Elements>. The fonts array tells Stripe to
    load Cormorant Garamond inside its iframe so CardElement text matches the
    rest of the app. Without this, Stripe falls back to its default sans-serif
    font and the card input looks out of place.
  */
  const elementsOptions = useMemo(() => clientSecret ? {
    clientSecret,
    fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap" }],
  } : null, [clientSecret]);

  return (
    <div style={{ ...mainView.card, padding: "48px 36px", overflow: "hidden" }}>
      {/* Sparkle shine animation for micromanage button */}
      <style>{`
        @keyframes cafe307-shine {
          0% { left: -100%; }
          30% { left: 150%; }
          100% { left: 150%; }
        }
      `}</style>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
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

      {/* Input fields + Button */}
      <div style={{ marginBottom: 24, marginTop: 8 }}>
        {/* Persistent email field */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 16px", marginBottom: 12,
          border: "1px solid rgba(232,152,171,0.15)",
          borderRadius: 12, background: "rgba(255,255,255,0.5)",
        }}>
          <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.6 }}>✉️</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email for receipt"
            style={{
              flex: 1, padding: 0, border: "none", background: "transparent",
              fontFamily: fonts.body, fontSize: 14, color: colors.ink,
              letterSpacing: 0.5, outline: "none",
            }}
          />
          <style>{`input[type="email"]::placeholder { color: #9B8B7A !important; }`}</style>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 16px", marginBottom: 12,
          border: "1px solid rgba(232,152,171,0.15)",
          borderRadius: 12, background: "rgba(255,255,255,0.5)",
          opacity: clientSecret ? 0.5 : 1,
        }}>
          <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.6 }}>🍽️</span>
          <input
            type="text"
            value={dishName}
            onChange={(e) => { setDishName(e.target.value); setNudge(false); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !clientSecret) handleRequest(); }}
            placeholder="Make a wish"
            disabled={!!clientSecret}
            style={{
              flex: 1, padding: 0, border: "none", background: "transparent",
              fontFamily: fonts.body, fontSize: 14, color: colors.ink,
              letterSpacing: 0.5, outline: "none",
            }}
          />
        </div>

        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "12px 16px",
          border: `1px solid ${nudge ? "rgba(232,152,171,0.4)" : "rgba(232,152,171,0.15)"}`,
          borderRadius: 12, background: "rgba(255,255,255,0.5)",
          opacity: clientSecret ? 0.5 : 1,
          transition: "border-color 0.3s",
        }}>
          <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.6, marginTop: 1 }}>📝</span>
          <textarea
            value={customNote}
            onChange={(e) => { setCustomNote(e.target.value); setNudge(false); }}
            placeholder="Micromanage (+$1)"
            maxLength={1000}
            disabled={!!clientSecret}
            style={{
              flex: 1, padding: 0, minHeight: 40, border: "none", background: "transparent",
              fontFamily: fonts.body, fontSize: 14, color: colors.ink,
              letterSpacing: 0.5, lineHeight: 1.6, resize: "vertical",
              outline: "none",
            }}
          />
        </div>
        {!hasMicromanage && !nudge && (
          <div style={{
            fontFamily: fonts.body, fontSize: 10, color: colors.inkLight,
            fontStyle: "italic", marginTop: 4, textAlign: "right", opacity: 0.7,
          }}>
            Leave empty for chef's choice
          </div>
        )}

        {/* Nudge message */}
        {nudge && (
          <div style={{
            textAlign: "center", marginTop: 10,
            fontFamily: fonts.body, fontSize: 11,
            color: colors.pinkDeep, fontStyle: "italic", letterSpacing: 0.3,
          }}>
            ✨ Micromanaging is $2 — or clear the field for $1 chef&rsquo;s choice
          </div>
        )}

        {/* Submit button — auto-switches between $1 and $2 */}
        {!clientSecret && !loading && (
          <button
            onClick={handleRequest}
            disabled={!dishName.trim()}
            style={{
              display: "block", width: "100%", marginTop: 16,
              padding: "14px 0", border: "none",
              background: "linear-gradient(135deg, rgba(244,180,195,0.2), rgba(232,224,240,0.25))",
              borderRadius: 14, fontFamily: fonts.body, fontSize: 14,
              letterSpacing: 2, color: colors.ink,
              cursor: dishName.trim() ? "pointer" : "default",
              transition: "all 0.3s",
              opacity: dishName.trim() ? 1 : 0.5,
              position: "relative", overflow: "hidden",
            }}
          >
            {hasMicromanage ? "Micromanage · $2" : "Request · $1"}
            {hasMicromanage && (
              <span style={{
                position: "absolute", top: 0, left: "-100%",
                width: "60%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                animation: "cafe307-shine 3s ease-in-out infinite",
                pointerEvents: "none",
              }} />
            )}
          </button>
        )}

        {/* Loading shimmer while fetching clientSecret */}
        {loading && !clientSecret && (
          <div style={{
            marginTop: 16, padding: "24px 0", textAlign: "center",
            background: "rgba(255,255,255,0.3)", borderRadius: 14,
          }}>
            <style>{`
              @keyframes cafe307-pulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 1; }
              }
            `}</style>
            <div style={{
              fontFamily: fonts.body, fontSize: 12, color: colors.inkLight,
              letterSpacing: 1.5, animation: "cafe307-pulse 1.2s ease-in-out infinite",
            }}>
              Loading payment...
            </div>
          </div>
        )}

        {/* Inline Stripe payment form */}
        {clientSecret && stripePromise && elementsOptions && (
          <PaymentErrorBoundary onCancel={handleCancel}>
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentForm clientSecret={clientSecret} email={email} setEmail={setEmail} onSuccess={handlePaymentSuccess} onCancel={handleCancel} amount={hasMicromanage ? 200 : 100} />
            </Elements>
          </PaymentErrorBoundary>
        )}

        {error && (
          <div style={{
            textAlign: "center", marginTop: 8, fontFamily: fonts.body,
            fontSize: 11, color: colors.err,
          }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{
            textAlign: "center", marginTop: 8, fontFamily: fonts.body,
            fontSize: 12, color: colors.success,
          }}>
            {successMsg}
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

      {/* Wishes list — ranked by request count (backend returns them sorted).
          Each dish shows its name, who requested it, and the total count. */}
      {/* Delete confirmation state */}
      {requests.length === 0 ? (
        <div style={{
          textAlign: "center", fontFamily: fonts.body, fontSize: 13,
          color: colors.inkLight, fontStyle: "italic", padding: "16px 0",
        }}>
          No wishes yet. Be the first!
        </div>
      ) : (
        requests.map((r, i) => {
          const canGrant = userCode === "vivian" || userCode === "vlad";
          return (
            <FadeIn key={r.dishName} delay={100 + i * 100}>
              <div style={{
                textAlign: "center", padding: "24px 0",
                borderBottom: i < requests.length - 1
                  ? "1px solid rgba(232,152,171,0.08)" : "none",
                position: "relative", overflow: "hidden",
              }}>
                {/* "GRANTED" corner ribbon — wide enough to not clip */}
                {r.granted && (
                  <div style={{
                    position: "absolute", top: 12, right: -35,
                    background: "linear-gradient(135deg, #F4B4C3, #E8E0F0)",
                    color: colors.ink, fontSize: 7, fontWeight: 600,
                    letterSpacing: 1.5, textTransform: "uppercase",
                    padding: "3px 42px", transform: "rotate(40deg)",
                    whiteSpace: "nowrap", pointerEvents: "none",
                  }}>
                    Granted
                  </div>
                )}
                {/* Dish name + star toggle */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{
                    fontFamily: fonts.body, fontSize: 18, fontWeight: 400,
                    color: colors.ink, letterSpacing: 2,
                  }}>
                    {r.dishName}
                  </div>
                  {canGrant && (
                    <span
                      onClick={() => handleGrant(r.dishName)}
                      style={{
                        fontSize: 16, cursor: "pointer",
                        opacity: r.granted ? 1 : 0.3,
                        filter: r.granted
                          ? "grayscale(0) drop-shadow(0 0 3px rgba(212,169,106,0.35))"
                          : "grayscale(1)",
                        transition: "all 0.3s",
                        userSelect: "none",
                      }}
                      title={r.granted ? "Ungrant wish" : "Grant wish"}
                    >⭐</span>
                  )}
                </div>
                {/* Requester pills */}
                {r.requestedBy && r.requestedBy.length > 0 && (
                  <div style={{
                    display: "flex", flexWrap: "wrap", justifyContent: "center",
                    gap: 5, marginTop: 8,
                  }}>
                    {r.requestedBy.map((name) => (
                      <div key={name} style={{
                        padding: "2px 10px", borderRadius: 20,
                        fontFamily: fonts.body, fontSize: 9, letterSpacing: 0.8,
                        color: colors.inkLight,
                        border: "1px solid rgba(232,152,171,0.18)",
                        background: "rgba(255,255,255,0.5)",
                      }}>
                        {name}
                      </div>
                    ))}
                  </div>
                )}
                {/* Custom notes from $2 requests */}
                {r.customNotes && r.customNotes.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {r.customNotes.map((cn, j) => (
                      <div key={j} style={{
                        fontFamily: fonts.body, fontSize: 12, color: "#B47B8A",
                        lineHeight: 1.5, marginTop: 4,
                      }}>
                        {cn.note.startsWith("http://") || cn.note.startsWith("https://")
                          ? <a href={cn.note} target="_blank" rel="noopener noreferrer" style={{ color: "#B47B8A", textDecoration: "underline" }}>{cn.note}</a>
                          : cn.note
                        }
                        <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 4 }}>— {cn.by}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Delete button — Vivian only */}
                {userCode === "vivian" && (
                  confirmDelete === r.dishName ? (
                    <div style={{
                      marginTop: 10, display: "flex", justifyContent: "center",
                      alignItems: "center", gap: 8,
                    }}>
                      <span style={{
                        fontFamily: fonts.body, fontSize: 10, color: colors.inkLight,
                      }}>
                        Remove this wish?
                      </span>
                      <span
                        onClick={() => handleDelete(r.dishName)}
                        style={{
                          fontFamily: fonts.body, fontSize: 10, color: "#C0392B",
                          cursor: "pointer", fontWeight: 500,
                        }}
                      >Yes</span>
                      <span
                        onClick={() => setConfirmDelete(null)}
                        style={{
                          fontFamily: fonts.body, fontSize: 10, color: colors.inkLight,
                          cursor: "pointer",
                        }}
                      >No</span>
                    </div>
                  ) : (
                    <div
                      onClick={() => setConfirmDelete(r.dishName)}
                      style={{
                        marginTop: 10, fontFamily: fonts.body, fontSize: 9,
                        color: colors.inkLight, cursor: "pointer",
                        opacity: 0.4, transition: "opacity 0.2s",
                        letterSpacing: 0.5,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
                    >
                      ✕ remove
                    </div>
                  )
                )}
              </div>
            </FadeIn>
          );
        })
      )}
    </div>
  );
}

RequestsTab.propTypes = {
  userCode: PropTypes.string.isRequired,
};

export default RequestsTab;
