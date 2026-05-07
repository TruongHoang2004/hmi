import { Server, Socket } from 'socket.io';
import plcService from '../services/plcService';

export default function initSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`📡 Client HMI kết nối: ${socket.id}`);
    
    // Gửi ngay trạng thái hiện tại khi client vừa kết nối
    socket.emit('plc-data', plcService.getData());

    // === GHI 1 TAG ===
    socket.on('write-tag', async (data: { tag: string; value: any }) => {
      const { tag, value } = data;
      console.log(`✍️ [Socket] Ghi PLC: ${tag} = ${value}`);
      
      try {
        await plcService.writeTag(tag, value);
        socket.emit('write-result', { success: true, tag, value });
      } catch (err: any) {
        console.error(`❌ [Socket] Lỗi ghi:`, err.message);
        socket.emit('write-result', { success: false, error: err.message });
      }
    });

    // === GHI NHIỀU TAG CÙNG LÚC ===
    socket.on('write-tags', async (data: { items: { tag: string; value: any }[] }) => {
      const { items } = data;
      console.log(`✍️ [Socket] Ghi nhiều tag:`, items);
      
      try {
        const tags = items.map(i => i.tag);
        const values = items.map(i => i.value);
        await plcService.writeMultipleTags(tags, values);
        socket.emit('write-result', { success: true, items });
      } catch (err: any) {
        socket.emit('write-result', { success: false, error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Client HMI ngắt kết nối: ${socket.id}`);
    });
  });
}
