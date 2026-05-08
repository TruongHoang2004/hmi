import snap7
import snap7.server
import ctypes
import struct
import time
import random
import threading

print(f"python-snap7 version: {snap7.__version__}")

# Khởi tạo S7 Server giả lập S7-1200 CPU 1214C
server = snap7.server.Server()

# ============================================================
# Data Block 1 (DB1) - Ánh xạ y hệt plcVariables.ts (backend)
# Byte offset theo chuẩn TIA Portal Standard DB (non-optimized)
# ============================================================
DB_SIZE = 64

# Bool offsets:
# ON          = byte 0, bit 0
# OFF         = byte 0, bit 1
# KhoiDong    = byte 10, bit 0
# Auto_Test   = byte 10, bit 1
# TG_Dao      = byte 10, bit 2
# DC_DaoTruoc = byte 10, bit 3
# DC_DaoSau   = byte 10, bit 4
# TG_XoayChieu= byte 10, bit 5
# ResetTimerDao= byte 10, bit 6
# Test        = byte 10, bit 7
# NgatTuDong  = byte 28, bit 0
# GiaNhiet    = byte 38, bit 0
# QuatTanNhiet= byte 38, bit 1
# TaoAm       = byte 38, bit 2
# QuatThongGio= byte 38, bit 3
# CB_Truoc    = byte 58, bit 0
# CB_Sau      = byte 58, bit 1

# Real offsets:
# HT_ND       = byte 2  (4 bytes)
# HT_DA       = byte 6  (4 bytes)
# Set_ND      = byte 30 (4 bytes)
# Set_DA      = byte 34 (4 bytes)

# DInt offsets:
# TimeAp      = byte 12 (4 bytes)
# SetTimeDao  = byte 16 (4 bytes)
# ThoiGian    = byte 40 (4 bytes)
# ThoiGian1   = byte 44 (4 bytes)
# ThoiGian2   = byte 48 (4 bytes)

# Int offsets:
# SetNgayAp   = byte 20 (2 bytes)
# GioSet      = byte 22 (2 bytes)
# SoLanDaoTrung = byte 24 (2 bytes)
# Gio         = byte 26 (2 bytes)
# Giay        = byte 52 (2 bytes)
# Phut        = byte 54 (2 bytes)
# Ngay        = byte 56 (2 bytes)

db1 = (ctypes.c_uint8 * DB_SIZE)()

# --- Ghi giá trị mặc định ---
struct.pack_into('>f', db1, 2,  25.0)   # HT_ND
struct.pack_into('>f', db1, 6,  55.0)   # HT_DA
struct.pack_into('>f', db1, 30, 37.5)   # Set_ND
struct.pack_into('>f', db1, 34, 65.0)   # Set_DA
struct.pack_into('>h', db1, 20, 21)     # SetNgayAp = 21 ngày
struct.pack_into('>h', db1, 22, 8)      # GioSet = 8 giờ
struct.pack_into('>i', db1, 16, 120 * 60000)  # SetTimeDao = 120 phút -> ms

# Đăng ký DB1
server.register_area(snap7.type.SrvArea.DB, 1, db1)
print("✅ Đã đăng ký DB1 (64 bytes)")

# --- Cấu hình server params cho S7-1200 (rack=0, slot=1) ---
# nodes7 gửi TSAP destination = 0x0101 (rack 0, slot 1)
# snap7 server cần respond đúng TSAP để hoàn thành ISO handshake
try:
    server.set_param(snap7.type.Parameter.LocalPort, 102)
    server.set_param(snap7.type.Parameter.MaxClients, 10)
    # SrcTSap = 0x0101 matches nodes7's S7-1200 slot 1 destination TSAP
    server.set_param(snap7.type.Parameter.SrcTSap, 0x0101)
    print("✅ Đã cấu hình TSAP=0x0101 (S7-1200, rack=0, slot=1)")
except Exception as e:
    print(f"⚠️ Warning set_param: {e}")

def set_bit(buf, byte_offset, bit_offset, value: bool):
    if value:
        buf[byte_offset] |= (1 << bit_offset)
    else:
        buf[byte_offset] &= ~(1 << bit_offset)

def get_bit(buf, byte_offset, bit_offset) -> bool:
    return bool(buf[byte_offset] & (1 << bit_offset))

# --- Luồng giả lập dữ liệu máy ấp trứng ---
def simulate_machine():
    base_temp = 25.0
    base_hum  = 55.0
    elapsed_ms = 0
    flip_count = 0
    day_count = 0

    while True:
        time.sleep(1)
        elapsed_ms += 1000

        # Đọc setpoint
        try:
            set_nd = struct.unpack_from('>f', db1, 30)[0]
            set_da = struct.unpack_from('>f', db1, 34)[0]
            if not (0 < set_nd < 100): set_nd = 37.5
            if not (0 < set_da < 100): set_da = 65.0
        except:
            set_nd, set_da = 37.5, 65.0

        khoi_dong = get_bit(db1, 10, 0)

        if khoi_dong:
            # Tiến dần đến setpoint
            base_temp += (set_nd - base_temp) * 0.05
            base_hum  += (set_da - base_hum)  * 0.03
        else:
            # Nguội dần về nhiệt độ phòng
            base_temp += (25.0 - base_temp) * 0.02
            base_hum  += (55.0 - base_hum)  * 0.02

        temp = base_temp + random.uniform(-0.3, 0.3)
        hum  = base_hum  + random.uniform(-1.0, 1.0)

        struct.pack_into('>f', db1, 2, round(temp, 2))
        struct.pack_into('>f', db1, 6, round(hum, 2))

        # Simulate actuators based on temp/humidity vs setpoints
        if khoi_dong:
            set_bit(db1, 38, 0, temp < set_nd)   # GiaNhiet
            set_bit(db1, 38, 1, temp > set_nd)   # QuatTanNhiet
            set_bit(db1, 38, 2, hum < set_da)    # TaoAm
            set_bit(db1, 38, 3, hum > set_da)    # QuatThongGio
        else:
            for bit in range(4):
                set_bit(db1, 38, bit, False)

        # Simulate time counters
        struct.pack_into('>i', db1, 40, elapsed_ms)
        giay = (elapsed_ms // 1000) % 60
        phut  = (elapsed_ms // 60000) % 60
        ngay  = elapsed_ms // 86400000
        struct.pack_into('>h', db1, 52, giay)
        struct.pack_into('>h', db1, 54, phut)
        struct.pack_into('>h', db1, 56, ngay)

        print(f"[SIM] T:{temp:.1f}°C SetND:{set_nd:.1f} | H:{hum:.1f}% SetDA:{set_da:.1f} | {'RUN' if khoi_dong else 'STOP'}")

sim_thread = threading.Thread(target=simulate_machine, daemon=True)
sim_thread.start()

# --- Khởi động Server ---
server.start()
print("✅ S7-1200 PLC Simulator chạy trên port 102")
print("   DB1 với đầy đủ tags (ON/OFF, HT_ND, HT_DA, actuators, timers...)")

try:
    while True:
        event = server.pick_event()
        if event:
            msg = server.event_text(event)
            print(f"[Event] {msg.strip()}")
        time.sleep(0.1)
except KeyboardInterrupt:
    server.stop()
    print("Server đã dừng.")
