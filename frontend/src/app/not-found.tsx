"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const MESSAGES = [
  "Bro… what are you even looking for? 👀",
  "This page ghosted you harder than your ex 💀",
  "404: page went on a walk and never came back 🚶",
  "You really said 'let me find a page that doesn't exist' 💀",
  "Even Google can't find this one bruh 🤷",
  "You lost? Don't worry, we all are sometimes 😭",
  "This page is on vacation. Permanently. 🏝️",
];

export default function NotFound() {
  const [msg, setMsg] = useState(MESSAGES[0]);
  const [glitch, setGlitch] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [stars, setStars] = useState<
    { w: number; h: number; l: number; t: number; dur: number; op: number }[]
  >([]);

  // Generate stars client-side only to avoid hydration mismatch
  useEffect(() => {
    setStars(
      Array.from({ length: 80 }, () => ({
        w: Math.random() * 3 + 1,
        h: Math.random() * 3 + 1,
        l: Math.random() * 100,
        t: Math.random() * 100,
        dur: Math.random() * 3 + 2,
        op: Math.random() * 0.7 + 0.2,
      }))
    );
  }, []);

  // Cycle through funny messages
  useEffect(() => {
    const iv = setInterval(() => {
      setMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  // Glitch the 404 text every few seconds
  useEffect(() => {
    const iv = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 600);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&display=swap');

        .not-found-wrap {
          font-family: 'Space Grotesk', sans-serif;
          min-height: 100vh;
          background: radial-gradient(ellipse at 60% 20%, #1a0533 0%, #0a0a0f 60%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          padding: 2rem;
        }

        /* Star field */
        .stars {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: twinkle var(--dur) ease-in-out infinite alternate;
          opacity: var(--op);
        }
        @keyframes twinkle {
          from { opacity: var(--op); transform: scale(1); }
          to   { opacity: calc(var(--op) * 0.2); transform: scale(0.5); }
        }

        /* Floating astronaut */
        .astronaut {
          font-size: 6rem;
          animation: float 4s ease-in-out infinite;
          filter: drop-shadow(0 0 30px rgba(167,139,250,0.5));
          margin-bottom: 1rem;
          cursor: pointer;
          user-select: none;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50%       { transform: translateY(-20px) rotate(5deg); }
        }
        .astronaut:active {
          animation: spin 0.5s ease;
        }
        @keyframes spin {
          from { transform: rotate(0deg) scale(1.2); }
          to   { transform: rotate(360deg) scale(1); }
        }

        /* 404 glitch */
        .four-oh-four {
          font-size: clamp(5rem, 18vw, 12rem);
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #a855f7, #3b82f6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          letter-spacing: -4px;
          transition: all 0.1s;
        }
        .four-oh-four.glitch {
          animation: glitch 0.6s steps(2) forwards;
          filter: blur(1px);
        }
        @keyframes glitch {
          0%   { transform: translate(0); filter: blur(0); }
          20%  { transform: translate(-4px, 2px) skewX(-3deg); filter: hue-rotate(90deg) blur(1px); }
          40%  { transform: translate(4px, -2px) skewX(3deg); filter: hue-rotate(180deg); }
          60%  { transform: translate(-2px, 1px); filter: hue-rotate(270deg) blur(0.5px); }
          80%  { transform: translate(2px, -1px) skewX(-1deg); }
          100% { transform: translate(0); filter: blur(0); }
        }

        /* Message */
        .msg-box {
          min-height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .msg-text {
          font-size: clamp(0.9rem, 2.5vw, 1.15rem);
          color: rgba(203,213,225,0.9);
          text-align: center;
          animation: fadeMsg 0.5s ease;
        }
        @keyframes fadeMsg {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Subtitle */
        .subtitle {
          color: rgba(148,163,184,0.6);
          font-size: 0.85rem;
          text-align: center;
          max-width: 340px;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        /* Button */
        .go-home {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 2.2rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          color: white;
          font-weight: 800;
          font-size: 1rem;
          text-decoration: none;
          box-shadow: 0 0 30px rgba(124,58,237,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .go-home::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #6d28d9, #1d4ed8);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .go-home:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 0 45px rgba(124,58,237,0.6);
        }
        .go-home:hover::before { opacity: 1; }
        .go-home span { position: relative; z-index: 1; }

        /* Floating orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: orbFloat var(--dur) ease-in-out infinite alternate;
          opacity: 0.15;
          filter: blur(40px);
        }
        @keyframes orbFloat {
          from { transform: translate(0, 0); }
          to   { transform: translate(var(--tx), var(--ty)); }
        }
      `}</style>

      <div className="not-found-wrap">
        {/* Stars */}
        <div className="stars">
          {stars.map((s, i) => (
            <div
              key={i}
              className="star"
              style={{
                width: s.w + "px",
                height: s.h + "px",
                left: s.l + "%",
                top: s.t + "%",
                "--dur": s.dur + "s",
                "--op": s.op,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Glowing orbs */}
        <div className="orb" style={{ width: 400, height: 400, background: "#7c3aed", left: "-10%", top: "-10%", "--dur": "8s", "--tx": "30px", "--ty": "20px" } as React.CSSProperties} />
        <div className="orb" style={{ width: 300, height: 300, background: "#2563eb", right: "-5%", bottom: "10%", "--dur": "6s", "--tx": "-20px", "--ty": "30px" } as React.CSSProperties} />
        <div className="orb" style={{ width: 200, height: 200, background: "#ec4899", left: "40%", bottom: "5%", "--dur": "5s", "--tx": "20px", "--ty": "-15px" } as React.CSSProperties} />

        {/* Floating astronaut */}
        <div
          className="astronaut"
          onClick={() => {
            setBounce(true);
            setTimeout(() => setBounce(false), 500);
          }}
          title="click me!"
        >
          🧑‍🚀
        </div>

        {/* 404 */}
        <h1 className={`four-oh-four ${glitch ? "glitch" : ""}`}>404</h1>

        {/* Rotating funny message */}
        <div className="msg-box" style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>
          <p className="msg-text" key={msg}>{msg}</p>
        </div>

        <p className="subtitle">
          The page you&apos;re looking for doesn&apos;t exist — or maybe it did and we deleted it.
          Either way, you&apos;re lost bro. 🤙
        </p>

        {/* Go home button */}
        <Link href="/" className="go-home">
          <span>← Go Back Home</span>
        </Link>

        {/* Tiny hint */}
        <p style={{ color: "rgba(100,116,139,0.5)", fontSize: "0.7rem", marginTop: "2rem" }}>
          click the astronaut for fun 🚀
        </p>
      </div>
    </>
  );
}
