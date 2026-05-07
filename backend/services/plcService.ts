import nodes7 from 'nodes7';
import { variables } from '../config/plcVariables';
import { Server } from 'socket.io';

class PlcService {
  private conn: any;
  private plcConnected: boolean = false;
  private currentPlcData: Record<string, any> = {};

  constructor() {
    this.conn = new nodes7();
  }

  public init(io: Server): void {
    const plcConfig = {
      port: 102,               
      host: '127.0.0.1',       
      rack: 0,                 
      slot: 1,                 
    };

    this.conn.initiateConnection(plcConfig, (err: any) => {
      if (typeof(err) !== "undefined") {
        console.error("❌ Lỗi kết nối tới PLC:", err);
        return;
      }
      
      console.log("✅ Đã kết nối thành công tới PLC!");
      this.plcConnected = true;

      this.conn.setTranslationCB((tag: string) => variables[tag]);
      this.conn.addItems(Object.keys(variables));
      
      setInterval(() => this.readData(io), 500);
    });
  }

  private readData(io: Server): void {
    if (!this.plcConnected) return;
    
    this.conn.readAllItems((err: any, values: Record<string, any>) => {
      if (err) {
        console.error("Lỗi đọc PLC:", err);
        return;
      }
      this.currentPlcData = values;
      
      if (io) {
        io.emit('plc-data', this.currentPlcData);
      }
    });
  }

  public getStatus() {
    return { connected: this.plcConnected, data: this.currentPlcData };
  }

  public writeTag(tag: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!variables[tag]) {
        return reject(new Error("Tag không hợp lệ"));
      }
      this.conn.writeItems(tag, value, (err: any) => {
        if (err) return reject(new Error("Lỗi ghi xuống PLC"));
        resolve();
      });
    });
  }
}

export default new PlcService();
