'use client';

import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Droplets,
  Clock,
  Calendar,
  Settings,
  Activity,
  Power,
  RotateCcw,
  Wind,
  Fan,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HMI() {
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'Auto' | 'Test'>('Auto');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock PLC Data
  const [plcData, setPlcData] = useState({
    actual: {
      temp: 37.5,
      humidity: 62,
      days: 12,
      rotations: 145,
      hours: 288,
      cycleTime: 180
    },
    set: {
      temp: 37.8,
      humidity: 65,
      days: 21,
      cycleTime: 120
    },
    status: {
      heating: false,
      cooling: false,
      humidifying: false,
      ventilation: true,
      motor1: false,
      motor2: false
    }
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate data fluctuations
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setPlcData(prev => ({
          ...prev,
          actual: {
            ...prev.actual,
            temp: +(prev.actual.temp + (Math.random() * 0.1 - 0.05)).toFixed(1),
            humidity: +(prev.actual.humidity + (Math.random() * 0.2 - 0.1)).toFixed(0)
          },
          status: {
            ...prev.status,
            heating: Math.random() > 0.7,
            humidifying: Math.random() > 0.8
          }
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans bg-grid">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 glass p-4 px-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Activity className="text-primary animate-pulse" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">INCUBATOR HMI</h1>
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

      <main className="grid grid-cols-12 gap-6">
        {/* Left Column: Modes & Controls */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          {/* Mode Selector */}
          <div className="glass p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Operation Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('Auto')}
                className={`py-3 rounded-xl border transition-all ${mode === 'Auto'
                    ? 'bg-primary/20 border-primary text-primary glow-primary'
                    : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'
                  }`}
              >
                AUTO
              </button>
              <button
                onClick={() => setMode('Test')}
                className={`py-3 rounded-xl border transition-all ${mode === 'Test'
                    ? 'bg-secondary/20 border-secondary text-secondary shadow-[0_0_15px_rgba(112,0,255,0.3)]'
                    : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'
                  }`}
              >
                TEST
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all active:scale-95 glass hover:bg-white/10"
              >
                <RotateCcw size={20} />
                MANUAL TURN
              </button>
            </div>
          </div>

          {/* Master Controls */}
          <div className="glass p-6 mt-auto">
            <button
              onClick={() => setIsRunning(true)}
              disabled={isRunning}
              className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 font-black text-xl mb-4 transition-all ${isRunning
                  ? 'bg-success/20 text-success border border-success/30 cursor-not-allowed opacity-50'
                  : 'bg-success text-black hover:scale-[1.02] active:scale-95 glow-success'
                }`}
            >
              <Power size={24} />
              START SYSTEM
            </button>
            <button
              onClick={() => setIsRunning(false)}
              disabled={!isRunning}
              className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 font-black text-xl transition-all ${!isRunning
                  ? 'bg-danger/20 text-danger border border-danger/30 cursor-not-allowed opacity-50'
                  : 'bg-danger text-white hover:scale-[1.02] active:scale-95 glow-danger'
                }`}
            >
              <AlertCircle size={24} />
              EMERGENCY STOP
            </button>
          </div>
        </div>

        {/* Center Column: Real-time Monitor */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-6">
            <StatusCard
              label="Temperature"
              value={plcData.actual.temp}
              unit="°C"
              target={plcData.set.temp}
              icon={<Thermometer className="text-orange-500" />}
              status={isRunning ? 'normal' : 'idle'}
            />
            <StatusCard
              label="Humidity"
              value={plcData.actual.humidity}
              unit="%"
              target={plcData.set.humidity}
              icon={<Droplets className="text-blue-500" />}
              status={isRunning ? 'normal' : 'idle'}
            />
          </div>

          {/* Process Animation Area */}
          <div className="glass flex-1 relative overflow-hidden min-h-[300px] flex items-center justify-center bg-black/40">
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-zinc-500">Live Visualizer</div>
            </div>

            {/* Simple Animated SVG representing the process */}
            <div className="flex gap-12 items-center">
              <MotorUnit id="01" label="Front Conveyor" isActive={isRunning && plcData.status.motor1} />
              <MotorUnit id="02" label="Rear Conveyor" isActive={isRunning && plcData.status.motor2} />
            </div>

            {/* Ambient effects */}
            <AnimatePresence>
              {plcData.status.heating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-orange-500/5 pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Timeline Stats */}
          <div className="grid grid-cols-3 gap-4">
            <MiniStat label="Day Count" value={plcData.actual.days} total={plcData.set.days} icon={<Calendar size={14} />} />
            <MiniStat label="Rotation Count" value={plcData.actual.rotations} icon={<RotateCcw size={14} />} />
            <MiniStat label="Total Hours" value={plcData.actual.hours} icon={<Clock size={14} />} />
          </div>
        </div>

        {/* Right Column: Sub-systems */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="glass p-6 h-full">
            <h3 className="text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider">Sub-Systems Status</h3>

            <div className="flex flex-col gap-4">
              <Indicator
                label="Heating Element"
                active={plcData.status.heating}
                icon={<Flame size={18} />}
                activeColor="text-orange-500"
              />
              <Indicator
                label="Cooling Fan"
                active={plcData.status.cooling}
                icon={<Fan size={18} />}
                activeColor="text-blue-400"
              />
              <Indicator
                label="Humidifier"
                active={plcData.status.humidifying}
                icon={<Droplets size={18} />}
                activeColor="text-cyan-400"
              />
              <Indicator
                label="Ventilation"
                active={plcData.status.ventilation}
                icon={<Wind size={18} />}
                activeColor="text-emerald-400"
              />
            </div>

            <div className="mt-12 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-zinc-500">System Logs</span>
                <span className="text-[10px] text-zinc-600">Real-time</span>
              </div>
              <div className="space-y-2 font-mono text-[10px]">
                <div className="text-zinc-500 flex gap-2">
                  <span className="text-zinc-700">14:20:12</span>
                  <span className="text-success">[OK]</span>
                  <span>System self-check passed</span>
                </div>
                <div className="text-zinc-500 flex gap-2">
                  <span className="text-zinc-700">14:21:05</span>
                  <span className="text-primary">[INF]</span>
                  <span>PLC Handshake established</span>
                </div>
                <div className="text-zinc-500 flex gap-2">
                  <span className="text-zinc-700">14:25:30</span>
                  <span className="text-warning">[WRN]</span>
                  <span>Temp deviation {'>'} 0.5°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({ label, value, unit, target, icon, status }: any) {
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
              className={`h-1 w-4 rounded-full ${i < 3 ? 'bg-primary/40' : 'bg-white/10'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, total, icon }: any) {
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

function Indicator({ label, active, icon, activeColor }: any) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-all ${active ? 'bg-white/5 border border-white/10' : 'opacity-40'
      }`}>
      <div className="flex items-center gap-3">
        <div className={active ? activeColor : 'text-zinc-500'}>
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-success animate-pulse' : 'bg-zinc-700'
        }`} />
    </div>
  );
}

function MotorUnit({ id, label, isActive }: any) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className={`w-24 h-16 rounded-lg bg-zinc-800 border-2 transition-all flex items-center justify-center ${isActive ? 'border-primary glow-primary' : 'border-zinc-700'
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
