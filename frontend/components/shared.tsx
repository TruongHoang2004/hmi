import React from "react";

/** Returns event handlers for a momentary (press-to-set, release-to-reset) button */
export function useMomentary(writeTag: (tag: string, value: any) => void) {
  return (tag: string) => ({
    onMouseDown: () => writeTag(tag, true),
    onMouseUp: () => writeTag(tag, false),
    onMouseLeave: () => writeTag(tag, false),
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); writeTag(tag, true); },
    onTouchEnd: () => writeTag(tag, false),
  });
}

/** Status indicator dot */
export function StatusDot({ active, size = "w-2.5 h-2.5", color }: {
  active: boolean;
  size?: string;
  color?: string;
}) {
  const c = color ?? (active ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-slate-600");
  return <div className={`${size} rounded-full transition-all duration-300 ${c}`} />;
}

/** Warning triangle SVG */
export function WarnTriangle({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 0.87} viewBox="0 0 50 45" className={className}>
      <polygon points="25,2 48,43 2,43" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
      <text x="25" y="36" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#451a03">!</text>
    </svg>
  );
}
