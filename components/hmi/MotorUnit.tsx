import React from 'react';
import { Settings } from 'lucide-react';

interface MotorUnitProps {
  id: string;
  label: string;
  isActive: boolean;
}

export function MotorUnit({ id, label, isActive }: MotorUnitProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className={`w-24 h-16 rounded-lg bg-zinc-800 border-2 transition-all flex items-center justify-center ${
          isActive ? 'border-primary glow-primary' : 'border-zinc-700'
        }`}>
          <Settings 
            size={32} 
            className={`text-zinc-600 transition-all ${isActive ? 'animate-spin text-primary' : ''}`} 
          />
        </div>
        <div className="absolute -top-2 -right-2 bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-[8px] font-bold">
          M{id}
        </div>
      </div>
      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}
