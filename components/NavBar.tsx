"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, Shield, LogOut, Sparkles, ChevronDown } from "lucide-react";
import Avatar from "@/components/Avatar";
import type { SessionUser } from "@/lib/auth";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(10,10,26,0.85)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/schueler"
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-semibold text-sm"
        >
          <Sparkles size={16} className="text-violet-400" />
          Kommentarseite
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/schueler"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              pathname === "/schueler"
                ? "text-white bg-white/10"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <Users size={15} />
            <span className="hidden sm:inline">Schüler</span>
          </Link>

          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                pathname === "/admin"
                  ? "text-violet-300 bg-violet-500/15"
                  : "text-white/50 hover:text-violet-300 hover:bg-violet-500/10"
              }`}
            >
              <Shield size={15} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
        </div>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              <Avatar name={user.name} size={28} />
              <span className="hidden sm:inline max-w-24 truncate">{user.name}</span>
              <ChevronDown size={14} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl py-1 z-50"
                  style={{
                    background: "rgba(20,12,40,0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-white/90 text-sm font-medium truncate">{user.name}</p>
                    <p className="text-white/40 text-xs">@{user.username}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Abmelden
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
