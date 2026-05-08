import nodes7 from 'nodes7';
// Forced reload to pick up patched nodes7 S7-Server packet size
import { PlcDataBlock, defaultPlcData, plcAddressMap } from '../config/plcVariables';
import { Server } from 'socket.io';

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
    host: '127.0.0.1',
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
        this.conn.dropConnection(() => {});
      } catch (e) {}
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

      this.conn.setTranslationCB((tag: string) => plcAddressMap[tag as keyof PlcDataBlock]);
      this.conn.addItems(Object.keys(plcAddressMap));

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
        this.currentPlcData = { ...this.currentPlcData, ...values };
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
