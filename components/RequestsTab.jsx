/**
 * Dish Requests tab: users pay $1 via inline Stripe payment to request a dish.
 * Most-requested dishes rise to the top.
 */

import { useState, useEffect, useMemo, Component } from "react";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements, CardElement, LinkAuthenticationElement,
  PaymentRequestButtonElement, useStripe, useElements,
} from "@stripe/react-stripe-js";
import FadeIn from "./layout/FadeIn";
import SectionDivider from "./layout/SectionDivider";
import { colors, fonts, mainView } from "../data/config/theme";
import { API_BASE, STRIPE_PUBLISHABLE_KEY } from "../src/config";

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

/* Error boundary so Stripe Elements errors don't crash the whole app */
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

/* Tab labels for payment methods */
const TABS = [
  { id: "card", label: "Card" },
  { id: "link", label: "Link" },
  { id: "wallet", label: " Pay" },
];

/* Inner payment form — must be inside <Elements> to use useStripe/useElements */
function PaymentForm({ clientSecret, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("card");

  /* Apple Pay / Google Pay setup */
  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: "Dish Request", amount: 100 },
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

  const cardStyle = {
    base: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "13px",
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
              onClick={() => !paying && setActiveTab(tab.id)}
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

      {/* Tab content: Stripe Link */}
      {activeTab === "link" && (
        <>
          <div style={{
            padding: "14px 14px", borderRadius: 14,
            border: "1px solid rgba(232,152,171,0.15)",
            background: "rgba(255,255,255,0.5)",
          }}>
            <LinkAuthenticationElement />
          </div>
          <button
              type="button"
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
              {paying ? "Processing..." : "Pay $1"}
            </button>
        </>
      )}

      {/* Tab content: Card */}
      {activeTab === "card" && (
        <form onSubmit={handlePay}>
          <div style={{
            padding: "14px 14px", borderRadius: 14,
            border: "1px solid rgba(232,152,171,0.15)",
            background: "rgba(255,255,255,0.5)",
          }}>
            <CardElement options={{ style: cardStyle, hidePostalCode: true, disableLink: true }} />
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
            {paying ? "Processing..." : "Pay $1"}
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
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function RequestsTab({ userCode }) {
  const [dishName, setDishName] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchRequests = () => {
    fetch(`${API_BASE}/api/requests`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => setRequests(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequest = async () => {
    const trimmed = dishName.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/requests/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Reservation-Code": userCode,
        },
        body: JSON.stringify({ dishName: trimmed }),
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

  const handlePaymentSuccess = async (paymentIntentId) => {
    /* Tell backend to verify & record the request */
    try {
      await fetch(`${API_BASE}/api/requests/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Reservation-Code": userCode,
        },
        body: JSON.stringify({ paymentIntentId }),
      });
    } catch { /* best-effort — webhook is backup */ }
    setClientSecret(null);
    setSuccessMsg(`✨ ${dishName.trim()} requested!`);
    setDishName("");
    fetchRequests();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCancel = () => {
    setClientSecret(null);
  };

  const elementsOptions = useMemo(() => clientSecret ? { clientSecret } : null, [clientSecret]);

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

      {/* Input + Button + Inline Payment */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !clientSecret) handleRequest(); }}
          placeholder="e.g. Mapo Tofu, Char Siu Bao..."
          disabled={!!clientSecret}
          style={{
            width: "100%", padding: "14px 0", border: "none",
            borderBottom: `1px solid rgba(232,152,171,0.3)`,
            background: "transparent", fontFamily: fonts.body, fontSize: 16,
            color: colors.ink, textAlign: "center", letterSpacing: 1,
            outline: "none", boxSizing: "border-box",
            opacity: clientSecret ? 0.5 : 1,
          }}
        />
        {!clientSecret && (
          <button
            onClick={handleRequest}
            disabled={loading || !dishName.trim()}
            style={{
              display: "block", width: "100%", marginTop: 16,
              padding: "14px 0", border: "none",
              background: "linear-gradient(135deg, rgba(244,180,195,0.2), rgba(232,224,240,0.25))",
              borderRadius: 14, fontFamily: fonts.body, fontSize: 14,
              letterSpacing: 2.5, color: colors.ink,
              cursor: dishName.trim() ? "pointer" : "default",
              transition: "all 0.3s",
              opacity: dishName.trim() ? 1 : 0.5,
            }}
          >
            {loading ? "Loading..." : "Request · $1"}
          </button>
        )}

        {/* Inline Stripe payment form */}
        {clientSecret && stripePromise && elementsOptions && (
          <PaymentErrorBoundary onCancel={handleCancel}>
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} onCancel={handleCancel} />
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
