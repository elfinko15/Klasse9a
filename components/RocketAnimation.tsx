"use client";

// Rocket launches vertically from Earth, arcs to Moon, lands vertically (flames off),
// relaunches vertically from Moon, arcs back, lands vertically on Earth. 20s loop.
export default function RocketAnimation() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 2 }}
    >
      <svg
        width="100%" height="100%"
        viewBox="0 0 1000 700"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="raEarth" cx="42%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#3da8d8" />
            <stop offset="42%" stopColor="#1560a0" />
            <stop offset="100%" stopColor="#031525" />
          </radialGradient>
          <radialGradient id="raMoon" cx="33%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#e8e5d8" />
            <stop offset="55%" stopColor="#b8b5a8" />
            <stop offset="100%" stopColor="#7a7870" />
          </radialGradient>
          <linearGradient id="raBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8898c0" />
            <stop offset="45%" stopColor="#eef2ff" />
            <stop offset="100%" stopColor="#606890" />
          </linearGradient>
          <linearGradient id="raNose" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28c9" />
          </linearGradient>
          <filter id="raGlow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="16" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── EARTH – fully visible, bottom-left ─────────────────── */}
        <circle cx="260" cy="580" r="150" fill="rgba(30,100,210,0.12)" filter="url(#raGlow)" />
        <circle cx="260" cy="580" r="118" fill="url(#raEarth)" />
        <circle cx="260" cy="580" r="124" fill="none" stroke="rgba(100,200,255,0.55)" strokeWidth="9" />
        <circle cx="260" cy="580" r="132" fill="none" stroke="rgba(80,180,255,0.18)" strokeWidth="5" />
        {/* Continents */}
        <path d="M 196 484 C 174 475,163 494,187 510 C 205 521,232 515,241 501 C 252 487,228 478,196 484Z"
          fill="#27703a" opacity="0.9" />
        <path d="M 290 482 C 273 474,267 493,281 505 C 296 516,324 507,328 494 C 333 481,311 478,290 482Z"
          fill="#27703a" opacity="0.8" />
        <ellipse cx="215" cy="524" rx="14" ry="9" fill="#2d8040" opacity="0.65" />
        {/* Clouds */}
        <ellipse cx="182" cy="467" rx="30" ry="9" fill="rgba(255,255,255,0.55)" transform="rotate(-12 182 467)" />
        <ellipse cx="310" cy="464" rx="24" ry="8" fill="rgba(255,255,255,0.45)" />
        <ellipse cx="248" cy="460" rx="17" ry="6" fill="rgba(255,255,255,0.4)" />
        <ellipse cx="265" cy="465" rx="11" ry="5" fill="rgba(210,235,255,0.55)" />

        {/* ── MOON – fully visible, upper-right ──────────────────── */}
        <circle cx="740" cy="130" r="108" fill="rgba(200,195,175,0.1)" filter="url(#raGlow)" />
        <circle cx="740" cy="130" r="82" fill="url(#raMoon)" />
        {/* Craters */}
        <circle cx="712" cy="109" r="15" fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="2.2" />
        <circle cx="712" cy="109" r="11" fill="rgba(0,0,0,0.08)" />
        <circle cx="765" cy="150" r="11" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.8" />
        <circle cx="765" cy="150" r="8" fill="rgba(0,0,0,0.07)" />
        <circle cx="724" cy="160" r="8" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.3" />
        <circle cx="724" cy="160" r="6" fill="rgba(0,0,0,0.05)" />
        <circle cx="756" cy="105" r="6" fill="rgba(0,0,0,0.09)" />
        <circle cx="738" cy="132" r="3" fill="rgba(0,0,0,0.07)" />
        <ellipse cx="708" cy="104" rx="23" ry="15" fill="rgba(255,255,255,0.22)" transform="rotate(-20 708 104)" />

        {/* ── ORBIT TRAIL (very faint dashed arc) ───────────────── */}
        {/*
          Path design: vertical tangents at both endpoints.
          Earth surface: (260, 462). Moon surface: (740, 212).
          Outbound: straight up from Earth, arcs to Moon, arrives from directly above.
          Return:   straight up from Moon, arcs back, arrives from directly above Earth.
          C1_out=(260,40), C2_out=(740,-100) → vertical tangents at Earth+Moon ✓
          C1_ret=(740,-100), C2_ret=(260,40) → vertical tangents at Moon+Earth ✓
        */}
        <path
          d="M 260 462 C 260 40, 740 -100, 740 212 C 740 -100, 260 40, 260 462"
          fill="none" stroke="rgba(139,92,246,0.07)" strokeWidth="1.2" strokeDasharray="6 18"
        />

        {/* ── FLIGHT PATH (hidden, for animateMotion) ────────────── */}
        <path
          id="raPath"
          d="M 260 462 C 260 40, 740 -100, 740 212 C 740 -100, 260 40, 260 462"
          fill="none" stroke="none"
        />

        {/* ── ROCKET ─────────────────────────────────────────────── */}
        {/*
          Outer <g>: animateMotion + rotate="auto" (path-following rotation).
          Inner <g>: animateTransform rotates between:
            rotate(90)  → nose faces direction-of-travel  (ascending / travel phase)
            rotate(-90) → nose faces OPPOSITE of travel  (descending phase = nose UP for landing)

          Flip schedule (20s total):
            0–25%:   rotate(90)  — ascending from Earth, nose up/forward
            25–27%:  flip 90→-90 — outbound arc apex
            27–50%:  rotate(-90) — descending to Moon (nose up), parked on Moon
            50%:     instant -90→90 — Moon launch, nose flips back up
            50–62%:  rotate(90)  — ascending from Moon
            62–64%:  flip 90→-90 — return arc apex
            64–97%:  rotate(-90) — descending to Earth (nose up)
            97–100%: flip -90→90 — prepare for next loop

          Flames schedule:
            0–40%:  ON  (ascent + travel to Moon)
            40–50%: OFF (landed on Moon)
            50–90%: ON  (Moon launch + return + Earth descent)
            90–100%: OFF (landed on Earth)
        */}
        <g>
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="90;90;-90;-90;90;90;-90;-90;90"
              keyTimes="0;0.25;0.27;0.50;0.50;0.62;0.64;0.97;1"
              calcMode="linear"
              dur="20s"
              repeatCount="indefinite"
            />

            {/* FLAMES */}
            <g>
              <animate
                attributeName="opacity"
                values="1;0;1;0"
                keyTimes="0;0.40;0.50;0.90"
                calcMode="discrete"
                dur="20s"
                repeatCount="indefinite"
              />
              {/* Outer flame */}
              <path d="M -8 22 L -20 66 L 0 53 L 20 66 L 8 22 Z" fill="rgba(255,70,0,0.75)">
                <animate attributeName="d"
                  values="M -8 22 L -20 66 L 0 53 L 20 66 L 8 22 Z;
                          M -8 22 L -16 60 L 0 48 L 16 60 L 8 22 Z;
                          M -8 22 L -23 71 L 0 57 L 23 71 L 8 22 Z;
                          M -8 22 L -18 64 L 0 51 L 18 64 L 8 22 Z;
                          M -8 22 L -20 66 L 0 53 L 20 66 L 8 22 Z"
                  dur="0.42s" repeatCount="indefinite" />
                <animate attributeName="fill"
                  values="rgba(255,70,0,0.75);rgba(255,110,0,0.85);rgba(255,50,0,0.7);rgba(255,90,0,0.8);rgba(255,70,0,0.75)"
                  dur="0.42s" repeatCount="indefinite" />
              </path>
              {/* Mid flame */}
              <path d="M -5 22 L -11 52 L 0 43 L 11 52 L 5 22 Z" fill="rgba(255,165,0,0.92)">
                <animate attributeName="d"
                  values="M -5 22 L -11 52 L 0 43 L 11 52 L 5 22 Z;
                          M -5 22 L -9 47 L 0 40 L 9 47 L 5 22 Z;
                          M -5 22 L -13 56 L 0 46 L 13 56 L 5 22 Z;
                          M -5 22 L -11 52 L 0 43 L 11 52 L 5 22 Z"
                  dur="0.31s" repeatCount="indefinite" />
              </path>
              {/* White-hot core */}
              <path d="M -3 22 L -5 38 L 0 33 L 5 38 L 3 22 Z" fill="rgba(255,255,220,0.98)">
                <animate attributeName="d"
                  values="M -3 22 L -5 38 L 0 33 L 5 38 L 3 22 Z;
                          M -3 22 L -4 35 L 0 31 L 4 35 L 3 22 Z;
                          M -3 22 L -6 41 L 0 35 L 6 41 L 3 22 Z;
                          M -3 22 L -5 38 L 0 33 L 5 38 L 3 22 Z"
                  dur="0.23s" repeatCount="indefinite" />
              </path>
              {/* Engine glow */}
              <ellipse cx="0" cy="28" rx="9" ry="5" fill="rgba(255,140,0,0.3)">
                <animate attributeName="ry" values="5;8;4;7;5" dur="0.4s" repeatCount="indefinite" />
              </ellipse>
            </g>

            {/* Rear fins */}
            <path d="M -11 17 L -26 37 L -7 27 Z" fill="#4c1d95" />
            <path d="M 11 17 L 26 37 L 7 27 Z" fill="#4c1d95" />
            {/* Front stabilizers */}
            <path d="M -9 -18 L -21 -32 L -7 -23 Z" fill="#5b21b6" />
            <path d="M 9 -18 L 21 -32 L 7 -23 Z" fill="#5b21b6" />

            {/* Body */}
            <rect x="-12" y="-22" width="24" height="44" rx="7" fill="url(#raBody)" />
            <rect x="-12" y="9" width="24" height="5" rx="2.5" fill="#7c3aed" opacity="0.9" />
            <rect x="-12" y="-10" width="24" height="1.5" rx="0.75" fill="rgba(255,255,255,0.22)" />

            {/* Nose cone */}
            <path d="M -12 -22 C -12 -37, 0 -53, 0 -53 C 0 -53, 12 -37, 12 -22 Z" fill="url(#raNose)" />
            <path d="M -4 -33 C -2 -44, 0 -51, 0 -53 C -1 -51, -6 -42, -6 -33 Z"
              fill="rgba(255,255,255,0.3)" />

            {/* Porthole */}
            <circle cx="0" cy="-5" r="9" fill="#07101e" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            <circle cx="0" cy="-5" r="7.5" fill="rgba(15,50,140,0.55)" />
            <text x="0" y="-2" textAnchor="middle" fontSize="10.5" style={{ userSelect: "none" }}>🐿️</text>
            <ellipse cx="-2.5" cy="-8.5" rx="2.8" ry="1.8"
              fill="rgba(255,255,255,0.45)" transform="rotate(-30 -2.5 -8.5)" />
          </g>

          <animateMotion
            dur="20s"
            repeatCount="indefinite"
            rotate="auto"
            keyPoints="0;0.5;0.5;1;1"
            keyTimes="0;0.40;0.50;0.90;1"
            calcMode="spline"
            keySplines="0.42 0 0.58 1;0 0 1 1;0.42 0 0.58 1;0 0 1 1"
          >
            <mpath href="#raPath" />
          </animateMotion>
        </g>
      </svg>
    </div>
  );
}
