"use client";

import { WarnTriangle } from "./shared";
import { useMomentary } from "./shared";

/** Screen_1: Warning / Alarm Screen */
export default function WarningScreen({ plc, writeTag, onNavigateMain }: {
  plc: Record<string, any>;
  writeTag: (tag: string, value: any) => void;
  onNavigateMain: () => void;
}) {
  const momentary = useMomentary(writeTag);

  const alarms = [
    { key: "CanhBaoND", label: "Cảnh báo Nhiệt độ", desc: "Nhiệt độ lệch khỏi giá trị cài đặt", pos: "translate(200,30)" },
    { key: "CanhBaoTanNhiet", label: "Cảnh báo Tản nhiệt", desc: "Hệ thống tản nhiệt gặp sự cố", pos: "translate(130,65)" },
    { key: "CanhBaoThongGio", label: "Cảnh báo Thông gió", desc: "Hệ thống thông gió gặp sự cố", pos: "translate(370,140)" },
    { key: "CanhBaoDA", label: "Cảnh báo Độ ẩm", desc: "Độ ẩm lệch khỏi giá trị cài đặt", pos: "translate(215,235)" },
  ];

  const activeAlarms = alarms.filter(a => !!plc[a.key]);

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto space-y-6 slide-up">
      {/* Warning banner */}
      <div className="bg-linear-to-r from-amber-600/20 via-amber-500/30 to-amber-600/20 border border-amber-500/40 rounded-2xl p-5 text-center">
        <div className="flex items-center justify-center gap-3">
          <WarnTriangle size={36} className="alarm-flash" />
          <h2 className="text-amber-400 font-bold text-2xl tracking-widest">WARNING</h2>
          <WarnTriangle size={36} className="alarm-flash" />
        </div>
        <p className="text-amber-300/60 text-sm mt-1">
          {activeAlarms.length > 0
            ? `${activeAlarms.length} cảnh báo đang hoạt động`
            : "Không có cảnh báo — hệ thống an toàn"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Indicators */}
        <div className="lg:col-span-4 space-y-4">
          {/* Đèn & Còi */}
          <div className="glass p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tín Hiệu Cảnh Báo</h3>
            {[
              { key: "DenBaoLoi", label: "Đèn báo lỗi", icon: "💡" },
              { key: "CoiBaoLoi", label: "Còi báo lỗi", icon: "🔊" },
            ].map(ind => (
              <div key={ind.key} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-lg
                  ${plc[ind.key]
                    ? "border-amber-400 bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.3)] alarm-flash"
                    : "border-slate-700 bg-slate-800"}`}>
                  {plc[ind.key] ? ind.icon : ""}
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-300">{ind.label}</span>
                  <span className={`block text-xs ${plc[ind.key] ? "text-amber-400 font-semibold" : "text-slate-600"}`}>
                    {plc[ind.key] ? "ĐANG BẬT" : "Tắt"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dừng button */}
          <button {...momentary("Dung")}
            className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 font-bold text-sm rounded-xl
              transition-all active:scale-95 select-none">
            🛑 Dừng Khẩn Cấp
          </button>

          {/* Alarm list */}
          <div className="glass p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Chi Tiết Cảnh Báo</h3>
            {alarms.map(a => (
              <div key={a.key} className={`flex items-start gap-3 p-3 rounded-lg transition-all ${plc[a.key] ? "bg-amber-500/10 border border-amber-500/20" : "bg-slate-800/50"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${plc[a.key] ? "bg-amber-400 alarm-flash" : "bg-slate-600"}`} />
                <div>
                  <span className={`text-sm font-medium ${plc[a.key] ? "text-amber-300" : "text-slate-500"}`}>{a.label}</span>
                  <span className="block text-xs text-slate-500">{a.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Machine + warning triangles */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass p-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Vị Trí Sự Cố</h3>
            <svg viewBox="0 0 480 300" className="w-full max-w-[520px] mx-auto">
              <rect x="90" y="40" width="280" height="200" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <polygon points="370,40 410,22 410,218 370,240" fill="#1a2332" stroke="#334155" strokeWidth="1.5" />
              <polygon points="90,40 130,22 410,22 370,40" fill="#1f2d3d" stroke="#334155" strokeWidth="1.5" />
              <path d="M120,60 Q150,48 180,60 Q210,72 240,60 Q270,48 300,60 Q330,72 350,60" stroke="#475569" strokeWidth="3" fill="none" />
              <circle cx="150" cy="90" r="14" fill="none" stroke="#475569" strokeWidth="2" />
              <circle cx="310" cy="90" r="14" fill="none" stroke="#475569" strokeWidth="2" />
              <g transform="translate(230,165)">
                <rect x="-100" y="-4" width="200" height="8" fill="#92400e" stroke="#78350f" rx="3" />
                {[-75, -45, -15, 15, 45, 75].map(x => <ellipse key={x} cx={x} cy={-14} rx="10" ry="12" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" opacity="0.5" />)}
              </g>
              <rect x="215" y="211" width="30" height="8" fill="#475569" rx="3" />
              <rect x="120" y="248" width="40" height="22" rx="4" fill="#334155" stroke="#475569" />
              <text x="140" y="263" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">M1</text>
              <rect x="300" y="248" width="40" height="22" rx="4" fill="#334155" stroke="#475569" />
              <text x="320" y="263" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">M2</text>

              {/* Warning triangles at alarm positions */}
              {alarms.map(a => plc[a.key] && (
                <g key={a.key} transform={a.pos}>
                  <polygon points="15,0 30,26 0,26" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" className="alarm-flash" />
                  <text x="15" y="22" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#451a03">!</text>
                </g>
              ))}
            </svg>
          </div>

          {/* Navigate back */}
          <div className="flex justify-end">
            <button onClick={onNavigateMain}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-sm rounded-xl
                transition-all hover:border-slate-600 active:scale-95">
              ← Màn hình chính
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
