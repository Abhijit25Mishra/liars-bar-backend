// socketEvents.js
import { v4 as uuidv4 } from 'uuid';
import { setupRoomEvents } from './roomEvents.js';
import { io, users, defaultRoom } from '../config/global.js';


export const socketController = () => {

    io.on('connection', (socket) => {
        const userId = uuidv4();
        users[socket.id] = userId;  // Track connected user by socket ID
        console.log(users);
        console.log(`User connected with ID: ${users[socket.id]}`);
        socket.join(defaultRoom);

        socket.on('changeName', ({ newName }) => {
            console.log('changeName Entry');    
            users[socket.id] = newName;
            console.log(users);
            console.log('changeName Exit');    

        });

        socket.on('chatMessage', ({ msg }) => {
            console.log('chatMessage Entry');
            console.info('inside chatMessage',socket.rooms);
            const rooms = [...socket.rooms].filter(room => room !== socket.id); 
            const fullMessage = `${users[socket.id]} said: ${msg}`;

            console.info(rooms);
            if (rooms.length > 0) {
                // User is in at least one room, emit to those rooms
                rooms.forEach(room => {
                    console.log('emiited to room ', room, fullMessage);
                    io.to(room).emit('chatMessage', fullMessage);  // Emit to the specific room
                });
            } else {
                // User is not in any room, emit to all connected clients
                console.log('emitted to all', fullMessage);
                io.emit('chatMessage', fullMessage);
            }

            console.log(fullMessage);
            console.log('chatMessage Exit');

        });

        setupRoomEvents(socket);

        socket.on('disconnect', () => {
            console.log(`User with ID ${users[socket.id]} disconnected`);
            delete users[socket.id];
        });
    });
};
