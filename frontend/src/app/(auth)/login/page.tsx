"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import {
  Eye, EyeOff, Mail, Lock, User,
  AlertCircle, CheckCircle2, Loader2, ArrowLeft,
} from "lucide-react";

/* ── Google Icon ──────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

/* ── Password Strength ────────────────────────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-500", "bg-amber-400", "bg-emerald-400"];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-[3px] flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : "bg-white/10"}`} />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span key={c.label} className={`text-[10px] flex items-center gap-1 ${c.ok ? "text-emerald-400" : "text-white/30"}`}>
            <CheckCircle2 className={`h-2.5 w-2.5 ${c.ok ? "opacity-100" : "opacity-30"}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Slide data ───────────────────────────────────────────────────────────── */
const SLIDES = [
  { type: "image" as const, src: "/loginlayout/logina.webp", model: "ChatGPT Image 2", tag: "OpenAI" },
  { type: "image" as const, src: "/loginlayout/loginb.webp", model: "Flux 2",           tag: "Black Forest Labs" },
  { type: "image" as const, src: "/loginlayout/loginc.webp", model: "Nano Banana Pro",  tag: "NanoBanana" },
  { type: "image" as const, src: "/loginlayout/logind.webp", model: "Wan 2",            tag: "Alibaba" },
  { type: "video" as const, src: "/loginlayout/ve.mp4",      model: "Veo 3.1 Pro",      tag: "Google DeepMind" },
];

/* ── Media Panel ──────────────────────────────────────────────────────────── */
function MediaPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[active];

  return (
    <div className="relative w-full h-full overflow-hidden bg-black rounded-2xl lg:rounded-none">
      {/* Media */}
      <div className="absolute inset-0">
        {SLIDES.map((s, i) =>
          s.type === "image" ? (
            <Image
              key={i}
              src={s.src}
              alt={s.model}
              fill
              className={`object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
              sizes="50vw"
              priority={i === 0}
            />
          ) : (
            <video
              key={i}
              src={s.src}
              autoPlay
              loop
              muted
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`}
            />
          )
        )}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {/* Tag */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[10px] font-bold text-white/70 uppercase tracking-wider mb-3">
          {slide.tag}
        </div>

        {/* Model name */}
        <h3 className="text-2xl font-black text-white tracking-tight mb-4 leading-tight">
          {slide.model}
        </h3>

        {/* Slide tabs */}
        <div className="flex gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex-1 flex flex-col gap-1.5 group"
            >
              <div className={`h-[3px] rounded-full transition-all duration-300 ${i === active ? "bg-white" : "bg-white/25 group-hover:bg-white/45"}`} />
              <span className={`text-[10px] font-semibold truncate transition-colors ${i === active ? "text-white" : "text-white/40 group-hover:text-white/60"}`}>
                {s.model}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Auth Content ────────────────────────────────────────────────────── */
function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName]       = useState("");
  const [signupEmail, setSignupEmail]     = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm]   = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearState = () => { setMessage(null); setErrors({}); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); clearState();
    const errs: Record<string, string> = {};
    if (!loginEmail) errs.loginEmail = "Email is required";
    if (!loginPassword) errs.loginPassword = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    const result = await signIn("credentials", { email: loginEmail, password: loginPassword, redirect: false });
    setIsLoading(false);
    if (result?.error) setMessage({ type: "error", text: "Invalid email or password." });
    else { router.push(callbackUrl); router.refresh(); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); clearState();
    const errs: Record<string, string> = {};
    if (!signupName.trim()) errs.signupName = "Name is required";
    if (!signupEmail) errs.signupEmail = "Email is required";
    if (signupPassword.length < 8) errs.signupPassword = "Min 8 characters";
    if (signupPassword !== signupConfirm) errs.signupConfirm = "Passwords don't match";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setIsLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) { setMessage({ type: "error", text: data.error || "Registration failed." }); return; }
    const result = await signIn("credentials", { email: signupEmail, password: signupPassword, redirect: false });
    if (result?.error) { setMessage({ type: "success", text: "Account created! Please sign in." }); setTab("login"); }
    else { router.push(callbackUrl); router.refresh(); }
  };

  const inputClass = (err?: string) =>
    `w-full bg-white/5 border ${err ? "border-red-500/60" : "border-white/10"} rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20`;

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle} tabIndex={-1} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .auth-root{font-family:'Inter',sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.4s cubic-bezier(.22,1,.36,1) both}
      `}</style>

      <div className="auth-root min-h-screen flex bg-[#080810]">
        {/* ── LEFT: Form ── */}
        <div className="flex flex-col justify-center w-full lg:w-[440px] xl:w-[480px] shrink-0 px-8 py-10 lg:px-12 relative z-10">

          {/* Back */}
          <Link href="/" className="absolute top-6 left-8 lg:left-12 flex items-center gap-1.5 text-xs font-semibold text-white/35 hover:text-white/70 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>

          <div className="fade-up max-w-sm mx-auto w-full">
            {/* Logo + heading */}
            <div className="mb-8">
              <div className="w-10 h-10 relative mb-5">
                <Image src="/eromifylogo.png" alt="Eromify" fill className="object-contain" />
              </div>
              <h1 className="text-2xl font-black text-white mb-1">
                {tab === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-white/40 font-medium">
                {tab === "login" ? "Sign in to continue to Eromify" : "Start generating for free today"}
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm border mb-5 ${
                message.type === "error"
                  ? "bg-red-500/10 border-red-500/25 text-red-400"
                  : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              }`}>
                {message.type === "error" ? <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Google CTA */}
            <button
              onClick={() => signIn("google", { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] mb-5"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-[11px] text-white/25 font-semibold uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Tab row */}
            <div className="flex mb-5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); clearState(); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    tab === t ? "bg-white/10 text-white shadow-sm" : "text-white/35 hover:text-white/60"
                  }`}
                >
                  {t === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* ── LOGIN ── */}
            {tab === "login" && (
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      placeholder="" className={`${inputClass(errors.loginEmail)} pl-10`} />
                  </div>
                  {errors.loginEmail && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.loginEmail}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input type={showPw ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      placeholder="" className={`${inputClass(errors.loginPassword)} pl-10 pr-10`} />
                    {eyeBtn(showPw, () => setShowPw(!showPw))}
                  </div>
                  {errors.loginPassword && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.loginPassword}</p>}
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  style={{ background: "linear-gradient(135deg,#5b21b6,#7c3aed)", boxShadow: "0 0 24px rgba(124,58,237,0.35)" }}>
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign In"}
                </button>
              </form>
            )}

            {/* ── SIGNUP ── */}
            {tab === "signup" && (
              <form onSubmit={handleSignup} className="space-y-3.5" noValidate>
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)}
                      placeholder="" className={`${inputClass(errors.signupName)} pl-10`} />
                  </div>
                  {errors.signupName && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.signupName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                      placeholder="" className={`${inputClass(errors.signupEmail)} pl-10`} />
                  </div>
                  {errors.signupEmail && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.signupEmail}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input type={showPw ? "text" : "password"} value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                      placeholder="" className={`${inputClass(errors.signupPassword)} pl-10 pr-10`} />
                    {eyeBtn(showPw, () => setShowPw(!showPw))}
                  </div>
                  <PasswordStrength password={signupPassword} />
                  {errors.signupPassword && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.signupPassword}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input type={showConfPw ? "text" : "password"} value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)}
                      placeholder="" className={`${inputClass(errors.signupConfirm)} pl-10 pr-10`} />
                    {eyeBtn(showConfPw, () => setShowConfPw(!showConfPw))}
                  </div>
                  {errors.signupConfirm && <p className="mt-1 text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.signupConfirm}</p>}
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  style={{ background: "linear-gradient(135deg,#5b21b6,#7c3aed)", boxShadow: "0 0 24px rgba(124,58,237,0.35)" }}>
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create Account"}
                </button>
              </form>
            )}

            {/* Legal */}
            <p className="mt-5 text-center text-[11px] text-white/20 leading-relaxed">
              By continuing, you agree to Eromify&apos;s{" "}
              <Link href="/terms" className="underline hover:text-white/50 transition-colors">Terms</Link> and{" "}
              <Link href="/privacy" className="underline hover:text-white/50 transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Media carousel (desktop only) ── */}
        <div className="hidden lg:block flex-1 p-3">
          <MediaPanel />
        </div>
      </div>
    </>
  );
}

/* ── Page export ──────────────────────────────────────────────────────────── */
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080810]" />}>
      <AuthContent />
    </Suspense>
  );
}
