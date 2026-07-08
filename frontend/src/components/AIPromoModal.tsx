"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Sparkles, ArrowRight, Zap } from "lucide-react";

interface AIPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIPromoModal({ isOpen, onClose }: AIPromoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Small delay so CSS transition plays
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{
        background: visible ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(8px)" : "none",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #0d0d1a 0%, #12122a 100%)",
          border: "1px solid rgba(124,58,237,0.35)",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.92) translateY(24px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          id="ai-promo-modal-close"
          aria-label="Close promotion"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Poster Image */}
        <div className="relative w-full h-52 overflow-hidden">
          <Image
            src="/modelpopup.webp"
            alt="AI Image Generator Promo"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay gradient */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 40%, #0d0d1a 100%)" }}
          />
          {/* Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(124,58,237,0.85)", color: "white", backdropFilter: "blur(8px)" }}>
            <Sparkles className="h-3 w-3" />
            New — AI Tools
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-2">
          <h2 className="text-white text-2xl font-black tracking-tight mb-2">
            Generate AI Images
            <span className="block text-violet-400">for just ₹99</span>
          </h2>
          <p className="text-[#a1a1aa] text-sm leading-relaxed mb-5">
            Access GPT Image 1, FLUX.1, Seedance, Kling & Veo models. Create stunning images and cinematic videos from any prompt — no watermarks, no limits.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              { icon: Sparkles, label: "GPT Image 1" },
              { icon: Zap, label: "FLUX.1 Dev" },
              { icon: Zap, label: "Seedance" },
              { icon: Sparkles, label: "Kling" },
              { icon: Zap, label: "Veo" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(124,58,237,0.15)",
                  color: "rgba(167,139,250,0.9)",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <Link
              href="/tools/creator"
              id="ai-promo-modal-try-free"
              onClick={() => {
                onClose();
                try { fetch("/api/analytics/track", { method: "POST", body: JSON.stringify({ event: "cta_click", page: "homepage", label: "promo_try_now" }), keepalive: true }) } catch (e) {}
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
            >
              <Sparkles className="h-4 w-4" />
              Try Now
            </Link>
            <button
              onClick={() => {
                onClose();
                try { fetch("/api/analytics/track", { method: "POST", body: JSON.stringify({ event: "cta_click", page: "homepage", label: "promo_later" }), keepalive: true }) } catch (e) {}
              }}
              className="px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
            >
              Later
            </button>
          </div>

          {/* Fine print */}
          <p className="text-center text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
            ₹99 one-time · Unlimited generations · No subscription
          </p>
        </div>
      </div>
    </div>
  );
}
