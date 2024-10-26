import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { socketController } from './controllers/socketController.js';

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",  // Your frontend's origin
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    },
    transports: ['websocket', 'polling']  // Enable WebSocket and polling
});

app.use(cors({
    origin: 'http://localhost:3000',  // Allow the frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow these headers
    credentials: true  // Enable credentials (if needed)
}));
app.options('*', cors());  // Handle preflight requests

socketController(io);

server.listen(3001, () => {
    console.log('Server running at http://localhost:3001');
});
