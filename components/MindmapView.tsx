"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Trash2, X, ChevronDown } from "lucide-react";
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

const NODE_W = 230;
const NODE_H = 110;
const CX_BASE = 500;
const CY_BASE = 380;

const AUTHOR_COLORS = [
  "#7c3aed","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#8b5cf6","#06b6d4","#f97316","#14b8a6",
];
function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AUTHOR_COLORS.length;
  return AUTHOR_COLORS[h];
}

function getPositions(count: number): { x: number; y: number }[] {
  if (count === 0) return [];
  const positions: { x: number; y: number }[] = [];
  const maxPerRing = [6, 8, 10];
  let remaining = count;
  let ring = 0;
  while (remaining > 0) {
    const perRing = maxPerRing[ring] ?? 12;
    const inRing = Math.min(perRing, remaining);
    const radius = 210 + ring * 180;
    const angleOffset = ring % 2 === 0 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / inRing;
    for (let i = 0; i < inRing; i++) {
      const angle = (i / inRing) * 2 * Math.PI + angleOffset;
      positions.push({
        x: CX_BASE + Math.cos(angle) * radius,
        y: CY_BASE + Math.sin(angle) * radius,
      });
    }
    remaining -= inRing;
    ring++;
  }
  return positions;
}

function canvasSize(count: number) {
  const rings = count <= 6 ? 1 : count <= 14 ? 2 : 3;
  const w = Math.max(900, CX_BASE * 2 + (rings - 1) * 160 + 300);
  const h = Math.max(700, CY_BASE * 2 + (rings - 1) * 140 + 100);
  return { w, h };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `vor ${h} Std.`;
  return `vor ${Math.floor(h / 24)} Tagen`;
}

export default function MindmapView({ comments, isAdmin, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    comments.forEach((c, i) => {
      setTimeout(() => {
        setVisible((prev) => new Set([...prev, c.id]));
      }, i * 120 + 200);
    });
  }, [comments]);

  const positions = getPositions(comments.length);
  const { w, h } = canvasSize(comments.length);

  async function handleDelete(id: string) {
    if (!confirm("Kommentar wirklich löschen?")) return;
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-3">💌</div>
        <p className="text-white/40">Noch keine Nachrichten – sei der Erste!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto rounded-2xl"
      style={{ maxHeight: "70vh", cursor: "default" }}
    >
      <div
        className="relative"
        style={{ width: w, height: h, minWidth: w }}
      >
        {/* SVG connecting lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={w}
          height={h}
          style={{ zIndex: 0 }}
        >
          <defs>
            {comments.map((c) => {
              const color = colorFor(c.author.name);
              return (
                <linearGradient
                  key={`grad-${c.id}`}
                  id={`grad-${c.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={CX_BASE}
                  y1={CY_BASE}
                  x2={positions[comments.indexOf(c)]?.x ?? CX_BASE}
                  y2={positions[comments.indexOf(c)]?.y ?? CY_BASE}
                >
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </linearGradient>
              );
            })}
          </defs>

          {comments.map((c, i) => {
            const pos = positions[i];
            if (!pos) return null;
            // Control point for the bezier curve (slight curve)
            const mx = (CX_BASE + pos.x) / 2;
            const my = (CY_BASE + pos.y) / 2 - 30;
            const isVis = visible.has(c.id);

            return (
              <path
                key={c.id}
                d={`M ${CX_BASE} ${CY_BASE} Q ${mx} ${my} ${pos.x} ${pos.y}`}
                fill="none"
                stroke={`url(#grad-${c.id})`}
                strokeWidth="1.5"
                strokeDasharray="6 4"
                style={{
                  opacity: isVis ? 1 : 0,
                  transition: `opacity 0.4s ease ${i * 0.1}s`,
                }}
              />
            );
          })}
        </svg>

        {/* Center dot */}
        <div
          className="absolute rounded-full"
          style={{
            width: 12,
            height: 12,
            left: CX_BASE - 6,
            top: CY_BASE - 6,
            background: "radial-gradient(circle, #a78bfa, #7c3aed)",
            boxShadow: "0 0 20px rgba(124,58,237,0.8)",
            zIndex: 1,
          }}
        />

        {/* Comment nodes */}
        {comments.map((c, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const color = colorFor(c.author.name);
          const isVis = visible.has(c.id);
          const isExpanded = expanded === c.id;
          const isDeleting = deletingId === c.id;

          return (
            <div
              key={c.id}
              onClick={() => setExpanded(isExpanded ? null : c.id)}
              className="absolute"
              style={{
                width: NODE_W,
                left: pos.x - NODE_W / 2,
                top: pos.y - NODE_H / 2,
                zIndex: isExpanded ? 20 : 2,
                opacity: isVis ? 1 : 0,
                transform: isVis
                  ? isExpanded ? "scale(1.04)" : "scale(1)"
                  : "scale(0.5)",
                transition: `opacity 0.4s ease ${i * 0.1}s, transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)`,
                cursor: "pointer",
              }}
            >
              <div
                className="rounded-2xl p-3.5 select-none"
                style={{
                  background: `linear-gradient(135deg, rgba(10,10,26,0.95), rgba(20,12,40,0.95))`,
                  border: `1px solid ${color}50`,
                  boxShadow: isExpanded
                    ? `0 0 0 2px ${color}60, 0 12px 40px rgba(0,0,0,0.6)`
                    : `0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px ${color}30`,
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Author row */}
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={c.author.name} size={24} />
                  <span className="text-white/90 font-bold text-xs truncate flex-1">
                    {c.author.name}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      disabled={isDeleting}
                      className="text-red-400/40 hover:text-red-400 transition-colors ml-auto flex-shrink-0 p-0.5 rounded"
                    >
                      {isDeleting
                        ? <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        : <Trash2 size={13} />
                      }
                    </button>
                  )}
                </div>

                {/* Message */}
                <p
                  className="text-white/75 text-xs leading-relaxed break-words"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: isExpanded ? 99 : 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {c.message}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white/25 text-[10px]">{timeAgo(c.created_at)}</span>
                  {c.message.length > 80 && (
                    <ChevronDown
                      size={12}
                      className="text-white/30 transition-transform"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  )}
                </div>

                {/* Color bar at bottom */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
