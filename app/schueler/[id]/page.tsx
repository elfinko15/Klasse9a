"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Send, ArrowLeft, ImageIcon, MessageCircle } from "lucide-react";
import StarField from "@/components/StarField";
import NavBar from "@/components/NavBar";
import Avatar from "@/components/Avatar";
import MindmapView from "@/components/MindmapView";
import type { SessionUser } from "@/lib/auth";

type Student = {
  id: string;
  name: string;
  username: string;
  role: "admin" | "student";
  bio: string;
  profile_picture_url: string | null;
  created_at: string;
};

type Comment = {
  id: string;
  author_id: string;
  message: string;
  created_at: string;
  author: { name: string; username: string };
};

export default function StudentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [session, setSession] = useState<SessionUser | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.replace("/login"); return; }
        setSession(d.user);
        loadData();
      });
  }, [id, router]);

  async function loadData() {
    const [userRes, commentsRes] = await Promise.all([
      fetch(`/api/users/${id}`),
      fetch(`/api/comments/${id}`),
    ]);
    if (userRes.ok) setStudent((await userRes.json()).user);
    if (commentsRes.ok) setComments((await commentsRes.json()).comments ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_user_id: id, message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || "Fehler.");
      } else {
        setComments((prev) => [data.comment, ...prev]);
        setMessage("");
        setFormOpen(false);
        import("canvas-confetti").then(({ default: confetti }) => {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#7c3aed", "#ec4899", "#fbbf24"] });
        });
      }
    } catch {
      setSendError("Netzwerkfehler.");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a1a" }}>
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a1a" }}>
        <p className="text-white/50">Profil nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <StarField />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(124,58,237,0.09) 0%, transparent 60%)" }}
      />

      <NavBar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Back */}
        <button
          onClick={() => router.push("/schueler")}
          className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-sm mb-6 transition-colors group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Alle Personen
        </button>

        {/* Profile header */}
        <div
          className="rounded-2xl p-4 sm:p-5 mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {student.profile_picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={student.profile_picture_url} alt={student.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover"
                  style={{ boxShadow: "0 6px 24px rgba(124,58,237,0.3)" }} />
              ) : (
                <div className="relative">
                  <Avatar name={student.name} size={window?.innerWidth < 640 ? 60 : 80} className="rounded-2xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(10,10,26,0.9)", border: "1px solid rgba(124,58,237,0.3)" }}>
                    <ImageIcon size={11} className="text-violet-400/60" />
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{student.name}</h1>
                    {student.role === "admin" && (
                      <span className="text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0"
                        style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">@{student.username}</p>
                  {student.bio && <p className="text-white/55 text-sm mt-1 leading-relaxed">{student.bio}</p>}
                  <p className="text-white/25 text-xs mt-1.5 flex items-center gap-1">
                    <MessageCircle size={10} />
                    {comments.length} {comments.length === 1 ? "Nachricht" : "Nachrichten"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Write button – full width on mobile */}
          <button
            onClick={() => { setFormOpen(true); setTimeout(() => textareaRef.current?.focus(), 80); }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
          >
            <Send size={15} />
            Nachricht an {student.name.split(" ")[0]} schreiben
          </button>
        </div>

        {/* Section title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.4), transparent)" }} />
          <span className="text-white/30 text-xs uppercase tracking-widest">Nachrichten</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(270deg, rgba(124,58,237,0.4), transparent)" }} />
        </div>

        {/* Mindmap */}
        <MindmapView
          comments={comments}
          isAdmin={session?.role === "admin"}
          onDelete={handleDelete}
        />
      </main>

      {/* Write message modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.target === e.currentTarget && setFormOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 scale-in"
            style={{
              background: "rgba(12,8,30,0.98)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderBottom: "none",
              boxShadow: "0 -8px 40px rgba(124,58,237,0.15)",
              paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))",
            }}
          >
            {/* Drag handle on mobile */}
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Avatar name={student.name} size={34} className="rounded-xl" />
              <div>
                <p className="text-white/80 text-sm font-semibold">Nachricht an {student.name}</p>
                {session && <p className="text-white/35 text-xs">als {session.name}</p>}
              </div>
              <button onClick={() => setFormOpen(false)}
                className="ml-auto text-white/30 hover:text-white/60 transition-colors p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Was möchtest du ${student.name} sagen? 💜`}
                rows={4}
                maxLength={1000}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none resize-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-white/25 text-xs">{message.length}/1000</span>
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                >
                  {sending
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Send size={14} /> Abschicken</>
                  }
                </button>
              </div>
              {sendError && <p className="text-red-400 text-xs mt-2">{sendError}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
