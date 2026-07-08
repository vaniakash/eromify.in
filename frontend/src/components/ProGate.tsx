"use client";

import { useEffect, useState, ReactNode } from "react";
import { Crown, Lock, Sparkles, Check, Zap, Star } from "lucide-react";
import Script from "next/script";
import { useSession, signIn } from "next-auth/react";

interface ProGateProps {
  children: ReactNode;
}

const proTools = [
  { name: "QR Code Generator", icon: "🔲", badge: "New" },
  { name: "Resume Builder", icon: "📄", badge: "Popular" },
  { name: "Image to WebP", icon: "🖼️", badge: null },
];

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export function ProGate({ children }: ProGateProps) {
  const [isUserPro, setIsUserPro] = useState<boolean | null>(null); // null = loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session, status } = useSession();

  useEffect(() => {
    const checkPro = () => {
      const pro = localStorage.getItem("eromify_pro");
      setIsUserPro(pro === "true");
    };

    if (status === "unauthenticated") {
      setIsUserPro(false);
    } else {
      checkPro();
    }

    window.addEventListener("eromify_pro_updated", checkPro);
    return () => window.removeEventListener("eromify_pro_updated", checkPro);
  }, [status]);

  const handleUpgrade = async () => {
    if (status === "unauthenticated") {
      signIn("google");
      return;
    }

    const currentEmail = session?.user?.email || "";
    const currentId = session?.user?.id || "";

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: currentEmail, userId: currentId }),
      });

      if (!res.ok) throw new Error("Failed to create payment order");
      const { orderId, amount, currency, keyId } = await res.json();

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
              localStorage.setItem("eromify_pro", "true");
              localStorage.setItem(
                "eromify_pro_payment_id",
                response.razorpay_payment_id
              );
              setIsUserPro(true);
            }
          } catch {
            setError("Payment verification failed. Please contact support.");
          }
        },
        theme: { color: "#1736cf" },
        modal: { ondismiss: () => setLoading(false) },
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

  // Loading skeleton
  if (isUserPro === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#1736cf]/20 border-t-[#1736cf] rounded-full animate-spin" />
      </div>
    );
  }

  // Unlocked — render the tool
  if (isUserPro) {
    return <>{children}</>;
  }

  // Locked — show upgrade screen
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(135deg, #0a0e2e 0%, #0f1850 50%, #1a2580 100%)",
        }}
      >
        {/* Background glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle, #4f46e5, transparent)" }}
        />

        <div
          className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Top accent line */}
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg, #7c3aed, #1736cf, #0ea5e9, #1736cf, #7c3aed)",
            }}
          />

          <div className="p-8">
            {/* Icon */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  boxShadow: "0 0 40px rgba(245,158,11,0.4)",
                }}
              >
                <Crown className="h-10 w-10 text-white" />
              </div>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
              >
                <Lock className="h-3 w-3" />
                PRO TOOL
              </div>
              <h1 className="text-2xl font-black text-white text-center">
                This is a Pro Tool
              </h1>
              <p className="text-sm text-center mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Upgrade to Pro for just ₹49 and unlock unlimited access to all premium tools forever.
              </p>
            </div>

            {/* Price card */}
            <div
              className="p-4 rounded-2xl mb-6 text-center"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-white">₹49</span>
                <span style={{ color: "rgba(255,255,255,0.5)" }} className="text-sm">
                  one-time
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                No subscriptions · Lifetime access · All future tools included
              </p>
            </div>

            {/* Pro tools list */}
            <div className="space-y-2 mb-6">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Sparkles className="h-3 w-3 inline mr-1" />
                What you unlock
              </p>
              {proTools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <span className="text-xl">{tool.icon}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{tool.name}</span>
                    {tool.badge && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                        style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b" }}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <Check className="h-4 w-4" style={{ color: "#22c55e" }} />
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="flex gap-3 mb-6">
              {[
                { icon: Zap, label: "Instant Access" },
                { icon: Star, label: "Future Tools" },
                { icon: Check, label: "Secure Pay" },
              ].map(({ icon: Ic, label }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <Ic className="h-3.5 w-3.5" style={{ color: "#818cf8" }} />
                  </div>
                  <span className="text-[10px] text-center font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
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

            {/* CTA */}
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-white text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? "rgba(255,255,255,0.1)"
                  : "linear-gradient(135deg, #1736cf, #4f46e5, #7c3aed)",
                boxShadow: loading ? "none" : "0 0 30px rgba(79,70,229,0.4)",
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
                  Unlock Now — ₹49 Only
                </>
              )}
            </button>

            <p className="text-center text-[10px] mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
              🔒 Secured by Razorpay · UPI, Cards, Net Banking accepted
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
