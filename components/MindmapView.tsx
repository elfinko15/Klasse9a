"use client";
import { useEffect, useState, useRef } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Avatar from "@/components/Avatar";

type Comment = {
  id: string;
  author_id: string;
  message: string;
  created_at: string;
  author: { name: string; username: string };
};

type Props = {
  comments: Comment[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
};

const AUTHOR_COLORS = [
  "#7c3aed","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444",
  "#8b5cf6","#06b6d4","#f97316","#14b8a6",
];
function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AUTHOR_COLORS.length;
  return AUTHOR_COLORS[h];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `vor ${h} Std.`;
  return `vor ${Math.floor(h / 24)} Tag${Math.floor(h / 24) !== 1 ? "en" : ""}`;
}

// ─── Card layout (mobile + tablet) ───────────────────────────────────────────
function CardView({ comments, isAdmin, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());

  useEffect(() => {
    comments.forEach((c, i) => {
      setTimeout(() => setVisible((p) => new Set([...p, c.id])), i * 80 + 100);
    });
  }, [comments]);

  async function handleDelete(id: string) {
    if (!confirm("Kommentar wirklich löschen?")) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  return (
    <div className="space-y-3">
      {comments.map((c, i) => {
        const color = colorFor(c.author.name);
        const isExp = expanded === c.id;
        const isLong = c.message.length > 120;
        return (
          <div
            key={c.id}
            className="rounded-2xl p-4 transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${color}30`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${color}15`,
              opacity: visible.has(c.id) ? 1 : 0,
              transform: visible.has(c.id) ? "translateY(0)" : "translateY(16px)",
              transition: `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s`,
            }}
          >
            {/* Author */}
            <div className="flex items-center gap-2.5 mb-3">
              <Avatar name={c.author.name} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-white/90 font-bold text-sm leading-none truncate">
                  {c.author.name}
                </p>
                <p className="text-white/35 text-xs mt-0.5">@{c.author.username}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-white/25 text-xs">{timeAgo(c.created_at)}</span>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="text-red-400/40 hover:text-red-400 transition-colors p-1.5 rounded-xl hover:bg-red-400/10 disabled:opacity-30"
                  >
                    {deletingId === c.id
                      ? <div className="w-3.5 h-3.5 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      : <Trash2 size={14} />
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Message */}
            <p
              className="text-white/75 text-sm leading-relaxed break-words whitespace-pre-wrap"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: isExp ? 999 : 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {c.message}
            </p>

            {/* Expand toggle */}
            {isLong && (
              <button
                onClick={() => setExpanded(isExp ? null : c.id)}
                className="flex items-center gap-1 mt-2 text-xs text-violet-400/60 hover:text-violet-400 transition-colors"
              >
                {isExp ? <><ChevronUp size={13} /> Weniger anzeigen</> : <><ChevronDown size={13} /> Mehr anzeigen</>}
              </button>
            )}

            {/* Color bar */}
            <div
              className="mt-3 h-px rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Mindmap layout (desktop) ─────────────────────────────────────────────────
const NODE_W = 220;
const CX_BASE = 500;
const CY_BASE = 360;

function getMindmapPositions(count: number) {
  if (count === 0) return [];
  const positions: { x: number; y: number }[] = [];
  const rings = [6, 8, 10];
  let remaining = count, ring = 0;
  while (remaining > 0) {
    const perRing = rings[ring] ?? 12;
    const inRing = Math.min(perRing, remaining);
    const radius = 210 + ring * 185;
    const offset = ring % 2 === 0 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / inRing;
    for (let i = 0; i < inRing; i++) {
      const angle = (i / inRing) * 2 * Math.PI + offset;
      positions.push({ x: CX_BASE + Math.cos(angle) * radius, y: CY_BASE + Math.sin(angle) * radius });
    }
    remaining -= inRing;
    ring++;
  }
  return positions;
}

function MindmapCanvas({ comments, isAdmin, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());

  useEffect(() => {
    comments.forEach((c, i) => {
      setTimeout(() => setVisible((p) => new Set([...p, c.id])), i * 120 + 200);
    });
  }, [comments]);

  const positions = getMindmapPositions(comments.length);
  const rings = comments.length <= 6 ? 1 : comments.length <= 14 ? 2 : 3;
  const canvasW = Math.max(1000, CX_BASE * 2 + (rings - 1) * 170 + 280);
  const canvasH = Math.max(720, CY_BASE * 2 + (rings - 1) * 150 + 80);

  async function handleDelete(id: string) {
    if (!confirm("Kommentar wirklich löschen?")) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  return (
    <div className="w-full overflow-auto rounded-2xl" style={{ maxHeight: "72vh" }}>
      <div className="relative" style={{ width: canvasW, height: canvasH }}>
        {/* SVG lines */}
        <svg className="absolute inset-0 pointer-events-none" width={canvasW} height={canvasH} style={{ zIndex: 0 }}>
          <defs>
            {comments.map((c, i) => {
              const pos = positions[i];
              if (!pos) return null;
              return (
                <linearGradient key={`g${c.id}`} id={`g${c.id}`} gradientUnits="userSpaceOnUse"
                  x1={CX_BASE} y1={CY_BASE} x2={pos.x} y2={pos.y}>
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
                  <stop offset="100%" stopColor={colorFor(c.author.name)} stopOpacity="0.4" />
                </linearGradient>
              );
            })}
          </defs>
          {comments.map((c, i) => {
            const pos = positions[i];
            if (!pos) return null;
            const mx = (CX_BASE + pos.x) / 2;
            const my = (CY_BASE + pos.y) / 2 - 35;
            return (
              <path key={c.id}
                d={`M ${CX_BASE} ${CY_BASE} Q ${mx} ${my} ${pos.x} ${pos.y}`}
                fill="none" stroke={`url(#g${c.id})`} strokeWidth="1.5" strokeDasharray="6 4"
                style={{ opacity: visible.has(c.id) ? 1 : 0, transition: `opacity 0.5s ease ${i * 0.1}s` }}
              />
            );
          })}
        </svg>

        {/* Center dot */}
        <div className="absolute rounded-full" style={{
          width: 14, height: 14,
          left: CX_BASE - 7, top: CY_BASE - 7,
          background: "radial-gradient(circle, #c4b5fd, #7c3aed)",
          boxShadow: "0 0 24px rgba(124,58,237,0.9)", zIndex: 1,
        }} />

        {/* Comment nodes */}
        {comments.map((c, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const color = colorFor(c.author.name);
          const isExp = expanded === c.id;
          const isVis = visible.has(c.id);

          return (
            <div key={c.id} onClick={() => setExpanded(isExp ? null : c.id)}
              className="absolute"
              style={{
                width: NODE_W,
                left: pos.x - NODE_W / 2,
                top: pos.y - 55,
                zIndex: isExp ? 20 : 2,
                opacity: isVis ? 1 : 0,
                transform: isVis ? (isExp ? "scale(1.05)" : "scale(1)") : "scale(0.5)",
                transition: `opacity 0.4s ease ${i * 0.1}s, transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)`,
                cursor: "pointer",
              }}
            >
              <div className="rounded-2xl p-3.5 select-none" style={{
                background: "linear-gradient(135deg, rgba(10,10,26,0.96), rgba(20,12,40,0.96))",
                border: `1px solid ${color}45`,
                boxShadow: isExp
                  ? `0 0 0 2px ${color}55, 0 16px 50px rgba(0,0,0,0.7)`
                  : `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${color}25`,
                backdropFilter: "blur(16px)",
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={c.author.name} size={22} />
                  <span className="text-white/90 font-bold text-xs truncate flex-1">{c.author.name}</span>
                  {isAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      disabled={deletingId === c.id}
                      className="text-red-400/40 hover:text-red-400 transition-colors ml-auto p-0.5 rounded flex-shrink-0">
                      {deletingId === c.id
                        ? <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        : <Trash2 size={12} />}
                    </button>
                  )}
                </div>
                <p className="text-white/75 text-xs leading-relaxed break-words" style={{
                  display: "-webkit-box",
                  WebkitLineClamp: isExp ? 99 : 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {c.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/25 text-[10px]">{timeAgo(c.created_at)}</span>
                  {c.message.length > 80 && (
                    <ChevronDown size={11} className="text-white/30"
                      style={{ transform: isExp ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  )}
                </div>
                <div className="absolute bottom-0 left-4 right-4 h-px rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}70, transparent)` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main export: picks layout based on screen width ─────────────────────────
export default function MindmapView(props: Props) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    function check() { setIsDesktop(window.innerWidth >= 1024); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (props.comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">💌</div>
        <p className="text-white/40 text-sm">Noch keine Nachrichten – sei der Erste!</p>
      </div>
    );
  }

  if (isDesktop === null) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return isDesktop ? <MindmapCanvas {...props} /> : <CardView {...props} />;
}
