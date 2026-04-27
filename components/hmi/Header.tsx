import React from 'react';
import { Activity, Settings } from 'lucide-react';

interface HeaderProps {
  currentTime: Date;
}

export function Header({ currentTime }: HeaderProps) {
  return (
    <header className="flex justify-between items-center mb-8 glass p-4 px-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Activity className="text-primary animate-pulse" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">VENGY INCUBATOR HMI</h1>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              PLC Connected: S7-1200
            </span>
            <span className="opacity-30">|</span>
            <span>v1.0.4</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-lg font-mono">{currentTime.toLocaleTimeString()}</div>
          <div className="text-xs text-zinc-500">{currentTime.toLocaleDateString()}</div>
        </div>
        <div className="h-10 w-px bg-white/10" />
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Settings size={20} className="text-zinc-400" />
        </button>
      </div>
    </header>
  );
}
