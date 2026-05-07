"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { motion } from "framer-motion";
import { Thermometer, Droplets, Fan, Power, Settings2, Activity, Play, Square } from "lucide-react";

export default function Home() {
  const [plcData, setPlcData] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to the backend server
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("plc-data", (data) => {
      setPlcData(data || {});
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleWriteTag = (tag: string, value: any) => {
    if (socket && isConnected) {
      socket.emit("write-tag", { tag, value });
    }
  };

  const getStatusColor = (val: boolean) => (val ? "bg-emerald-500/20 text-emerald-500" : "bg-neutral-800 text-neutral-400");
  const getStatusDot = (val: boolean) => (val ? "bg-emerald-500" : "bg-neutral-600");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-500" />
              Bảng Điều Khiển Máy Ấp Trứng
            </h1>
            <p className="text-neutral-400 mt-2 text-sm">Hệ thống giám sát và điều khiển tự động</p>
          </div>
          <div className="flex items-center gap-3 bg-neutral-900 px-4 py-2 rounded-full border border-neutral-800">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-sm font-medium">
              {isConnected ? "Đã kết nối Server" : "Mất kết nối"}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Sensors (Temperature & Humidity) */}
          <div className="col-span-1 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Thermometer className="w-32 h-32 text-orange-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-500/20 text-orange-500 rounded-2xl">
                    <Thermometer className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-medium text-neutral-300">Nhiệt Độ Hiện Tại</h2>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-light tracking-tighter text-white">
                    {plcData.HT_ND !== undefined ? Number(plcData.HT_ND).toFixed(1) : "--"}
                  </span>
                  <span className="text-2xl text-neutral-500 font-light">°C</span>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-neutral-400">
                  <span>Cài đặt (Set ND):</span>
                  <span className="text-white font-medium">{plcData.Set_ND ?? "--"} °C</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Droplets className="w-32 h-32 text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500/20 text-blue-500 rounded-2xl">
                    <Droplets className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-medium text-neutral-300">Độ Ẩm Hiện Tại</h2>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-light tracking-tighter text-white">
                    {plcData.HT_DA !== undefined ? Number(plcData.HT_DA).toFixed(1) : "--"}
                  </span>
                  <span className="text-2xl text-neutral-500 font-light">%</span>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-neutral-400">
                  <span>Cài đặt (Set DA):</span>
                  <span className="text-white font-medium">{plcData.Set_DA ?? "--"} %</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls & Actuators */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl flex-1">
              <h3 className="text-lg font-medium text-neutral-300 mb-6 flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Trạng Thái Thiết Bị
              </h3>
              
              <div className="space-y-4">
                {[
                  { key: 'GiaNhiet', label: 'Thiết bị gia nhiệt', icon: <Thermometer className="w-4 h-4" /> },
                  { key: 'TaoAm', label: 'Thiết bị tạo ẩm', icon: <Droplets className="w-4 h-4" /> },
                  { key: 'QuatTanNhiet', label: 'Quạt tản nhiệt', icon: <Fan className="w-4 h-4" /> },
                  { key: 'QuatThongGio', label: 'Quạt thông gió', icon: <Fan className="w-4 h-4" /> },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${getStatusColor(plcData[item.key])}`}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-neutral-300">{item.label}</span>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot(plcData[item.key])}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
          <h3 className="text-lg font-medium text-neutral-300 mb-6 flex items-center gap-2">
            <Power className="w-5 h-5" />
            Điều Khiển Chính
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleWriteTag("KhoiDong", !plcData.KhoiDong)}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-all ${
                plcData.KhoiDong 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                  : "bg-neutral-800 hover:bg-neutral-700 text-white"
              }`}
            >
              {plcData.KhoiDong ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              {plcData.KhoiDong ? "Đang Khởi Động" : "Bật Máy"}
            </button>

            <button
              onClick={() => handleWriteTag("Auto_Test", !plcData.Auto_Test)}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-all ${
                plcData.Auto_Test 
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                  : "bg-neutral-800 hover:bg-neutral-700 text-white"
              }`}
            >
              <Settings2 className="w-5 h-5" />
              Chế độ {plcData.Auto_Test ? "Tự Động" : "Manual"}
            </button>
            
            <button
              onClick={() => handleWriteTag("ON", true)}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-all bg-neutral-800 hover:bg-neutral-700 text-white active:bg-neutral-600"
            >
              Nút nhấn ON
            </button>

            <button
              onClick={() => handleWriteTag("OFF", true)}
              className="flex items-center justify-center gap-2 p-4 rounded-2xl font-medium transition-all bg-neutral-800 hover:bg-red-500/20 hover:text-red-500 text-white active:bg-red-500/30"
            >
              Nút nhấn OFF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
