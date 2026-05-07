import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import plcService from './services/plcService';
import plcRoutes from './routes/plcRoutes';
import plcSocket from './sockets/plcSocket';

const app = express();
const PORT = 3001;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/plc', plcRoutes);

// --- HTTP SERVER & SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Khởi tạo PLC Connection (truyền io vào để emit data)
plcService.init(io);

// Khởi tạo Socket.IO Events
plcSocket(io);

// Khởi chạy Server
server.listen(PORT, () => {
  console.log(`🚀 Backend Server (TypeScript) máy ấp trứng chạy tại: http://localhost:${PORT}`);
});
