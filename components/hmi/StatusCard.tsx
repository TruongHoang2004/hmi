import React from 'react';

interface StatusCardProps {
  label: string;
  value: number | string;
  unit: string;
  target: number | string;
  icon: React.ReactNode;
  status?: 'normal' | 'idle' | 'warning' | 'danger';
}

export function StatusCard({ label, value, unit, target, icon, status }: StatusCardProps) {
  return (
    <div className="glass p-6 relative group overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Target</div>
          <div className="text-sm font-mono text-zinc-300">{target}{unit}</div>
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold font-mono tracking-tighter">{value}</span>
        <span className="text-xl text-zinc-500 font-medium">{unit}</span>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`h-1 w-4 rounded-full ${
                i < 3 ? 'bg-primary/40' : 'bg-white/10'
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
