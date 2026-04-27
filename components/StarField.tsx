"use client";
import { useEffect, useRef } from "react";

export default function StarField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const count = 120;
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const star = document.createElement("div");
      const size = Math.random() * 2.5 + 0.5;
      star.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        background:white;border-radius:50%;
        top:${Math.random() * 100}%;left:${Math.random() * 100}%;
        animation:twinkle ${2 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 4}s;
        opacity:0.2;
      `;
      container.appendChild(star);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
