"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Eye, EyeOff, BarChart2, X, Lock, Unlock } from "lucide-react";
import StarField from "@/components/StarField";
import NavBar from "@/components/NavBar";
import type { SessionUser } from "@/lib/auth";

type PollOption = {
  id: string;
  text: string;
  position: number;
  votes: number;
};

type Poll = {
  id: string;
  question: string;
  is_anonymous: boolean;
  is_visible: boolean;
  created_at: string;
  total_votes: number;
  options: PollOption[];
  my_vote: string | null;
};

export default function UmfragenPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [voting, setVoting] = useState<string | null>(null);

  // Create form state
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadPolls = useCallback(async () => {
    const res = await fetch("/api/polls");
    if (res.ok) {
      const data = await res.json();
      setPolls(data.polls ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.replace("/login"); return; }
        setSession(d.user);
        loadPolls();
      });
  }, [router, loadPolls]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(loadPolls, 5000);
    return () => clearInterval(interval);
  }, [session, loadPolls]);

  async function handleVote(pollId: string, optionId: string) {
    setVoting(pollId);
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_id: optionId }),
      });
      if (res.ok) {
        await loadPolls();
      }
    } finally {
      setVoting(null);
    }
  }

  async function handleDelete(pollId: string) {
    if (!confirm("Umfrage wirklich löschen?")) return;
    await fetch(`/api/polls/${pollId}`, { method: "DELETE" });
    setPolls((prev) => prev.filter((p) => p.id !== pollId));
  }

  async function handleToggleVisible(poll: Poll) {
    await fetch(`/api/polls/${poll.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_visible: !poll.is_visible }),
    });
    setPolls((prev) => prev.map((p) => p.id === poll.id ? { ...p, is_visible: !poll.is_visible } : p));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    const filled = options.filter((o) => o.trim());
    if (!question.trim()) { setCreateError("Frage fehlt."); return; }
    if (filled.length < 2) { setCreateError("Mindestens 2 Antworten eingeben."); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), options: filled, is_anonymous: isAnonymous, is_visible: isVisible }),
      });
      if (res.ok) {
        setCreateOpen(false);
        setQuestion("");
        setOptions(["", ""]);
        setIsAnonymous(true);
        setIsVisible(true);
        await loadPolls();
      } else {
        const data = await res.json();
        setCreateError(data.error || "Fehler.");
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <StarField />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(124,58,237,0.09) 0%, transparent 60%)" }}
      />

      <NavBar />

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text">Umfragen</h1>
            <p className="text-white/40 text-sm mt-1">Stimme anonym ab – Ergebnisse live</p>
          </div>
          {session?.role === "admin" && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.03] active:scale-95"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              <Plus size={16} />
              Neue Umfrage
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && polls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart2 size={40} className="text-white/20 mb-4" />
            <p className="text-white/40 text-sm">
              {session?.role === "admin" ? "Noch keine Umfragen – erstelle eine!" : "Noch keine Umfragen vorhanden."}
            </p>
          </div>
        )}

        <div className="space-y-5">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              isAdmin={session?.role === "admin"}
              isVoting={voting === poll.id}
              onVote={(optId) => handleVote(poll.id, optId)}
              onDelete={() => handleDelete(poll.id)}
              onToggleVisible={() => handleToggleVisible(poll)}
            />
          ))}
        </div>
      </main>

      {/* Create modal */}
      {createOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.target === e.currentTarget && setCreateOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6"
            style={{
              background: "rgba(12,8,30,0.98)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderBottom: "none",
              boxShadow: "0 -8px 40px rgba(124,58,237,0.15)",
              paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Neue Umfrage</h2>
              <button onClick={() => setCreateOpen(false)} className="text-white/30 hover:text-white/60 transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Frage</label>
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Was ist dein Lieblingsfach?"
                  maxLength={200}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block font-medium">Antwortmöglichkeiten</label>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={opt}
                        onChange={(e) => setOptions((prev) => prev.map((o, j) => j === i ? e.target.value : o))}
                        placeholder={`Option ${i + 1}`}
                        maxLength={100}
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                      {options.length > 2 && (
                        <button type="button" onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                          className="text-white/30 hover:text-red-400 transition-colors px-2">
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                  {options.length < 8 && (
                    <button type="button" onClick={() => setOptions((prev) => [...prev, ""])}
                      className="flex items-center gap-1.5 text-violet-400/60 hover:text-violet-400 text-xs transition-colors">
                      <Plus size={13} /> Option hinzufügen
                    </button>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isAnonymous ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/30" : "text-white/40 bg-white/5 border border-white/10"
                  }`}>
                  {isAnonymous ? <Lock size={14} /> : <Unlock size={14} />}
                  {isAnonymous ? "Anonym" : "Nicht anonym"}
                </button>
                <button type="button" onClick={() => setIsVisible(!isVisible)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isVisible ? "text-violet-400 bg-violet-400/10 border border-violet-400/30" : "text-white/40 bg-white/5 border border-white/10"
                  }`}>
                  {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  {isVisible ? "Sichtbar" : "Versteckt"}
                </button>
              </div>

              {createError && <p className="text-red-400 text-xs">{createError}</p>}

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
              >
                {creating
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Plus size={16} /> Umfrage erstellen</>
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PollCard({ poll, isAdmin, isVoting, onVote, onDelete, onToggleVisible }: {
  poll: Poll;
  isAdmin: boolean;
  isVoting: boolean;
  onVote: (optionId: string) => void;
  onDelete: () => void;
  onToggleVisible: () => void;
}) {
  const hasVoted = !!poll.my_vote;

  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${poll.is_visible ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.06)"}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        opacity: poll.is_visible ? 1 : 0.6,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base leading-snug">{poll.question}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-white/30 text-xs">{poll.total_votes} Stimme{poll.total_votes !== 1 ? "n" : ""}</span>
            {poll.is_anonymous && (
              <span className="text-emerald-400/60 text-xs flex items-center gap-1"><Lock size={10} /> Anonym</span>
            )}
            {!poll.is_visible && isAdmin && (
              <span className="text-white/30 text-xs flex items-center gap-1"><EyeOff size={10} /> Versteckt</span>
            )}
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onToggleVisible}
              className="p-1.5 rounded-lg text-white/30 hover:text-violet-400 hover:bg-violet-400/10 transition-colors"
              title={poll.is_visible ? "Verstecken" : "Sichtbar machen"}>
              {poll.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button onClick={onDelete}
              className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {poll.options.map((opt) => {
          const pct = poll.total_votes > 0 ? Math.round((opt.votes / poll.total_votes) * 100) : 0;
          const isMyVote = poll.my_vote === opt.id;

          return (
            <div key={opt.id}>
              {hasVoted ? (
                // Results view
                <div className="relative rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div
                    className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: isMyVote
                        ? "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(236,72,153,0.25))"
                        : "rgba(255,255,255,0.05)",
                    }}
                  />
                  <div className="relative flex items-center justify-between px-4 py-2.5">
                    <span className={`text-sm font-medium ${isMyVote ? "text-violet-300" : "text-white/70"}`}>
                      {isMyVote && <span className="mr-1.5">✓</span>}
                      {opt.text}
                    </span>
                    <span className={`text-xs font-semibold ml-3 flex-shrink-0 ${isMyVote ? "text-violet-300" : "text-white/40"}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
              ) : (
                // Voting view
                <button
                  onClick={() => !isVoting && onVote(opt.id)}
                  disabled={isVoting}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-white/70 hover:text-white transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                >
                  {opt.text}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {hasVoted && (
        <p className="text-white/25 text-xs mt-3 text-center">
          Du hast bereits abgestimmt · Ergebnisse werden live aktualisiert
        </p>
      )}
    </div>
  );
}
