import React from 'react';

interface IndicatorProps {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  activeColor: string;
}

export function Indicator({ label, active, icon, activeColor }: IndicatorProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${
      active ? 'bg-white/5 border border-white/10' : 'opacity-40'
    }`}>
      <div className="flex items-center gap-3">
        <div className={active ? activeColor : 'text-zinc-500'}>
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={`w-2 h-2 rounded-full ${
        active ? 'bg-success animate-pulse' : 'bg-zinc-700'
      }`} />
    </div>
  );
}
