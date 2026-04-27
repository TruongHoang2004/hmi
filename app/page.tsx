'use client';

import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Clock, 
  Calendar, 
  RotateCcw,
  Wind,
  Fan,
  Flame,
  Power,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import separated components
import { Header } from '@/components/hmi/Header';
import { StatusCard } from '@/components/hmi/StatusCard';
import { MiniStat } from '@/components/hmi/MiniStat';
import { Indicator } from '@/components/hmi/Indicator';
import { MotorUnit } from '@/components/hmi/MotorUnit';

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
      <Header currentTime={currentTime} />

      <main className="grid grid-cols-12 gap-6">
        {/* Left Column: Modes & Controls */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          {/* Mode Selector */}
          <div className="glass p-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Operation Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setMode('Auto')}
                className={`py-3 rounded-xl border transition-all ${
                  mode === 'Auto' 
                    ? 'bg-primary/20 border-primary text-primary glow-primary' 
                    : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'
                }`}
              >
                AUTO
              </button>
              <button 
                onClick={() => setMode('Test')}
                className={`py-3 rounded-xl border transition-all ${
                  mode === 'Test' 
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
                className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 font-black text-xl mb-4 transition-all ${
                  isRunning 
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
                className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 font-black text-xl transition-all ${
                  !isRunning 
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
            
            <div className="flex gap-12 items-center">
               <MotorUnit id="01" label="Front Conveyor" isActive={isRunning && plcData.status.motor1} />
               <MotorUnit id="02" label="Rear Conveyor" isActive={isRunning && plcData.status.motor2} />
            </div>

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
            <MiniStat label="Day Count" value={plcData.actual.days} total={plcData.set.days} icon={<Calendar size={14}/>} />
            <MiniStat label="Rotation Count" value={plcData.actual.rotations} icon={<RotateCcw size={14}/>} />
            <MiniStat label="Total Hours" value={plcData.actual.hours} icon={<Clock size={14}/>} />
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
