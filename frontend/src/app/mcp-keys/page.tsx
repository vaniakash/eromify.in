"use client";

/**
 * /mcp-keys/page.tsx
 *
 * MCP API Key Management Dashboard
 * Allows logged-in Eromify users to:
 *   - View all their MCP API keys (metadata only — raw keys never shown again)
 *   - Generate a new key (shown once, with a copy button)
 *   - Revoke any active key
 *
 * Connected to Claude at: [your-vercel-url]/api/mcp
 */

import { useState, useEffect, useCallback } from "react";
import { useSession }                        from "next-auth/react";
import { useRouter }                         from "next/navigation";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  ExternalLink,
  Terminal,
  Info,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiKey {
  id: string;
  label: string | null;
  keyPreview: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
  revokedAt: string | null;
}

// ── Utility ───────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000)       return "Just now";
  if (diff < 3_600_000)    return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000)   return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function McpKeysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [keys, setKeys]             = useState<ApiKey[]>([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey]         = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState("");
  const [copied, setCopied]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [keyVisible, setKeyVisible] = useState(false);

  const mcpEndpoint =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/mcp`
      : "https://eromify.in/api/mcp";

  // ── Fetch keys ──────────────────────────────────────────────────────────────

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mcp/keys");
      if (!res.ok) throw new Error("Failed to load keys");
      const data = await res.json();
      setKeys(data.keys ?? []);
    } catch {
      setError("Failed to load API keys. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchKeys();
    }
  }, [status, router, fetchKeys]);

  // ── Generate key ────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/mcp/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ label: labelInput.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to generate key");
        return;
      }
      setNewKey(data.key);
      setLabelInput("");
      setShowNewKeyForm(false);
      await fetchKeys();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // ── Copy key ────────────────────────────────────────────────────────────────

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Revoke key ──────────────────────────────────────────────────────────────

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Revoke this key? Any Claude connectors using it will stop working immediately.")) return;
    setRevokingId(keyId);
    try {
      const res = await fetch(`/api/mcp/keys?id=${keyId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to revoke key");
        return;
      }
      await fetchKeys();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setRevokingId(null);
    }
  };

  // ── Dismiss new key banner ──────────────────────────────────────────────────

  const dismissNewKey = () => {
    if (!confirm("Are you sure? Once dismissed, you cannot recover this key.")) return;
    setNewKey(null);
    setKeyVisible(false);
  };

  const activeKeys  = keys.filter((k) => !k.revoked);
  const revokedKeys = keys.filter((k) => k.revoked);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Key className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">MCP API Keys</h1>
              <p className="text-sm text-slate-500">Connect Claude to your Eromify account</p>
            </div>
          </div>
          <button
            onClick={fetchKeys}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">{error}</p>
              <button onClick={() => setError(null)} className="text-xs text-red-500 underline mt-1">Dismiss</button>
            </div>
          </div>
        )}

        {/* ── New key reveal banner ── */}
        {newKey && (
          <div className="mb-6 p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-800">Copy this key now — it will not be shown again</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Once you dismiss this banner, the raw key is gone. Store it in your password manager.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl p-3 font-mono text-sm text-slate-800 break-all">
              <span className="flex-1">
                {keyVisible ? newKey : "emcp_" + "•".repeat(newKey.length - 5)}
              </span>
              <button
                onClick={() => setKeyVisible((v) => !v)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg shrink-0"
                title={keyVisible ? "Hide key" : "Show key"}
              >
                {keyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleCopy(newKey)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="flex justify-end mt-3">
              <button
                onClick={dismissNewKey}
                className="text-xs text-amber-700 hover:text-amber-900 underline"
              >
                I&apos;ve saved it — dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── Setup instructions ── */}
        <div className="mb-6 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-slate-500" />
            <h2 className="font-semibold text-slate-800">How to connect Claude</h2>
          </div>
          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
            <li>Generate an API key below</li>
            <li>
              In Claude, go to{" "}
              <span className="font-medium text-slate-800">Settings → Integrations → Add Integration</span>
            </li>
            <li>
              Paste this MCP Server URL:
              <div className="mt-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs text-slate-700">
                <span className="flex-1 break-all">{mcpEndpoint}</span>
                <button
                  onClick={() => handleCopy(mcpEndpoint)}
                  className="text-slate-400 hover:text-slate-600 shrink-0"
                  title="Copy URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
            <li>Paste your API key when prompted and click Connect</li>
          </ol>
          <a
            href="https://claude.ai/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-600 hover:text-violet-800 font-medium"
          >
            Open Claude Settings <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* ── Active keys ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">
              Active Keys
              <span className="ml-2 text-xs font-normal text-slate-400">
                {activeKeys.length}/10
              </span>
            </h2>
            <button
              onClick={() => setShowNewKeyForm((v) => !v)}
              disabled={activeKeys.length >= 10}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Key
            </button>
          </div>

          {/* Generate form */}
          {showNewKeyForm && (
            <div className="mb-4 p-4 bg-violet-50 border border-violet-200 rounded-xl">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Label <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="e.g. Claude Desktop"
                  maxLength={64}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-70 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {generating ? "Generating…" : "Generate"}
                </button>
                <button
                  onClick={() => setShowNewKeyForm(false)}
                  className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Keys list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : activeKeys.length === 0 ? (
            <div className="py-10 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl">
              <Key className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No active keys yet. Generate one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {key.label ?? "Untitled key"}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <p className="font-mono text-xs text-slate-400">{key.keyPreview}</p>
                    </div>
                    <button
                      onClick={() => handleRevoke(key.id)}
                      disabled={revokingId === key.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                      title="Revoke key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {revokingId === key.id ? "Revoking…" : "Revoke"}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                    <span>Created {relativeTime(key.createdAt)}</span>
                    <span>Last used: {relativeTime(key.lastUsedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Revoked keys (collapsed) ── */}
        {revokedKeys.length > 0 && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-600 select-none mb-3">
              {revokedKeys.length} revoked key{revokedKeys.length > 1 ? "s" : ""} (hidden)
            </summary>
            <div className="space-y-2">
              {revokedKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-3 bg-white border border-dashed border-slate-200 rounded-xl opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 truncate">{key.label ?? "Untitled key"}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 rounded-full">
                      Revoked
                    </span>
                  </div>
                  <p className="font-mono text-xs text-slate-300 mt-0.5">{key.keyPreview}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Revoked {relativeTime(key.revokedAt)}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* ── Info note ── */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Requires Claude Pro or higher</strong> — custom integrations are not available on the free plan.</p>
            <p>Revoked keys are rejected immediately on the next request — no delay.</p>
            <p>Raw keys are never stored on our servers — only a SHA-256 hash is kept.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
