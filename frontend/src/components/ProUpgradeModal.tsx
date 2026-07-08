"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Crown, Zap, Check, Lock, Sparkles, Star } from "lucide-react";
import Script from "next/script";
import { useSession, signIn } from "next-auth/react";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userEmail?: string;
  userId?: string;
}

const proTools = [
  {
    name: "QR Code Generator",
    desc: "Generate free QR codes instantly for URLs, text, WiFi, business cards.",
    icon: "🔲",
    badge: "New",
  },
  {
    name: "Resume Builder",
    desc: "Create a professional resume with real-time preview and export to PDF.",
    icon: "📄",
    badge: "Popular",
  },
  {
    name: "Image to WebP",
    desc: "Convert PNG and JPG images to the optimized WebP format instantly.",
    icon: "🖼️",
    badge: null,
  },
];

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export function ProUpgradeModal({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  userId,
}: ProUpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status } = useSession();

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (status === "unauthenticated") {
      signIn("google");
      return;
    }

    const currentEmail = userEmail || session?.user?.email || "";
    const currentId = userId || session?.user?.id || "";

    setLoading(true);
    setError(null);

    try {
      // Create order
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // packId must be "starter" to match the ₹49 price shown in the UI
        body: JSON.stringify({ userEmail: currentEmail, userId: currentId, packId: "starter" }),
      });

      if (!res.ok) throw new Error("Failed to create payment order");
      const { orderId, amount, currency, keyId } = await res.json();

      // Open Razorpay checkout
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Eromify",
        description: "Pro Plan — Unlock All Premium Tools",
        order_id: orderId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userEmail: currentEmail,
                userId: currentId,
              }),
            });

            if (!verifyRes.ok) throw new Error("Verification failed");

            const data = await verifyRes.json();
            if (data.success) {
              // Save pro status in localStorage
              localStorage.setItem("eromify_pro", "true");
              localStorage.setItem(
                "eromify_pro_payment_id",
                response.razorpay_payment_id
              );
              // Re-fetch fresh credits + pro status from DB so UI updates immediately
              try {
                await new Promise((r) => setTimeout(r, 500)); // let DB write settle
                const syncRes = await fetch("/api/user/sync-pro");
                const syncData = await syncRes.json();
                if (syncData.isPro) {
                  localStorage.setItem("eromify_pro", "true");
                } else {
                  localStorage.removeItem("eromify_pro");
                }
                // Dispatch events so credit counter / pro badge refresh
                window.dispatchEvent(
                  new CustomEvent("eromify_credits_updated", {
                    detail: { credits: syncData.credits ?? data.creditsAdded ?? 0 },
                  })
                );
                window.dispatchEvent(new Event("eromify_pro_updated"));
              } catch {
                // Fallback — still signal a refresh
                window.dispatchEvent(new Event("eromify_pro_updated"));
              }
              onSuccess?.();
              onClose();
            }
          } catch {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: userEmail || "",
        },
        theme: {
          color: "#1736cf",
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Backdrop */}
      {typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Modal */}
          <div
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, #0a0e2e 0%, #0f1850 40%, #1a2580 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
          {/* Glowing top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{
              background:
                "linear-gradient(90deg, #7c3aed, #1736cf, #0ea5e9, #1736cf, #7c3aed)",
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <X className="h-4 w-4 text-white" />
          </button>

          <div className="p-8">
            {/* Crown + Badge */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  boxShadow: "0 0 30px rgba(245,158,11,0.4)",
                }}
              >
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
              >
                <Sparkles className="h-3 w-3" />
                PREMIUM ACCESS
              </div>
              <h2 className="text-2xl font-black text-white text-center">
                Unlock Pro Tools
              </h2>
              <p className="text-sm text-center mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                Get unlimited access to all premium tools with a one-time payment
              </p>
            </div>

            {/* Price */}
            <div
              className="flex items-center justify-center gap-2 mb-6 p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-white">₹49</span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">
                    one-time
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  No recurring charges · Lifetime access
                </p>
              </div>
            </div>

            {/* Pro Tools */}
            <div className="mb-6 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Lock className="h-3 w-3 inline mr-1" />
                Pro Tools Included
              </p>
              {proTools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <span className="text-2xl">{tool.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{tool.name}</p>
                      {tool.badge && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                          style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
                        >
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {tool.desc}
                    </p>
                  </div>
                  <Check className="h-4 w-4 flex-shrink-0" style={{ color: "#22c55e" }} />
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="flex gap-4 mb-6">
              {[
                { icon: Zap, label: "Instant Access" },
                { icon: Star, label: "All Future Tools" },
                { icon: Check, label: "Secure Payment" },
              ].map(({ icon: Ic, label }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <Ic className="h-3.5 w-3.5" style={{ color: "#1736cf" }} />
                  </div>
                  <span className="text-[10px] text-center font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-4 p-3 rounded-xl text-sm text-center"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}
              >
                {error}
              </div>
            )}

            {/* CTA Button */}
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-white text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              style={{
                background: loading
                  ? "linear-gradient(135deg, #374151, #1f2937)"
                  : "linear-gradient(135deg, #1736cf, #4f46e5, #7c3aed)",
                boxShadow: loading ? "none" : "0 0 30px rgba(79,70,229,0.5)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 text-amber-300" />
                  Upgrade Now — ₹49 Only
                </>
              )}
            </button>

            <p className="text-center text-[10px] mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              🔒 Secured by Razorpay · UPI, Cards, Net Banking accepted
            </p>
          </div>
        </div>
      </div>, document.body)}
    </>
  );
}
