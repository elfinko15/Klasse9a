"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MessageCircle, UserRound } from "lucide-react";
import StarField from "@/components/StarField";
import NavBar from "@/components/NavBar";
import Avatar from "@/components/Avatar";

type Student = {
  id: string;
  name: string;
  username: string;
  role: "admin" | "student";
  bio: string;
  profile_picture_url: string | null;
  created_at: string;
};

export default function SchuelerPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) router.replace("/login");
        else loadStudents();
      });
  }, [router]);

  async function loadStudents() {
    const res = await fetch("/api/users");
    const data = await res.json();
    if (res.ok) setStudents(data.users ?? []);
    setLoading(false);
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <StarField />
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,0.05) 0%, transparent 60%)",
        }}
      />

      <NavBar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3" style={{ animation: "float 5s ease-in-out infinite" }}>
            👋
          </div>
          <h1 className="text-4xl font-black gradient-text mb-2">Unsere Klasse</h1>
          <p className="text-white/40 text-sm">
            {loading ? "" : `${students.length} Personen · Klicke auf ein Profil, um eine Nachricht zu schreiben`}
          </p>
        </div>

        {/* Search */}
        {!loading && students.length > 0 && (
          <div className="max-w-sm mx-auto mb-8 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Person suchen…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
            <p>Lade Schüler…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserRound size={40} className="text-white/20 mb-4" />
            <p className="text-white/50 text-lg font-medium">
              {search ? "Niemanden gefunden" : "Noch keine Personen angelegt"}
            </p>
            {!search && (
              <p className="text-white/30 text-sm mt-1">
                Die Lehrerin kann Schüler im Admin-Bereich hinzufügen.
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((student, i) => (
              <Link
                key={student.id}
                href={`/schueler/${student.id}`}
                className="group block slide-up"
                style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
              >
                <div
                  className="rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.4)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                      "0 8px 30px rgba(124,58,237,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
                  }}
                >
                  <Avatar
                    name={student.name}
                    profilePictureUrl={student.profile_picture_url}
                    size={64}
                    className="mb-3"
                  />
                  <p className="text-white/90 font-semibold text-sm leading-tight line-clamp-2">
                    {student.name}
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">@{student.username}</p>
                  {student.role === "admin" && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md mt-1"
                      style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
                    >
                      Admin
                    </span>
                  )}
                  <div className="mt-2 flex items-center gap-1 text-violet-400/60 text-xs group-hover:text-violet-400 transition-colors">
                    <MessageCircle size={12} />
                    <span>Nachricht schreiben</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
