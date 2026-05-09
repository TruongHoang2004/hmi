"use client";

import { StatusDot } from "./shared";

/** SVG Machine Visualization - Egg Incubator */
export default function MachineViz({ plc, onInvert }: {
  plc: Record<string, any>;
  onInvert: (tag: string) => void;
}) {
  const tilt = plc.DC_DaoTruoc ? -8 : plc.DC_DaoSau ? 8 : 0;

  return (
    <div className="glass p-6 relative">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Sơ Đồ Máy Ấp</h3>
      <svg viewBox="0 0 480 300" className="w-full max-w-[520px] mx-auto">
        {/* Chamber */}
        <rect x="90" y="40" width="280" height="200" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        <polygon points="370,40 410,22 410,218 370,240" fill="#1a2332" stroke="#334155" strokeWidth="1.5" />
        <polygon points="90,40 130,22 410,22 370,40" fill="#1f2d3d" stroke="#334155" strokeWidth="1.5" />

        {/* Heating coil */}
        <path d="M120,60 Q150,48 180,60 Q210,72 240,60 Q270,48 300,60 Q330,72 350,60"
          stroke={plc.GiaNhiet ? "#f97316" : "#475569"} strokeWidth="3" fill="none"
          className={plc.GiaNhiet ? "pulse-glow" : ""} />

        {/* Fan L - QuatTanNhiet */}
        <g transform="translate(150,90)">
          <circle r="14" fill="none" stroke={plc.QuatTanNhiet ? "#22d3ee" : "#475569"} strokeWidth="2" />
          <g className={plc.QuatTanNhiet ? "fan-spin" : ""}>
            <line x1="0" y1="-10" x2="0" y2="10" stroke={plc.QuatTanNhiet ? "#22d3ee" : "#475569"} strokeWidth="2.5" />
            <line x1="-10" y1="0" x2="10" y2="0" stroke={plc.QuatTanNhiet ? "#22d3ee" : "#475569"} strokeWidth="2.5" />
          </g>
        </g>

        {/* Fan R - QuatThongGio */}
        <g transform="translate(310,90)">
          <circle r="14" fill="none" stroke={plc.QuatThongGio ? "#22d3ee" : "#475569"} strokeWidth="2" />
          <g className={plc.QuatThongGio ? "fan-spin" : ""}>
            <line x1="-8" y1="-8" x2="8" y2="8" stroke={plc.QuatThongGio ? "#22d3ee" : "#475569"} strokeWidth="2.5" />
            <line x1="8" y1="-8" x2="-8" y2="8" stroke={plc.QuatThongGio ? "#22d3ee" : "#475569"} strokeWidth="2.5" />
          </g>
        </g>

        {/* đk control dots */}
        <circle cx="190" cy="55" r="5" fill={plc.DkNhiet ? "#ef4444" : "transparent"} cursor="pointer" onClick={() => onInvert("DkNhiet")} />
        <circle cx="300" cy="75" r="5" fill={plc.DkTanNhiet ? "#ef4444" : "transparent"} cursor="pointer" onClick={() => onInvert("DkTanNhiet")} />
        <circle cx="345" cy="90" r="5" fill={plc.DkGio ? "#ef4444" : "transparent"} cursor="pointer" onClick={() => onInvert("DkGio")} />

        {/* Egg tray */}
        <g transform={`translate(230,165) rotate(${tilt})`}>
          <rect x="-100" y="-4" width="200" height="8" fill="#92400e" stroke="#78350f" rx="3" />
          {[-75, -45, -15, 15, 45, 75].map((x) => (
            <ellipse key={x} cx={x} cy={-14} rx="10" ry="12" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" opacity="0.7" />
          ))}
          {[-60, -30, 0, 30, 60].map((x) => (
            <ellipse key={x} cx={x} cy={-30} rx="10" ry="12" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" opacity="0.5" />
          ))}
        </g>

        {/* Humidity */}
        <g transform="translate(230,215)">
          <rect x="-15" y="-4" width="30" height="8" fill={plc.TaoAm ? "#38bdf8" : "#475569"} rx="3" />
          {plc.TaoAm && <>
            <circle cx="-5" cy="12" r="2" fill="#38bdf8" opacity="0.6" className="pulse-glow" />
            <circle cx="5" cy="16" r="1.5" fill="#38bdf8" opacity="0.4" className="pulse-glow" />
          </>}
        </g>
        <circle cx="270" cy="220" r="5" fill={plc.DkAm ? "#ef4444" : "transparent"} cursor="pointer" onClick={() => onInvert("DkAm")} />

        {/* Motors */}
        <rect x="120" y="248" width="40" height="22" rx="4" fill={plc.DC_DaoTruoc ? "#10b981" : "#334155"} stroke="#475569" />
        <text x="140" y="263" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">M1</text>
        <rect x="300" y="248" width="40" height="22" rx="4" fill={plc.DC_DaoSau ? "#10b981" : "#334155"} stroke="#475569" />
        <text x="320" y="263" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">M2</text>

        {/* CB indicators */}
        <rect x="107" y="195" width="16" height="10" rx="3" fill={plc.CB_Truoc ? "#10b981" : "#475569"} stroke="#334155" />
        <rect x="337" y="195" width="16" height="10" rx="3" fill={plc.CB_Sau ? "#10b981" : "#475569"} stroke="#334155" />

        {/* Connection lines */}
        <line x1="140" y1="248" x2="155" y2="173" stroke="#475569" strokeWidth="1" strokeDasharray="4,3" />
        <line x1="320" y1="248" x2="305" y2="173" stroke="#475569" strokeWidth="1" strokeDasharray="4,3" />
      </svg>

      {/* Actuator status row */}
      <div className="flex items-center justify-around mt-5 pt-4 border-t border-slate-800">
        {[
          { key: "GiaNhiet", label: "Gia nhiệt", color: "text-orange-400" },
          { key: "TaoAm", label: "Tạo ẩm", color: "text-sky-400" },
          { key: "QuatTanNhiet", label: "Tản nhiệt", color: "text-cyan-400" },
          { key: "QuatThongGio", label: "Thông gió", color: "text-cyan-400" },
        ].map((a) => (
          <div key={a.key} className="flex items-center gap-2">
            <StatusDot active={!!plc[a.key]} size="w-3 h-3" />
            <span className={`text-xs font-medium ${plc[a.key] ? a.color : "text-slate-500"}`}>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
