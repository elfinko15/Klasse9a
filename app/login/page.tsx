"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, Sparkles } from "lucide-react";
import StarField from "@/components/StarField";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) router.replace("/schueler");
        else setChecking(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fehler beim Login.");
      } else if (data.mustChangePassword) {
        router.replace("/change-password");
      } else {
        router.replace("/schueler");
      }
    } catch {
      setError("Netzwerkfehler. Bitte versuche es nochmal.");
    } finally {
      setLoading(false);
    }
  }

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

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.06) 40%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4 inline-block" style={{ animation: "float 5s ease-in-out infinite" }}>
            🌟
          </div>
          <h1 className="text-3xl font-black gradient-text">Kommentarseite</h1>
          <p className="text-white/40 text-sm mt-2">Melde dich an, um Nachrichten zu lesen und zu schreiben.</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-7"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 20px 60px rgba(124,58,237,0.15), 0 0 0 1px rgba(124,58,237,0.1)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Benutzername</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="max.mustermann"
                autoComplete="username"
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                required
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1.5 block font-medium">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/30 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Anmelden
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6 flex items-center justify-center gap-1.5">
          <Sparkles size={11} />
          Zugangsdaten bekommst du von der Lehrerin
          <Sparkles size={11} />
        </p>
      </div>
    </main>
  );
}
