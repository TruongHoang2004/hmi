import nodes7 from 'nodes7';
import { PlcDataBlock, defaultPlcData, plcAddressMap } from '../config/plcVariables';
import { Server } from 'socket.io';

// ============================================================
// DB1 Block Read: đọc toàn bộ DB1 dưới dạng 1 khối byte liên tục
// Giải quyết lỗi PDU > 240 bytes khi đọc 45 tag riêng lẻ
// ============================================================
const DB1_SIZE = 58; // byte 0 → byte 57

/** Parse 58 bytes thô từ DB1 thành PlcDataBlock */
function parseDB1Buffer(buf: Buffer): PlcDataBlock {
  const bit = (byte: number, b: number) => !!((buf[byte] >> b) & 1);

  return {
    // Byte 0: ON, OFF
    ON: bit(0, 0),
    OFF: bit(0, 1),

    // DInt sensors (bytes 2-9)
    HT_ND: buf.readInt32BE(2),
    HT_DA: buf.readInt32BE(6),

    // Byte 10: Control bools
    KhoiDong: bit(10, 0),
    Auto_Test: bit(10, 1),
    TG_Dao: bit(10, 2),
    DC_DaoTruoc: bit(10, 3),
    DC_DaoSau: bit(10, 4),
    TG_XoayChieu: bit(10, 5),
    ResetTimerDao: bit(10, 6),
    Test: bit(10, 7),

    // DInt timers (bytes 12-19)
    TimeAp: buf.readInt32BE(12),
    SetTimeDao: buf.readInt32BE(16),

    // Int settings (bytes 20-25)
    SetNgayAp: buf.readInt16BE(20),
    SoLanDaoTrung: buf.readInt16BE(22),
    Gio: buf.readInt16BE(24),

    // Byte 26: NgatTuDong
    NgatTuDong: bit(26, 0),

    // DInt setpoints (bytes 28-35)
    Set_ND: buf.readInt32BE(28),
    Set_DA: buf.readInt32BE(32),

    // Byte 36: Actuator bools
    GiaNhiet: bit(36, 0),
    QuatTanNhiet: bit(36, 1),
    TaoAm: bit(36, 2),
    QuatThongGio: bit(36, 3),

    // Time/DInt (bytes 38-49)
    ThoiGian: buf.readInt32BE(38),
    ThoiGian1: buf.readInt32BE(42),
    ThoiGian2: buf.readInt32BE(46),

    // Int counters (bytes 50-55)
    Giay: buf.readInt16BE(50),
    Phut: buf.readInt16BE(52),
    Ngay: buf.readInt16BE(54),

    // Bytes 56-57: Sensors, alarms, controls
    CB_Truoc: bit(56, 0),
    CB_Sau: bit(56, 1),
    Reset: bit(56, 2),
    CanhBaoND: bit(56, 3),
    CanhBaoDA: bit(56, 4),
    CanhBaoTanNhiet: bit(56, 5),
    CanhBaoThongGio: bit(56, 6),
    Loi: bit(56, 7),
    DenBaoLoi: bit(57, 0),
    CoiBaoLoi: bit(57, 1),
    Dung: bit(57, 2),
    DkNhiet: bit(57, 3),
    DkAm: bit(57, 4),
    DkGio: bit(57, 5),
    DkTanNhiet: bit(57, 6),
  };
}

class PlcService {
  private conn: any;
  private plcConnected: boolean = false;

  // Cache nội bộ — luôn có data dù PLC kết nối hay chưa
  private currentPlcData: PlcDataBlock = { ...defaultPlcData };

  private io!: Server;
  private readInterval: any = null;
  private reconnectTimeout: any = null;

  private plcConfig = {
    port: 102,
    host: '10.1.3.34',
    rack: 0,
    slot: 1, // S7-1200 = slot 1
  };

  constructor() {
    this.conn = new nodes7();
  }

  public init(io: Server): void {
    this.io = io;
    this.connect();

    // Định kỳ 500ms phát dữ liệu (online/offline) tới tất cả socket clients
    setInterval(() => {
      this.io.emit('plc-data', this.currentPlcData);
    }, 500);
  }

  private connect(): void {
    if (this.plcConnected) return;

    console.log(`[PLC] Đang kết nối tới ${this.plcConfig.host}:${this.plcConfig.port}...`);

    // Giải phóng kết nối cũ nếu có để tránh rò rỉ socket
    if (this.conn) {
      try {
        this.conn.dropConnection(() => { });
      } catch (e) { }
    }
    this.conn = new nodes7();

    this.conn.initiateConnection(this.plcConfig, (err: any) => {
      if (typeof err !== "undefined") {
        console.error("❌ Lỗi kết nối tới PLC:", err);
        console.warn("⚠️  Backend đang chạy ở chế độ OFFLINE — Thử kết nối lại sau 5 giây...");
        this.plcConnected = false;
        this.scheduleReconnect();
        return;
      }

      console.log("✅ Đã kết nối thành công tới PLC!");
      this.plcConnected = true;

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Translation callback: dùng cho cả block read (_rawDB1) và write (từng tag)
      this.conn.setTranslationCB((tag: string) => {
        if (tag === '_rawDB1') return `DB1,BYTE0.${DB1_SIZE}`;
        return plcAddressMap[tag as keyof PlcDataBlock];
      });

      // Chỉ thêm 1 item duy nhất: đọc toàn bộ DB1 dưới dạng khối byte
      // → 1 S7 read request item thay vì 45 items → luôn nằm trong PDU 240 bytes
      this.conn.addItems(['_rawDB1']);

      this.startReading();
    });
  }

  private startReading(): void {
    if (this.readInterval) {
      clearInterval(this.readInterval);
    }

    this.readInterval = setInterval(() => {
      if (!this.plcConnected) return;

      this.conn.readAllItems((err: any, values: Record<string, any>) => {
        if (err) {
          console.error("[PLC] Lỗi đọc dữ liệu:", err);
          this.handleDisconnect();
          return;
        }

        const raw = values['_rawDB1'];
        if (!raw) return;

        try {
          // nodes7 có thể trả về Buffer hoặc array of numbers
          const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
          if (buf.length >= DB1_SIZE) {
            this.currentPlcData = parseDB1Buffer(buf);
          }
        } catch (parseErr) {
          console.error("[PLC] Lỗi parse dữ liệu:", parseErr);
        }
      });
    }, 500);
  }

  private handleDisconnect(): void {
    if (!this.plcConnected) return;

    console.warn("⚠️  Mất kết nối với PLC! Đang chuyển sang chế độ OFFLINE...");
    this.plcConnected = false;

    if (this.readInterval) {
      clearInterval(this.readInterval);
      this.readInterval = null;
    }

    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 5000);
  }

  public isConnected(): boolean {
    return this.plcConnected;
  }

  public getData(): PlcDataBlock {
    return this.currentPlcData;
  }

  public getStatus() {
    return { connected: this.plcConnected, data: this.currentPlcData };
  }

  public writeTag(tag: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!plcAddressMap[tag as keyof PlcDataBlock]) {
        return reject(new Error(`Tag "${tag}" không hợp lệ`));
      }

      // Luôn cập nhật cache nội bộ
      (this.currentPlcData as any)[tag] = value;

      if (!this.plcConnected) {
        // Offline mode: ghi vào cache, không báo lỗi
        console.log(`[OFFLINE] Ghi cache: ${tag} = ${value}`);
        return resolve();
      }

      this.conn.writeItems(tag, value, (err: any) => {
        if (err) return reject(new Error(`Lỗi ghi tag "${tag}" xuống PLC`));
        console.log(`[PLC] ✍️ Ghi thành công: ${tag} = ${value}`);
        resolve();
      });
    });
  }

  public writeMultipleTags(tags: string[], values: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      // Luôn cập nhật cache nội bộ trước
      tags.forEach((tag, i) => {
        if (plcAddressMap[tag as keyof PlcDataBlock] !== undefined) {
          (this.currentPlcData as any)[tag] = values[i];
        }
      });

      if (!this.plcConnected) {
        // Offline mode: thành công với cache
        console.log(`[OFFLINE] Ghi ${tags.length} tags vào cache`);
        return resolve();
      }

      // Lọc chỉ những tag hợp lệ
      const validPairs = tags.reduce<{ t: string[]; v: any[] }>((acc, tag, i) => {
        if (plcAddressMap[tag as keyof PlcDataBlock] !== undefined) {
          acc.t.push(tag);
          acc.v.push(values[i]);
        }
        return acc;
      }, { t: [], v: [] });

      this.conn.writeItems(validPairs.t, validPairs.v, (err: any) => {
        if (err) return reject(new Error("Lỗi ghi nhiều tag xuống PLC"));
        console.log(`[PLC] ✍️ Ghi thành công ${validPairs.t.length} tags`);
        resolve();
      });
    });
  }
}

export default new PlcService();
