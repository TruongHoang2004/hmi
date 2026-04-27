import React from 'react';

interface MiniStatProps {
  label: string;
  value: number | string;
  total?: number | string;
  icon: React.ReactNode;
}

export function MiniStat({ label, value, total, icon }: MiniStatProps) {
  return (
    <div className="glass p-4">
      <div className="flex items-center gap-2 text-zinc-500 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold font-mono">{value}</span>
        {total && <span className="text-xs text-zinc-600">/ {total}</span>}
      </div>
    </div>
  );
}
