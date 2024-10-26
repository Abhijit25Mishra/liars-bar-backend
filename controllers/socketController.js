// socketEvents.js
import { v4 as uuidv4 } from 'uuid';

const users = {}; // Keep users in a module-level variable

export const socketController = (io) => {
    io.on('connection', (socket) => {
        const userId = uuidv4();
        users[socket.id] = userId;  // Track connected user by socket ID

        console.log(`User connected with ID: ${users[socket.id]}`);
        console.log(users);

        socket.on('change name', ({ newName }) => {
            console.log(newName);
            users[socket.id] = newName;
            console.log(users);
        });

        socket.on('chat message', ({ msg }) => {
            const fullMessage = `${users[socket.id]} said ${msg}`;
            io.emit('chat message', fullMessage);  // Emit to all connected clients
            console.log(fullMessage);
        });

        socket.on('disconnect', () => {
            console.log(`User with ID ${users[socket.id]} disconnected`);
            delete users[socket.id];
        });

    });
};
