import nodes7 from 'nodes7';
import { PlcDataBlock, defaultPlcData, plcAddressMap } from '../config/plcVariables';
import { Server } from 'socket.io';

class PlcService {
  private conn: any;
  private plcConnected: boolean = false;
  private currentPlcData: PlcDataBlock = { ...defaultPlcData };

  constructor() {
    this.conn = new nodes7();
  }

  public init(io: Server): void {
    const plcConfig = {
      port: 102,               
      host: '127.0.0.1',       
      rack: 0,                 
      slot: 1,                 // S7-1200 = slot 1
    };

    console.log(`[PLC] Đang kết nối tới ${plcConfig.host}:${plcConfig.port}...`);

    this.conn.initiateConnection(plcConfig, (err: any) => {
      if (typeof(err) !== "undefined") {
        console.error("❌ Lỗi kết nối tới PLC:", err);
        return;
      }
      
      console.log("✅ Đã kết nối thành công tới PLC!");
      this.plcConnected = true;

      // Đăng ký translation callback để map tag name -> address
      this.conn.setTranslationCB((tag: string) => plcAddressMap[tag as keyof PlcDataBlock]);
      this.conn.addItems(Object.keys(plcAddressMap));
      
      // Vòng lặp đọc PLC mỗi 500ms và phát data lên Socket.IO
      setInterval(() => this.readData(io), 500);
    });
  }

  private readData(io: Server): void {
    if (!this.plcConnected) return;
    
    this.conn.readAllItems((err: any, values: Record<string, any>) => {
      if (err) {
        console.error("[PLC] Lỗi đọc:", err);
        return;
      }
      this.currentPlcData = values as PlcDataBlock;
      io.emit('plc-data', this.currentPlcData);
    });
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
      if (!this.plcConnected) {
        return reject(new Error("PLC chưa kết nối"));
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
      if (!this.plcConnected) {
        return reject(new Error("PLC chưa kết nối"));
      }
      this.conn.writeItems(tags, values, (err: any) => {
        if (err) return reject(new Error("Lỗi ghi nhiều tag xuống PLC"));
        resolve();
      });
    });
  }
}

export default new PlcService();
