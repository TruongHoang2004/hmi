"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Thermometer, Droplets, Fan, Power, Settings2, Activity,
  Play, Square, ChevronRight, AlertTriangle, CheckCircle2, Clock, RotateCcw
} from "lucide-react";

interface Settings {
  Set_ND: string;
  Set_DA: string;
  SetNgayAp: string;
  GioSet: string;
  SetTimeDao: string; // phút
  Auto_Test: boolean; // false = Auto, true = Test
}

const DEFAULT_SETTINGS: Settings = {
  Set_ND: "",
  Set_DA: "",
  SetNgayAp: "",
  GioSet: "",
  SetTimeDao: "",
  Auto_Test: false,
};

// Validate all required settings are filled in
function validateSettings(s: Settings): string | null {
  if (!s.Set_ND || isNaN(Number(s.Set_ND))) return "Vui lòng nhập nhiệt độ cài đặt hợp lệ";
  if (!s.Set_DA || isNaN(Number(s.Set_DA))) return "Vui lòng nhập độ ẩm cài đặt hợp lệ";
  if (!s.SetNgayAp || isNaN(Number(s.SetNgayAp)) || Number(s.SetNgayAp) <= 0) return "Vui lòng nhập số ngày ấp hợp lệ";
  if (!s.GioSet || isNaN(Number(s.GioSet))) return "Vui lòng nhập giờ set hợp lệ";
  if (!s.SetTimeDao || isNaN(Number(s.SetTimeDao)) || Number(s.SetTimeDao) <= 0) return "Vui lòng nhập thời gian đảo hợp lệ";
  return null;
}

export default function Home() {
  const [plcData, setPlcData] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Settings form state
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("plc-data", (data) => setPlcData(data || {}));
    return () => { newSocket.close(); };
  }, []);

  const handleWriteTag = (tag: string, value: any) => {
    if (socket && isConnected) {
      socket.emit("write-tag", { tag, value });
    }
  };

  // Write all settings down to PLC then enable start button
  const handleSaveSettings = async () => {
    setSettingsError(null);
    const error = validateSettings(settings);
    if (error) {
      setSettingsError(error);
      return;
    }
    setIsSaving(true);

    // SetTimeDao: người dùng nhập phút → chuyển sang ms (x 60000) cho PLC (DInt)
    const items = [
      { tag: "Set_ND",     value: Number(settings.Set_ND) },
      { tag: "Set_DA",     value: Number(settings.Set_DA) },
      { tag: "SetNgayAp",  value: Number(settings.SetNgayAp) },
      { tag: "GioSet",     value: Number(settings.GioSet) },
      { tag: "SetTimeDao", value: Number(settings.SetTimeDao) * 60000 },
      { tag: "Auto_Test",  value: settings.Auto_Test },
    ];

    socket?.emit("write-tags", { items });

    // Chờ xác nhận write-result
    socket?.once("write-result", (result: any) => {
      setIsSaving(false);
      if (result.success) {
        setSettingsSaved(true);
      } else {
        setSettingsError(result.error ?? "Lỗi không xác định khi ghi PLC");
      }
    });
  };

  const handleStartMachine = () => {
    handleWriteTag("ON", true);
  };

  const handleStopMachine = () => {
    handleWriteTag("OFF", true);
    setSettingsSaved(false);
  };

  const getStatusColor = (val: boolean) =>
    val ? "bg-emerald-500/20 text-emerald-400" : "bg-neutral-800 text-neutral-500";
  const getStatusDot = (val: boolean) =>
    val ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-neutral-700";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 md:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-500" />
            Máy Ấp Trứng HMI
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">Hệ thống giám sát và điều khiển tự động</p>
        </div>
        <div className="flex items-center gap-3 bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800">
          <div className={`w-2.5 h-2.5 rounded-full transition-all ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          <span className="text-sm font-medium">{isConnected ? "Server: Đã kết nối" : "Server: Mất kết nối"}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">

        {/* ===== STEP 1: CÀI ĐẶT THÔNG SỐ ===== */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-neutral-300">1</div>
            <h2 className="text-lg font-semibold text-white">Cài Đặt Thông Số</h2>
            <span className="text-xs text-neutral-500 font-normal">— Nhập đầy đủ trước khi bật máy</span>
            {settingsSaved && (
              <span className="ml-auto flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Đã lưu xuống PLC
              </span>
            )}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Nhiệt độ cài đặt */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-400" /> Nhiệt độ cài đặt (Set ND)
                </label>
                <div className="relative">
                  <input
                    type="number" step="0.1" min="0" max="60"
                    value={settings.Set_ND}
                    disabled={settingsSaved}
                    onChange={(e) => setSettings(s => ({ ...s, Set_ND: e.target.value }))}
                    placeholder="Ví dụ: 37.5"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">°C</span>
                </div>
              </div>

              {/* Độ ẩm cài đặt */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-400" /> Độ ẩm cài đặt (Set DA)
                </label>
                <div className="relative">
                  <input
                    type="number" step="0.1" min="0" max="100"
                    value={settings.Set_DA}
                    disabled={settingsSaved}
                    onChange={(e) => setSettings(s => ({ ...s, Set_DA: e.target.value }))}
                    placeholder="Ví dụ: 65"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">%</span>
                </div>
              </div>

              {/* Số ngày ấp */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" /> Số ngày ấp (Set Ngày Ấp)
                </label>
                <div className="relative">
                  <input
                    type="number" min="1" max="30"
                    value={settings.SetNgayAp}
                    disabled={settingsSaved}
                    onChange={(e) => setSettings(s => ({ ...s, SetNgayAp: e.target.value }))}
                    placeholder="Ví dụ: 21"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 pr-16 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">ngày</span>
                </div>
              </div>

              {/* Giờ set */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" /> Giờ set
                </label>
                <div className="relative">
                  <input
                    type="number" min="0" max="23"
                    value={settings.GioSet}
                    disabled={settingsSaved}
                    onChange={(e) => setSettings(s => ({ ...s, GioSet: e.target.value }))}
                    placeholder="Ví dụ: 8"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-neutral-600 focus:outline-none focus:border-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">h</span>
                </div>
              </div>

              {/* Thời gian đảo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-teal-400" /> Thời gian đảo trứng
                </label>
                <div className="relative">
                  <input
                    type="number" min="1"
                    value={settings.SetTimeDao}
                    disabled={settingsSaved}
                    onChange={(e) => setSettings(s => ({ ...s, SetTimeDao: e.target.value }))}
                    placeholder="Ví dụ: 120"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 pr-16 text-white placeholder-neutral-600 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">phút</span>
                </div>
              </div>

              {/* Chế độ Auto/Test */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-neutral-400" /> Chế độ hoạt động
                </label>
                <div className="flex rounded-xl overflow-hidden border border-neutral-700">
                  <button
                    disabled={settingsSaved}
                    onClick={() => setSettings(s => ({ ...s, Auto_Test: false }))}
                    className={`flex-1 py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      !settings.Auto_Test ? "bg-emerald-600 text-white" : "bg-neutral-950 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    disabled={settingsSaved}
                    onClick={() => setSettings(s => ({ ...s, Auto_Test: true }))}
                    className={`flex-1 py-3 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      settings.Auto_Test ? "bg-blue-600 text-white" : "bg-neutral-950 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    Test
                  </button>
                </div>
              </div>
            </div>

            {/* Error / Save button */}
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <AnimatePresence>
                {settingsError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {settingsError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="ml-auto flex gap-3">
                {settingsSaved && (
                  <button
                    onClick={() => { setSettingsSaved(false); setSettings(DEFAULT_SETTINGS); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Cài đặt lại
                  </button>
                )}
                {!settingsSaved && (
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving || !isConnected}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu thông số xuống PLC"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== STEP 2: GIÁM SÁT & ĐIỀU KHIỂN ===== */}
        <section className={`transition-opacity duration-300 ${!settingsSaved ? "opacity-40 pointer-events-none select-none" : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold ${settingsSaved ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-neutral-800 border-neutral-700 text-neutral-500"}`}>2</div>
            <h2 className="text-lg font-semibold text-white">Giám Sát & Điều Khiển</h2>
            {!settingsSaved && <span className="text-xs text-neutral-600">— Cần lưu thông số trước</span>}
          </div>

          <div className="space-y-6">
            {/* Sensors */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="col-span-1 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temperature Card */}
                <motion.div whileHover={{ scale: 1.02 }} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Thermometer className="w-28 h-28 text-orange-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-xl"><Thermometer className="w-5 h-5" /></div>
                      <h3 className="text-base font-medium text-neutral-300">Nhiệt Độ Hiện Tại</h3>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-light tracking-tighter text-white">
                        {plcData.HT_ND !== undefined ? Number(plcData.HT_ND).toFixed(1) : "--"}
                      </span>
                      <span className="text-xl text-neutral-500">°C</span>
                    </div>
                    <div className="mt-4 text-sm text-neutral-500">
                      Cài đặt: <span className="text-orange-400 font-semibold">{settings.Set_ND || "--"} °C</span>
                    </div>
                  </div>
                </motion.div>

                {/* Humidity Card */}
                <motion.div whileHover={{ scale: 1.02 }} className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Droplets className="w-28 h-28 text-blue-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl"><Droplets className="w-5 h-5" /></div>
                      <h3 className="text-base font-medium text-neutral-300">Độ Ẩm Hiện Tại</h3>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-light tracking-tighter text-white">
                        {plcData.HT_DA !== undefined ? Number(plcData.HT_DA).toFixed(1) : "--"}
                      </span>
                      <span className="text-xl text-neutral-500">%</span>
                    </div>
                    <div className="mt-4 text-sm text-neutral-500">
                      Cài đặt: <span className="text-blue-400 font-semibold">{settings.Set_DA || "--"} %</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Actuator Status */}
              <div className="col-span-1 md:col-span-4">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl h-full">
                  <h3 className="text-base font-medium text-neutral-300 mb-5 flex items-center gap-2">
                    <Settings2 className="w-4 h-4" /> Trạng Thái Thiết Bị
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: "GiaNhiet", label: "Gia nhiệt", icon: <Thermometer className="w-4 h-4" /> },
                      { key: "TaoAm", label: "Tạo ẩm", icon: <Droplets className="w-4 h-4" /> },
                      { key: "QuatTanNhiet", label: "Quạt tản nhiệt", icon: <Fan className="w-4 h-4" /> },
                      { key: "QuatThongGio", label: "Quạt thông gió", icon: <Fan className="w-4 h-4" /> },
                      { key: "DC_DaoTruoc", label: "ĐC đảo trước", icon: <RotateCcw className="w-4 h-4" /> },
                      { key: "DC_DaoSau", label: "ĐC đảo sau", icon: <RotateCcw className="w-4 h-4" /> },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${getStatusColor(plcData[item.key])}`}>{item.icon}</div>
                          <span className="text-sm text-neutral-300">{item.label}</span>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full transition-all ${getStatusDot(plcData[item.key])}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="bg-neutral-900 border border-neutral-800 p-7 rounded-3xl">
              <h3 className="text-base font-medium text-neutral-300 mb-5 flex items-center gap-2">
                <Power className="w-4 h-4" /> Điều Khiển Chính
              </h3>
              <div className="flex flex-wrap gap-4">
                {/* ON */}
                <button
                  onClick={handleStartMachine}
                  disabled={plcData.KhoiDong}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_24px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Bật Máy (ON)
                </button>

                {/* OFF */}
                <button
                  onClick={handleStopMachine}
                  disabled={!plcData.KhoiDong}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-base transition-all bg-red-600 hover:bg-red-500 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Square className="w-5 h-5 fill-current" />
                  Tắt Máy (OFF)
                </button>

                {/* Status */}
                <div className="flex items-center gap-3 ml-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusDot(plcData.KhoiDong)}`} />
                  <span className="text-sm text-neutral-400">
                    {plcData.KhoiDong ? "Máy đang chạy" : "Máy đang dừng"}
                  </span>
                  {plcData.NgatTuDong && (
                    <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium bg-yellow-400/10 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5" /> Đã ngắt tự động
                    </span>
                  )}
                </div>
              </div>

              {/* Runtime Info */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-neutral-800">
                {[
                  { label: "Ngày ấp",   value: plcData.Ngay ?? "--",          unit: "ngày" },
                  { label: "Giờ",       value: plcData.Gio ?? "--",           unit: "giờ" },
                  { label: "Phút",      value: plcData.Phut ?? "--",          unit: "phút" },
                  { label: "Số lần đảo", value: plcData.SoLanDaoTrung ?? "--", unit: "lần" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-light text-white">{stat.value} <span className="text-sm text-neutral-500">{stat.unit}</span></div>
                    <div className="text-xs text-neutral-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
