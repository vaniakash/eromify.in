"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X, Zap, Check, Shield, Sparkles, Star, Flame, Layers, Video,
  type LucideIcon,
} from "lucide-react";
import Script from "next/script";
import { useSession, signIn } from "next-auth/react";

interface ImageGenPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (creditsAdded?: number) => void;
  mode: "login" | "payment";
}

declare global {
  interface Window { Razorpay: any; }
}



interface Pack {
  id: string;
  name: string;
  tag: string;
  price: number;
  credits: number;
  unitPrice: string;
  accent: string;
  glow: string;
  iconBg: string;
  icon: LucideIcon;
  popular?: boolean;
  videoAccess?: boolean;
}

const PACKS: Pack[] = [
  {
    id: "value", name: "Beginner", tag: "₹99 · ~$1.19",
    price: 99, credits: 1200, unitPrice: "",
    accent: "#3b82f6", glow: "rgba(59,130,246,0.28)",
    iconBg: "linear-gradient(135deg,#1e3a8a,#1d4ed8)",
    icon: Star,
  },
  {
    id: "pro", name: "Creator", tag: "₹399 · ~$3.99",
    price: 399, credits: 3000, unitPrice: "",
    accent: "#a855f7", glow: "rgba(168,85,247,0.28)",
    iconBg: "linear-gradient(135deg,#4c1d95,#6d28d9)",
    icon: Flame, popular: true, videoAccess: true,
  },
  {
    id: "mega", name: "Professional", tag: "₹499 · ~$4.99",
    price: 499, credits: 10000, unitPrice: "",
    accent: "#f43f5e", glow: "rgba(244,63,94,0.25)",
    iconBg: "linear-gradient(135deg,#881337,#be123c)",
    icon: Layers, videoAccess: true,
  },
  {
    id: "premium", name: "Enterprise", tag: "₹1999 · ~$19.99",
    price: 1999, credits: 40000, unitPrice: "",
    accent: "#eab308", glow: "rgba(234,179,8,0.28)",
    iconBg: "linear-gradient(135deg,#854d0e,#a16207)",
    icon: Sparkles, videoAccess: true,
  },
];

export function ImageGenPayModal({ isOpen, onClose, onSuccess, mode }: ImageGenPayModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackId, setSelectedPackId] = useState("value");
  const { data: session } = useSession();

  if (!isOpen) return null;

  const selectedPack = PACKS.find(p => p.id === selectedPackId)!;

  const handleLogin = () => signIn("google", { callbackUrl: "/tools/creator/image-generator" });

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: session?.user?.email || "", userId: session?.user?.id || "", packId: selectedPackId }),
      });
      if (!res.ok) throw new Error();
      const { orderId, amount, currency, keyId } = await res.json();

      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount, currency,
        name: "Eromify",
        description: `${selectedPack.name} Pack — ${selectedPack.credits} Image Credits`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const vr = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userEmail: session?.user?.email || "",
                userId: session?.user?.id || "",
              }),
            });
            const data = await vr.json();
            if (data.success) {
              try {
                const proRes = await fetch("/api/user/sync-pro");
                const proData = await proRes.json();
                if (proData.isPro) localStorage.setItem("eromify_pro", "true");
                else localStorage.removeItem("eromify_pro");
                window.dispatchEvent(new CustomEvent("eromify_credits_updated", { detail: { credits: proData.credits ?? data.creditsAdded ?? 0 } }));
              } catch { localStorage.setItem("eromify_pro", "true"); }
              window.dispatchEvent(new Event("eromify_pro_updated"));
              await new Promise(r => setTimeout(r, 500));
              onSuccess(data.creditsAdded);
              onClose();
            }
          } catch { setError("Payment verification failed. Please contact support."); }
        },
        prefill: { email: session?.user?.email || "" },
        theme: { color: selectedPack.accent },
        modal: { ondismiss: () => setLoading(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => { setError("Payment failed. Please try again."); setLoading(false); });
      rzp.open();
    } catch { setError("Something went wrong. Please try again."); setLoading(false); }
  };

  const content = (
    <>
      <style>{`
        @keyframes modal-in{from{opacity:0;transform:scale(0.94) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes shimmer-move{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes pack-pop{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        .modal-card{animation:modal-in 0.35s cubic-bezier(.22,1,.36,1) both}
        .pack-row{animation:pack-pop 0.3s cubic-bezier(.22,1,.36,1) both}
        .pack-row:nth-child(1){animation-delay:0.05s}
        .pack-row:nth-child(2){animation-delay:0.12s}
        .pack-row:nth-child(3){animation-delay:0.19s}
        .pack-btn{transition:all 0.2s cubic-bezier(.22,1,.36,1)}
        .pack-btn:hover{transform:translateX(2px)}
        .shimmer-badge{
          background:linear-gradient(90deg,#a78bfa 0%,#fff 40%,#a78bfa 100%);
          background-size:200% auto;animation:shimmer-move 2s linear infinite;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text
        }
        .cta-btn{transition:all 0.2s ease}
        .cta-btn:hover:not(:disabled){transform:translateY(-1px)}
        .cta-btn:active:not(:disabled){transform:scale(0.98)}
      `}</style>

      <div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="modal-card relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#09091a 0%,#0f0f24 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 0 1px rgba(124,58,237,0.15), 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)",
            maxHeight: "94vh",
            overflowY: "auto",
          }}
        >
          {/* Top glow bar */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px]" style={{ background: "linear-gradient(90deg,transparent,#7c3aed 30%,#3b82f6 70%,transparent)" }} />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>

          <div className="px-6 pt-6 pb-7">

            {/* Header */}
            <div className="flex flex-col items-center mb-7">
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative"
                style={{
                  background: "linear-gradient(135deg,#4c1d95,#7c3aed)",
                  boxShadow: "0 0 40px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                {/* Sparkle ring */}
                <div className="absolute -inset-1 rounded-3xl" style={{ background: "radial-gradient(circle,rgba(124,58,237,0.25) 0%,transparent 70%)" }} />
                <Sparkles className="h-7 w-7 text-white relative z-10" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: "rgba(167,139,250,0.8)" }}>
                AI Image Generator
              </span>

              {mode === "login" ? (
                <>
                  <h2 className="text-2xl font-black text-white text-center leading-tight">Sign in to continue</h2>
                  <p className="text-sm text-center mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    Sign in with Google to generate stunning AI images.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-white text-center leading-tight">Get More Credits</h2>
                  <p className="text-sm text-center mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
                    One-time purchase · Credits never expire
                  </p>
                </>
              )}
            </div>

            {/* Packs */}
            {mode === "payment" && (
              <div className="space-y-2.5 mb-5">
                {PACKS.map((pack) => {
                  const isSelected = selectedPackId === pack.id;
                  const Icon = pack.icon;
                  return (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedPackId(pack.id)}
                      className="pack-row pack-btn w-full relative flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-left"
                      style={{
                        background: isSelected ? `rgba(${pack.id === "value" ? "59,130,246" : pack.id === "pro" ? "168,85,247" : pack.id === "mega" ? "244,63,94" : "234,179,8"},0.1)` : "rgba(255,255,255,0.03)",
                        border: isSelected ? `1px solid ${pack.accent}60` : "1px solid rgba(255,255,255,0.07)",
                        boxShadow: isSelected ? `0 0 20px ${pack.glow}, inset 0 1px 0 rgba(255,255,255,0.04)` : "none",
                      }}
                    >
                      {/* Selected left bar */}
                      {isSelected && (
                        <div className="absolute left-0 top-[15%] bottom-[15%] w-[2.5px] rounded-r-full" style={{ background: pack.accent }} />
                      )}

                      {/* Pack icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: isSelected ? pack.iconBg : "rgba(255,255,255,0.05)",
                          boxShadow: isSelected ? `0 0 12px ${pack.glow}` : "none",
                          transition: "all 0.25s ease",
                        }}
                      >
                        <Icon className="h-5 w-5" style={{ color: isSelected ? pack.accent : "rgba(255,255,255,0.3)", transition: "color 0.25s ease" }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black" style={{ color: isSelected ? "#fff" : "rgba(255,255,255,0.65)" }}>
                            {pack.name} Pack
                          </span>
                          <span
                            className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
                            style={
                              pack.popular && isSelected
                                ? { background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.35)" }
                                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }
                            }
                          >
                            {pack.tag}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                          <span className="font-bold" style={{ color: isSelected ? pack.accent : "rgba(255,255,255,0.4)" }}>{pack.credits.toLocaleString()}</span> credits
                        </p>
                        {pack.videoAccess && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Video className="h-3 w-3" style={{ color: isSelected ? pack.accent : "rgba(255,255,255,0.3)" }} />
                            <span
                              className="text-[10px] font-bold"
                              style={{ color: isSelected ? pack.accent : "rgba(255,255,255,0.3)" }}
                            >
                              Video Generation Access
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="shrink-0 text-right">
                        <span
                          className="text-xl font-black tabular-nums"
                          style={{ color: isSelected ? "#fff" : "rgba(255,255,255,0.4)" }}
                        >
                          ₹{pack.price}
                        </span>
                      </div>

                      {/* Check mark */}
                      {isSelected && (
                        <div
                          className="absolute right-3 top-3 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: pack.accent, boxShadow: `0 0 8px ${pack.glow}` }}
                        >
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Refund badge */}
            {mode === "payment" && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-5"
                style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.15)" }}>
                  <Shield className="h-3.5 w-3.5" style={{ color: "#34d399" }} />
                </div>
                <p className="text-xs leading-snug" style={{ color: "rgba(52,211,153,0.85)" }}>
                  <span className="font-bold">24-Hour Refund Guarantee</span> — Not satisfied? Full refund within 24 hours, no questions asked.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-2xl text-xs text-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                {error}
              </div>
            )}

            {/* CTA */}
            {mode === "login" ? (
              <button
                onClick={handleLogin}
                className="cta-btn w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2.5"
                style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 30px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            ) : (
              <button
                onClick={handlePayment}
                disabled={loading}
                className="cta-btn w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? "rgba(107,114,128,0.3)"
                    : `linear-gradient(135deg,${selectedPack.id === "value" ? "#1d4ed8,#3b82f6" : selectedPack.id === "pro" ? "#7c3aed,#a855f7" : selectedPack.id === "mega" ? "#be123c,#f43f5e" : "#a16207,#ca8a04"})`,
                  boxShadow: loading ? "none" : `0 0 30px ${selectedPack.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
                ) : (
                  <><Zap className="h-4 w-4" /> Pay ₹{selectedPack.price} &amp; Get {selectedPack.credits.toLocaleString()} Credits</>
                )}
              </button>
            )}

            <p className="text-center text-[10px] mt-3 flex items-center justify-center gap-1" style={{ color: "rgba(255,255,255,0.2)" }}>
              <Shield className="h-3 w-3" />
              Secured by Razorpay · UPI · Cards · Net Banking
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {typeof document !== "undefined" && createPortal(content, document.body)}
    </>
  );
}
