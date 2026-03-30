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

import { useState, useEffect, useRef, useMemo, useCallback, Component } from "react";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements, CardNumberElement, CardExpiryElement, CardCvcElement,
  useStripe, useElements,
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
  PaymentForm — Option B layout (no tabs).
  Card fields on top, "or pay with" divider, Apple/Google Pay below.
  Everything renders at once — no tab switching, no animation issues.
  Deferred intent: PaymentIntent created on Pay click (or pre-fetched).
*/
function PaymentForm({ dishName, customNote, isCustom, userCode, email, onSuccess, onCancel, amount, prefetchedSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [walletType, setWalletType] = useState(null); // "applePay" | "googlePay" | "link"

  // Track which Stripe elements are ready — show all at once
  const [readyCount, setReadyCount] = useState(0);
  const allCardReady = readyCount >= 3;

  // Apple Pay / Google Pay
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
        if (result.applePay) setWalletType("applePay");
        else if (result.googlePay) setWalletType("googlePay");
        else setWalletType("link");
      }
    });
    pr.on("paymentmethod", async (ev) => {
      try {
        let clientSecret = prefetchedSecret;
        if (!clientSecret) {
          const res = await fetch(`${API_BASE}/api/requests/create-payment-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Reservation-Code": userCode },
            body: JSON.stringify({ dishName, isCustom, customNote: isCustom ? customNote : undefined }),
          });
          if (!res.ok) { ev.complete("fail"); setPayError("Failed to create payment"); return; }
          const data = await res.json();
          clientSecret = data.clientSecret;
        }
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );
        if (confirmError) { ev.complete("fail"); setPayError(confirmError.message); }
        else { ev.complete("success"); onSuccess(paymentIntent.id); }
      } catch { ev.complete("fail"); setPayError("Payment failed"); }
    });
  }, [stripe, amount, dishName, isCustom, customNote, userCode, onSuccess]);

  const elementStyle = {
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

  const onElementReady = () => setReadyCount((c) => c + 1);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setPayError(null);

    let clientSecret = prefetchedSecret;
    if (!clientSecret) {
      try {
        const res = await fetch(`${API_BASE}/api/requests/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Reservation-Code": userCode },
          body: JSON.stringify({ dishName, isCustom, customNote: isCustom ? customNote : undefined }),
        });
        if (!res.ok) throw new Error("Failed to create payment");
        const data = await res.json();
        clientSecret = data.clientSecret;
      } catch {
        setPayError("Something went wrong. Please try again.");
        setPaying(false);
        return;
      }
    }

    const cardNumber = elements.getElement(CardNumberElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardNumber },
    });
    if (error) {
      setPayError(error.message);
      setPaying(false);
    } else {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Card fields */}
      <form onSubmit={handlePay}>
        <div style={{
          borderRadius: 12,
          border: "1px solid rgba(232,152,171,0.15)",
          background: "rgba(255,255,255,0.5)",
          opacity: allCardReady ? 1 : 0,
          transition: "opacity 0.15s ease",
        }}>
          <div style={{ padding: "14px 14px 10px" }}>
            <CardNumberElement onReady={onElementReady} options={{ style: elementStyle, disableLink: true, placeholder: "Card number" }} />
          </div>
          <div style={{ height: 1, background: "rgba(232,152,171,0.1)", margin: "0 14px" }} />
          <div style={{ display: "flex", padding: "10px 14px 14px", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <CardExpiryElement onReady={onElementReady} options={{ style: elementStyle }} />
            </div>
            <div style={{ flex: 1 }}>
              <CardCvcElement onReady={onElementReady} options={{ style: elementStyle }} />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={paying || !stripe || !allCardReady}
          style={{
            display: "block", width: "100%", marginTop: 14,
            padding: "13px 0", border: "none",
            background: "linear-gradient(135deg, #F4B4C3, #E8E0F0)",
            borderRadius: 12, fontFamily: fonts.body, fontSize: 13,
            fontWeight: 600,
            letterSpacing: 2, color: colors.ink, cursor: "pointer",
            transition: "all 0.3s", opacity: paying ? 0.6 : allCardReady ? 1 : 0,
          }}
        >
          {paying ? "Processing..." : `Pay $${(amount || 100) / 100}`}
        </button>
      </form>

      {/* "or" divider + custom Apple Pay button (no Stripe iframe = no animation) */}
      {paymentRequest && (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, margin: "18px 0",
          }}>
            <div style={{ flex: 1, height: 1, background: "rgba(232,152,171,0.2)" }} />
            <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.inkLight, letterSpacing: 1 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(232,152,171,0.2)" }} />
          </div>
          <button
            type="button"
            onClick={() => paymentRequest.show()}
            disabled={paying}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", padding: "13px 0", 
              border: walletType === "link" ? "none" : "1px solid #e0e0e0",
              borderRadius: 12,
              background: walletType === "link"
                ? "linear-gradient(135deg, #00D66F, #00B35B)"
                : "#000",
              color: "#fff",
              fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
              letterSpacing: 2, cursor: "pointer",
              opacity: paying ? 0.5 : 1,
              WebkitAppearance: "none",
            }}
          >
            {walletType === "applePay" ? "Apple Pay" : walletType === "googlePay" ? "Google Pay" : "Pay with Link"}
          </button>
        </>
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
  dishName: PropTypes.string.isRequired,
  customNote: PropTypes.string,
  isCustom: PropTypes.bool.isRequired,
  userCode: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  amount: PropTypes.number,
  prefetchedSecret: PropTypes.string,
};

function RequestsTab({ userCode }) {
  const [dishName, setDishName] = useState("");
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem("cafe307_email") || ""; } catch { return ""; }
  });
  const [customNote, setCustomNote] = useState("");
  const [nudge, setNudge] = useState(false);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // dish name pending delete

  // Pre-fetched PaymentIntent cache
  const prefetchRef = useRef({ secret: null, isCustom: false, dishName: "", fetching: false });
  const debounceRef = useRef(null);

  const prefetchIntent = useCallback((dish, isCustom, note) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const trimmed = (dish || "").trim();
      if (!trimmed) return;
      // Skip if already fetched for same params
      const cache = prefetchRef.current;
      if (cache.secret && cache.dishName === trimmed && cache.isCustom === isCustom) return;
      if (cache.fetching) return;
      cache.fetching = true;
      try {
        const res = await fetch(`${API_BASE}/api/requests/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Reservation-Code": userCode },
          body: JSON.stringify({ dishName: trimmed, isCustom, customNote: isCustom ? (note || "").trim() : undefined }),
        });
        if (res.ok) {
          const data = await res.json();
          prefetchRef.current = { secret: data.clientSecret, isCustom, dishName: trimmed, fetching: false };
        } else {
          cache.fetching = false;
        }
      } catch { cache.fetching = false; }
    }, 400); // 400ms debounce
  }, [userCode]);

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

  // Pre-fetch PaymentIntent as user types
  useEffect(() => {
    if (dishName.trim()) {
      prefetchIntent(dishName, hasMicromanage, customNote);
    }
  }, [dishName, hasMicromanage, customNote, prefetchIntent]);

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
    setDishName("");
    setCustomNote("");
    setNudge(false);
    prefetchRef.current = { secret: null, isCustom: false, dishName: "", fetching: false };
    if (confirmOk) {
      setSuccessMsg(`✨ ${dishName.trim()} requested!`);
    } else {
      setSuccessMsg(`✨ Payment received — your wish will appear shortly.`);
    }
    fetchRequests();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCancel = () => {
    prefetchRef.current = { secret: null, isCustom: false, dishName: "", fetching: false };
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
  const elementsOptions = useMemo(() => ({
    fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap" }],
  }), []);

  return (
    <div style={{ ...mainView.card, padding: "48px 36px", overflow: "hidden" }}>
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
          <style>{`
            input[type="email"]::placeholder,
            input[type="text"]::placeholder,
            textarea::placeholder { color: #9B8B7A !important; }
          `}</style>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 16px", marginBottom: 12,
          border: "1px solid rgba(232,152,171,0.15)",
          borderRadius: 12, background: "rgba(255,255,255,0.5)",
        }}>
          <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.6 }}>🍽️</span>
          <input
            type="text"
            value={dishName}
            onChange={(e) => { setDishName(e.target.value); setNudge(false); }}
            placeholder="Make a wish"
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
          transition: "border-color 0.3s",
        }}>
          <span style={{ fontSize: 13, flexShrink: 0, opacity: 0.6, marginTop: 1 }}>📝</span>
          <textarea
            value={customNote}
            onChange={(e) => { setCustomNote(e.target.value); setNudge(false); }}
            placeholder="Micromanage (+$1)"
            maxLength={1000}
            style={{
              flex: 1, padding: 0, minHeight: 40, border: "none", background: "transparent",
              fontFamily: fonts.body, fontSize: 14, color: colors.ink,
              letterSpacing: 0.5, lineHeight: 1.6, resize: "vertical",
              outline: "none",
            }}
          />
        </div>
        {/* Payment form — always visible, no intermediate button */}
        {stripePromise && (
          <PaymentErrorBoundary onCancel={handleCancel}>
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentForm
                dishName={dishName.trim()}
                customNote={customNote.trim()}
                isCustom={hasMicromanage}
                userCode={userCode}
                email={email}
                onSuccess={handlePaymentSuccess}
                onCancel={handleCancel}
                amount={hasMicromanage ? 200 : 100}
                prefetchedSecret={prefetchRef.current.secret}
              />
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
          return (
            <FadeIn key={r.dishName} delay={100 + i * 100}>
              <div style={{
                textAlign: "center", padding: "24px 0",
                borderBottom: i < requests.length - 1
                  ? "1px solid rgba(232,152,171,0.08)" : "none",
                position: "relative",
              }}>
                {/* Gold "Wish Granted" label above dish name */}
                {r.granted && (
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    marginBottom: 6,
                  }}>
                    <span style={{ fontSize: 11 }}>🌟</span>
                    <span style={{
                      fontFamily: fonts.body, fontSize: 9, color: "#C4A265",
                      letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500,
                    }}>Wish Granted</span>
                  </div>
                )}
                {/* Dish name */}
                <div style={{
                  fontFamily: fonts.body, fontSize: 18, fontWeight: 400,
                  color: colors.ink, letterSpacing: 2,
                }}>
                  {r.dishName}
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
                {/* Admin controls — Vivian only */}
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
                    <div style={{
                      marginTop: 10, display: "flex", justifyContent: "center",
                      alignItems: "center", gap: 12,
                    }}>
                      <span
                        onClick={() => handleGrant(r.dishName)}
                        style={{
                          fontFamily: fonts.body, fontSize: 9, color: "#C4A265",
                          cursor: "pointer", opacity: 0.5, transition: "opacity 0.2s",
                          letterSpacing: 0.5,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                      >
                        {r.granted ? "☆ ungrant" : "★ grant"}
                      </span>
                      <span style={{ fontSize: 9, color: "rgba(232,152,171,0.3)" }}>·</span>
                    <div
                      onClick={() => setConfirmDelete(r.dishName)}
                      style={{
                        fontFamily: fonts.body, fontSize: 9,
                        color: colors.inkLight, cursor: "pointer",
                        opacity: 0.4, transition: "opacity 0.2s",
                        letterSpacing: 0.5,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
                    >
                      ✕ remove
                    </div>
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
