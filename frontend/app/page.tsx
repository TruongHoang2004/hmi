"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import IOField from "@/components/IOField";
import MachineViz from "@/components/MachineViz";
import WarningScreen from "@/components/WarningScreen";
import { useMomentary, StatusDot, WarnTriangle } from "@/components/shared";

export default function Home() {
  const [plc, setPlc] = useState<Record<string, any>>({});
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [screen, setScreen] = useState<"main" | "warning">("main");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("hmi-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("hmi-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const s = io(backendUrl);
    setSocket(s);
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("plc-data", (d) => setPlc(d || {}));
    return () => { s.close(); };
  }, []);

  const writeTag = useCallback((tag: string, value: any) => {
    socket?.emit("write-tag", { tag, value });
  }, [socket]);

  const invertTag = useCallback((tag: string) => {
    writeTag(tag, !plc[tag]);
  }, [writeTag, plc]);

  const momentary = useMomentary(writeTag);

  // ─── Header (shared) ───
  const header = (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-header backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-bold">HMI</span>
        </div>
        <div>
          <span className="text-strong font-semibold text-sm">Máy Ấp Trứng</span>
          <span className="text-muted text-xs block -mt-0.5">Hệ thống giám sát & điều khiển</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-badge border border-border-subtle text-muted hover:text-strong hover:bg-surface-hover transition-all cursor-pointer active:scale-95 flex items-center justify-center shadow-xs"
          title={`Chuyển sang chế độ ${theme === 'light' ? 'Tối' : 'Sáng'}`}
        >
          {theme === 'light' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-badge border border-border-subtle">
          <StatusDot active={connected} />
          <span className="text-xs font-medium text-muted">{connected ? "Online" : "Offline"}</span>
        </div>
      </div>
    </header>
  );

  // ─── Warning screen ───
  if (screen === "warning") {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        {header}
        <WarningScreen plc={plc} writeTag={writeTag} onNavigateMain={() => setScreen("main")} />
      </div>
    );
  }

  // ─── Main screen ───
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {header}

      <div className="p-4 md:p-6 max-w-[1100px] mx-auto space-y-5 slide-up">

        {/* ══════ Row 1: Timer + Sensor Readings ══════ */}
        <div className="flex flex-wrap items-center gap-4 justify-between">
          {/* Timer */}
          <div className="glass px-5 py-3 flex items-center gap-2">
            <span className="text-xs text-muted font-semibold uppercase tracking-wider mr-1">Timer</span>
            {[
              { tag: "Ngay", unit: "ngày" },
              { tag: "Gio", unit: "giờ" },
              { tag: "Phut", unit: "phút" },
              { tag: "Giay", unit: "giây" },
            ].map(t => (
              <div key={t.tag} className="flex items-center gap-1">
                <IOField tag={t.tag} value={plc[t.tag]} onWrite={writeTag} />
                <span className="text-xs text-muted font-medium">{t.unit}</span>
              </div>
            ))}
          </div>

          {/* Sensor cards */}
          <div className="flex items-center gap-3">
            <div className="glass px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                <span className="text-orange-500 text-sm">🌡</span>
              </div>
              <div>
                <span className="text-[10px] text-muted font-semibold uppercase">Nhiệt độ</span>
                <div className="flex items-baseline gap-1">
                  <IOField tag="HT_ND" value={plc.HT_ND} onWrite={writeTag} />
                  <span className="text-xs text-muted">°C</span>
                </div>
              </div>
            </div>
            <div className="glass px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                <span className="text-sky-500 text-sm">💧</span>
              </div>
              <div>
                <span className="text-[10px] text-muted font-semibold uppercase">Độ ẩm</span>
                <div className="flex items-baseline gap-1">
                  <IOField tag="HT_DA" value={plc.HT_DA} onWrite={writeTag} />
                  <span className="text-xs text-muted">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ Main Grid ══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT: Settings + Controls ── */}
          <div className="lg:col-span-4 space-y-5">
            {/* Settings */}
            <div className="glass p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Cài Đặt</h3>
                <StatusDot active={!!plc.KhoiDong} size="w-3 h-3" />
              </div>
              <div className="space-y-3">
                {[
                  { label: "Số ngày ấp", tag: "SetNgayAp", unit: "ngày" },
                  { label: "Nhiệt độ ấp", tag: "Set_ND", unit: "°C" },
                  { label: "Độ ẩm ấp", tag: "Set_DA", unit: "%" },
                  { label: "Thời gian đảo", tag: "SetTimeDao", unit: "Giờ" },
                ].map(f => (
                  <div key={f.tag} className="flex items-center justify-between">
                    <span className="text-sm text-strong">{f.label}</span>
                    <div className="flex items-center gap-1.5">
                      <IOField tag={f.tag} value={plc[f.tag]} onWrite={writeTag} wide />
                      <span className="text-xs text-muted w-8">{f.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="glass p-5 space-y-4">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Điều Khiển</h3>

              {/* Auto/Test */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-3 h-3 rounded-full transition-all ${!plc.Auto_Test ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-border-strong"}`} />
                  <span className={`text-xs font-semibold ${!plc.Auto_Test ? "text-emerald-500" : "text-muted"}`}>Auto</span>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-3 h-3 rounded-full transition-all ${plc.Auto_Test ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "bg-border-strong"}`} />
                  <span className={`text-xs font-semibold ${plc.Auto_Test ? "text-sky-500" : "text-muted"}`}>Test</span>
                </div>
                <button onClick={() => invertTag("Auto_Test")}
                  className="px-3 py-1.5 text-xs font-semibold bg-btn hover:bg-btn-hover border border-border-strong rounded-lg transition-all active:scale-95 text-strong cursor-pointer">
                  Chọn
                </button>
                <button {...momentary("Test")}
                  className="px-3 py-1.5 text-xs font-semibold bg-btn hover:bg-btn-hover border border-border-strong rounded-lg transition-all active:scale-95 text-strong select-none cursor-pointer">
                  Test
                </button>
              </div>

              {/* START / STOP */}
              <div className="grid grid-cols-2 gap-3">
                <button {...momentary("ON")}
                  className="py-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-500 font-bold text-sm rounded-xl
                    transition-all active:scale-95 select-none cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  ▶ START
                </button>
                <button {...momentary("OFF")}
                  className="py-3 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-500 font-bold text-sm rounded-xl
                    transition-all active:scale-95 select-none cursor-pointer">
                  ■ STOP
                </button>
              </div>

              {/* Reset + CB */}
              <div className="flex gap-2">
                <button {...momentary("Reset")}
                  className="flex-1 py-2 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-lg
                    transition-all active:scale-95 select-none cursor-pointer">
                  Reset
                </button>
                <button onClick={() => invertTag("CB_Truoc")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all active:scale-95 cursor-pointer
                    ${plc.CB_Truoc ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500 font-bold" : "bg-btn border-border-strong text-muted hover:text-strong hover:bg-btn-hover"}`}>
                  CB 1
                </button>
                <button onClick={() => invertTag("CB_Sau")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all active:scale-95 cursor-pointer
                    ${plc.CB_Sau ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500 font-bold" : "bg-btn border-border-strong text-muted hover:text-strong hover:bg-btn-hover"}`}>
                  CB 2
                </button>
              </div>

              {/* NgatTuDong */}
              {plc.NgatTuDong && (
                <div className="text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg text-center alarm-flash">
                  ⚠ Đã ngắt tự động
                </div>
              )}
            </div>

            {/* Runtime stats */}
            <div className="glass p-5">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Thống Kê</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Số lần đảo", val: plc.SoLanDaoTrung ?? 0, unit: "lần" },
                  { label: "Trạng thái", val: plc.KhoiDong ? "Chạy" : "Dừng", color: plc.KhoiDong ? "text-emerald-500 font-bold" : "text-muted font-medium" },
                ].map(s => (
                  <div key={s.label} className="bg-badge rounded-lg p-3 text-center border border-border-subtle">
                    <div className={`text-lg font-semibold ${(s as any).color ?? "text-strong"}`}>{s.val} {s.unit && <span className="text-xs text-muted">{s.unit}</span>}</div>
                    <div className="text-[10px] text-muted font-medium uppercase mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Machine Viz ── */}
          <div className="lg:col-span-8">
            <MachineViz plc={plc} onInvert={invertTag} />
          </div>
        </div>

        {/* ══════ Error Alarm ══════ */}
        {plc.Loi && (
          <div className="glass p-4 flex items-center justify-between border-amber-500/30 bg-amber-500/5 slide-up">
            <div className="flex items-center gap-3">
              <WarnTriangle size={36} className="alarm-flash" />
              <div>
                <span className="text-amber-500 font-bold text-sm">Phát hiện lỗi hệ thống</span>
                <span className="text-muted text-xs block">Nhấn để xem chi tiết cảnh báo</span>
              </div>
            </div>
            <button onClick={() => setScreen("warning")}
              className="px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-500 font-bold text-sm rounded-xl
                transition-all active:scale-95 alarm-flash cursor-pointer">
              Báo Lỗi →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
