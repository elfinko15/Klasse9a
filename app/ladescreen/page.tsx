"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const TIPS = [
  "Das Eichhörnchen in der Rakete hat keine offizielle Zulassung für Mondlandungen.",
  "Hausaufgaben werden einfacher, wenn man sie vor dem letzten Moment beginnt.",
  "Prüfungen schreibt man besser, wenn man vorher gelernt hat.",
  "Die Klasse 9a ist einzigartig – wie ein Eichhörnchen auf dem Mond.",
  "Ein Kommentar hinterlassen macht mehr Spaß als Mathe.",
  "Der Weltraum ist unendlich. Genauso wie unerledigte Schulaufgaben.",
  "Manchmal ist der beste Zug im Leben ein neuer Anfang.",
  "Wir vergessen euch nie – auch nicht nach der 9. Klasse.",
];

const DURATION = 6000;

export default function LadescreenPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => router.replace("/schueler"), 80);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: "#000", fontFamily: "'Arial Black', 'Arial', sans-serif" }}
    >
      {/* GTA5 background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/gta5.jpg"
        alt=""
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover", objectPosition: "center top" }}
        draggable={false}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Bottom dark gradient */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "35%",
          background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.85) 40%, transparent 100%)",
        }}
      />

      {/* Bottom info area */}
      <div className="absolute inset-x-0 bottom-0 px-8 pb-2">

        {/* Tip + percentage row */}
        <div className="flex items-end justify-between mb-3 gap-8">
          {/* Tip text */}
          <div style={{ maxWidth: "65%" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "11px",
                fontFamily: "Arial, sans-serif",
                fontWeight: 400,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: "3px",
              }}
            >
              TIPP
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "13px",
                fontFamily: "Arial, sans-serif",
                fontWeight: 400,
                lineHeight: 1.45,
                letterSpacing: "0.01em",
              }}
            >
              {tip}
            </p>
          </div>

          {/* Percentage */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "28px",
                fontFamily: "'Arial Black', Arial, sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {Math.floor(progress)}
              <span style={{ fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>%</span>
            </span>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "10px",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              LADEN
            </p>
          </div>
        </div>

        {/* GTA5-style loading bar – very thin, at the very bottom */}
        <div
          style={{
            width: "100%",
            height: "3px",
            background: "rgba(255,255,255,0.12)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              right: `${100 - progress}%`,
              background: "rgba(255,255,255,0.9)",
              transition: "right 0.05s linear",
            }}
          />
          {/* Shimmer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              right: `${100 - progress}%`,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
              backgroundSize: "60px 100%",
              animation: "shimmer 1s linear infinite",
            }}
          />
        </div>
      </div>

      {/* Top-left: "Klasse 9a" watermark */}
      <div
        className="absolute top-6 left-8"
        style={{
          color: "rgba(255,255,255,0.25)",
          fontSize: "12px",
          fontFamily: "'Arial Black', Arial, sans-serif",
          fontWeight: 900,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        KLASSE 9A
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -60px 0; }
          100% { background-position: 60px 0; }
        }
      `}</style>
    </div>
  );
}
