"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Instagram,
  Zap,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MessageCircle,
  Send,
  Activity,
  CheckCircle2,
  XCircle,
  LogOut,
  Info,
  Loader2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConnectedAccount {
  _id: string;
  instagramUsername: string;
  instagramProfilePic: string;
  pageName: string;
  isActive: boolean;
}

interface Rule {
  _id: string;
  trigger: { type: "keyword" | "all"; keyword?: string };
  action: {
    replyComment: boolean;
    commentText?: string;
    sendDM: boolean;
    dmText: string;
  };
  isActive: boolean;
  triggerCount: number;
}

interface Log {
  _id: string;
  type: "comment_reply" | "dm_sent";
  triggerKeyword?: string;
  targetUserId?: string;
  status: "success" | "failed";
  error?: string;
  createdAt: string;
}

// ─── Anonymous user ID (stored in localStorage, no login required) ────────────

function getOrCreateUserId(): string {
  const key = "eromify_ig_uid";
  let id = localStorage.getItem(key);
  if (!id) {
    id =
      "anon_" +
      Math.random().toString(36).slice(2) +
      Date.now().toString(36);
    localStorage.setItem(key, id);
  }
  return id;
}

// ─── Main Page Component ──────────────────────────────────────────────────────

function InstagramAutoDMContent() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);

  const [account, setAccount] = useState<ConnectedAccount | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // New rule form state
  const [showForm, setShowForm] = useState(false);
  const [triggerType, setTriggerType] = useState<"keyword" | "all">("keyword");
  const [keyword, setKeyword] = useState("");
  const [replyComment, setReplyComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendDM, setSendDM] = useState(true);
  const [dmText, setDmText] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Init anonymous user ID from localStorage ──────────────────────────────

  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
  }, []);

  // ─── Data fetching ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const [acctRes, rulesRes, logsRes] = await Promise.all([
        fetch(`/api/instagram/account?userId=${uid}`),
        fetch(`/api/instagram/rules?userId=${uid}`),
        fetch(`/api/instagram/logs?userId=${uid}&limit=20`),
      ]);
      const acctData = await acctRes.json();
      const rulesData = await rulesRes.json();
      const logsData = await logsRes.json();
      setAccount(acctData.account || null);
      setRules(rulesData.rules || []);
      setLogs(logsData.logs || []);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchData(userId);
  }, [userId, fetchData]);

  // Handle redirect messages from OAuth
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "connected") showToast("Instagram connected successfully! 🎉");
    if (error === "permission_denied") showToast("You denied Instagram permissions.", "error");
    if (error === "no_pages") showToast("No Facebook Pages found. Please link a page to Instagram first.", "error");
    if (error === "oauth_failed") showToast("OAuth failed. Please try again.", "error");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleConnect = () => {
    if (!userId) return;
    window.location.href = `/api/auth/meta?userId=${userId}`;
  };

  const handleDisconnect = async () => {
    if (!userId || !confirm("Disconnect Instagram? All rules and logs will be deleted.")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/instagram/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setAccount(null);
      setRules([]);
      setLogs([]);
      showToast("Instagram disconnected.");
    } catch {
      showToast("Failed to disconnect.", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleAddRule = async () => {
    if (!userId) return;
    setFormError("");
    if (triggerType === "keyword" && !keyword.trim()) {
      setFormError("Please enter a keyword.");
      return;
    }
    if (!sendDM && !replyComment) {
      setFormError("Choose at least one action: Comment Reply or DM.");
      return;
    }
    if (sendDM && !dmText.trim()) {
      setFormError("DM message cannot be empty.");
      return;
    }
    if (replyComment && !commentText.trim()) {
      setFormError("Comment reply text cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/instagram/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          trigger: { type: triggerType, keyword: triggerType === "keyword" ? keyword.trim() : undefined },
          action: { replyComment, commentText: commentText.trim(), sendDM, dmText: dmText.trim() },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRules((prev) => [data.rule, ...prev]);
      setShowForm(false);
      setKeyword(""); setDmText(""); setCommentText("");
      setTriggerType("keyword"); setReplyComment(false); setSendDM(true);
      showToast("Rule added!");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save rule.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (ruleId: string, current: boolean) => {
    setRules((prev) => prev.map((r) => r._id === ruleId ? { ...r, isActive: !current } : r));
    await fetch("/api/instagram/rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId, isActive: !current }),
    });
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Delete this rule?")) return;
    setRules((prev) => prev.filter((r) => r._id !== ruleId));
    await fetch("/api/instagram/rules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleId }),
    });
    showToast("Rule deleted.");
  };

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (!userId || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 100%)" }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#e1306c]" />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 50%, #0a0a0f 100%)" }}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold transition-all ${
            toast.type === "success"
              ? "bg-green-500/20 border border-green-500/40 text-green-300"
              : "bg-red-500/20 border border-red-500/40 text-red-300"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="border-b px-6 py-8" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2 text-sm mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/tools/creator" className="hover:text-white transition-colors">Creator Tools</Link>
            <ChevronRight className="h-3 w-3" />
            <span style={{ color: "rgba(255,255,255,0.8)" }}>Instagram AutoDM</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                Instagram AutoDM
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                Auto-reply to comments and send DMs when keywords are mentioned
              </p>
            </div>

            {account && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
                {account.instagramProfilePic ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={account.instagramProfilePic} alt={account.instagramUsername} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e1306c, #f77737)" }}>
                    <Instagram className="h-4 w-4 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-white">@{account.instagramUsername}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{account.pageName}</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="ml-1 p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                  title="Disconnect"
                >
                  {disconnecting ? <Loader2 className="h-4 w-4 animate-spin text-red-400" /> : <LogOut className="h-4 w-4 text-red-400" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-8 space-y-8">

        {/* ── Section 1: Connection ── */}
        {!account ? (
          <ConnectionPanel onConnect={handleConnect} />
        ) : (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Active Rules", value: rules.filter((r) => r.isActive).length, icon: Zap, color: "#e1306c" },
                { label: "Total Triggers", value: rules.reduce((a, r) => a + r.triggerCount, 0), icon: Activity, color: "#f77737" },
                { label: "Logged Events", value: logs.length, icon: MessageCircle, color: "#bc1888" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-5 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}1a` }}>
                      <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Webhook info banner */}
            <div className="flex items-start gap-3 px-5 py-4 rounded-xl border" style={{ background: "rgba(251,191,36,0.06)", borderColor: "rgba(251,191,36,0.2)" }}>
              <Info className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                <span className="font-bold text-amber-400">Webhook URL for Meta Dashboard: </span>
                <code className="bg-black/40 px-2 py-0.5 rounded font-mono">{typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/instagram</code>
                <span className="ml-2">· Verify Token: set in your <code className="bg-black/40 px-1 rounded font-mono">META_WEBHOOK_VERIFY_TOKEN</code> env variable</span>
              </div>
            </div>

            {/* ── Section 2: Rule Manager ── */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#e1306c]" />
                  Automation Rules
                </h2>
                <button
                  onClick={() => setShowForm((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #e1306c, #bc1888)", color: "white" }}
                >
                  <Plus className="h-4 w-4" />
                  Add Rule
                </button>
              </div>

              {/* Add Rule Form */}
              {showForm && (
                <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(225,48,108,0.04)" }}>
                  <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#e1306c]" /> New Automation Rule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trigger */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Trigger (IF)</p>
                      <div className="flex gap-2">
                        {(["keyword", "all"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTriggerType(t)}
                            className="flex-1 py-2 rounded-lg text-sm font-bold border transition-all"
                            style={{
                              background: triggerType === t ? "linear-gradient(135deg, #e1306c, #bc1888)" : "rgba(255,255,255,0.04)",
                              borderColor: triggerType === t ? "transparent" : "rgba(255,255,255,0.1)",
                              color: triggerType === t ? "white" : "rgba(255,255,255,0.5)",
                            }}
                          >
                            {t === "keyword" ? "Keyword Match" : "Any Comment"}
                          </button>
                        ))}
                      </div>
                      {triggerType === "keyword" && (
                        <input
                          type="text"
                          placeholder="e.g. price, info, link"
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none border"
                          style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                        />
                      )}
                    </div>

                    {/* Action */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Action (THEN)</p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={sendDM} onChange={(e) => setSendDM(e.target.checked)} className="accent-[#e1306c] w-4 h-4 rounded" />
                        <Send className="h-4 w-4 text-[#e1306c]" />
                        <span className="text-sm font-medium text-white">Send DM</span>
                      </label>
                      {sendDM && (
                        <textarea
                          placeholder="Your DM message..."
                          value={dmText}
                          onChange={(e) => setDmText(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
                          style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                        />
                      )}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={replyComment} onChange={(e) => setReplyComment(e.target.checked)} className="accent-[#e1306c] w-4 h-4 rounded" />
                        <MessageCircle className="h-4 w-4 text-[#f77737]" />
                        <span className="text-sm font-medium text-white">Reply to Comment</span>
                      </label>
                      {replyComment && (
                        <textarea
                          placeholder="Public comment reply..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
                          style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}
                        />
                      )}
                    </div>
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl border" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{formError}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={handleAddRule}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #e1306c, #bc1888)", color: "white" }}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Save Rule
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold border transition-all"
                      style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Rules List */}
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {rules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(225,48,108,0.1)" }}>
                      <Zap className="h-8 w-8 text-[#e1306c]" />
                    </div>
                    <p className="text-white font-bold mb-1">No rules yet</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Click &quot;Add Rule&quot; to create your first automation</p>
                  </div>
                ) : (
                  rules.map((rule) => (
                    <div key={rule._id} className="flex items-start gap-4 px-6 py-5 transition-colors hover:bg-white/[0.02]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(225,48,108,0.15)", color: "#e1306c" }}>
                            {rule.trigger.type === "keyword" ? `"${rule.trigger.keyword}"` : "Any Comment"}
                          </span>
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>→</span>
                          {rule.action.sendDM && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: "rgba(188,24,136,0.15)", color: "#bc1888" }}>
                              <Send className="h-3 w-3" /> DM
                            </span>
                          )}
                          {rule.action.replyComment && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: "rgba(247,119,55,0.15)", color: "#f77737" }}>
                              <MessageCircle className="h-3 w-3" /> Reply
                            </span>
                          )}
                          <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.3)" }}>
                            fired {rule.triggerCount}×
                          </span>
                        </div>
                        {rule.action.sendDM && (
                          <p className="text-sm truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
                            DM: &quot;{rule.action.dmText}&quot;
                          </p>
                        )}
                        {rule.action.replyComment && rule.action.commentText && (
                          <p className="text-sm truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
                            Reply: &quot;{rule.action.commentText}&quot;
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleToggleRule(rule._id, rule.isActive)} title={rule.isActive ? "Disable" : "Enable"}>
                          {rule.isActive
                            ? <ToggleRight className="h-7 w-7 text-[#e1306c]" />
                            : <ToggleLeft className="h-7 w-7" style={{ color: "rgba(255,255,255,0.3)" }} />}
                        </button>
                        <button onClick={() => handleDeleteRule(rule._id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Section 3: Activity Log ── */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#bc1888]" />
                  Activity Log
                </h2>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                  Last 30 days
                </span>
              </div>

              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <Activity className="h-10 w-10 mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
                  <p className="font-bold text-white">No activity yet</p>
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Events will appear here once automation triggers</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        {["Time", "Type", "Keyword", "Status"].map((h) => (
                          <th key={h} className="px-6 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      {logs.map((log) => (
                        <tr key={log._id} className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-6 py-3.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: log.type === "dm_sent" ? "#bc1888" : "#f77737" }}>
                              {log.type === "dm_sent" ? <Send className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
                              {log.type === "dm_sent" ? "DM Sent" : "Comment Reply"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <code className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                              {log.triggerKeyword || "—"}
                            </code>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: log.status === "success" ? "#22c55e" : "#ef4444" }}>
                              {log.status === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ConnectionPanel ──────────────────────────────────────────────────────────

function ConnectionPanel({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
      <div className="p-10 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl" style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
          <Instagram className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Connect Your Instagram</h2>
        <p className="text-sm max-w-lg mb-8" style={{ color: "rgba(255,255,255,0.45)" }}>
          Connect an Instagram Business account managed through a Facebook Page. Once connected, create keyword-based rules that auto-reply to comments and send DMs.
        </p>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
          {[
            { icon: Instagram, label: "1. Connect", desc: "Authorize via Facebook" },
            { icon: Zap, label: "2. Add Rules", desc: "IF keyword → THEN reply/DM" },
            { icon: Send, label: "3. Automate", desc: "Runs 24/7 on your account" },
          ].map((step) => (
            <div key={step.label} className="rounded-xl px-5 py-4 border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
              <step.icon className="h-5 w-5 mb-2" style={{ color: "#e1306c" }} />
              <p className="font-bold text-white text-sm">{step.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onConnect}
          className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-white text-base transition-all hover:scale-105 active:scale-95 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", boxShadow: "0 8px 30px rgba(225,48,108,0.35)" }}
        >
          <Instagram className="h-5 w-5" />
          Connect with Instagram
        </button>

        <div className="flex items-start gap-2 mt-6 px-5 py-3.5 rounded-xl border max-w-lg" style={{ background: "rgba(251,191,36,0.05)", borderColor: "rgba(251,191,36,0.15)" }}>
          <BookOpen className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-left" style={{ color: "rgba(255,255,255,0.5)" }}>
            <strong className="text-amber-400">Requirements:</strong> You need an Instagram Business or Creator account linked to a Facebook Page. Personal Instagram accounts are not supported by Meta&apos;s API.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InstagramAutoDMPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}><div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" /></div>}>
      <InstagramAutoDMContent />
    </Suspense>
  );
}
