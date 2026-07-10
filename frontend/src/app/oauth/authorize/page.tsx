/**
 * /oauth/authorize
 *
 * OAuth 2.0 Authorization / Consent page.
 * Claude redirects users here during the connector setup flow.
 *
 * If the user is not logged in → redirect to login with return URL
 * If logged in → show "Approve Claude to access your Eromify account?" UI
 */

import { auth }             from "@/auth";
import { redirect }         from "next/navigation";
import { OAUTH_CONFIG, isAllowedRedirectUri } from "@/lib/oauth-config";

interface Props {
  searchParams: Promise<{
    client_id?:             string;
    redirect_uri?:          string;
    state?:                 string;
    code_challenge?:        string;
    code_challenge_method?: string;
    response_type?:         string;
    scope?:                 string;
  }>;
}

export default async function OAuthAuthorizePage({ searchParams }: Props) {
  const session = await auth();

  // In Next.js 15+, searchParams is a Promise — must be awaited
  const params = await searchParams;

  const {
    client_id           = "",
    redirect_uri        = "",
    state               = "",
    code_challenge      = "",
    code_challenge_method = "S256",
    scope               = "mcp",
  } = params;


  // ── Validate params before doing anything ─────────────────────────────────
  if (client_id !== OAUTH_CONFIG.clientId) {
    return <ErrorPage message="Invalid OAuth client. This authorization link is not valid." />;
  }
  if (!isAllowedRedirectUri(redirect_uri)) {
    return <ErrorPage message="Invalid redirect URI. Authorization rejected for security." />;
  }
  if (!code_challenge) {
    return <ErrorPage message="Missing PKCE code_challenge. Request is malformed." />;
  }

  // ── Not logged in → redirect to sign-in ───────────────────────────────────
  if (!session?.user) {
    const loginUrl = `/auth/signin?callbackUrl=${encodeURIComponent(
      `/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state}&code_challenge=${code_challenge}&code_challenge_method=${code_challenge_method}&scope=${scope}&response_type=code`
    )}`;
    redirect(loginUrl);
  }

  const user = session.user;
  const scopes = scope.split(" ").filter(Boolean);

  // ── Consent UI ────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #13001a 50%, #0a0a0f 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "1rem",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "2.5rem",
        maxWidth: "420px",
        width: "100%",
        backdropFilter: "blur(20px)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>

        {/* Logos */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "1.75rem" }}>
          {/* Eromify */}
          <div style={{
            width: 52, height: 52, borderRadius: "14px",
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", boxShadow: "0 0 20px rgba(168,85,247,0.4)",
          }}>
            e
          </div>

          {/* Connector line */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(168,85,247,0.6)" }} />
            <div style={{ width: 28, height: 1, background: "linear-gradient(90deg, rgba(168,85,247,0.6), rgba(255,255,255,0.3))" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
          </div>

          {/* Claude logo approximation */}
          <div style={{
            width: 52, height: 52, borderRadius: "14px",
            background: "linear-gradient(135deg, #d4a574, #c4956a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", boxShadow: "0 0 20px rgba(212,165,116,0.3)",
          }}>
            ✦
          </div>
        </div>

        {/* Title */}
        <h1 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>
          Claude wants to connect to Eromify
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", textAlign: "center", marginBottom: "1.75rem" }}>
          Logged in as <strong style={{ color: "rgba(168,85,247,0.9)" }}>{user.email}</strong>
        </p>

        {/* Permissions box */}
        <div style={{
          background: "rgba(168,85,247,0.06)",
          border: "1px solid rgba(168,85,247,0.2)",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginBottom: "1.75rem",
        }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
            Claude will be able to:
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              { icon: "🖼️", text: "Generate AI images using your credits" },
              { icon: "🎬", text: "Generate AI videos using your credits" },
              { icon: "🎭", text: "List your avatar templates" },
              { icon: "💳", text: "Check your credit balance" },
            ].map(({ icon, text }) => (
              <li key={text} style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>
                <span>{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action form */}
        <form action="/api/oauth/authorize" method="POST">
          <input type="hidden" name="client_id"             value={client_id} />
          <input type="hidden" name="redirect_uri"          value={redirect_uri} />
          <input type="hidden" name="state"                 value={state} />
          <input type="hidden" name="code_challenge"        value={code_challenge} />
          <input type="hidden" name="code_challenge_method" value={code_challenge_method} />

          <div style={{ display: "flex", gap: "0.75rem" }}>
            {/* Deny */}
            <button
              type="submit"
              name="action"
              value="deny"
              style={{
                flex: 1, padding: "0.75rem",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Deny
            </button>

            {/* Approve */}
            <button
              type="submit"
              name="action"
              value="approve"
              style={{
                flex: 2, padding: "0.75rem",
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(168,85,247,0.4)",
              }}
            >
              Approve Connection ✓
            </button>
          </div>
        </form>

        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", textAlign: "center", marginTop: "1rem" }}>
          This grants Claude access until you revoke it from{" "}
          <a href="/mcp-keys" style={{ color: "rgba(168,85,247,0.7)" }}>MCP API Keys</a>
        </p>
      </div>
    </div>
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: "16px",
        padding: "2rem",
        maxWidth: "380px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⛔</div>
        <h2 style={{ color: "#ef4444", fontSize: "1.1rem", marginBottom: "0.5rem" }}>Authorization Failed</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>{message}</p>
      </div>
    </div>
  );
}
