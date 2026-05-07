import { Server, Socket } from 'socket.io';
import plcService from '../services/plcService';

export default function initSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`📡 Client kết nối HMI: ${socket.id}`);
    
    // Gửi ngay trạng thái hiện tại khi client vừa kết nối
    socket.emit('plc-data', plcService.getStatus().data);

    // Lắng nghe sự kiện ghi dữ liệu từ client
    socket.on('write-tag', async (data: { tag: string, value: any }) => {
      const { tag, value } = data;
      console.log(`✍️ Ghi PLC qua Socket: Tag=${tag}, Value=${value}`);
      
      try {
        await plcService.writeTag(tag, value);
      } catch (err: any) {
        console.error(`❌ Lỗi ghi PLC qua Socket:`, err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Client ngắt kết nối: ${socket.id}`);
    });
  });
}
