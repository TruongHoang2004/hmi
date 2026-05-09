"use client";

import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// ============================================================
// I/O Field component - Mimics TIA Portal Input/Output field
// Shows PLC value, allows direct editing, writes on Enter/blur
// ============================================================
function IOField({ tag, value, onWrite, wide }: {
  tag: string; value: number;
  onWrite: (tag: string, val: number) => void;
  wide?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState("");
  const display = editing ? local : String(value ?? 0).padStart(2, "0");

  return (
    <input
      type="text" inputMode="numeric"
      value={display}
      className={`io-field ${wide ? "!w-[65px]" : ""}`}
      onFocus={() => { setEditing(true); setLocal(String(value ?? 0)); }}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        setEditing(false);
        const n = parseInt(local);
        if (!isNaN(n)) onWrite(tag, n);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setEditing(false);
      }}
    />
  );
}

// ============================================================
// Machine Visualization SVG - Egg incubator schematic
// ============================================================
function MachineViz({ plc, onInvert }: {
  plc: Record<string, any>;
  onInvert: (tag: string) => void;
}) {
  const tilt = plc.DC_DaoTruoc ? -8 : plc.DC_DaoSau ? 8 : 0;

  return (
    <svg viewBox="0 0 480 300" className="w-full max-w-[550px]">
      {/* Chamber body - 3D box */}
      <rect x="90" y="40" width="280" height="200" rx="2"
        fill="#e0e0e0" stroke="#333" strokeWidth="2" />
      <polygon points="370,40 410,20 410,220 370,240"
        fill="#ccc" stroke="#333" strokeWidth="1.5" />
      <polygon points="90,40 130,20 410,20 370,40"
        fill="#d8d8d8" stroke="#333" strokeWidth="1.5" />

      {/* Heating coil at top */}
      <path
        d="M120,60 Q150,48 180,60 Q210,72 240,60 Q270,48 300,60 Q330,72 350,60"
        stroke={plc.GiaNhiet ? "#ff5224" : "#999"}
        strokeWidth="3" fill="none"
        className={plc.GiaNhiet ? "heat-active" : ""}
      />

      {/* Fan - QuatTanNhiet (top-left inside chamber) */}
      <g transform="translate(150,90)">
        <circle r="14" fill="none" stroke={plc.QuatTanNhiet ? "#0c0" : "#888"} strokeWidth="2" />
        <g className={plc.QuatTanNhiet ? "fan-spinning" : ""}>
          <line x1="0" y1="-10" x2="0" y2="10" stroke={plc.QuatTanNhiet ? "#0c0" : "#888"} strokeWidth="2.5" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke={plc.QuatTanNhiet ? "#0c0" : "#888"} strokeWidth="2.5" />
        </g>
      </g>

      {/* Fan - QuatThongGio (top-right inside chamber) */}
      <g transform="translate(310,90)">
        <circle r="14" fill="none" stroke={plc.QuatThongGio ? "#0c0" : "#888"} strokeWidth="2" />
        <g className={plc.QuatThongGio ? "fan-spinning" : ""}>
          <line x1="-8" y1="-8" x2="8" y2="8" stroke={plc.QuatThongGio ? "#0c0" : "#888"} strokeWidth="2.5" />
          <line x1="8" y1="-8" x2="-8" y2="8" stroke={plc.QuatThongGio ? "#0c0" : "#888"} strokeWidth="2.5" />
        </g>
      </g>

      {/* đk control dots (red circles near components) */}
      {/* đk nhiệt - near heating */}
      <circle cx="190" cy="55" r="5" fill={plc.DkNhiet ? "red" : "transparent"}
        stroke={plc.DkNhiet ? "red" : "none"} cursor="pointer"
        onClick={() => onInvert("DkNhiet")} />
      {/* đk tản nhiệt - near fan left */}
      <circle cx="300" cy="75" r="5" fill={plc.DkTanNhiet ? "red" : "transparent"}
        stroke={plc.DkTanNhiet ? "red" : "none"} cursor="pointer"
        onClick={() => onInvert("DkTanNhiet")} />
      {/* đk gió - near fan right */}
      <circle cx="345" cy="90" r="5" fill={plc.DkGio ? "red" : "transparent"}
        stroke={plc.DkGio ? "red" : "none"} cursor="pointer"
        onClick={() => onInvert("DkGio")} />

      {/* Egg tray - tilts based on motor direction */}
      <g transform={`translate(230,165) rotate(${tilt})`}>
        {/* Tray platform */}
        <rect x="-100" y="-4" width="200" height="8" fill="#8B7355" stroke="#5a4a30" rx="2" />
        {/* Tray grid lines */}
        <line x1="-90" y1="-4" x2="-90" y2="4" stroke="#6a5a3a" />
        <line x1="-60" y1="-4" x2="-60" y2="4" stroke="#6a5a3a" />
        <line x1="-30" y1="-4" x2="-30" y2="4" stroke="#6a5a3a" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#6a5a3a" />
        <line x1="30" y1="-4" x2="30" y2="4" stroke="#6a5a3a" />
        <line x1="60" y1="-4" x2="60" y2="4" stroke="#6a5a3a" />
        <line x1="90" y1="-4" x2="90" y2="4" stroke="#6a5a3a" />
        {/* Eggs row 1 */}
        {[-75, -45, -15, 15, 45, 75].map((x) => (
          <ellipse key={x} cx={x} cy={-14} rx="10" ry="12" fill="#F5DEB3" stroke="#d4c49a" strokeWidth="0.8" />
        ))}
        {/* Eggs row 2 */}
        {[-60, -30, 0, 30, 60].map((x) => (
          <ellipse key={x} cx={x} cy={-30} rx="10" ry="12" fill="#f0d8a8" stroke="#d4c49a" strokeWidth="0.8" />
        ))}
      </g>

      {/* Humidity nozzle at bottom */}
      <g transform="translate(230,215)">
        <rect x="-15" y="-4" width="30" height="8" fill={plc.TaoAm ? "#4af" : "#999"} rx="2" />
        {plc.TaoAm && <>
          <circle cx="-5" cy="12" r="2" fill="#4af" opacity="0.7" />
          <circle cx="5" cy="15" r="1.5" fill="#4af" opacity="0.5" />
          <circle cx="0" cy="18" r="2" fill="#4af" opacity="0.6" />
        </>}
      </g>
      {/* đk ẩm dot */}
      <circle cx="270" cy="220" r="5" fill={plc.DkAm ? "red" : "transparent"}
        stroke={plc.DkAm ? "red" : "none"} cursor="pointer"
        onClick={() => onInvert("DkAm")} />

      {/* Motor left - DC_DaoTruoc */}
      <rect x="120" y="248" width="40" height="22" rx="2"
        fill={plc.DC_DaoTruoc ? "#0c0" : "#333"} stroke="#222" strokeWidth="1.5" />
      <text x="140" y="263" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">M</text>

      {/* Motor right - DC_DaoSau */}
      <rect x="300" y="248" width="40" height="22" rx="2"
        fill={plc.DC_DaoSau ? "#0c0" : "#333"} stroke="#222" strokeWidth="1.5" />
      <text x="320" y="263" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">M</text>

      {/* CB limit switch indicators */}
      <g transform="translate(115,200)">
        <rect x="-8" y="-5" width="16" height="10" fill={plc.CB_Truoc ? "#0f0" : "#999"} stroke="#333" rx="2" />
      </g>
      <g transform="translate(345,200)">
        <rect x="-8" y="-5" width="16" height="10" fill={plc.CB_Sau ? "#0f0" : "#999"} stroke="#333" rx="2" />
      </g>

      {/* Connection lines: motor to tray */}
      <line x1="140" y1="248" x2="155" y2="173" stroke="#555" strokeWidth="1.5" strokeDasharray="4,2" />
      <line x1="320" y1="248" x2="305" y2="173" stroke="#555" strokeWidth="1.5" strokeDasharray="4,2" />
    </svg>
  );
}

// ============================================================
// Main Home Page
// ============================================================
export default function Home() {
  const [plc, setPlc] = useState<Record<string, any>>({});
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io("http://localhost:3001");
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

  // Momentary button: SetBit on press, ResetBit on release (matches TIA Portal behavior)
  const momentary = (tag: string) => ({
    onMouseDown: () => writeTag(tag, true),
    onMouseUp: () => writeTag(tag, false),
    onMouseLeave: () => writeTag(tag, false),
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); writeTag(tag, true); },
    onTouchEnd: () => writeTag(tag, false),
  });

  return (
    <div className="min-h-screen bg-[#b6b6b6] text-[#31344a]">
      {/* ══════ SIEMENS Header ══════ */}
      <header className="bg-gradient-to-b from-[#003366] to-[#0a2540] h-12 flex items-center justify-between px-6 shadow-md">
        <span className="text-white font-bold text-lg tracking-[0.2em]">SIEMENS</span>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-400 shadow-[0_0_6px_#0f0]" : "bg-red-500"}`} />
          <span className="text-white/70 text-sm font-semibold tracking-wide">SIMATIC HMI</span>
        </div>
      </header>

      <div className="p-3 max-w-[950px] mx-auto space-y-3">

        {/* ══════ Row 1: Timer + Sensor readings ══════ */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-between">
          {/* Timer display */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <IOField tag="Ngay" value={plc.Ngay} onWrite={writeTag} />
            <span className="text-sm font-bold">ngày</span>
            <IOField tag="Gio" value={plc.Gio} onWrite={writeTag} />
            <span className="text-sm font-bold">giờ</span>
            <IOField tag="Phut" value={plc.Phut} onWrite={writeTag} />
            <span className="text-sm font-bold">phút</span>
            <IOField tag="Giay" value={plc.Giay} onWrite={writeTag} />
            <span className="text-sm font-bold">giây</span>
          </div>

          {/* Current sensor values */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Nhiệt độ</span>
            <IOField tag="HT_ND" value={plc.HT_ND} onWrite={writeTag} />
            <IOField tag="HT_DA" value={plc.HT_DA} onWrite={writeTag} />
            <span className="text-sm font-bold">Độ ẩm</span>
          </div>
        </div>

        {/* ══════ Main Content: Left Panel + Machine ══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">

          {/* ──── LEFT: Settings + Controls ──── */}
          <div className="lg:col-span-4 flex flex-col">

            {/* Settings Panel (gray) */}
            <div className="bg-[#c0c0c0] border border-[#181c31] p-4">
              <div className="flex items-center mb-3">
                <h2 className="font-bold text-base">Cài đặt</h2>
                {/* Running indicator (KhoiDong) */}
                <div className={`w-5 h-5 rounded-full border border-[#9c9aa5] ml-auto transition-colors
                  ${plc.KhoiDong ? "bg-[#00ff00]" : "bg-[#f1f1f2]"}`}
                  title={plc.KhoiDong ? "Đang chạy" : "Đã dừng"} />
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Số ngày ấp", tag: "SetNgayAp", unit: "ngày" },
                  { label: "Nhiệt độ ấp", tag: "Set_ND", unit: "Độ C" },
                  { label: "Độ ẩm ấp", tag: "Set_DA", unit: "%" },
                  { label: "Time đảo trứng", tag: "SetTimeDao", unit: "Giờ" },
                ].map((f) => (
                  <div key={f.tag} className="flex items-center gap-2">
                    <span className="text-sm font-bold w-[125px] shrink-0">{f.label}</span>
                    <IOField tag={f.tag} value={plc[f.tag]} onWrite={writeTag} wide />
                    <span className="text-sm font-bold">{f.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls Panel (light blue) */}
            <div className="bg-[#99ccff] border border-black p-4 space-y-3">
              {/* Auto/Test mode indicators */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-4">
                  {/* Auto indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full border border-[#181c31] transition-colors
                      ${!plc.Auto_Test ? "bg-[#00ff00]" : "bg-[#d9d9d9]"}`} />
                    <span className="text-xs font-bold">Auto</span>
                  </div>
                  {/* Test indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full border border-[#181c31] transition-colors
                      ${plc.Auto_Test ? "bg-[#00ff00]" : "bg-[#d9d9d9]"}`} />
                    <span className="text-xs font-bold">Test</span>
                  </div>
                </div>

                {/* START button */}
                <button {...momentary("ON")}
                  className="btn-3d ml-auto px-5 py-2 bg-[#00ff00] text-white font-bold text-sm rounded
                    border-2 border-[#474957] shadow-[2px_2px_0_#333] select-none">
                  START
                </button>
              </div>

              {/* chọn / test / STOP / Reset */}
              <div className="flex items-center gap-2">
                <button onClick={() => invertTag("Auto_Test")}
                  className="btn-3d px-3 py-1.5 bg-[#636171] text-white font-bold text-sm rounded
                    border-2 border-[#474957] hover:bg-[#7a7a8a] select-none">
                  chọn
                </button>
                <button {...momentary("Test")}
                  className="btn-3d px-3 py-1.5 bg-[#636171] text-white font-bold text-sm rounded
                    border-2 border-[#474957] hover:bg-[#7a7a8a] select-none">
                  test
                </button>

                {/* STOP button */}
                <button {...momentary("OFF")}
                  className="btn-3d ml-auto px-5 py-2 bg-[#ff0000] text-white font-bold text-sm rounded
                    border-2 border-[#474957] shadow-[2px_2px_0_#333] select-none">
                  STOP
                </button>
              </div>

              {/* Reset button */}
              <div>
                <button {...momentary("Reset")}
                  className="btn-3d px-4 py-1.5 bg-[#ffff99] text-[#31344a] font-bold text-sm rounded
                    border border-[#c0c0c0] shadow-[1px_1px_0_#999] select-none">
                  Reset
                </button>
              </div>

              {/* NgatTuDong indicator */}
              {plc.NgatTuDong && (
                <div className="text-xs font-bold text-red-700 bg-yellow-200 px-2 py-1 rounded text-center">
                  ⚠ Đã ngắt tự động
                </div>
              )}
            </div>
          </div>

          {/* ──── RIGHT: Machine Visualization ──── */}
          <div className="lg:col-span-8 flex flex-col gap-3">

            {/* Machine SVG + CB buttons */}
            <div className="relative flex items-center justify-center min-h-[280px]">
              {/* CB 1 button (left) */}
              <button onClick={() => invertTag("CB_Truoc")}
                className={`btn-3d absolute left-0 top-1/2 -translate-y-1/2 z-10
                  px-3 py-1.5 font-bold text-sm text-white rounded
                  border-2 border-[#474957] select-none
                  ${plc.CB_Truoc ? "bg-[#00ff00] text-[#31344a]" : "bg-[#636171]"}`}>
                CB 1
              </button>

              {/* Machine diagram */}
              <MachineViz plc={plc} onInvert={invertTag} />

              {/* CB 2 button (right) */}
              <button onClick={() => invertTag("CB_Sau")}
                className={`btn-3d absolute right-0 top-1/2 -translate-y-1/2 z-10
                  px-3 py-1.5 font-bold text-sm text-white rounded
                  border-2 border-[#474957] select-none
                  ${plc.CB_Sau ? "bg-[#00ff00] text-[#31344a]" : "bg-[#636171]"}`}>
                CB 2
              </button>
            </div>

            {/* Actuator status circles */}
            <div className="flex items-center justify-around flex-wrap gap-2">
              {[
                { key: "GiaNhiet", label: "Gia nhiệt" },
                { key: "TaoAm", label: "Tạo ẩm" },
                { key: "QuatTanNhiet", label: "Tản nhiệt" },
                { key: "QuatThongGio", label: "Thông gió" },
              ].map((a) => (
                <div key={a.key} className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full border border-[#181c31] transition-colors
                    ${plc[a.key] ? "bg-[#00ff00]" : "bg-[#d9d9d9]"}`} />
                  <span className="text-sm font-bold">{a.label}</span>
                </div>
              ))}
            </div>

            {/* Số lần đảo trứng */}
            <div className="flex items-center gap-2 justify-center text-sm">
              <span className="font-bold">Số lần đảo trứng:</span>
              <span className="io-field inline-flex items-center justify-center !border-none !bg-transparent font-bold text-base">
                {plc.SoLanDaoTrung ?? 0}
              </span>
              <span className="font-bold">lần</span>
            </div>
          </div>
        </div>

        {/* ══════ Error Alarm Bar ══════ */}
        {plc.Loi && (
          <div className="flex items-center justify-center gap-4 pt-2">
            {/* Warning icon */}
            <div className="alarm-blink">
              <svg width="50" height="45" viewBox="0 0 50 45">
                <polygon points="25,2 48,43 2,43" fill="#ff0" stroke="#333" strokeWidth="2" />
                <text x="25" y="36" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#333">!</text>
              </svg>
            </div>
            {/* Báo Lỗi button */}
            <button
              className="btn-3d px-12 py-3 bg-[#ffff00] text-[#31344a] font-bold text-2xl rounded
                border-2 border-[#9c9aa5] shadow-[2px_2px_0_#666] select-none alarm-blink">
              Báo Lỗi
            </button>
          </div>
        )}

        {/* ══════ Alarm detail badges ══════ */}
        {(plc.CanhBaoND || plc.CanhBaoDA || plc.CanhBaoTanNhiet || plc.CanhBaoThongGio ||
          plc.DenBaoLoi || plc.CoiBaoLoi || plc.Dung) && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {plc.CanhBaoND && <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded alarm-blink">⚠ Cảnh báo Nhiệt độ</span>}
            {plc.CanhBaoDA && <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded alarm-blink">⚠ Cảnh báo Độ ẩm</span>}
            {plc.CanhBaoTanNhiet && <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded alarm-blink">⚠ Lỗi Tản nhiệt</span>}
            {plc.CanhBaoThongGio && <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded alarm-blink">⚠ Lỗi Thông gió</span>}
            {plc.DenBaoLoi && <span className="px-2 py-1 bg-red-700 text-white text-xs font-bold rounded alarm-blink">💡 Đèn báo lỗi</span>}
            {plc.CoiBaoLoi && <span className="px-2 py-1 bg-red-800 text-white text-xs font-bold rounded alarm-blink">🔊 Còi báo lỗi</span>}
            {plc.Dung && <span className="px-2 py-1 bg-gray-700 text-white text-xs font-bold rounded">⏹ DỪNG</span>}
          </div>
        )}
      </div>
    </div>
  );
}
