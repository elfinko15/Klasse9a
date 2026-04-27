"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, UserPlus, Trash2, Users, RefreshCw, ChevronRight, X, Key, Copy, Check } from "lucide-react";
import StarField from "@/components/StarField";
import NavBar from "@/components/NavBar";
import Avatar from "@/components/Avatar";

type User = {
  id: string;
  name: string;
  username: string;
  role: "admin" | "student";
  bio: string;
  profile_picture_url: string | null;
  created_at: string;
};

function generateUsername(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .trim()
    .split(/\s+/)
    .join(".")
    .replace(/[^a-z0-9._-]/g, "");
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New user form
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState<"student" | "admin">("student");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createdUser, setCreatedUser] = useState<{ name: string; username: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.role !== "admin") {
          router.replace("/schueler");
        } else {
          loadUsers();
        }
      });
  }, [router]);

  async function loadUsers() {
    setRefreshing(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) setUsers(data.users ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, username: newUsername, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Fehler.");
      } else {
        setUsers((prev) => [...prev, data.user]);
        setCreatedUser({ name: newName, username: newUsername });
        setNewName("");
        setNewUsername("");
        setNewRole("student");
        setShowForm(false);
      }
    } catch {
      setCreateError("Netzwerkfehler.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`${userName} wirklich löschen? Alle Kommentare werden ebenfalls gelöscht.`)) return;
    setDeletingId(userId);
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== userId));
    setDeletingId(null);
  }

  function handleCopy() {
    navigator.clipboard.writeText("Schule123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const students = users.filter((u) => u.role === "student");
  const admins = users.filter((u) => u.role === "admin");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a1a" }}>
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <StarField />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(124,58,237,0.07) 0%, transparent 60%)" }}
      />
      <NavBar />

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Admin-Bereich</h1>
              <p className="text-white/40 text-xs">Benutzerverwaltung</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              className="text-white/40 hover:text-white/70 transition-colors p-2 rounded-lg hover:bg-white/5"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => { setShowForm(true); setCreatedUser(null); setCreateError(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              <UserPlus size={16} />
              Neuer Schüler
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {[
            { label: "Schüler", value: students.length, icon: "👤" },
            { label: "Admins", value: admins.length, icon: "🛡️" },
            { label: "Gesamt", value: users.length, icon: "👥" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Success banner */}
        {createdUser && (
          <div
            className="rounded-2xl p-4 mb-6 flex items-start gap-3"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}
          >
            <span className="text-xl">✅</span>
            <div className="flex-1">
              <p className="text-emerald-300 font-semibold text-sm">
                {createdUser.name} wurde erfolgreich erstellt!
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Key size={12} className="text-white/40" />
                <span className="text-white/50 text-xs">Standardpasswort:</span>
                <code className="text-white/80 text-xs bg-white/10 px-2 py-0.5 rounded-md font-mono">
                  Schule123
                </code>
                <button
                  onClick={handleCopy}
                  className="text-white/40 hover:text-white/70 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
              <p className="text-white/40 text-xs mt-1">
                Login: <code className="text-white/60">@{createdUser.username}</code>
              </p>
            </div>
            <button onClick={() => setCreatedUser(null)} className="text-white/30 hover:text-white/60">
              <X size={16} />
            </button>
          </div>
        )}

        {/* User List */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Users size={16} className="text-white/50" />
            <h2 className="text-white/80 font-semibold text-sm">Alle Benutzer</h2>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12 text-white/30 text-sm">
              Noch keine Benutzer. Erstelle den ersten Schüler!
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <Avatar name={u.name} profilePictureUrl={u.profile_picture_url} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white/90 font-medium text-sm truncate">{u.name}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{
                          background: u.role === "admin" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.08)",
                          color: u.role === "admin" ? "#a78bfa" : "rgba(255,255,255,0.5)",
                          border: `1px solid ${u.role === "admin" ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.1)"}`,
                        }}
                      >
                        {u.role === "admin" ? "Admin" : "Schüler"}
                      </span>
                    </div>
                    <p className="text-white/35 text-xs">@{u.username}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a
                      href={`/schueler/${u.id}`}
                      className="text-white/30 hover:text-violet-400 transition-colors p-1.5 rounded-lg hover:bg-violet-500/10"
                      title="Profil ansehen"
                    >
                      <ChevronRight size={16} />
                    </a>
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={deletingId === u.id}
                      className="text-red-400/40 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10 disabled:opacity-30"
                      title="Benutzer löschen"
                    >
                      {deletingId === u.id ? (
                        <div className="w-4 h-4 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create User Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 scale-in"
            style={{
              background: "rgba(15,10,35,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(124,58,237,0.3)",
              boxShadow: "0 20px 60px rgba(124,58,237,0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus size={20} className="text-violet-400" />
                Neuen Benutzer erstellen
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Vollständiger Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setNewUsername(generateUsername(e.target.value));
                  }}
                  placeholder="Max Mustermann"
                  maxLength={60}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Benutzername (Login) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                    placeholder="max.mustermann"
                    maxLength={40}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                    required
                  />
                </div>
                <p className="text-white/30 text-xs mt-1">Wird für den Login verwendet. Wird automatisch aus dem Namen generiert.</p>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Rolle</label>
                <div className="flex gap-2">
                  {(["student", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: newRole === r ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${newRole === r ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                        color: newRole === r ? "#a78bfa" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {r === "student" ? "👤 Schüler" : "🛡️ Admin"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default password info */}
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-2"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <Key size={14} className="text-amber-400 flex-shrink-0" />
                <p className="text-white/60 text-xs">
                  Standardpasswort: <code className="text-amber-300 font-mono">Schule123</code>
                  {" "}– der Schüler kann es später ändern.
                </p>
              </div>

              {createError && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                  {createError}
                </p>
              )}

              <button
                type="submit"
                disabled={creating || !newName.trim() || !newUsername.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
              >
                {creating ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={16} />
                    Erstellen
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
