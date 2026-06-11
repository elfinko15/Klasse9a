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

const IMAGES = ["/gta.5.jpg", "/gta.5.2.jpg"];
const DURATION = 7000;
const SWITCH_AT = 0.5; // switch image at 50% progress

export default function LadescreenPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [imgIndex, setImgIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [tip, setTip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const startRef = useRef<number>(0);
  const switchedRef = useRef(false);

  useEffect(() => {
    startRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);

      // Switch image at SWITCH_AT
      if (pct / 100 >= SWITCH_AT && !switchedRef.current) {
        switchedRef.current = true;
        setFading(true);
        setTimeout(() => {
          setImgIndex(1);
          setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
          setFading(false);
        }, 400);
      }

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
      {/* Background images — cross-fade between them */}
      {IMAGES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition: "center top",
            opacity: imgIndex === i ? (fading ? 0 : 1) : fading && i === imgIndex + 1 - 1 ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
          draggable={false}
        />
      ))}

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)" }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "clamp(140px, 40%, 280px)",
          background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.88) 50%, transparent 100%)",
        }}
      />

      {/* Bottom info */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ padding: "0 clamp(16px, 5vw, 40px) clamp(6px, 2vh, 14px)" }}
      >
        {/* Tip + percentage */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "clamp(12px, 4vw, 32px)",
            marginBottom: "clamp(8px, 1.5vh, 14px)",
          }}
        >
          {/* Tip */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              opacity: fading ? 0 : 1,
              transition: "opacity 0.4s ease",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "clamp(9px, 1.8vw, 11px)",
                fontFamily: "Arial, sans-serif",
                fontWeight: 400,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              TIPP
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "clamp(11px, 2.2vw, 14px)",
                fontFamily: "Arial, sans-serif",
                fontWeight: 400,
                lineHeight: 1.5,
                letterSpacing: "0.01em",
                overflowWrap: "break-word",
              }}
            >
              {tip}
            </p>
          </div>

          {/* Percentage */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "clamp(22px, 5vw, 32px)",
                fontFamily: "'Arial Black', Arial, sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {Math.floor(progress)}
              <span style={{ fontSize: "clamp(13px, 2.5vw, 18px)", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
                %
              </span>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "clamp(8px, 1.5vw, 10px)",
                fontFamily: "Arial, sans-serif",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginTop: "3px",
              }}
            >
              LADEN
            </p>
          </div>
        </div>

        {/* Loading bar */}
        <div
          style={{
            width: "100%",
            height: "clamp(2px, 0.4vh, 4px)",
            background: "rgba(255,255,255,0.12)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              right: `${100 - progress}%`,
              background: "rgba(255,255,255,0.9)",
              transition: "right 0.05s linear",
            }}
          />
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

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          top: "clamp(16px, 3vh, 28px)",
          left: "clamp(16px, 5vw, 36px)",
          color: "rgba(255,255,255,0.25)",
          fontSize: "clamp(9px, 1.8vw, 13px)",
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
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
