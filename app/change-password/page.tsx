"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import StarField from "@/components/StarField";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.replace("/login"); return; }
        if (!d.user.mustChangePassword) { router.replace("/schueler"); return; }
        setUserName(d.user.name);
        setChecking(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("Mindestens 6 Zeichen."); return; }
    if (newPassword !== confirm) { setError("Passwörter stimmen nicht überein."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Fehler."); }
      else { router.replace("/schueler"); }
    } catch {
      setError("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  const strength = newPassword.length === 0 ? 0
    : newPassword.length < 6 ? 1
    : newPassword.length < 10 ? 2
    : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 4
    : 3;

  const strengthLabel = ["", "Zu kurz", "Schwach", "Okay", "Stark"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a1a" }}>
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4">
      <StarField />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.12) 0%, transparent 60%)" }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 8px 30px rgba(124,58,237,0.4)" }}
          >
            <KeyRound size={30} className="text-white" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white mb-1">Passwort festlegen</h1>
          <p className="text-white/40 text-sm">
            Hallo {userName}! Bitte wähle ein eigenes Passwort bevor du weitermachst.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 60px rgba(124,58,237,0.15)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Neues Passwort</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  autoFocus
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  required
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: s <= strength ? strengthColor[strength] : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColor[strength] }}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Passwort bestätigen</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/25 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${confirm.length > 0 ? (confirm === newPassword ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.4)") : "rgba(255,255,255,0.1)"}`,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = confirm === newPassword ? "rgba(16,185,129,0.5)" : "rgba(124,58,237,0.6)")}
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && confirm === newPassword && (
                <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                  <ShieldCheck size={12} /> Passwörter stimmen überein
                </p>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || newPassword.length < 6 || newPassword !== confirm}
              className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 mt-1"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><KeyRound size={16} /> Passwort speichern</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-5">
          Das alte Passwort <code className="text-white/30">Schule123</code> funktioniert danach nicht mehr.
        </p>
      </div>
    </main>
  );
}
