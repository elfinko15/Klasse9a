"use client";

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
          <radialGradient id="raEarth" cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#3ba8d8" />
            <stop offset="40%" stopColor="#1565a0" />
            <stop offset="100%" stopColor="#041628" />
          </radialGradient>
          <radialGradient id="raMoon" cx="32%" cy="28%" r="65%">
            <stop offset="0%" stopColor="#eae7d8" />
            <stop offset="55%" stopColor="#bab8ac" />
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
          <filter id="raGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="12" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="raSmoke" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* ── EARTH ───────────────────────────────── */}
        <circle cx="130" cy="895" r="310" fill="rgba(30,100,210,0.1)" filter="url(#raGlow)" />
        <circle cx="130" cy="895" r="265" fill="url(#raEarth)" />
        {/* Atmosphere rim */}
        <circle cx="130" cy="895" r="272" fill="none" stroke="rgba(100,200,255,0.55)" strokeWidth="9" />
        <circle cx="130" cy="895" r="280" fill="none" stroke="rgba(80,180,255,0.18)" strokeWidth="5" />
        {/* Continents */}
        <path d="M 65 652 C 38 641, 30 663, 57 679 C 80 692, 110 684, 122 667 C 136 649, 106 636, 65 652 Z"
          fill="#27703a" opacity="0.9" />
        <path d="M 168 654 C 150 644, 143 666, 160 679 C 178 688, 210 677, 214 661 C 220 645, 190 648, 168 654 Z"
          fill="#27703a" opacity="0.8" />
        <ellipse cx="84" cy="690" rx="18" ry="12" fill="#2d8040" opacity="0.6" />
        {/* Clouds */}
        <ellipse cx="50" cy="627" rx="35" ry="11" fill="rgba(255,255,255,0.55)" transform="rotate(-10 50 627)" />
        <ellipse cx="62" cy="619" rx="22" ry="8" fill="rgba(255,255,255,0.45)" transform="rotate(-8 62 619)" />
        <ellipse cx="175" cy="621" rx="27" ry="9" fill="rgba(255,255,255,0.45)" />
        <ellipse cx="232" cy="648" rx="21" ry="7" fill="rgba(255,255,255,0.35)" />
        {/* Ice caps hint */}
        <ellipse cx="136" cy="630" rx="14" ry="7" fill="rgba(210,235,255,0.5)" />

        {/* ── MOON ─────────────────────────────────── */}
        <circle cx="845" cy="88" r="108" fill="rgba(200,195,175,0.1)" filter="url(#raGlow)" />
        <circle cx="845" cy="88" r="76" fill="url(#raMoon)" />
        {/* Craters with rim */}
        <circle cx="820" cy="71" r="13" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
        <circle cx="820" cy="71" r="10" fill="rgba(0,0,0,0.08)" />
        <circle cx="864" cy="105" r="10" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
        <circle cx="864" cy="105" r="7" fill="rgba(0,0,0,0.06)" />
        <circle cx="832" cy="115" r="7" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.2" />
        <circle cx="832" cy="115" r="5" fill="rgba(0,0,0,0.05)" />
        <circle cx="856" cy="68" r="5" fill="rgba(0,0,0,0.09)" />
        <circle cx="840" cy="90" r="3" fill="rgba(0,0,0,0.07)" />
        {/* Highlight */}
        <ellipse cx="815" cy="64" rx="20" ry="13" fill="rgba(255,255,255,0.22)" transform="rotate(-20 815 64)" />

        {/* ── ORBIT TRAIL (faint dashed) ─────────── */}
        <path
          d="M 132 626 C 155 345, 605 170, 845 166 C 1075 156, 285 495, 132 626"
          fill="none"
          stroke="rgba(139,92,246,0.09)"
          strokeWidth="1.5"
          strokeDasharray="7 16"
        />

        {/* ── FLIGHT PATH (invisible anchor) ────── */}
        <path
          id="raPath"
          d="M 132 626 C 155 345, 605 170, 845 166 C 1075 156, 285 495, 132 626"
          fill="none" stroke="none"
        />

        {/* ── ROCKET ───────────────────────────── */}
        <g>
          {/* rotate(90) so nose (drawn pointing up = -Y) aligns with travel direction (+X after auto rotate) */}
          <g transform="rotate(90)">

            {/* Engine exhaust glow */}
            <ellipse cx="0" cy="32" rx="10" ry="6" fill="rgba(255,120,0,0.25)" filter="url(#raSmoke)">
              <animate attributeName="ry" values="6;9;5;8;6" dur="0.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.25;0.4;0.2;0.35;0.25" dur="0.4s" repeatCount="indefinite" />
            </ellipse>

            {/* Outer flame */}
            <path d="M -8 22 L -20 66 L 0 53 L 20 66 L 8 22 Z" fill="rgba(255,70,0,0.75)">
              <animate attributeName="d"
                values="M -8 22 L -20 66 L 0 53 L 20 66 L 8 22 Z;
                        M -8 22 L -16 60 L 0 48 L 16 60 L 8 22 Z;
                        M -8 22 L -22 70 L 0 57 L 22 70 L 8 22 Z;
                        M -8 22 L -18 64 L 0 51 L 18 64 L 8 22 Z;
                        M -8 22 L -20 66 L 0 53 L 20 66 L 8 22 Z"
                dur="0.42s" repeatCount="indefinite" />
              <animate attributeName="fill"
                values="rgba(255,70,0,0.75);rgba(255,100,0,0.85);rgba(255,50,0,0.7);rgba(255,90,0,0.8);rgba(255,70,0,0.75)"
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

            {/* Core flame (white-hot) */}
            <path d="M -3 22 L -5 38 L 0 33 L 5 38 L 3 22 Z" fill="rgba(255,255,220,0.98)">
              <animate attributeName="d"
                values="M -3 22 L -5 38 L 0 33 L 5 38 L 3 22 Z;
                        M -3 22 L -4 35 L 0 31 L 4 35 L 3 22 Z;
                        M -3 22 L -6 41 L 0 35 L 6 41 L 3 22 Z;
                        M -3 22 L -5 38 L 0 33 L 5 38 L 3 22 Z"
                dur="0.23s" repeatCount="indefinite" />
            </path>

            {/* Rear fins */}
            <path d="M -11 17 L -25 37 L -7 27 Z" fill="#4c1d95" />
            <path d="M 11 17 L 25 37 L 7 27 Z" fill="#4c1d95" />

            {/* Front stabilizers */}
            <path d="M -9 -18 L -20 -31 L -7 -23 Z" fill="#5b21b6" />
            <path d="M 9 -18 L 20 -31 L 7 -23 Z" fill="#5b21b6" />

            {/* Body */}
            <rect x="-12" y="-22" width="24" height="44" rx="7" fill="url(#raBody)" />

            {/* Violet accent band */}
            <rect x="-12" y="9" width="24" height="5" rx="2.5" fill="#7c3aed" opacity="0.9" />
            {/* Subtle highlight line */}
            <rect x="-12" y="-10" width="24" height="1.5" rx="0.75" fill="rgba(255,255,255,0.22)" />

            {/* Nose cone */}
            <path d="M -12 -22 C -12 -37, 0 -53, 0 -53 C 0 -53, 12 -37, 12 -22 Z" fill="url(#raNose)" />
            {/* Nose highlight */}
            <path d="M -4 -33 C -2 -44, 0 -51, 0 -53 C -1 -51, -6 -42, -6 -33 Z"
              fill="rgba(255,255,255,0.3)" />

            {/* Porthole */}
            <circle cx="0" cy="-5" r="9" fill="#07101e" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            <circle cx="0" cy="-5" r="7.5" fill="rgba(15,50,140,0.55)" />

            {/* 🐿️ Eichhörnchen */}
            <text x="0" y="-2" textAnchor="middle" fontSize="10.5" style={{ userSelect: "none" }}>
              🐿️
            </text>

            {/* Window glare */}
            <ellipse cx="-2.5" cy="-8.5" rx="2.8" ry="1.8"
              fill="rgba(255,255,255,0.45)" transform="rotate(-30 -2.5 -8.5)" />
          </g>

          <animateMotion
            dur="18s"
            repeatCount="indefinite"
            rotate="auto"
            keyPoints="0;0.5;0.5;1;1"
            keyTimes="0;0.38;0.48;0.88;1"
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
