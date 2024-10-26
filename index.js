import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

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

// Store connected users (optional, for user management or tracking)
const users = {};

io.on('connection', (socket) => {
    // Generate a unique ID for the user
    const userId = uuidv4();
    users[socket.id] = userId;  // Track connected user by socket ID
    // users.filter()
    console.log(users);
    console.log(`User connected with ID: ${userId}`);

    socket.on('chat message', ({ msg }) => {
        const fullMessage = `User ${userId}: ${msg}`;
        io.emit('chat message', fullMessage);  // Emit to all connected clients
        console.log(fullMessage);
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        console.log(`User with ID ${userId} disconnected`);
        delete users[socket.id];
    });

});

server.listen(3001, () => {
    console.log('Server running at http://localhost:3001');
});
